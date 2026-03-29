import { Hono } from "hono";
import { serve } from "@hono/node-server";

import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { jwt } from "hono/jwt";
import auth from "./auth.js";
import hostels from "./hostels.js";
import bookings from "./bookings.js";
import viewings from "./viewings.js";
import payments from "./payments.js";

const app = new Hono();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

app.use(logger());
app.use(cors());

// Protected routes middleware
app.use("/hostels/*", jwt({ secret: JWT_SECRET, alg: "HS256" }));
app.use("/bookings/*", jwt({ secret: JWT_SECRET, alg: "HS256" }));
app.use("/viewings/*", jwt({ secret: JWT_SECRET, alg: "HS256" }));
app.use("/payments/*", jwt({ secret: JWT_SECRET, alg: "HS256" }));

app.route("/auth", auth);
app.route("/hostels", hostels);
app.route("/bookings", bookings);
app.route("/viewings", viewings);
app.route("/payments", payments);

app.get("/", (c) => {
  return c.text("Hello World!");
});

app.get("/health", (c) => {
  const message = "I'm alive: API is running well on port 5000";
  return c.json({ message });
});

serve({ fetch: app.fetch, port: 5000 }, () => {
  console.log("Server is running on port 5000");
});
