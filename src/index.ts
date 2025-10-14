import { Hono } from "hono";
import { cors } from "hono/cors";

import { db } from "./lib/db";

const app = new Hono();

app.use(cors());

app.get("/", (c) => {
  return c.json({
    title: "Amazing Safari API",
  });
});

app.get("/products", async (c) => {
  const products = await db.product.findMany();

  return c.json(products);
});

export default app;
