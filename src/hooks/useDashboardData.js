import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

const useDashboardData = (user) => {
  const [hostels, setHostels] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [viewings, setViewings] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      if (user.role === "manager") {
        const [hostelsRes, bookingsRes, viewingsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/hostels`, { headers }),
          axios.get(`${API_BASE_URL}/bookings/manager`, { headers }),
          axios.get(`${API_BASE_URL}/viewings/manager`, { headers }),
        ]);
        setHostels(hostelsRes.data);
        setBookings(bookingsRes.data);
        setViewings(viewingsRes.data);
      } else if (user.role === "student") {
        const [hostelsRes, viewingsRes, studentBookingsRes, historyRes] =
          await Promise.all([
            axios.get(`${API_BASE_URL}/hostels/all`, { headers }),
            axios.get(`${API_BASE_URL}/viewings/student`, { headers }),
            axios.get(`${API_BASE_URL}/bookings/student`, { headers }),
            axios.get(`${API_BASE_URL}/bookings/student/history`, { headers }),
          ]);
        setHostels(hostelsRes.data);
        setViewings(viewingsRes.data);
        setBookings(studentBookingsRes.data);
        setHistory(historyRes.data);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    hostels,
    bookings,
    viewings,
    history,
    loading,
    refresh: fetchData,
  };
};

export default useDashboardData;
