import React, { createContext } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import useSessionManager from "../hooks/useSessionManager";
import useSessionInterceptors from "../hooks/useSessionInterceptors";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { user, loading, saveSession, logout } = useSessionManager();

  useSessionInterceptors(logout);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      const isSessionValid = saveSession(data.token, data.user);
      if (!isSessionValid) {
        return {
          success: false,
          error: "Session expired. Please login again.",
        };
      }

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || "Login failed",
      };
    }
  };

  const register = async (fullname, email, password, role, studentNumber = null) => {
    try {
      await axios.post(`${API_BASE_URL}/auth/register`, {
        fullname,
        email,
        password,
        role,
        student_number: studentNumber,
      });
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || "Registration failed",
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
