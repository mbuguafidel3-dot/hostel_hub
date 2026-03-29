import { Hono } from "hono";
import db from "./db.js";

const payments = new Hono();

// Student creates a payment for their assigned booking
payments.post("/", async (c) => {
  const user = c.get("jwtPayload");
  const studentId = user?.id;
  if (!studentId) return c.json({ error: "Unauthorized" }, 401);

  try {
    const { booking_id, amount, method, reference } = await c.req.json();

    if (!booking_id || !amount || !method || !reference) {
      return c.json(
        { error: "booking_id, amount, method and reference are required" },
        400,
      );
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return c.json({ error: "Amount must be a positive number" }, 400);
    }

    const normalizedMethod = String(method).toLowerCase();
    if (!["mpesa", "bank_card"].includes(normalizedMethod)) {
      return c.json({ error: "Invalid payment method" }, 400);
    }

    const booking = db
      .prepare(
        `
      SELECT
        b.id,
        b.hostel_id,
        b.unit_number,
        h.name AS hostel_name,
        m.fullname AS manager_name,
        m.email AS manager_email
      FROM bookings b
      JOIN hostels h ON b.hostel_id = h.id
      JOIN users m ON h.manager_id = m.id
      WHERE b.id = ? AND b.student_id = ? AND b.status = 'assigned'
    `,
      )
      .get(booking_id, studentId);

    if (!booking) {
      return c.json(
        { error: "Assigned booking not found for this student" },
        404,
      );
    }

    if (!booking.unit_number) {
      return c.json(
        { error: "Cannot create payment without assigned unit number" },
        400,
      );
    }

    const info = db
      .prepare(
        `
      INSERT INTO payments (
        student_id,
        hostel_id,
        booking_id,
        unit_number,
        amount,
        method,
        status,
        reference
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      )
      .run(
        studentId,
        booking.hostel_id,
        booking.id,
        booking.unit_number,
        parsedAmount,
        normalizedMethod,
        "completed",
        reference,
      );

    return c.json(
      {
        message: "Payment recorded successfully",
        id: info.lastInsertRowid,
        payment: {
          id: info.lastInsertRowid,
          booking_id: booking.id,
          hostel_id: booking.hostel_id,
          unit_number: booking.unit_number,
          amount: parsedAmount,
          method: normalizedMethod,
          reference,
          status: "completed",
        },
        hostel: {
          name: booking.hostel_name,
        },
        manager: {
          name: booking.manager_name,
          email: booking.manager_email,
        },
      },
      201,
    );
  } catch (err) {
    if (
      err.message.includes("UNIQUE constraint failed") &&
      err.message.includes("reference")
    ) {
      return c.json({ error: "Reference already exists" }, 400);
    }

    console.error("[Payments] Error creating payment:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Student gets payment history
payments.get("/student", async (c) => {
  const user = c.get("jwtPayload");
  const studentId = user?.id;
  if (!studentId) return c.json({ error: "Unauthorized" }, 401);

  try {
    const list = db
      .prepare(
        `
      SELECT p.*, h.name AS hostel_name, h.location
      FROM payments p
      JOIN hostels h ON p.hostel_id = h.id
      WHERE p.student_id = ?
      ORDER BY p.paid_at DESC
    `,
      )
      .all(studentId);

    return c.json(list);
  } catch (err) {
    console.error("[Payments] Error fetching student payments:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Manager gets payments made for their hostels
payments.get("/manager", async (c) => {
  const user = c.get("jwtPayload");
  const managerId = user?.id;
  if (!managerId) return c.json({ error: "Unauthorized" }, 401);

  try {
    const list = db
      .prepare(
        `
      SELECT p.*, h.name AS hostel_name, h.location, u.fullname AS student_name, u.email AS student_email
      FROM payments p
      JOIN hostels h ON p.hostel_id = h.id
      JOIN users u ON p.student_id = u.id
      WHERE h.manager_id = ?
      ORDER BY p.paid_at DESC
    `,
      )
      .all(managerId);

    return c.json(list);
  } catch (err) {
    console.error("[Payments] Error fetching manager payments:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default payments;
