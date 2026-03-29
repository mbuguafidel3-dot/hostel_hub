import React, { useState } from "react";
import { CheckCircle, Loader2, X } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import "../styles/dashboard.css";

const BookingList = ({ bookings, onUpdate }) => {
  const [reviewBooking, setReviewBooking] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [studentReport, setStudentReport] = useState(null);
  const [reviewUnitNumber, setReviewUnitNumber] = useState("");
  const [savingAssignment, setSavingAssignment] = useState(false);

  const handleAssign = async (bookingId, unitNumber) => {
    try {
      setSavingAssignment(true);
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_BASE_URL}/bookings/${bookingId}/assign`,
        { unit_number: unitNumber },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setReviewBooking(null);
      setReviewUnitNumber("");
      setStudentReport(null);
      setReviewError("");
      onUpdate();
    } catch (err) {
      console.error("Error assigning unit:", err);
      alert("Failed to assign unit");
    } finally {
      setSavingAssignment(false);
    }
  };

  const closeReviewModal = () => {
    setReviewBooking(null);
    setReviewLoading(false);
    setReviewError("");
    setStudentReport(null);
    setReviewUnitNumber("");
  };

  const openReviewModal = async (booking) => {
    setReviewBooking(booking);
    setReviewLoading(true);
    setReviewError("");
    setStudentReport(null);
    setReviewUnitNumber("");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}/payments/student-report/${booking.student_id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setStudentReport(response.data);
    } catch (err) {
      console.error("Error loading student report:", err);
      setReviewError(
        err?.response?.data?.error ||
          "Could not load student report at the moment.",
      );
    } finally {
      setReviewLoading(false);
    }
  };

  const handleLeave = async (bookingId) => {
    if (
      !window.confirm(
        "Are you sure you want to approve this student checking out?",
      )
    )
      return;
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_BASE_URL}/bookings/${bookingId}/leave`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onUpdate();
    } catch (err) {
      console.error("Error approving leave:", err);
      alert("Failed to approve checkout");
    }
  };

  if (!bookings || bookings.length === 0) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "40px" }}>
        <p style={{ color: "var(--text-muted)" }}>
          No bookings found for your hostels.
        </p>
      </div>
    );
  }

  return (
    <div className="data-table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Email / ID</th>
            <th>Hostel</th>
            <th>Unit Number</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td>
                <div style={{ fontWeight: 600 }}>{booking.student_name}</div>
                {booking.notice_given === 1 && (
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#92400e",
                      background: "#fef3c7",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      display: "inline-block",
                      marginTop: "4px",
                    }}
                  >
                    Notice Given
                  </div>
                )}
              </td>
              <td>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  {booking.student_email}
                </div>
                <div style={{ fontSize: "12px", color: "var(--primary)" }}>
                  {booking.student_number}
                </div>
              </td>
              <td>{booking.hostel_name}</td>
              <td>
                {booking.status === "assigned" ? (
                  <span style={{ fontWeight: 600 }}>{booking.unit_number}</span>
                ) : (
                  <span
                    style={{ color: "var(--text-muted)", fontStyle: "italic" }}
                  >
                    Not assigned
                  </span>
                )}
              </td>
              <td>
                <span className={`status-badge status-${booking.status}`}>
                  {booking.status}
                </span>
              </td>
              <td>
                <div
                  style={{ display: "flex", gap: "8px", alignItems: "center" }}
                >
                  {booking.status === "pending" && (
                    <button
                      onClick={() => openReviewModal(booking)}
                      className="assign-btn"
                    >
                      Review Student
                    </button>
                  )}
                  {booking.status === "assigned" && (
                    <>
                      <button
                        onClick={() => handleLeave(booking.id)}
                        className="assign-btn"
                        style={{
                          background: "var(--error-bg)",
                          color: "var(--error)",
                        }}
                      >
                        Check Out
                      </button>
                      <CheckCircle size={18} color="var(--success)" />
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {reviewBooking && (
        <div className="modal-backdrop" onClick={closeReviewModal}>
          <div
            className="card modal-content student-review-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="student-review-header">
              <h3>Student Placement Review</h3>
              <button className="review-close-btn" onClick={closeReviewModal}>
                <X size={16} />
              </button>
            </div>

            <div className="student-review-basic">
              <p>
                <strong>{reviewBooking.student_name}</strong>
              </p>
              <p>{reviewBooking.student_email}</p>
              <p>{reviewBooking.student_number || "No student number"}</p>
              <p>
                Applying for: <strong>{reviewBooking.hostel_name}</strong>
              </p>
            </div>

            {reviewLoading && (
              <div className="student-review-loading">
                <Loader2 size={18} className="spin" />
                <span>Loading student report...</span>
              </div>
            )}

            {reviewError && !reviewLoading && (
              <div className="error-message" style={{ marginTop: "12px" }}>
                {reviewError}
              </div>
            )}

            {studentReport && !reviewLoading && (
              <>
                <div className="rent-score-row">
                  <div className="rent-score-badge">
                    {studentReport?.rent_score?.value ?? "--"}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>Rent Score</div>
                    <div
                      style={{ color: "var(--text-muted)", fontSize: "13px" }}
                    >
                      {studentReport?.rent_score?.label || "Needs Review"}
                    </div>
                  </div>
                </div>

                <div className="student-metrics-grid">
                  <div className="metric-card">
                    <span className="metric-label">Total Payments</span>
                    <span className="metric-value">
                      {studentReport.summary?.total_payments ?? 0}
                    </span>
                  </div>
                  <div className="metric-card">
                    <span className="metric-label">Total Paid</span>
                    <span className="metric-value">
                      KES{" "}
                      {(
                        studentReport.summary?.total_paid ?? 0
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="metric-card">
                    <span className="metric-label">Your Hostels Paid</span>
                    <span className="metric-value">
                      KES{" "}
                      {(
                        studentReport.summary?.manager_total_paid ?? 0
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="metric-card">
                    <span className="metric-label">Notice Compliance</span>
                    <span className="metric-value">
                      {studentReport.summary?.notice_compliance ?? 0}%
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: "14px" }}>
                  <div style={{ fontWeight: 600, marginBottom: "8px" }}>
                    Recent Payments
                  </div>
                  {studentReport.recent_payments?.length ? (
                    <div className="review-payments-list">
                      {studentReport.recent_payments.map((payment) => (
                        <div key={payment.id} className="review-payment-item">
                          <span>
                            KES {Number(payment.amount).toLocaleString()}
                          </span>
                          <span>{payment.hostel_name}</span>
                          <span>
                            {String(payment.method || "").replace("_", " ")}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: "var(--text-muted)", margin: 0 }}>
                      No payment history yet.
                    </p>
                  )}
                </div>

                <div className="student-review-assign-row">
                  <input
                    type="text"
                    placeholder="Enter unit number"
                    value={reviewUnitNumber}
                    onChange={(e) => setReviewUnitNumber(e.target.value)}
                    className="review-unit-input"
                  />
                  <button
                    onClick={() =>
                      handleAssign(reviewBooking.id, reviewUnitNumber)
                    }
                    className="assign-btn"
                    style={{
                      background: "var(--success-bg)",
                      color: "var(--success)",
                    }}
                    disabled={!reviewUnitNumber || savingAssignment}
                  >
                    {savingAssignment ? "Assigning..." : "Assign Placement"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingList;
