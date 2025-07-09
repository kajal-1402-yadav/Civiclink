import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import MyIssues from "./pages/MyIssues";
import IssueMap from "./pages/IssueMap";
import ReportIssue from "./pages/ReportIssue";
import EditIssue from "./pages/EditIssue";
import CommunityIssues from "./pages/CommunityIssues";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

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
      <Navbar />
      <Routes>
        {/* ✅ Public Home (or wrap with ProtectedRoute if needed) */}
        <Route
          path="/"
          element={
            <Home />
            // If you want to protect Home:
            // <ProtectedRoute><Home /></ProtectedRoute>
          }
        />

        {/* ✅ Protected Routes */}
        <Route
          path="/report"
          element={
            <ProtectedRoute>
              <ReportIssue />
            </ProtectedRoute>
          }
        />

        <Route
          path="/issues-map"
          element={
            <ProtectedRoute>
              <IssueMap />
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
          path="/api/public-issues"
          element={
            <ProtectedRoute>
              <CommunityIssues />
            </ProtectedRoute>
          }
        />
        <Route path="/edit-issue/:issueId" element={<EditIssue />} />

        {/* ✅ Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterAndLogout />} />
        <Route path="/logout" element={<Logout />} />

        {/* ✅ 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
