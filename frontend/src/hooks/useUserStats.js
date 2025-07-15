import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants'; // You already use these
import api from '../api'; // your axios instance

const useUserStats = () => {
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    upvotes: 0,
    comments: 0,
    activity: [],
  });

  const [loading, setLoading] = useState(true);

  const refreshToken = async () => {
    const refresh = localStorage.getItem(REFRESH_TOKEN);
    if (!refresh) return false;
    try {
      const res = await api.post('/api/token/refresh/', { refresh });
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
        return localStorage.getItem(ACCESS_TOKEN); // get new token
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
        if (!token) throw new Error('Unauthorized');

        const res = await fetch('http://localhost:8000/api/my-issues/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

        const issues = await res.json();

        const total = issues.length;
        const resolved = issues.filter((i) => i.status === 'Resolved').length;
        const upvotes = issues.reduce((acc, i) => acc + (i.upvotes || 0), 0);
        const comments = issues.reduce((acc, i) => acc + (i.comments?.length || 0), 0);

        const activity = issues
          .flatMap((issue) => {
            const logs = [];
            logs.push(`🆕 You reported: ${issue.title}`);
            if (issue.status === 'Resolved') logs.push(`✅ Issue resolved: ${issue.title}`);
            if (issue.upvotes > 0) logs.push(`⬆️ ${issue.upvotes} upvotes on: ${issue.title}`);
            if (issue.comments?.length > 0) logs.push(`💬 ${issue.comments.length} comments on: ${issue.title}`);
            return logs;
          })
          .slice(0, 6);

        setStats({ total, resolved, upvotes, comments, activity });
      } catch (error) {
        console.error('❌ Error loading user stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { ...stats, loading };
};

export default useUserStats;
