import { cors } from "hono/cors";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";

import { db } from "./lib/db";
import {
  ProductSlugParamSchema,
  ProductSchema,
  ProductsSchema,
} from "./modules/product/schema";

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
