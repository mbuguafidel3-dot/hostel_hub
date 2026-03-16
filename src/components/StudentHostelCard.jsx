import { MapPin, User as UserIcon, Building2, Eye, Send } from 'lucide-react';

const StudentHostelCard = ({ 
  hostel, 
  viewing, 
  booking, 
  hasStayedBefore, 
  canApply, 
  onRequestViewing, 
  onRequestConsideration 
}) => {
  return (
    <div className="card hostel-card">
      <div className="hostel-info">
        <h3>{hostel.name}</h3>
        <div className="hostel-stats">
          <div className="stat-item"><MapPin size={16} /> {hostel.location}</div>
          <div className="stat-item"><UserIcon size={16} /> {hostel.manager_name}</div>
          <div className="stat-item"><Building2 size={16} /> {hostel.total_units - hostel.booked_units} Available</div>
        </div>
      </div>
      <div className="card-actions">
        {!viewing && !hasStayedBefore && (
          <button 
            className="auth-button" 
            style={{ fontSize: '14px', padding: '8px 16px', width: 'auto' }} 
            onClick={() => onRequestViewing(hostel.id)}
          >
            <Eye size={16} style={{ marginRight: '6px' }} /> Request Viewing
          </button>
        )}
        {((viewing && viewing.status === 'completed') || hasStayedBefore) && !booking && (
          <button 
            className="auth-button" 
            style={{ 
              fontSize: '14px', padding: '8px 16px', width: 'auto', 
              background: canApply ? 'var(--success-bg)' : '#f1f5f9', 
              color: canApply ? 'var(--success)' : '#94a3b8',
              cursor: canApply ? 'pointer' : 'not-allowed'
            }} 
            onClick={() => canApply && onRequestConsideration(hostel.id)}
            title={!canApply ? 'Give notice at your current hostel first' : ''}
            disabled={!canApply}
          >
            <Send size={16} style={{ marginRight: '6px' }} /> Apply for Consideration
          </button>
        )}
        {viewing && viewing.status !== 'completed' && (
          <span className={`status-badge status-${viewing.status}`} style={{ margin: 0 }}>
            Viewing {viewing.status}
          </span>
        )}
        {booking && (
          <span className={`status-badge status-${booking.status}`} style={{ margin: 0 }}>
            {booking.status === 'pending' ? 'Application Pending' : booking.status === 'assigned' ? `Assigned Unit: ${booking.unit_number}` : 'Application Completed'}
          </span>
        )}
      </div>
    </div>
  );
};

export default StudentHostelCard;
