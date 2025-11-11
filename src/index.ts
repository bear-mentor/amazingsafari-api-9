import { cors } from "hono/cors";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";

import { db } from "./lib/db";
import {
  ProductSlugParamSchema,
  ProductSchema,
  ProductsSchema,
} from "./modules/product/schema";
import {
  LoginUserSchema,
  PrivateUserSchema,
  RegisterUserSchema,
  TokenSchema,
  UserIdParamSchema,
  UserSchema,
  UsersSchema,
} from "./modules/user/schema";
import { signToken } from "./lib/token";
import { checkAuthorized } from "./modules/auth/middleware";
import { productRoute } from "./modules/product/route";
import { userRoute } from "./modules/user/route";

const app = new OpenAPIHono();

app.use(cors());

app.route("/products", productRoute);
app.route("/users", userRoute);

// POST /auth/register
app.openapi(
  createRoute({
    method: "post",
    path: "/auth/register",
    request: {
      body: { content: { "application/json": { schema: RegisterUserSchema } } },
    },
    responses: {
      201: {
        description: "Registered new user",
        content: { "application/json": { schema: UserSchema } },
      },
      400: {
        description: "Failed to register new user",
      },
    },
  }),
  async (c) => {
    const body = c.req.valid("json");

    try {
      const hash = await Bun.password.hash(body.password);

      const user = await db.user.create({
        data: {
          username: body.username,
          email: body.email,
          fullName: body.fullName,
          password: { create: { hash } },
        },
      });

      return c.json(user, 201);
    } catch (error) {
      return c.json({ message: "Username or email already exist" }, 400);
    }
  }
);

// POST /auth/login
app.openapi(
  createRoute({
    method: "post",
    path: "/auth/login",
    request: {
      body: { content: { "application/json": { schema: LoginUserSchema } } },
    },
    responses: {
      200: {
        description: "Logged in to user",
        content: { "text/plain": { schema: TokenSchema } },
      },
      400: {
        description: "Failed to login user",
      },
      404: {
        description: "User not found",
      },
    },
  }),
  async (c) => {
    const body = c.req.valid("json");

    try {
      const user = await db.user.findUnique({
        where: { email: body.email },
        include: {
          password: true,
        },
      });

      if (!user) {
        return c.notFound();
      }

      if (!user.password?.hash) {
        return c.json({
          message: "User has no password",
        });
      }

      const isMatch = await Bun.password.verify(
        body.password,
        user.password.hash
      );

      if (!isMatch) {
        return c.json({
          message: "Password incorrect",
        });
      }

      const token = await signToken(user.id);

      return c.text(token);
    } catch (error) {
      return c.json({ message: "Email or password is incorrect" }, 400);
    }
  }
);

// GET /auth/me
app.openapi(
  createRoute({
    method: "get",
    path: "/auth/me",
    middleware: checkAuthorized,
    responses: {
      200: {
        description: "Get authenticated user",
        content: { "application/json": { schema: PrivateUserSchema } },
      },
    },
  }),
  async (c) => {
    const user = c.get("user");

    return c.json(user);
  }
);

app.doc("/openapi.json", {
  openapi: "3.0.0",
  info: {
    title: "Amazing Safari API",
    version: "1.0.0",
  },
});

app.get(
  "/",
  Scalar({
    pageTitle: "Amazing Safari API",
    url: "/openapi.json",
  })
);

export default app;
