import React, { useEffect, useState } from "react";
import api from "../api";
import CommentsSection from "../components/CommentsSection";
import styles from "../styles/CommunityIssues.module.css";
import Navbar from "../components/Navbar";

function CommunityIssues() {
  const [issues, setIssues] = useState([]);
  const [commentCounts, setCommentCounts] = useState({});
  const [visibleComments, setVisibleComments] = useState({});
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    priority: "",
  });

  useEffect(() => {
    const fetchIssuesAndComments = async () => {
      try {
        const res = await api.get("/api/public-issues/");
        const issuesData = res.data;
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
        console.error("Error fetching issues:", error);
      }
    };

    fetchIssuesAndComments();
  }, []);

  const toggleComments = (id) =>
    setVisibleComments((prev) => ({ ...prev, [id]: !prev[id] }));

  const getProgressPercent = (status) => {
    switch (status) {
      case "pending":
        return 25;
      case "in_progress":
        return 60;
      case "resolved":
        return 100;
      default:
        return 0;
    }
  };

  const filteredIssues = issues.filter((issue) => {
    const matchStatus = filters.status ? issue.status === filters.status : true;
    const matchCategory = filters.category ? issue.category === filters.category : true;
    const matchPriority = filters.priority ? issue.priority === filters.priority : true;
    return matchStatus && matchCategory && matchPriority;
  });

  const handleVote = async (id, type) => {
    await api.post(`/api/issue/${id}/${type}/`);
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === id
          ? {
              ...issue,
              upvotes: type === "upvote" ? issue.upvotes + 1 : issue.upvotes,
              downvotes: type === "downvote" ? issue.downvotes + 1 : issue.downvotes,
            }
          : issue
      )
    );
  };

  return (
    <><Navbar />
    <div className={styles.container}>
      <h2 className={styles.title}>Community Reported Issues</h2>

      <div className={styles.filterBar}>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
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

      {filteredIssues.map((issue) => (
        <div
          key={issue.id}
          className={`${styles.card} ${
            issue.reporter_username === localStorage.getItem("username") ? styles.yourReport : ""
          }`}
        >
          {issue.image && (
            <img src={issue.image} alt="Issue" className={styles.image} />
          )}

          <div className={styles.details}>
            <h3>{issue.title}</h3>

            {issue.reporter_username === localStorage.getItem("username") && (
              <p style={{ fontStyle: "italic", color: "#999" }}>📝 This is your report</p>
            )}

            <p>📍 {issue.address}</p>

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
                <span>In Progress</span>
                <span>Resolved</span>
              </div>
              <p className={styles.progressPercent}>{getProgressPercent(issue.status)}%</p>
            </div>

            <p><strong>Description:</strong> {issue.description}</p>
            <p>🗓️ Reported: {new Date(issue.created_at).toDateString()}</p>
            <p>📅 Open (Days): {issue.days_open || 0}</p>
            <p>
              Priority:{" "}
              <span
                className={`${styles.priorityTag} ${
                  styles[`priority${issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)}`]
                }`}
              >
                {issue.priority}
              </span>
            </p>

            {issue.status === "resolved" && issue.resolved_by && (
              <p className={styles.resolvedBy}>✅ Resolved by: <strong>{issue.resolved_by}</strong></p>
            )}

            <div className={styles.voteBox}>
              <button onClick={() => handleVote(issue.id, "upvote")}>👍</button>
              <span>{issue.upvotes - issue.downvotes}</span>
              <button onClick={() => handleVote(issue.id, "downvote")}>👎</button>
              <span className={styles.toggleComment} onClick={() => toggleComments(issue.id)}>
                💬 {commentCounts[issue.id] || 0} comments
              </span>
            </div>

            {visibleComments[issue.id] && (
              <CommentsSection
                issueId={issue.id}
                onCommentCountChange={(count) =>
                  setCommentCounts((prev) => ({ ...prev, [issue.id]: count }))
                }
              />
            )}
          </div>
        </div>
      ))}
    </div>
    </>
  );
}

export default CommunityIssues;
