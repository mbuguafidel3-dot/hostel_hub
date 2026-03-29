import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = "token";
const USER_KEY = "user";

export const getTokenExpiryMs = (token) => {
  try {
    const decodedPayload = jwtDecode(token);
    if (!decodedPayload?.exp) return null;

    return decodedPayload.exp * 1000;
  } catch {
    return null;
  }
};

const clearStoredSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  delete axios.defaults.headers.common.Authorization;
};

const hydrateUserFromStorage = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  const storedUser = localStorage.getItem(USER_KEY);

  if (!token || !storedUser) {
    clearStoredSession();
    return null;
  }

  try {
    const parsedUser = JSON.parse(storedUser);
    const expiresAtMs = getTokenExpiryMs(token);

    if (!expiresAtMs || Date.now() >= expiresAtMs) {
      clearStoredSession();
      return null;
    }

    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    return parsedUser;
  } catch {
    clearStoredSession();
    return null;
  }
};

const useSessionManager = () => {
  const [user, setUser] = useState(() => hydrateUserFromStorage());
  const [loading] = useState(false);
  const logoutTimerRef = useRef(null);

  const clearLogoutTimer = useCallback(() => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  }, []);

  const clearSession = useCallback(() => {
    clearLogoutTimer();
    clearStoredSession();
    setUser(null);
  }, [clearLogoutTimer]);

  const scheduleAutoLogout = useCallback(
    (token, onExpire) => {
      clearLogoutTimer();
      const expiresAtMs = getTokenExpiryMs(token);

      if (!expiresAtMs) return false;

      const msUntilExpiry = expiresAtMs - Date.now();
      if (msUntilExpiry <= 0) return false;

      logoutTimerRef.current = setTimeout(() => {
        onExpire();
      }, msUntilExpiry);

      return true;
    },
    [clearLogoutTimer],
  );

  const saveSession = useCallback(
    (token, nextUser) => {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      setUser(nextUser);

      const isSessionValid = scheduleAutoLogout(token, clearSession);
      if (!isSessionValid) {
        clearSession();
        return false;
      }

      return true;
    },
    [clearSession, scheduleAutoLogout],
  );

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    const isSessionValid = scheduleAutoLogout(token, clearSession);
    if (!isSessionValid) {
      clearStoredSession();
    }
  }, [clearSession, scheduleAutoLogout]);

  useEffect(() => {
    return () => {
      clearLogoutTimer();
    };
  }, [clearLogoutTimer]);

  return {
    user,
    loading,
    saveSession,
    logout: clearSession,
  };
};

export default useSessionManager;
