import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import axios from "axios";
import useAuth from "../hooks/useAuth";
import useDashboardData from "../hooks/useDashboardData";
import Navbar from "../components/Navbar";
import Tabs from "../components/Tabs";
import CurrentPlacementPanel from "../components/CurrentPlacementPanel";
import { API_BASE_URL } from "../config/api";
import "../styles/dashboard.css";
import "../styles/student-placement.css";

const StudentPlacement = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { bookings, loading, refresh } = useDashboardData(user);
  const [activeTab, setActiveTab] = useState("payments");

  const currentPlacement = bookings.find(
    (booking) => booking.status === "assigned",
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleGiveNotice = async () => {
    if (!currentPlacement) return;

    if (
      !window.confirm(
        "Are you sure you want to give leave notice? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_BASE_URL}/bookings/${currentPlacement.id}/notice`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      alert("Leave notice given successfully");
      refresh();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to give notice");
    }
  };

  if (!user) return null;

  return (
    <div className="dashboard-container">
      <Navbar user={user} onLogout={handleLogout} />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-content">
            <h1>Manage Placement</h1>
            <p>Everything related to your current hostel placement</p>
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
        ) : !currentPlacement ? (
          <section className="card placement-card">
            <h3>No active placement</h3>
            <p className="placement-muted">
              You currently do not have an assigned hostel unit. Once assigned,
              placement tools will appear here.
            </p>
          </section>
        ) : (
          <>
            <CurrentPlacementPanel
              placement={currentPlacement}
              mode="default"
              className="card placement-card"
              actionButton={
                currentPlacement.notice_given === 0
                  ? {
                      label: "Give Leave Notice",
                      onClick: handleGiveNotice,
                      variant: "danger",
                    }
                  : null
              }
              noticeMessage={
                currentPlacement.notice_given === 1
                  ? "Your leave notice has been submitted. Await manager action."
                  : ""
              }
            />

            <br />

            <Tabs
              tabs={[
                { id: "payments", label: "Payments" },
                { id: "payment-history", label: "Payment History" },
                { id: "tools", label: "Tools (Coming Soon)" },
              ]}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            {activeTab === "payments" && (
              <section className="card placement-card">
                <h3>Placement Payments</h3>
                <p className="placement-muted">
                  More placement details and actions will live in this tab as we
                  continue expanding this page.
                </p>
              </section>
            )}

            {activeTab === "payment-history" && (
              <section className="card placement-card">
                <h3>Payment History</h3>
                <p className="placement-muted">
                  We will add additional actions and tabs here in the next
                  phase.
                </p>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default StudentPlacement;
