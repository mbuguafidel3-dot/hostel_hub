import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import '../styles/common.css';

const Unauthorized = () => {
  return (
    <div className="auth-container">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <ShieldAlert size={64} color="var(--error)" style={{ margin: '0 auto' }} />
        <h1 style={{ fontSize: '28px', margin: '20px 0 10px', color: 'var(--text-main)' }}>Access Denied</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>You don't have permission to view this page.</p>
        <Link to="/dashboard" className="auth-button" style={{ display: 'inline-flex', width: 'auto', padding: '12px 24px' }}>
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
