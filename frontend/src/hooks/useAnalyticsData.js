import { useEffect, useState } from 'react';

const BASE_URL = 'http://localhost:8000'; // Change if using env vars

const useAnalyticsData = () => {
  const [totalIssues, setTotalIssues] = useState(0);
  const [resolved, setResolved] = useState(0);
  const [pending, setPending] = useState(0);
  const [inProgress, setInProgress] = useState(0);
  const [upvotes, setUpvotes] = useState(0);
  const [comments, setComments] = useState(0);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${BASE_URL}/api/public-issues/`, {
          
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch issues: ${res.status}`);
        }

        const issues = await res.json();
        if (!Array.isArray(issues)) {
          throw new Error("Invalid response format (expected array)");
        }

        let resolvedCount = 0;
        let pendingCount = 0;
        let inProgressCount = 0;
        let upvoteSum = 0;
        let commentSum = 0;
        const categoryMap = {};
        const dateMap = {};

        issues.forEach((issue) => {
          if (issue.status === 'resolved') resolvedCount++;
          if (issue.status === 'pending') pendingCount++;
          if (issue.status === 'in_progress') inProgressCount++;

          upvoteSum += issue.upvotes || 0;
          commentSum += (issue.comments?.length || 0);

          // Count by category
          categoryMap[issue.category] = (categoryMap[issue.category] || 0) + 1;

          // Count by creation date (YYYY-MM-DD)
          const date = new Date(issue.created_at).toISOString().slice(0, 10);
          dateMap[date] = (dateMap[date] || 0) + 1;
        });

        const timelineData = Object.entries(dateMap)
          .sort(([a], [b]) => new Date(a) - new Date(b))
          .map(([date, count]) => ({ date, count }));

        setTotalIssues(issues.length);
        setResolved(resolvedCount);
        setPending(pendingCount);
        setInProgress(inProgressCount);
        setUpvotes(upvoteSum);
        setComments(commentSum);
        setCategoryCounts(categoryMap);
        setTimeline(timelineData);
      } catch (error) {
        console.error('❌ Analytics fetch error:', error);
      }
    };

    fetchData();
  }, []);

  return {
    totalIssues,
    resolved,
    pending,
    inProgress,
    upvotes,
    comments,
    categoryCounts,
    timeline,
  };
};

export default useAnalyticsData;
