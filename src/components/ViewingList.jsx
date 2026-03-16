import { CheckCircle } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

const ViewingList = ({ viewings, onUpdate, role }) => {
  const handleStatusUpdate = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_BASE_URL}/viewings/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onUpdate();
    } catch (err) {
      console.error("Error updating viewing status:", err);
      alert("Failed to update status");
    }
  };

  if (!viewings || viewings.length === 0) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "40px" }}>
        <p style={{ color: "var(--text-muted)" }}>No viewing requests found.</p>
      </div>
    );
  }

  return (
    <div className="data-table-container">
      <table className="data-table">
        <thead>
          <tr>
            {role === "manager" && <th>Student</th>}
            <th>Hostel</th>
            <th>Date Requested</th>
            <th>Status</th>
            {role === "manager" && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {viewings.map((v) => (
            <tr key={v.id}>
              {role === "manager" && (
                <td>
                  <div style={{ fontWeight: 600 }}>{v.student_name}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    {v.student_number}
                  </div>
                </td>
              )}
              <td>
                <div style={{ fontWeight: 600 }}>{v.hostel_name}</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  {v.location}
                </div>
              </td>
              <td style={{ fontSize: "14px" }}>
                {new Date(v.created_at).toLocaleDateString()}
              </td>
              <td>
                <span className={`status-badge status-${v.status}`}>
                  {v.status}
                </span>
              </td>
              {role === "manager" && (
                <td>
                  {v.status === "pending" && (
                    <button
                      onClick={() => handleStatusUpdate(v.id, "approved")}
                      className="assign-btn"
                      style={{
                        background: "var(--primary-light)",
                        color: "var(--primary)",
                      }}
                    >
                      Approve
                    </button>
                  )}
                  {v.status === "approved" && (
                    <button
                      onClick={() => handleStatusUpdate(v.id, "completed")}
                      className="assign-btn"
                      style={{
                        background: "var(--success-bg)",
                        color: "var(--success)",
                      }}
                    >
                      Mark Completed
                    </button>
                  )}
                  {v.status === "completed" && (
                    <CheckCircle size={18} color="var(--success)" />
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewingList;