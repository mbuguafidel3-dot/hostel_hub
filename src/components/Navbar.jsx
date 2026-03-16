import { LogOut } from "lucide-react";
import { UserIcon } from "lucide-react";
import { Building2 } from "lucide-react";

function Navbar({ user, onLogout }) {
  return (
    <nav className="dashboard-nav">
      <div className="nav-logo">
        <Building2 color="var(--primary)" size={28} />
        <span>HostelHub</span>
      </div>
      <div className="nav-user">
        <div className="user-info">
          <UserIcon size={28} />
          <div className="user-info-text">
            <span>{user.fullname}</span>
            <span className="role-badge">{user.role}</span>
          </div>
        </div>
        <button onClick={onLogout} className="logout-btn">
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
