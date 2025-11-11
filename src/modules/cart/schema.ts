import { z } from "@hono/zod-openapi";
import { ProductSchema } from "../product/schema";
import { UserSchema } from "../user/schema";

export const CartItemSchema = z.object({
  id: z.string(),

  product: ProductSchema,
  productId: z.string(),

  quantity: z.number().int(),

  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CartItemsSchema = z.array(CartItemSchema);

export const CartSchema = z.object({
  id: z.string(),

  userId: z.string(),

  items: CartItemsSchema,

  createdAt: z.date(),
  updatedAt: z.date(),
});
