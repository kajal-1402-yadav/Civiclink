import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import ReportIssue from "./pages/ReportIssue";
import MyIssues from "./pages/MyIssues";
import AllIssues from "./pages/AllIssues";
import NotFound from "./pages/NotFound";
import Logout from "./pages/Logout";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

function App() {
  return (
    <Router>
      <Navbar /> {/* ✅ Navbar will show on all pages */}

      <Routes>
        {/* ✅ Protected Home */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* ✅ Other Protected Pages */}
        <Route
          path="/report"
          element={
            <ProtectedRoute>
              <ReportIssue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-issues"
          element={
            <ProtectedRoute>
              <MyIssues />
            </ProtectedRoute>
          }
        />
        <Route
          path="/all-issues"
          element={
            <ProtectedRoute>
              <AllIssues />
            </ProtectedRoute>
          }
        />

        {/* ✅ Public Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ✅ Logout */}
        <Route path="/logout" element={<Logout />} />

        {/* ✅ 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
