import React, { useState } from "react";
import useAuth from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import {
  UserPlus,
  User,
  Mail,
  Lock,
  Briefcase,
  Loader2,
  Hash,
} from "lucide-react";
import AuthNavbar from "../components/AuthNavbar";
import AuthFooter from "../components/AuthFooter";
import "../styles/auth.css";
import "../styles/auth-layout.css";

const Register = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    role: "student",
    student_number: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // We'll need to update the register call to include student_number if it's a student
    const result = await register(
      formData.fullname,
      formData.email,
      formData.password,
      formData.role,
      formData.role === "student" ? formData.student_number : null,
    );
    if (result.success) {
      navigate("/login");
    } else {
      setError(result.error);
    }
    setIsSubmitting(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <div className="auth-page">
      <AuthNavbar />

      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <UserPlus size={32} color="var(--primary)" />
            </div>
            <h1>Create Account</h1>
            <p>Join the hostel booking system</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="fullname">Full Name</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  id="fullname"
                  type="text"
                  className="auth-input"
                  placeholder="Enter your full name"
                  value={formData.fullname}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  id="email"
                  type="email"
                  className="auth-input"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  id="password"
                  type="password"
                  className="auth-input"
                  placeholder="Secure password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="role">Role</label>
              <div className="input-with-icon">
                <Briefcase size={18} className="input-icon" />
                <select
                  id="role"
                  className="auth-input"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="student">Student</option>
                  <option value="manager">Hostel Manager</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              {formData.role === "student" && (
                <>
                  <label htmlFor="student_number">Student Number</label>
                  <div className="input-with-icon">
                    <Hash size={18} className="input-icon" />
                    <input
                      id="student_number"
                      type="text"
                      className="auth-input"
                      placeholder="Enter student ID"
                      value={formData.student_number}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </>
              )}
            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account? <Link to="/login">Login here</Link>
          </div>
        </div>
      </div>

      <AuthFooter />
    </div>
  );
};

export default Register;
