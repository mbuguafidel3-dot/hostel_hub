import { Building2 } from "lucide-react";
import { Link } from "react-router-dom";

const AuthNavbar = () => {
  return (
    <header className="auth-top-nav" aria-label="Authentication navigation">
      <div className="auth-top-nav-inner">
        <Link to="/" className="auth-brand">
          <span className="auth-brand-icon" aria-hidden="true">
            <Building2 size={18} />
          </span>
          <span>HostelHub</span>
        </Link>

        <nav className="auth-nav-links" aria-label="Auth links">
          <Link to="/">Home</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </nav>
      </div>
    </header>
  );
};

export default AuthNavbar;
