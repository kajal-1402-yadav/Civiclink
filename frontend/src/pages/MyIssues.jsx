import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import styles from "../styles/MyIssues.module.css";
import Navbar from "../components/Navbar";

function MyIssuesPage() {
  const [issues, setIssues] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    priority: "",
  });
  const navigate = useNavigate();

  const fetchIssues = async () => {
    try {
      const response = await api.get("/api/my-issues/");
      setIssues(response.data);
    } catch (error) {
      console.error("Error fetching issues:", error);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const filteredIssues = issues.filter((issue) => {
    const matchStatus = filters.status ? issue.status === filters.status : true;
    const matchCategory = filters.category ? issue.category === filters.category : true;
    const matchPriority = filters.priority ? issue.priority === filters.priority : true;
    return matchStatus && matchCategory && matchPriority;
  });

  const getProgressPercent = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return 10;
      case "acknowledged":
        return 30;
      case "in progress":
        return 60;
      case "resolved":
        return 90;
      case "closed":
        return 100;
      default:
        return 0;
    }
  };

  return (
    <>
      <Navbar />

      <div className={styles.myIssuesContainer}>
        <h2 className={styles.pageTitle}>My Reported Issues</h2>

        {/* Filters */}
        <div className={styles.filterBar}>
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="in progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
            <option value="">All Categories</option>
            <option value="road">Road</option>
            <option value="garbage">Garbage</option>
            <option value="water">Water</option>
            <option value="electricity">Electricity</option>
            <option value="other">Other</option>
          </select>

          <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {/* Issues */}
        {filteredIssues.length === 0 ? (
          <p>No issues match the selected filters.</p>
        ) : (
          filteredIssues.map((issue) => (
            <div key={issue.id} className={styles.issueCard}>
              <div className={styles.issueRow}>
                {issue.image && (
                  <img src={issue.image} alt="Issue" className={styles.issueImage} />
                )}

                <div className={styles.issueDetails}>
                  <h3 style={{ color: "orange" }}>{issue.title}</h3>
                  <p>📍 {issue.address}</p>

                  <div className={styles.progressSection}>
                    <div className={styles.progressBarBg}>
                      <div
                        className={styles.progressBarFill}
                        style={{ width: `${getProgressPercent(issue.status)}%` }}
                      ></div>
                    </div>
                    <div className={styles.progressLabels}>
                      <span>Reported</span>
                      <span>In Progress</span>
                      <span>Resolved</span>
                    </div>
                    <p className={styles.progressPercent}>
                      {getProgressPercent(issue.status)}%
                    </p>
                  </div>

                  <p><strong>Description:</strong> {issue.description}</p>
                  <p>🗓️ Reported: {new Date(issue.created_at).toDateString()}</p>
                  <p>📅 Open (Days): {issue.days_open || 0}</p>

                  <p>
                    Priority:{" "}
                    <span className={`${styles.priorityTag} ${styles[issue.priority]}`}>
                      {issue.priority}
                    </span>
                  </p>

                  <button onClick={() => navigate(`/edit-issue/${issue.id}`)}>
                    ✏️ Edit
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default MyIssuesPage;
