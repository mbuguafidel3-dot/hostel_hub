import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import StudentPlacement from "./pages/StudentPlacement";
import ManagerProperty from "./pages/ManagerProperty";
import Unauthorized from "./pages/Unauthorized";
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/placement"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentPlacement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manager/properties/:hostelId"
            element={
              <ProtectedRoute allowedRoles={["manager"]}>
                <ManagerProperty />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
