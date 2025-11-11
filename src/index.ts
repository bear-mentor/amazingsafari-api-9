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
import { authRoute } from "./modules/auth/route";
import { cartRoute } from "./modules/cart/route";

const app = new OpenAPIHono();

app.use(cors());

app.route("/products", productRoute);
app.route("/users", userRoute);
app.route("/auth", authRoute);
app.route("/cart", cartRoute);

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
