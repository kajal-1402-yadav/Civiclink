import { useEffect, useState } from 'react';

const BASE_URL = 'http://localhost:8000'; // adjust if using env vars

const useAnalyticsData = () => {
  const [totalIssues, setTotalIssues] = useState(0);
  const [resolved, setResolved] = useState(0);
  const [closed, setClosed] = useState(0);
  const [acknowledged, setAcknowledged] = useState(0);
  const [open, setOpen] = useState(0);
  const [inProgress, setInProgress] = useState(0);
  const [upvotes, setUpvotes] = useState(0);
  const [comments, setComments] = useState(0);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/public-issues/`);
        if (!res.ok) throw new Error(`Failed to fetch issues: ${res.status}`);

        const issues = await res.json();
        if (!Array.isArray(issues)) throw new Error("Expected array response");

        let resolvedCount = 0;
        let closedCount = 0;
        let acknowledgedCount = 0;
        let openCount = 0;
        let inProgressCount = 0;
        let upvoteSum = 0;
        let commentSum = 0;
        const categoryMap = {};
        const dateMap = {};

        issues.forEach(issue => {
          const status = issue.status?.toLowerCase().replace(/\s+/g, '_');

          if (status === 'open') openCount++;
          else if (status === 'acknowledged') acknowledgedCount++;
          else if (status === 'in_progress') inProgressCount++;
          else if (status === 'resolved') resolvedCount++;
          else if (status === 'closed') closedCount++;

          upvoteSum += issue.upvotes_count || 0;
          commentSum += issue.comments_count || 0;

          if (issue.category) {
            categoryMap[issue.category] = (categoryMap[issue.category] || 0) + 1;
          }

          if (issue.created_at) {
            const date = new Date(issue.created_at).toISOString().slice(0, 10);
            dateMap[date] = (dateMap[date] || 0) + 1;
          }
        });

        const timelineData = Object.entries(dateMap)
          .sort(([a], [b]) => new Date(a) - new Date(b))
          .map(([date, count]) => ({ date, count }));

        setTotalIssues(issues.length);
        setResolved(resolvedCount);
        setClosed(closedCount);
        setAcknowledged(acknowledgedCount);
        setOpen(openCount);
        setInProgress(inProgressCount);
        setUpvotes(upvoteSum);
        setComments(commentSum);
        setCategoryCounts(categoryMap);
        setTimeline(timelineData);
      } catch (error) {
        console.error('❌ Analytics fetch error:', error);
        // fallback
        setResolved(0);
        setClosed(0);
        setAcknowledged(0);
        setOpen(0);
        setInProgress(0);
        setUpvotes(0);
        setComments(0);
        setCategoryCounts({});
        setTimeline([]);
      }
    };

    fetchData();
  }, []);

  return {
    totalIssues,
    resolved,
    closed,
    acknowledged,
    open,
    inProgress,
    upvotes,
    comments,
    categoryCounts,
    timeline,
  };
};

export default useAnalyticsData;
