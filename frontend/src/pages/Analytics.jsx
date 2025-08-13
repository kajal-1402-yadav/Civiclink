import React from 'react';
import styles from '../styles/Analytics.module.css';
import useAnalyticsData from '../hooks/useAnalyticsData';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import Navbar from '../components/Navbar';

// Colors for pie slices
const STATUS_COLORS = ['#a3b5d1', '#81858b', '#ef4444']; 
const CATEGORY_COLORS = ['#ef4444', '#6b7280']; // Bar chart colors

const Analytics = () => {
  const {
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
  } = useAnalyticsData();

  // Pie chart grouping (Option 2)
  const pieData = [
    { name: 'Open Issues', value: (open || 0) + (acknowledged || 0) },
    { name: 'In Progress', value: inProgress || 0 },
    { name: 'Closed', value: (resolved || 0) + (closed || 0) },
  ];

  const barData = Object.entries(categoryCounts).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <>
      <Navbar />
      <div className={styles.analytics}>
        <h3 className={styles.pageTitle}>Analytics Dashboard</h3>

        {/* Summary Cards */}
        <section className={styles.summary}>
          <div className={styles.card}>
            <h3>Total Issues</h3>
            <p>{totalIssues}</p>
          </div>
          <div className={styles.card}>
            <h3>Resolved</h3>
            <p>{resolved}</p>
          </div>
          <div className={styles.card}>
            <h3>Upvotes</h3>
            <p>{upvotes}</p>
          </div>
          <div className={styles.card}>
            <h3>Comments</h3>
            <p>{comments}</p>
          </div>
        </section>

        {/* Line Chart */}
        <section className={styles.section}>
          <h2>Issues Over Time</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={timeline} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <XAxis
                dataKey="date"
                stroke="#fff"
                interval="preserveStartEnd"
                tick={{ fill: '#fff', fontSize: 12 }}
                angle={-20}
                dx={-5}
                dy={10}
              />
              <YAxis stroke="#fff" />
              <Tooltip />
              <Line type="linear" dataKey="count" stroke="#60a5fa" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </section>

        {/* Pie Chart */}
        <section className={styles.section} style={{ padding: '1rem', borderRadius: '8px', background: 'transparent' }}>
          <h2 style={{ color: 'white' }}>Status Breakdown</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={80}
                labelLine={false}
                label={false}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: 'white' }} />
              <Legend wrapperStyle={{ color: 'white' }} />
            </PieChart>
          </ResponsiveContainer>
        </section>

        {/* Bar Chart */}
        <section className={styles.section}>
          <h2>Top Categories</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <XAxis dataKey="name" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip />
              <Bar dataKey="value">
                {barData.map((_, index) => (
                  <Cell key={`bar-cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* Map Placeholder */}
        <section className={styles.section}>
          <h2>Issue Location Heatmap</h2>
          <div className={styles.mapPlaceholder}>🗺️ Map placeholder – lat/lng not available</div>
        </section>
      </div>
    </>
  );
};

export default Analytics;

