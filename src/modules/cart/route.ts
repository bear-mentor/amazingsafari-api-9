import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { checkAuthorized } from "../auth/middleware";
import { CartItemSchema, CartSchema } from "./schema";
import { db } from "../../lib/db";

export const cartRoute = new OpenAPIHono();

// GET /cart
cartRoute.openapi(
  createRoute({
    method: "get",
    path: "/",
    middleware: checkAuthorized,
    responses: {
      200: {
        description: "Get user's cart",
        content: { "application/json": { schema: CartSchema } },
      },
    },
  }),
  async (c) => {
    const user = c.get("user");

    const cart = await db.cart.findUnique({
      where: { userId: user.id },
      include: { items: { include: { product: true } } },
    });

    if (!cart) {
      const newCart = await db.cart.create({
        data: { userId: user.id },
        include: { items: { include: { product: true } } },
      });

      return c.json(newCart);
    }

    return c.json(cart);
  }
);

// PUT /cart/items
cartRoute.openapi(
  createRoute({
    method: "put",
    path: "/items",
    middleware: checkAuthorized,
    responses: {
      200: {
        description: "Add item to user's cart",
        content: { "application/json": { schema: CartItemSchema } },
      },
      404: {
        description: "User's cart not found",
      },
    },
  }),
  async (c) => {
    const user = c.get("user");

    const cart = await db.cart.findUnique({
      where: { userId: user.id },
      include: { items: { include: { product: true } } },
    });

    if (!cart) {
      return c.notFound();
    }

    const newCartItem = await db.cartItem.create({
      data: {
        cartId: cart.id,
        productId: "",
        quantity: 1,
      },
    });

    return c.json(newCartItem);
  }
);
