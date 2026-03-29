import { Hono } from "hono";
import db from "./db.js";

const payments = new Hono();

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const computeRentScore = ({
  completedPayments,
  paymentCoverage,
  activeAssignments,
  historicalStays,
  noticeCompliance,
}) => {
  const score =
    35 +
    completedPayments * 8 +
    paymentCoverage * 35 +
    (activeAssignments > 0 ? 8 : 0) +
    Math.min(historicalStays, 3) * 4 +
    noticeCompliance * 14;

  return Math.round(clamp(score, 0, 100));
};

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

// Manager gets a student payment behavior report for placement decisions
payments.get("/student-report/:studentId", async (c) => {
  const user = c.get("jwtPayload");
  const managerId = user?.id;
  const role = user?.role;
  if (!managerId) return c.json({ error: "Unauthorized" }, 401);
  if (role !== "manager") return c.json({ error: "Forbidden" }, 403);

  const studentId = Number(c.req.param("studentId"));
  if (!Number.isInteger(studentId) || studentId <= 0) {
    return c.json({ error: "Invalid studentId" }, 400);
  }

  try {
    const student = db
      .prepare(
        `
      SELECT id, fullname, email, student_number
      FROM users
      WHERE id = ?
    `,
      )
      .get(studentId);

    if (!student) {
      return c.json({ error: "Student not found" }, 404);
    }

    const currentBooking = db
      .prepare(
        `
      SELECT b.id, b.hostel_id, b.status, b.unit_number, b.created_at, h.name AS hostel_name
      FROM bookings b
      JOIN hostels h ON h.id = b.hostel_id
      WHERE b.student_id = ?
      ORDER BY CASE WHEN b.status = 'pending' THEN 0 WHEN b.status = 'assigned' THEN 1 ELSE 2 END, b.created_at DESC
      LIMIT 1
    `,
      )
      .get(studentId);

    const managerHasRelationship = db
      .prepare(
        `
      SELECT 1
      FROM hostels h
      WHERE h.manager_id = ?
      AND (
        EXISTS (
          SELECT 1 FROM bookings b
          WHERE b.hostel_id = h.id AND b.student_id = ?
        )
        OR EXISTS (
          SELECT 1 FROM booking_history bh
          WHERE bh.hostel_id = h.id AND bh.student_id = ?
        )
      )
      LIMIT 1
    `,
      )
      .get(managerId, studentId, studentId);

    if (!managerHasRelationship) {
      return c.json(
        {
          error:
            "You can only view reports for students linked to your hostels",
        },
        403,
      );
    }

    const overallPayments = db
      .prepare(
        `
      SELECT
        COUNT(*) AS total_payments,
        COALESCE(SUM(amount), 0) AS total_paid
      FROM payments
      WHERE student_id = ?
    `,
      )
      .get(studentId);

    const managerPayments = db
      .prepare(
        `
      SELECT
        COUNT(*) AS total_payments,
        COALESCE(SUM(p.amount), 0) AS total_paid
      FROM payments p
      JOIN hostels h ON h.id = p.hostel_id
      WHERE p.student_id = ?
      AND h.manager_id = ?
    `,
      )
      .get(studentId, managerId);

    const assignmentStats = db
      .prepare(
        `
      SELECT
        SUM(CASE WHEN status = 'assigned' THEN 1 ELSE 0 END) AS active_assignments,
        SUM(CASE WHEN notice_given = 1 THEN 1 ELSE 0 END) AS notice_given_count,
        COUNT(*) AS active_booking_count
      FROM bookings
      WHERE student_id = ?
    `,
      )
      .get(studentId);

    const historyStats = db
      .prepare(
        `
      SELECT
        COUNT(*) AS historical_stays,
        SUM(CASE WHEN notice_given = 1 THEN 1 ELSE 0 END) AS historical_notice_count
      FROM booking_history
      WHERE student_id = ?
    `,
      )
      .get(studentId);

    const recentPayments = db
      .prepare(
        `
      SELECT p.id, p.amount, p.method, p.reference, p.status, p.paid_at, h.name AS hostel_name
      FROM payments p
      JOIN hostels h ON h.id = p.hostel_id
      WHERE p.student_id = ?
      ORDER BY p.paid_at DESC
      LIMIT 5
    `,
      )
      .all(studentId);

    const totalPayments = Number(overallPayments?.total_payments || 0);
    const totalPaid = Number(overallPayments?.total_paid || 0);
    const activeAssignments = Number(assignmentStats?.active_assignments || 0);
    const activeBookingCount = Number(
      assignmentStats?.active_booking_count || 0,
    );
    const activeNoticeCount = Number(assignmentStats?.notice_given_count || 0);
    const historicalStays = Number(historyStats?.historical_stays || 0);
    const historicalNoticeCount = Number(
      historyStats?.historical_notice_count || 0,
    );

    const totalStays = activeBookingCount + historicalStays;
    const totalNoticeGiven = activeNoticeCount + historicalNoticeCount;
    const noticeCompliance =
      totalStays > 0
        ? totalNoticeGiven / totalStays
        : totalPayments > 0
          ? 0.7
          : 0.5;

    const expectedCoverage = Math.max(1, totalStays);
    const paymentCoverage = clamp(totalPayments / expectedCoverage, 0, 1);

    const rentScore = computeRentScore({
      completedPayments: totalPayments,
      paymentCoverage,
      activeAssignments,
      historicalStays,
      noticeCompliance,
    });

    let scoreLabel = "Needs Review";
    if (rentScore >= 80) scoreLabel = "Excellent";
    else if (rentScore >= 65) scoreLabel = "Reliable";
    else if (rentScore >= 50) scoreLabel = "Moderate";

    return c.json({
      student,
      current_booking: currentBooking || null,
      summary: {
        total_payments: totalPayments,
        total_paid: totalPaid,
        manager_payments: Number(managerPayments?.total_payments || 0),
        manager_total_paid: Number(managerPayments?.total_paid || 0),
        historical_stays: historicalStays,
        active_assignments: activeAssignments,
        notice_compliance: Number((noticeCompliance * 100).toFixed(1)),
      },
      rent_score: {
        value: rentScore,
        label: scoreLabel,
      },
      recent_payments: recentPayments,
    });
  } catch (err) {
    console.error("[Payments] Error fetching student report:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default payments;
