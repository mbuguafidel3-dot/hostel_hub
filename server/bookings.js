import { Hono } from "hono";
import db from "./db.js";

const bookings = new Hono();

// Manager gets bookings for their hostels
bookings.get("/manager", async (c) => {
  const user = c.get("jwtPayload");
  const managerId = user?.id;
  if (!managerId) return c.json({ error: "Unauthorized" }, 401);

  const list = db
    .prepare(
      `
    SELECT b.*, u.fullname as student_name, u.email as student_email, u.student_number, h.name as hostel_name
    FROM bookings b
    JOIN users u ON b.student_id = u.id
    JOIN hostels h ON b.hostel_id = h.id
    WHERE h.manager_id = ?
    ORDER BY b.created_at DESC
  `,
    )
    .all(managerId);

  return c.json(list);
});

// Student gets their own bookings
bookings.get("/student", async (c) => {
  const user = c.get("jwtPayload");
  const studentId = user?.id;
  if (!studentId) return c.json({ error: "Unauthorized" }, 401);

  const list = db
    .prepare(
      `
    SELECT b.*, h.name as hostel_name, h.location
    FROM bookings b
    JOIN hostels h ON b.hostel_id = h.id
    WHERE b.student_id = ?
    ORDER BY b.created_at DESC
  `,
    )
    .all(studentId);

  return c.json(list);
});

// Student gets their booking history (archived)
bookings.get("/student/history", async (c) => {
  const user = c.get("jwtPayload");
  const studentId = user?.id;
  if (!studentId) return c.json({ error: "Unauthorized" }, 401);

  const list = db
    .prepare(
      `
    SELECT bh.*, h.name as hostel_name, h.location
    FROM booking_history bh
    JOIN hostels h ON bh.hostel_id = h.id
    WHERE bh.student_id = ?
    ORDER BY bh.checkout_date DESC
  `,
    )
    .all(studentId);

  return c.json(list);
});

