import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { checkAuthorized } from "../auth/middleware";
import { CartSchema } from "./schema";
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
      404: {
        description: "Cart not found",
      },
    },
  }),
  async (c) => {
    const user = c.get("user");

    console.log({ user });

    const cart = await db.cart.findUnique({
      where: {
        userId: user.id,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      return c.notFound();
    }

    return c.json(cart);
  }
);
