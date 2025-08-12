import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import styles from "../styles/MyIssues.module.css";
import Navbar from "../components/Navbar";
import { FiMapPin, FiCalendar, FiClock, FiEdit2, FiTrash2 } from "react-icons/fi";

function MyIssuesPage() {
  const [issues, setIssues] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    priority: "",
    dateFrom: "",
    dateTo: "",
    sortBy: ""
  });
  const [commentCounts, setCommentCounts] = useState({});
  const navigate = useNavigate();

  const fetchIssuesAndComments = async () => {
    try {
      const res = await api.get("/api/my-issues/");
      setIssues(res.data);

      const counts = {};
      await Promise.all(
        res.data.map(async (issue) => {
          try {
            const commentsRes = await api.get(`/api/issue/${issue.id}/comments/`);
            counts[issue.id] = commentsRes.data.length;
          } catch {
            counts[issue.id] = 0;
          }
        })
      );
      setCommentCounts(counts);
    } catch (error) {
      console.error("Error fetching issues/comments:", error);
    }
  };

  useEffect(() => {
    fetchIssuesAndComments();
  }, []);

  const deleteIssue = async (id) => {
    if (window.confirm("Are you sure you want to delete this issue? This action cannot be undone.")) {
      try {
        await api.delete(`/api/issue/${id}/delete/`);
        setIssues(issues.filter((issue) => issue.id !== id));
      } catch (error) {
        console.error("Error deleting issue:", error);
      }
    }
  };

  // Apply filtering & sorting like CommunityIssues
  const filteredIssues = issues
    .filter((issue) => {
      const matchStatus = filters.status ? issue.status === filters.status : true;
      const matchCategory = filters.category ? issue.category === filters.category : true;
      const matchPriority = filters.priority ? issue.priority === filters.priority : true;

      const issueDate = new Date(issue.created_at);
      const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
      const toDate = filters.dateTo ? new Date(filters.dateTo) : null;

      const matchDateFrom = fromDate ? issueDate >= fromDate : true;
      const matchDateTo = toDate ? issueDate <= toDate : true;

      return matchStatus && matchCategory && matchPriority && matchDateFrom && matchDateTo;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case "dateAsc":
          return new Date(a.created_at) - new Date(b.created_at);
        case "dateDesc":
          return new Date(b.created_at) - new Date(a.created_at);
        default:
          return 0;
      }
    });

  const getProgressPercent = (status) => {
    switch (status.toLowerCase()) {
      case "open":
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
    <div className={styles.myIssuesWrapper}>
      <Navbar />
      <div className={styles.main}>
        <h2 className={styles.pageTitle}>My Reported Issues</h2>

        {/* Filter Bar with 6 filters now */}
        <div className={styles.filterBar}>
          {/* Status */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="in progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          {/* Category */}
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          >
            <option value="">All Categories</option>
            <option value="road">Road</option>
            <option value="garbage">Garbage</option>
            <option value="water">Water</option>
            <option value="electricity">Electricity</option>
            <option value="other">Other</option>
          </select>

          {/* Priority */}
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          {/* Date From */}
          <label>
            From:{" "}
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            />
          </label>

          {/* Date To */}
          <label>
            To:{" "}
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            />
          </label>

          {/* Sort By */}
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
          >
            <option value="">Sort By</option>
            <option value="dateAsc">Date Ascending</option>
            <option value="dateDesc">Date Descending</option>
          </select>
        </div>

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
                  <h3>{issue.title}</h3>
                  <p className={styles.metaItem}>
                    <FiMapPin /> {issue.address}
                  </p>

                  <div className={styles.progressSection}>
                    <div className={styles.progressBarBg}>
                      <div
                        className={styles.progressBarFill}
                        style={{ width: `${getProgressPercent(issue.status)}%` }}
                      ></div>
                    </div>
                    <div className={styles.progressLabels}>
                      <span>Reported</span>
                      <span>Acknowledged</span>
                      <span>In Progress</span>
                      <span>Resolved</span>
                      <span>Closed</span>
                    </div>
                    <p className={styles.progressPercent}>
                      {getProgressPercent(issue.status)}%
                    </p>
                  </div>

                  <p>
                    <strong>Description:</strong> {issue.description}
                  </p>
                  <div className={styles.issueMetaRow}>
                    <p className={styles.metaItem}>
                      <FiCalendar /> Reported {new Date(issue.created_at).toDateString()}
                    </p>
                    <p className={styles.metaItem}>
                      <FiClock /> {issue.days_open || 0} days
                    </p>
                    <div className={styles.metaLeft}>
                      Priority:
                      <span
                        className={`${styles.priorityTag} ${
                          styles[issue.priority.toLowerCase()]
                        }`}
                      >
                        {issue.priority}
                      </span>
                    </div>
                    <div className={styles.metaRight}>
                      <button
                        className={styles.metaRightEdit}
                        onClick={() => navigate(`/edit-issue/${issue.id}`)}
                      >
                        <FiEdit2 /> Edit
                      </button>
                      <button
                        className={styles.metaRightDelete}
                        onClick={() => deleteIssue(issue.id)}
                      >
                        <FiTrash2 style={{ marginRight: "6px" }} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MyIssuesPage;
