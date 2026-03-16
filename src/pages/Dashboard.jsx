import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import useDashboardData from "../hooks/useDashboardData";
import ManagerView from "../components/ManagerView";
// import StudentView from "../components/StudentView";
import "../styles/dashboard.css";
import Navbar from "../components/Navbar";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { hostels, bookings, viewings, history, loading, refresh } =
    useDashboardData(user);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="dashboard-container">
      <Navbar user={user} onLogout={handleLogout} />
      <main className="dashboard-main">
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "100px",
            }}
          >
            <Loader2
              className="animate-spin"
              size={48}
              color="var(--primary)"
            />
          </div>
        ) : user.role === "manager" ? (
          <ManagerView
            hostels={hostels}
            bookings={bookings}
            viewings={viewings}
            onUpdate={refresh}
          />
        ) : (
          // <StudentView
          //   user={user}
          //   hostels={hostels}
          //   bookings={bookings}
          //   viewings={viewings}
          //   history={history}
          //   onUpdate={refresh}
          // />
          null
        )}
      </main>
    </div>
  );
};

export default Dashboard;