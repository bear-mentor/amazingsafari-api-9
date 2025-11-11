import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import {
  ProductSchema,
  ProductSlugParamSchema,
  ProductsSchema,
} from "./schema";
import { db } from "../../lib/db";

export const productRoute = new OpenAPIHono();

// GET /products
productRoute.openapi(
  createRoute({
    method: "get",
    path: "/",
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

// GET /products/{slug}
productRoute.openapi(
  createRoute({
    method: "get",
    path: "/{slug}",
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

    const product = await db.product.findUnique({
      where: { slug },
    });

    if (!product) {
      return c.notFound();
    }

    return c.json(product);
  }
);
