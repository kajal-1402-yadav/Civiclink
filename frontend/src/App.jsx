import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";

// Dashboard pages
import Dashboard from "./pages/Dashboard";
import MyIssues from "./pages/MyIssues";
import ReportIssue from "./pages/ReportIssue";
import IssueMap from "./pages/IssueMap";
import EditIssue from "./pages/EditIssue";
import CommunityIssues from "./pages/CommunityIssues";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";

// Admin
import AdminDashboard from "./pages/AdminDashboard";

function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />;
}

function RegisterAndLogout() {
  localStorage.clear();
  return <Register />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🌐 Public Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterAndLogout />} />
        <Route path="*" element={<NotFound />} />

        {/* 🔐 Main App Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
          {/* ⬇️ Nested under /dashboard (relative paths only) */}
          <Route path="/user/info" element={<Profile />} />
          <Route path="/my-issues" element={<MyIssues />} />
          <Route path="/report" element={<ReportIssue />} />
          <Route path="/issues-map" element={<IssueMap />} />
          <Route path="/edit-issue/:issueId" element={<EditIssue />} />
          <Route path="/all-issues" element={<CommunityIssues />} />
          <Route path="/analytics" element={<Analytics />} />
       

        {/* 🔒 Admin-only dashboard */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* 🔓 Optional: Logout Route */}
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
