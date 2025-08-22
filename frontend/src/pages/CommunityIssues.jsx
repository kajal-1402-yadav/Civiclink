import React, { useEffect, useState } from "react";
import api from "../api";
import CommentsSection from "../components/CommentsSection";
import styles from "../styles/CommunityIssues.module.css";
import Navbar from "../components/Navbar";
import {
  FiCalendar,
  FiClock,
  FiThumbsUp,
  FiMessageSquare,
  FiMapPin,
} from "react-icons/fi";

function CommunityIssues() {
  const [issues, setIssues] = useState([]);
  const [expandedComments, setExpandedComments] = useState({});
  const [commentCounts, setCommentCounts] = useState({});

  const [filters, setFilters] = useState({
    status: "",
    category: "",
    priority: "",
    dateFrom: "",
    dateTo: "",
    sortBy: "",
  });

  useEffect(() => {
  const fetchIssuesAndComments = async () => {
    try {
      const resIssues = await api.get("/api/public-issues/");
      const issuesData = resIssues.data.map(issue => ({
        ...issue,
        image: fixImageUrl(issue.image),
        upvotes_count: Number(issue.upvotes_count) || 0,
        user_has_voted: Boolean(issue.user_has_voted),
      }));

      setIssues(issuesData);

      const counts = {};
      await Promise.all(
        issuesData.map(async (issue) => {
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
      console.error("Error fetching issues or comments:", error);
    }
  };

  fetchIssuesAndComments();
}, []);


  const fixImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("http")) return imageUrl;
   return `http://localhost:8000${imageUrl}`;
};

  const toggleComments = (id) =>
    setExpandedComments((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));

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

  const filteredIssues = issues
    .filter((issue) => {
      const matchStatus = filters.status ? (issue.status || "").toLowerCase() === filters.status : true;
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
        case "votes":
          return (b.upvotes_count || 0) - (a.upvotes_count || 0);
        default:
          return 0;
      }
    });

  const handleVote = async (issueId) => {
    try {
      // single toggle endpoint; backend returns updated counts/state
      const { data } = await api.post(`/api/issue/${issueId}/upvote/`);
      const { upvotes_count, user_has_voted } = data || {};

      setIssues((prevIssues) =>
        prevIssues.map((issue) =>
          issue.id === issueId
            ? {
                ...issue,
                upvotes_count: Number(upvotes_count) || issue.upvotes_count || 0,
                user_has_voted: Boolean(user_has_voted),
              }
            : issue
        )
      );
    } catch (error) {
      const backendMessage = error.response?.data?.message || error.message;
      console.error("Error updating vote:", backendMessage);
      // Do not mutate counts on error
    }
  };

  return (
    <>
      <div className={styles.main}>
        <Navbar />
        <div className={styles.container}>
          <h2 className={styles.pageTitle}>Community Reported Issues</h2>

          <div className={styles.filterBar}>
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

            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <label>
              From:{" "}
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </label>

            <label>
              To:{" "}
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </label>

            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            >
              <option value="">Sort By</option>
              <option value="dateAsc">Date Ascending</option>
              <option value="dateDesc">Date Descending</option>
              <option value="votes">Votes</option>
            </select>
          </div>

          {filteredIssues.map((issue) => (
            <div
              key={issue.id}
              className={`${styles.card} ${
                issue.reporter_username === localStorage.getItem("username")
                  ? styles.yourReport
                  : ""
              }`}
            >
              {issue.image && (
                <img
                  src={issue.image}
                  alt="Issue"
                  className={styles.image}
                  onError={(e) => {
                    e.target.style.display = "none"; 
                  }}
                />
              )}

              <div className={styles.details}>
                <h3>{issue.title}</h3>

                {issue.reporter_username === localStorage.getItem("username") && (
                  <p style={{ fontStyle: "italic", color: "#999" }}>
                    📝 This is your report
                  </p>
                )}

                <p className={styles.metaItem}>
                  <FiMapPin /> {issue.address}
                </p>

                <div className={styles.progressSection}>
                  <p>Progress</p>
                  <div className={styles.progressBarBg}>
                    <div
                      className={styles.progressBarFill}
                      style={{ width: `${getProgressPercent(issue.status)}%` }}
                    />
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

                <div className={styles.metaRow}>
                  <span className={styles.metaItem}>
                    <FiCalendar /> Reported {new Date(issue.created_at).toDateString()}
                  </span>

                  <span className={styles.metaItem}>
                    <FiClock /> {issue.days_open || 0} days
                  </span>
                  Priority:
                  <span
                    className={`${styles.priorityTag} ${
                      styles[issue.priority.toLowerCase()]
                    }`}
                  >
                    {issue.priority}
                  </span>

                  <span className={styles.metaItem}>
                    <FiThumbsUp
                      className={`${styles.iconButton} ${
                        issue.user_has_voted ? styles.voteActive : ""
                      }`}
                      onClick={() => handleVote(issue.id)}
                      title="Vote"
                    />{" "}
                    {(Number(issue.upvotes_count) || 0)} votes
                  </span>

                  <span
                    className={styles.metaItem}
                    onClick={() => toggleComments(issue.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <FiMessageSquare /> {commentCounts[issue.id] || 0} comments
                  </span>
                </div>

                {expandedComments[issue.id] && (
                  <CommentsSection
                    issueId={issue.id}
                    onCommentCountChange={(newCount) => {
                      setCommentCounts((prev) => ({
                        ...prev,
                        [issue.id]: newCount,
                      }));
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default CommunityIssues;
