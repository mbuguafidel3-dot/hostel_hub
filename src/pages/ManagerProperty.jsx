import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Building2, MapPin } from "lucide-react";
import axios from "axios";
import useAuth from "../hooks/useAuth";
import useDashboardData from "../hooks/useDashboardData";
import Navbar from "../components/Navbar";
import Tabs from "../components/Tabs";
import BookingList from "../components/BookingList";
import { API_BASE_URL } from "../config/api";
import "../styles/dashboard.css";

const ManagerProperty = () => {
  const { hostelId } = useParams();
  const parsedHostelId = Number(hostelId);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { hostels, bookings, loading, refresh } = useDashboardData(user);
  const [activeTab, setActiveTab] = useState("placements");
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);

  const hostel = hostels.find((item) => Number(item.id) === parsedHostelId);
  const placements = bookings.filter(
    (booking) =>
      booking.status === "assigned" &&
      Number(booking.hostel_id) === parsedHostelId,
  );
  const totalUnits = Number(hostel?.total_units || 0);
  const bookedUnits = Number(hostel?.booked_units || 0);
  const availableUnits = Math.max(totalUnits - bookedUnits, 0);
  const occupancyRate =
    totalUnits > 0 ? Math.round((bookedUnits / totalUnits) * 100) : 0;

  const fetchPayments = useCallback(async () => {
    try {
      setPaymentsLoading(true);
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_BASE_URL}/payments/manager`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const hostelPayments = Array.isArray(data)
        ? data.filter((payment) => Number(payment.hostel_id) === parsedHostelId)
        : [];

      setPayments(hostelPayments);
    } catch (err) {
      console.error("Error fetching property payments", err);
      setPayments([]);
    } finally {
      setPaymentsLoading(false);
    }
  }, [parsedHostelId]);

  useEffect(() => {
    if (!user || !parsedHostelId) return;
    fetchPayments();
  }, [user, parsedHostelId, fetchPayments]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleRefreshAll = async () => {
    await refresh();
    await fetchPayments();
  };

  if (!user) return null;

  return (
    <div className="dashboard-container">
      <Navbar user={user} onLogout={handleLogout} />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-content">
            <h1>Property Management</h1>
            <p>Manage placements and payment history for this property</p>
          </div>
          <Link to="/dashboard" className="placement-back-link">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
        </header>

        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "80px",
            }}
          >
            <Loader2
              className="animate-spin"
              size={42}
              color="var(--primary)"
            />
          </div>
        ) : !hostel ? (
          <section className="card">
            <h3>Property not found</h3>
            <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
              This property does not exist or you may not have access to it.
            </p>
          </section>
        ) : (
          <>
            <section
              className="card"
              style={{ borderLeft: "4px solid var(--primary)" }}
            >
              <div className="card-header">
                <h3>{hostel.name}</h3>
                <span
                  className={`status-badge ${availableUnits > 0 ? "status-active" : "status-full"}`}
                >
                  {availableUnits > 0 ? "Available" : "Fully Booked"}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "18px",
                  marginTop: "8px",
                  color: "var(--text-muted)",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <MapPin size={15} /> {hostel.location}
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Building2 size={15} /> {totalUnits} total units
                </span>
              </div>

              <div className="card-stats">
                <div className="stat-item">
                  <span className="stat-value">{totalUnits}</span>
                  <span className="stat-label">Total Units</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{bookedUnits}</span>
                  <span className="stat-label">Booked Units</span>
                </div>
                <div className="stat-item">
                  <span
                    className="stat-value"
                    style={{
                      color:
                        availableUnits > 0 ? "var(--success)" : "var(--error)",
                    }}
                  >
                    {availableUnits}
                  </span>
                  <span className="stat-label">Remaining Units</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{occupancyRate}%</span>
                  <span className="stat-label">Occupancy</span>
                </div>
              </div>
            </section>

            <br />

            <Tabs
              tabs={[
                { id: "placements", label: "Placements" },
                { id: "payments", label: "Payment History" },
              ]}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            {activeTab === "placements" && (
              <section>
                <div className="section-header">
                  <h2>Active Placements</h2>
                </div>
                <BookingList
                  bookings={placements}
                  onUpdate={handleRefreshAll}
                />
              </section>
            )}

            {activeTab === "payments" && (
              <section>
                <div className="section-header">
                  <h2>Payment History</h2>
                </div>

                {paymentsLoading ? (
                  <div
                    className="card"
                    style={{ textAlign: "center", padding: "40px" }}
                  >
                    <Loader2
                      className="animate-spin"
                      size={28}
                      color="var(--primary)"
                    />
                  </div>
                ) : payments.length === 0 ? (
                  <div
                    className="card"
                    style={{ textAlign: "center", padding: "40px" }}
                  >
                    <p style={{ color: "var(--text-muted)" }}>
                      No payments recorded for this property yet.
                    </p>
                  </div>
                ) : (
                  <div className="data-table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Student</th>
                          <th>Method</th>
                          <th>Unit</th>
                          <th>Reference</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((payment) => (
                          <tr key={payment.id}>
                            <td>
                              {new Date(payment.paid_at).toLocaleString()}
                            </td>
                            <td>
                              <div style={{ fontWeight: 600 }}>
                                {payment.student_name}
                              </div>
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "var(--text-muted)",
                                }}
                              >
                                {payment.student_email}
                              </div>
                            </td>
                            <td>
                              {payment.method === "bank_card"
                                ? "Bank Card"
                                : "M-PESA"}
                            </td>
                            <td>{payment.unit_number}</td>
                            <td>{payment.reference}</td>
                            <td style={{ fontWeight: 700 }}>
                              KES {Number(payment.amount).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ManagerProperty;