// Assign a unit to a booking (Manager)
bookings.patch("/:id/assign", async (c) => {
  const user = c.get("jwtPayload");
  const managerId = user?.id;
  if (!managerId) return c.json({ error: "Unauthorized" }, 401);

  const id = c.req.param("id");
  const { unit_number } = await c.req.json();

  if (!unit_number) {
    return c.json({ error: "Unit number is required" }, 400);
  }

  try {
    // 1. Verify booking belongs to this manager's hostel
    const targetBooking = db
      .prepare(
        `
      SELECT b.id, b.student_id FROM bookings b
      JOIN hostels h ON b.hostel_id = h.id
      WHERE b.id = ? AND h.manager_id = ?
    `,
      )
      .get(id, managerId);

    if (!targetBooking) {
      return c.json({ error: "Booking not found or unauthorized" }, 404);
    }

    // 2. Ensure student doesn't have ANOTHER assigned booking that isn't on notice
    const otherAssigned = db
      .prepare(
        `
      SELECT id FROM bookings 
      WHERE student_id = ? AND status = 'assigned' AND notice_given = 0 AND id != ?
    `,
      )
      .get(targetBooking.student_id, id);

    if (otherAssigned) {
      return c.json(
        { error: "Student already has an active assignment in another hostel" },
        400,
      );
    }

    db.prepare(
      "UPDATE bookings SET unit_number = ?, status = ? WHERE id = ?",
    ).run(unit_number, "assigned", id);

    return c.json({ message: "Unit assigned successfully" });
  } catch (err) {
    console.error("[Bookings] Error assigning unit:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Give leave notice (Student)
bookings.patch("/:id/notice", async (c) => {
  const user = c.get("jwtPayload");
  const studentId = user?.id;
  if (!studentId) return c.json({ error: "Unauthorized" }, 401);

  const id = c.req.param("id");

  try {
    const booking = db
      .prepare(
        "SELECT id FROM bookings WHERE id = ? AND student_id = ? AND status = ?",
      )
      .get(id, studentId, "assigned");

    if (!booking) {
      return c.json({ error: "Active booking not found" }, 404);
    }

    db.prepare(
      "UPDATE bookings SET notice_given = 1, notice_date = CURRENT_TIMESTAMP WHERE id = ?",
    ).run(id);

    return c.json({ message: "Leave notice given successfully" });
  } catch (err) {
    console.error("[Bookings] Error giving notice:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Approve leaving (Manager)
bookings.patch("/:id/leave", async (c) => {
  const user = c.get("jwtPayload");
  const managerId = user?.id;
  if (!managerId) return c.json({ error: "Unauthorized" }, 401);

  const id = c.req.param("id");

  try {
    const booking = db
      .prepare(
        `
      SELECT b.id FROM bookings b
      JOIN hostels h ON b.hostel_id = h.id
      WHERE b.id = ? AND h.manager_id = ? AND b.status = 'assigned'
    `,
      )
      .get(id, managerId);

    if (!booking) {
      return c.json({ error: "Active booking not found or unauthorized" }, 404);
    }

    // Move to history and delete from active bookings
    const archiveTransaction = db.transaction(() => {
      const fullBooking = db
        .prepare("SELECT * FROM bookings WHERE id = ?")
        .get(id);

      // Preserve payment records while allowing booking archival by removing FK link.
      db.prepare(
        "UPDATE payments SET booking_id = NULL WHERE booking_id = ?",
      ).run(id);

      db.prepare(
        `
        INSERT INTO booking_history (id, hostel_id, student_id, unit_number, notice_given, notice_date, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      ).run(
        fullBooking.id,
        fullBooking.hostel_id,
        fullBooking.student_id,
        fullBooking.unit_number,
        fullBooking.notice_given,
        fullBooking.notice_date,
        fullBooking.created_at,
      );

      db.prepare("DELETE FROM bookings WHERE id = ?").run(id);
    });

    archiveTransaction();

    return c.json({ message: "Student successfully checked out and archived" });
  } catch (err) {
    console.error("[Bookings] Error approving leave:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Student creates a booking (Request Consideration)
bookings.post("/", async (c) => {
  const user = c.get("jwtPayload");
  const studentId = user?.id;
  if (!studentId) return c.json({ error: "Unauthorized" }, 401);

  const { hostel_id } = await c.req.json();
  if (!hostel_id) return c.json({ error: "Hostel ID is required" }, 400);

  try {
    // 1. Check if viewing is COMPLETED OR student has stayed here before (history)
    const viewing = db
      .prepare(
        "SELECT id FROM viewings WHERE hostel_id = ? AND student_id = ? AND status = 'completed'",
      )
      .get(hostel_id, studentId);
    const inHistory = db
      .prepare(
        "SELECT id FROM booking_history WHERE hostel_id = ? AND student_id = ? LIMIT 1",
      )
      .get(hostel_id, studentId);

    if (!viewing && !inHistory) {
      return c.json(
        {
          error:
            "You must complete a viewing or have a past stay before requesting consideration",
        },
        403,
      );
    }

    // 2. Check if student is already assigned somewhere without notice
    const currentAssigned = db
      .prepare(
        `
      SELECT id FROM bookings 
      WHERE student_id = ? AND status = 'assigned' AND notice_given = 0
    `,
      )
      .get(studentId);

    if (currentAssigned) {
      return c.json(
        {
          error:
            "You must give leave notice at your current hostel before applying for a new one",
        },
        400,
      );
    }

    // 3. Check if already applied
    const existing = db
      .prepare(
        "SELECT id FROM bookings WHERE hostel_id = ? AND student_id = ? AND status != 'completed'",
      )
      .get(hostel_id, studentId);
    if (existing)
      return c.json(
        {
          error: "You have an active application or assignment for this hostel",
        },
        400,
      );

    const info = db
      .prepare(
        "INSERT INTO bookings (hostel_id, student_id, status) VALUES (?, ?, ?)",
      )
      .run(hostel_id, studentId, "pending");

    return c.json(
      {
        message: "Request for consideration sent successfully",
        id: info.lastInsertRowid,
      },
      201,
    );
  } catch (err) {
    console.error("[Bookings] Error creating booking:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default bookings;
