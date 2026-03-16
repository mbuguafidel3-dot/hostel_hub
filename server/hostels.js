import { Hono } from "hono";
import db from "./db.js";

const hostels = new Hono();

// Get all hostels for a manager
hostels.get("/", async (c) => {
  const user = c.get("jwtPayload"); // Assuming middleware sets this
  // In a real app, we'd have a middleware verify the JWT and set c.set('user', payload)
  // For now, let's assume the user ID is passed or available via a future middleware.
  // Actually, I should add a basic auth middleware or just use the payload if already present.

  console.log("user from JWT payload:", user);

  const managerId = user?.id;
  if (!managerId) return c.json({ error: "Unauthorized" }, 401);

  const list = db
    .prepare(
      `
    SELECT h.*, 
    (SELECT COUNT(*) FROM bookings b WHERE b.hostel_id = h.id AND b.status = 'assigned') as booked_units
    FROM hostels h 
    WHERE h.manager_id = ?
  `,
    )
    .all(managerId);

  return c.json(list);
});

// Create a new hostel
hostels.post("/", async (c) => {
  const user = c.get("jwtPayload");
  const managerId = user?.id;
  if (!managerId) return c.json({ error: "Unauthorized" }, 401);

  const { name, location, total_units } = await c.req.json();
  if (!name || !location || !total_units) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  try {
    const info = db
      .prepare(
        "INSERT INTO hostels (name, location, total_units, manager_id) VALUES (?, ?, ?, ?)",
      )
      .run(name, location, total_units, managerId);
    return c.json(
      { message: "Hostel created successfully", id: info.lastInsertRowid },
      201,
    );
  } catch (err) {
    console.error("[Hostels] Error creating hostel:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get all hostels (Student view)
hostels.get("/all", async (c) => {
  try {
    const list = db
      .prepare(
        `
      SELECT h.*, 
      (SELECT COUNT(*) FROM bookings b WHERE b.hostel_id = h.id AND b.status = 'assigned') as booked_units,
      u.fullname as manager_name
      FROM hostels h
      JOIN users u ON h.manager_id = u.id
    `,
      )
      .all();
    return c.json(list);
  } catch (err) {
    console.error("[Hostels] Error fetching all hostels:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default hostels;
