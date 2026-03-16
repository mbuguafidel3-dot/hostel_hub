import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import "../styles/common.css";

const Unauthorized = () => {
  return (
    <div className="unauthorized-container">
      <div className="unauthorized-card">
        <ShieldAlert size={64} color="#dc2626" />
        <h1>Access Denied</h1>
        <p>You don't have permission to view this page.</p>
        <Link to="/dashboard" className="back-btn">Back to Dashboard</Link>
      </div>
      
     
    </div>
  );
};

export default Unauthorized;
