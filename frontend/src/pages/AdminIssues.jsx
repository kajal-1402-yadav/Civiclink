import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import "../styles/AdminIssues.css";

function AdminIssues() {
  const [issues, setIssues] = useState([]);
  const [userRole, setUserRole] = useState("");
  const navigate = useNavigate();

  // ✅ Fetch user role
  const fetchUserInfo = async () => {
    try {
      const res = await api.get("/api/user/info/");
      setUserRole(res.data.role);
    } catch (error) {
      console.error("Error fetching user info:", error);
      navigate("/login");
    }
  };

  // ✅ Fetch all issues
  const fetchIssues = async () => {
    try {
      const res = await api.get("/api/all-issues/");
      setIssues(res.data);
    } catch (error) {
      console.error("Error fetching issues:", error);
    }
  };

  // ✅ Resolve issue
  const handleResolve = async (id) => {
    try {
      await api.post(`/api/resolve/${id}/`);
      fetchIssues();
    } catch (error) {
      console.error("Error resolving issue:", error);
    }
  };

  useEffect(() => {
    fetchUserInfo();
    fetchIssues();
  }, []);

  if (userRole !== "admin") {
    return <p>Access denied. Admins only.</p>;
  }

  // ✅ Filtered lists
  const pendingIssues = issues.filter((issue) => issue.status !== "resolved");
const resolvedIssues = issues.filter((issue) => issue.status === "resolved");

  return (
    <div className="admin-issues-container">
      <h2>All Reported Issues (Admin View)</h2>

      {/* ✅ Pending Issues */}
      <h3>Pending Issues</h3>
      <table className="admin-issues-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Category</th>
            <th>Reporter</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {pendingIssues.length === 0 ? (
            <tr>
              <td colSpan="5">No pending issues.</td>
            </tr>
          ) : (
            pendingIssues.map((issue) => (
              <tr key={issue.id}>
                <td>{issue.title}</td>
                <td>{issue.status}</td>
                <td>{issue.category}</td>
                <td>{issue.reporter_username}</td>
                <td>
                  <button onClick={() => handleResolve(issue.id)}>
                    Mark Resolved
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ✅ Resolved Issues */}
      <h3>Resolved Issues</h3>
      <table className="admin-issues-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Category</th>
            <th>Reporter</th>
            <th>Resolved By</th>
          </tr>
        </thead>
        <tbody>
          {resolvedIssues.length === 0 ? (
            <tr>
              <td colSpan="5">No resolved issues yet.</td>
            </tr>
          ) : (
            resolvedIssues.map((issue) => (
              <tr key={issue.id}>
                <td>{issue.title}</td>
                <td>{issue.status}</td>
                <td>{issue.category}</td>
                <td>{issue.reporter_username}</td>
                <td>{issue.resolved_by_username || "-"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AdminIssues;
