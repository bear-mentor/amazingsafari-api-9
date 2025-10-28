import { cors } from "hono/cors";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";

import { db } from "./lib/db";
import {
  ProductSlugParamSchema,
  ProductSchema,
  ProductsSchema,
} from "./modules/product/schema";
import {
  UserIdParamSchema,
  UserSchema,
  UsersSchema,
} from "./modules/user/schema";

const app = new OpenAPIHono();

app.use(cors());

app.openapi(
  createRoute({
    method: "get",
    path: "/products",
    responses: {
      200: {
        description: "Get all products",
        content: { "application/json": { schema: ProductsSchema } },
      },
    },
  }),
  async (c) => {
    const products = await db.product.findMany();

    return c.json(products);
  }
);

app.openapi(
  createRoute({
    method: "get",
    path: "/products/{slug}",
    request: { params: ProductSlugParamSchema },
    responses: {
      200: {
        description: "Get one product by slug",
        content: { "application/json": { schema: ProductSchema } },
      },
      404: {
        description: "Product by slug not found",
      },
    },
  }),
  async (c) => {
    const { slug } = c.req.valid("param");

    const product = await db.product.findUnique({ where: { slug } });

    if (!product) {
      return c.notFound();
    }

    return c.json(product);
  }
);

app.openapi(
  createRoute({
    method: "get",
    path: "/users",
    responses: {
      200: {
        description: "Get all users",
        content: { "application/json": { schema: UsersSchema } },
      },
    },
  }),
  async (c) => {
    const users = await db.user.findMany();

    return c.json(users);
  }
);

app.openapi(
  createRoute({
    method: "get",
    path: "/users/{id}",
    request: { params: UserIdParamSchema },
    responses: {
      200: {
        description: "Get one user by ID",
        content: { "application/json": { schema: UserSchema } },
      },
      404: {
        description: "User by id not found",
      },
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");

    const user = await db.user.findUnique({ where: { id } });

    if (!user) {
      return c.notFound();
    }

    return c.json(user);
  }
);

// POST /auth/register
// POST /auth/login
// GET /auth/me

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
