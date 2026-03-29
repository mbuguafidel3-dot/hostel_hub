import React, { useState } from "react";
import { Plus, Building2, MapPin } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import HostelCard from "./HostelCard";
import BookingList from "./BookingList";
import ViewingList from "./ViewingList";
import Tabs from "./Tabs";
import { useNavigate } from "react-router-dom";

const ManagerView = ({ hostels, bookings, viewings, onUpdate }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("hostels");
  const [showAddHostel, setShowAddHostel] = useState(false);
  const [newHostel, setNewHostel] = useState({
    name: "",
    location: "",
    total_units: "",
  });

  const handleAddHostel = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/hostels`, newHostel, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowAddHostel(false);
      setNewHostel({ name: "", location: "", total_units: "" });
      onUpdate();
    } catch (err) {
      console.error("Error adding hostel:", err);
      alert("Failed to add hostel");
    }
  };

  const managerTabs = [
    { id: "hostels", label: "Hostels" },
    { id: "viewings", label: "Viewings" },
    { id: "applications", label: "Applications" },
  ];

  return (
    <>
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Manager Dashboard</h1>
          <p>Manage your hostels and applications</p>
        </div>
        <button
          className="auth-button"
          style={{
            display: "flex",
            gap: "8px",
            width: "auto",
            padding: "12px 24px",
          }}
          onClick={() => setShowAddHostel(true)}
        >
          <Plus size={20} />
          Add Hostel
        </button>
      </header>

      <Tabs
        tabs={managerTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === "hostels" && (
        <section>
          <div className="section-header">
            <h2>Your Hostels</h2>
          </div>
          {hostels.length > 0 ? (
            <div className="dashboard-grid">
              {hostels.map((h) => (
                <HostelCard
                  key={h.id}
                  hostel={h}
                  onManage={() => navigate(`/manager/properties/${h.id}`)}
                />
              ))}
            </div>
          ) : (
            <div
              className="card"
              style={{ textAlign: "center", padding: "60px" }}
            >
              <Building2
                size={48}
                color="var(--primary-light)"
                style={{ margin: "0 auto 20px" }}
              />
              <p>You haven't added any hostels yet.</p>
              <button
                className="auth-button"
                style={{ width: "auto", margin: "20px auto 0" }}
                onClick={() => setShowAddHostel(true)}
              >
                Create Your First Hostel
              </button>
            </div>
          )}
        </section>
      )}

      {activeTab === "viewings" && (
        <section>
          <div className="section-header">
            <h2>Viewing Requests</h2>
          </div>
          <ViewingList viewings={viewings} onUpdate={onUpdate} role="manager" />
        </section>
      )}

      {activeTab === "applications" && (
        <section>
          <div className="section-header">
            <h2>Consideration Applications</h2>
          </div>
          <BookingList
            bookings={bookings.filter((b) => b.status === "pending")}
            onUpdate={onUpdate}
          />
        </section>
      )}

      {showAddHostel && (
        <div className="modal-backdrop">
          <div className="auth-card modal-content">
            <div className="auth-header">
              <h1>Add New Hostel</h1>
              <p>Enter the details of your accommodation</p>
            </div>
            <form onSubmit={handleAddHostel}>
              <div className="form-group">
                <label>Hostel Name</label>
                <input
                  type="text"
                  className="auth-input"
                  style={{ paddingLeft: "15px" }}
                  required
                  value={newHostel.name}
                  onChange={(e) =>
                    setNewHostel({ ...newHostel, name: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <div className="input-with-icon">
                  <MapPin size={18} className="input-icon" />
                  <input
                    type="text"
                    className="auth-input"
                    required
                    value={newHostel.location}
                    onChange={(e) =>
                      setNewHostel({ ...newHostel, location: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Total Units</label>
                <input
                  type="number"
                  className="auth-input"
                  style={{ paddingLeft: "15px" }}
                  required
                  value={newHostel.total_units}
                  onChange={(e) =>
                    setNewHostel({ ...newHostel, total_units: e.target.value })
                  }
                />
              </div>
              <div style={{ display: "flex", gap: "15px", marginTop: "30px" }}>
                <button type="submit" className="auth-button">
                  Add Hostel
                </button>
                <button
                  type="button"
                  className="auth-button"
                  style={{
                    background: "var(--bg-main)",
                    color: "var(--text-main)",
                  }}
                  onClick={() => setShowAddHostel(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ManagerView;
