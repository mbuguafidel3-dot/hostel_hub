import React, { useState } from 'react';
import { User, Mail, Hash, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import '../styles/dashboard.css';

const BookingList = ({ bookings, onUpdate }) => {
  const [assigningId, setAssigningId] = useState(null);
  const [unitNumber, setUnitNumber] = useState('');

  const handleAssign = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_BASE_URL}/bookings/${bookingId}/assign`, 
        { unit_number: unitNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAssigningId(null);
      setUnitNumber('');
      onUpdate();
    } catch (err) {
      console.error('Error assigning unit:', err);
      alert('Failed to assign unit');
    }
  };

  const handleLeave = async (bookingId) => {
    if (!window.confirm('Are you sure you want to approve this student checking out?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_BASE_URL}/bookings/${bookingId}/leave`, 
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdate();
    } catch (err) {
      console.error('Error approving leave:', err);
      alert('Failed to approve checkout');
    }
  };

  if (!bookings || bookings.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: 'var(--text-muted)' }}>No bookings found for your hostels.</p>
      </div>
    );
  }

  return (
    <div className="data-table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Email / ID</th>
            <th>Hostel</th>
            <th>Unit Number</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td>
                <div style={{ fontWeight: 600 }}>{booking.student_name}</div>
                {booking.notice_given === 1 && (
                  <div style={{ fontSize: '10px', color: '#92400e', background: '#fef3c7', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '4px' }}>
                    Notice Given
                  </div>
                )}
              </td>
              <td>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{booking.student_email}</div>
                <div style={{ fontSize: '12px', color: 'var(--primary)' }}>{booking.student_number}</div>
              </td>
              <td>{booking.hostel_name}</td>
              <td>
                {booking.status === 'assigned' ? (
                  <span style={{ fontWeight: 600 }}>{booking.unit_number}</span>
                ) : assigningId === booking.id ? (
                  <input
                    type="text"
                    placeholder="Unit #"
                    value={unitNumber}
                    onChange={(e) => setUnitNumber(e.target.value)}
                    style={{ padding: '4px 8px', width: '80px', borderRadius: '4px', border: '1px solid var(--border)' }}
                    autoFocus
                  />
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Not assigned</span>
                )}
              </td>
              <td>
                <span className={`status-badge status-${booking.status}`}>
                  {booking.status}
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {booking.status === 'pending' && (
                    assigningId === booking.id ? (
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button 
                          onClick={() => handleAssign(booking.id)}
                          className="assign-btn"
                          style={{ background: 'var(--success-bg)', color: 'var(--success)' }}
                          disabled={!unitNumber}
                        >
                          Save
                        </button>
                        <button 
                          onClick={() => setAssigningId(null)}
                          className="assign-btn"
                          style={{ background: 'var(--bg-main)', color: 'var(--text-muted)' }}
                        >
                          X
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setAssigningId(booking.id)}
                        className="assign-btn"
                      >
                        Assign Unit
                      </button>
                    )
                  )}
                  {booking.status === 'assigned' && (
                    <>
                      <button 
                        onClick={() => handleLeave(booking.id)}
                        className="assign-btn"
                        style={{ background: 'var(--error-bg)', color: 'var(--error)' }}
                      >
                        Check Out
                      </button>
                      <CheckCircle size={18} color="var(--success)" />
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookingList;
