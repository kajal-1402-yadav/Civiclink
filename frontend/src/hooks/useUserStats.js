import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import api from "../api";

const CACHE_KEY = "userStatsCache";

const useUserStats = () => {
  const [stats, setStats] = useState(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached
      ? JSON.parse(cached)
      : {
          total: 0,
          resolved: 0,
          votes: 0,
          comments: 0,
          activity: [],
        };
  });

  const [loading, setLoading] = useState(!localStorage.getItem(CACHE_KEY));

  const refreshToken = async () => {
    const refresh = localStorage.getItem(REFRESH_TOKEN);
    if (!refresh) return false;
    try {
      const res = await api.post("/api/token/refresh/", { refresh });
      localStorage.setItem(ACCESS_TOKEN, res.data.access);
      return true;
    } catch {
      return false;
    }
  };

  const getValidAccessToken = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      const now = Date.now() / 1000;
      if (decoded.exp < now) {
        const refreshed = await refreshToken();
        if (!refreshed) return null;
        return localStorage.getItem(ACCESS_TOKEN);
      }
      return token;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = await getValidAccessToken();
        if (!token) throw new Error("Unauthorized");

        const issuesRes = await fetch("http://localhost:8000/api/my-issues/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!issuesRes.ok) throw new Error(`Failed to fetch issues: ${issuesRes.status}`);
        const issues = await issuesRes.json();

        const commentsRes = await fetch("http://localhost:8000/api/my-comments/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!commentsRes.ok) throw new Error(`Failed to fetch comments: ${commentsRes.status}`);
        const commentsData = await commentsRes.json();

        const votesRes = await fetch("http://localhost:8000/api/user-voted-issues/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!votesRes.ok) throw new Error(`Failed to fetch votes: ${votesRes.status}`);
        const votesData = await votesRes.json();

        const total = issues.length;
        const resolved = issues.filter((i) => i.status === "Resolved").length;
        const votes = votesData.length; 
        const comments = commentsData.count || commentsData.length || 0;

        // Build activity items with timestamps for sorting
        const issueActivity = issues.flatMap((issue) => {
          const logs = [];
          if (issue.created_at)
            logs.push({ text: `🆕 You reported: ${issue.title}`, timestamp: new Date(issue.created_at) });
          if (issue.status === "Resolved" && issue.updated_at)
            logs.push({ text: `✅ Issue resolved: ${issue.title}`, timestamp: new Date(issue.updated_at) });
          return logs;
        });

        const commentsActivity = (commentsData.comments || commentsData).map((c) => ({
          text: `💬 You commented on "${c.issue_title || c.issue.title}": "${c.text.substring(0, 40)}..."`,
          timestamp: new Date(c.created_at),
        }));

        const votesActivity = (votesData || []).map((v) => ({
          text: `⬆️ You voted issue: "${v.issue_title || v.issue.title || 'Issue #' + v.issueId}"`,
          timestamp: new Date(v.voted_at || v.created_at || Date.now()),
        }));

        const combinedActivity = [...issueActivity, ...commentsActivity, ...votesActivity]
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 6)
          .map((item) => item.text);

        const newStats = { total, resolved, votes, comments, activity: combinedActivity };

        setStats(newStats);
        localStorage.setItem(CACHE_KEY, JSON.stringify(newStats));
      } catch (error) {
        console.error("❌ Error loading user stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { ...stats, loading };
};

export default useUserStats;
