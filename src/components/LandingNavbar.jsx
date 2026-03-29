import { Link } from "react-router-dom";
import { Building2 } from "lucide-react";
import "../styles/landing-navbar.css";

const LandingNavbar = ({ user }) => {
  return (
    <nav className="landing-nav" aria-label="Homepage navigation">
      <div className="landing-nav-inner">
        <Link className="landing-brand" to="/">
          <span className="landing-brand-icon" aria-hidden="true">
            <Building2 size={18} />
          </span>
          <span>HostelHub</span>
        </Link>

        <div className="landing-links">
          <a href="#benefits">Benefits</a>
          <a href="#process">How it works</a>
          <a href="#campus">For Students</a>
          <a href="#managers">For Managers</a>
        </div>

        <div className="landing-actions">
          {user ? (
            <Link className="landing-cta landing-cta-primary" to="/dashboard">
              Dashboard
            </Link>
          ) : (
            <>
              <Link className="landing-cta landing-cta-ghost" to="/login">
                Login
              </Link>
              <Link className="landing-cta landing-cta-primary" to="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default LandingNavbar;
