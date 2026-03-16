import { useState } from 'react';
import { Search, MapPin, Building2, User as UserIcon, Eye, Send, History } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import ViewingList from './ViewingList';
import Tabs from './Tabs';
import StudentHostelCard from './StudentHostelCard';

const StudentView = ({ user, hostels, bookings, viewings, history, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('browse');
  const [search, setSearch] = useState('');

  const handleRequestViewing = async (hostelId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/viewings`, { hostel_id: hostelId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Viewing request sent!');
      onUpdate();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to request viewing');
    }
  };

  const handleRequestConsideration = async (hostelId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/bookings`, { hostel_id: hostelId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Application for consideration sent!');
      onUpdate();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to request consideration');
    }
  };

  const handleGiveNotice = async (bookingId) => {
    if (!window.confirm('Are you sure you want to give leave notice? This action cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_BASE_URL}/bookings/${bookingId}/notice`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Leave notice given successfully');
      onUpdate();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to give notice');
    }
  };

  const currentPlacement = bookings.find(b => b.status === 'assigned');

  const filteredHostels = hostels.filter(h => 
    h.name.toLowerCase().includes(search.toLowerCase()) || 
    h.location.toLowerCase().includes(search.toLowerCase())
  );

  const studentTabs = [
    { id: 'browse', label: 'Browse Hostels' },
    { id: 'requests', label: 'Viewing Requests' },
    { id: 'history', label: 'History' }
  ];

  return (
    <>
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Student Dashboard</h1>
          <p>Find and manage your accommodation</p>
        </div>
      </header>

      {currentPlacement && (
        <section style={{ marginBottom: '40px' }}>
          <div className="section-header">
            <h2>Your Current Placement</h2>
          </div>
          <div className="card" style={{ borderLeft: '4px solid var(--primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ marginBottom: '5px' }}>{currentPlacement.hostel_name}</h3>
              <div style={{ display: 'flex', gap: '15px', color: 'var(--text-muted)', fontSize: '14px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={16} /> {currentPlacement.location}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Building2 size={16} /> Unit {currentPlacement.unit_number}</span>
              </div>
              {currentPlacement.notice_given === 1 && (
                <div style={{ marginTop: '10px', color: '#92400e', background: '#fef3c7', padding: '4px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, display: 'inline-block' }}>
                  Notice Given on {new Date(currentPlacement.notice_date).toLocaleDateString()}
                </div>
              )}
            </div>
            {currentPlacement.notice_given === 0 && (
              <button 
                className="auth-button" 
                style={{ width: 'auto', background: 'var(--error-bg)', color: 'var(--error)', padding: '10px 20px' }}
                onClick={() => handleGiveNotice(currentPlacement.id)}
              >
                Give Leave Notice
              </button>
            )}
          </div>
        </section>
      )}

      <Tabs 
        tabs={studentTabs} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {activeTab === 'browse' && (
        <section>
          <div className="search-container">
            <div className="input-with-icon">
              <Search size={18} className="input-icon" />
              <input 
                type="text" className="auth-input" placeholder="Search by name or location..." 
                value={search} onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="dashboard-grid">
            {filteredHostels.map(h => (
              <StudentHostelCard 
                key={h.id}
                hostel={h}
                viewing={viewings.find(v => v.hostel_id === h.id)}
                booking={bookings.find(b => b.hostel_id === h.id)}
                hasStayedBefore={history.some(item => item.hostel_id === h.id)}
                canApply={!currentPlacement || currentPlacement.notice_given === 1}
                onRequestViewing={handleRequestViewing}
                onRequestConsideration={handleRequestConsideration}
              />
            ))}
          </div>
        </section>
      )}

      {activeTab === 'requests' && (
        <section>
          <ViewingList viewings={viewings} onUpdate={onUpdate} role="student" />
        </section>
      )}

      {activeTab === 'history' && (
        <section>
          <div className="section-header">
            <h2>Booking History</h2>
          </div>
          {history.length > 0 ? (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Hostel Name</th>
                    <th>Location</th>
                    <th>Unit Number</th>
                    <th>Checkout Date</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(item => (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.hostel_name}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
                          <MapPin size={14} color="var(--text-muted)" /> {item.location}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
                          <Building2 size={14} color="var(--text-muted)" /> Unit {item.unit_number}
                        </div>
                      </td>
                      <td>
                        <span className="status-badge" style={{ background: '#f1f5f9', color: '#64748b', fontSize: '12px', padding: '4px 12px', margin: 0 }}>
                          {new Date(item.checkout_date).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
              <History size={48} color="var(--primary-light)" style={{ margin: '0 auto 20px' }} />
              <p>No past bookings found.</p>
            </div>
          )}
        </section>
      )}
    </>
  );
};

export default StudentView;
