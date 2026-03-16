import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, User, Mail, Lock, Briefcase, Loader2 } from 'lucide-react';
import "../styles/auth.css";

const Register = () => {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    const result = await register(formData.fullname, formData.email, formData.password, formData.role);
    if (result.success) {
      navigate('/login');
    } else {
      setError(result.error);
    }
    setIsSubmitting(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <div className="register-logo">
            <UserPlus size={32} color="#6366f1" />
          </div>
          <h1>Create Account</h1>
          <p>Join the hostel booking system</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="fullname">Full Name</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                id="fullname"
                type="text"
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
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="student">Student</option>
                <option value="manager">Hostel Manager</option>
              </select>
            </div>
          </div>
          
          <button type="submit" className="register-button" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
          </button>
        </form>
        
        <div className="register-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </div>
      
  
    </div>
  );
};

export default Register