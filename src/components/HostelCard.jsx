import { MapPin } from 'lucide-react';
import '../styles/dashboard.css';

const HostelCard = ({ hostel }) => {
  const isFull = hostel.booked_units >= hostel.total_units;
  const available = hostel.total_units - hostel.booked_units;

  return (
    <div className="card">
      <div className="card-header">
        <h3>{hostel.name}</h3>
        <span className={`status-badge ${isFull ? 'status-full' : 'status-active'}`}>
          {isFull ? 'Fully Booked' : 'Available'}
        </span>
      </div>
      
      <div className="card-content">
        <div className="user-info" style={{ marginBottom: '10px' }}>
          <MapPin size={16} />
          <span>{hostel.location}</span>
        </div>
        
        <div className="card-stats">
          <div className="stat-item">
            <span className="stat-value">{hostel.total_units}</span>
            <span className="stat-label">Total Units</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{hostel.booked_units}</span>
            <span className="stat-label">Booked</span>
          </div>
          <div className="stat-item" style={{ borderLeft: '1px solid var(--border)', paddingLeft: '20px' }}>
            <span className="stat-value" style={{ color: available > 0 ? 'var(--success)' : 'var(--error)' }}>
              {available}
            </span>
            <span className="stat-label">Available</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostelCard;
