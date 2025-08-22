import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "./api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "./constants";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import MyIssues from "./pages/MyIssues";
import ReportIssue from "./pages/ReportIssue";
import CommunityIssues from "./pages/CommunityIssues";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";

function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />;
}

function RegisterAndLogout() {
  localStorage.clear();
  return <Register />;
}

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const refreshAccessToken = async () => {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN);
      if (refreshToken) {
        try {
          const res = await api.post("/api/token/refresh/", { refresh: refreshToken });
          localStorage.setItem(ACCESS_TOKEN, res.data.access);
        } catch (err) {
          console.error("Refresh token failed", err);
          localStorage.removeItem(ACCESS_TOKEN);
          localStorage.removeItem(REFRESH_TOKEN);
        }
      }
      setLoading(false);
    };
    refreshAccessToken();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* 🌐 Public Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterAndLogout />} />
        <Route path="*" element={<NotFound />} />

        {/*Main App Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/user/info" element={<Profile />} />
        <Route path="/my-issues" element={<MyIssues />} />
        <Route path="/report" element={<ReportIssue />} />
        
        <Route path="/all-issues" element={<CommunityIssues />} />
        <Route path="/analytics" element={<Analytics />} />


        <Route path="/logout" element={<Logout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
