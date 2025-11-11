import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { checkAuthorized } from "../auth/middleware";
import { AddCartItemSchema, CartItemSchema, CartSchema } from "./schema";
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
    request: {
      body: { content: { "application/json": { schema: AddCartItemSchema } } },
    },
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
    const body = c.req.valid("json");

    const cart = await db.cart.findUnique({
      where: { userId: user.id },
      include: { items: { include: { product: true } } },
    });

    if (!cart) {
      return c.notFound();
    }

    // Only create new cart item,
    // if the product doesn't exist yet in the cart items
    const newCartItem = await db.cartItem.create({
      data: {
        cartId: cart.id,
        productId: body.productId,
        quantity: body.quantity,
      },
      include: {
        product: true,
      },
    });

    return c.json(newCartItem);
  }
);
