import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import styles from "../styles/AdminDashboard.module.css";

export default function AdminDashboard() {
  const [issues, setIssues] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      navigate("/");  // 🚫 Prevent non-admins
    }

    api.get("/api/all-issues/")
      .then(res => setIssues(res.data))
      .catch(err => console.error(err));
  }, [navigate]);

  const resolveIssue = (id) => {
    api.post(`/api/resolve/${id}/`)
      .then(() => {
        alert("Issue resolved!");
        setIssues(prev => prev.map(i => i.id === id ? { ...i, status: 'resolved' } : i));
      })
      .catch(err => alert("Failed to resolve: " + err.message));
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Admin Dashboard</h1>

      {issues.length === 0 ? (
        <p className={styles.noIssues}>No issues found.</p>
      ) : (
        <ul className={styles.issueList}>
          {issues.map(issue => (
            <li key={issue.id} className={styles.issueItem}>
              <div>
                <strong>{issue.title}</strong> — <span className={styles.status}>{issue.status}</span>
              </div>
              {issue.status !== "resolved" && (
                <button
                  onClick={() => resolveIssue(issue.id)}
                  className={styles.resolveButton}
                >
                  Mark Resolved
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
