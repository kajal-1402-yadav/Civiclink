import React from 'react';
import styles from '../styles/Analytics.module.css';
import useAnalyticsData from '../hooks/useAnalyticsData';
import { LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer } from 'recharts';
import Navbar from '../components/Navbar';

const COLORS = ['#60a5fa', '#a78bfa', '#f472b6'];

const Analytics = () => {
  const {
    totalIssues,
    resolved,
    pending,
    inProgress,
    upvotes,
    comments,
    categoryCounts,
    timeline,
  } = useAnalyticsData();

  const pieData = [
    { name: 'Resolved', value: resolved },
    { name: 'In Progress', value: inProgress },
    { name: 'Pending', value: pending },
  ];

  const barData = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));

  return (
    <>
    <Navbar/>
    <div className={styles.analytics}>
      
      <h1 className={styles.pageTitle}>Analytics Dashboard</h1>

      {/* Summary Cards */}
      <section className={styles.summary}>
        <div className={styles.card}><h3>Total Issues</h3><p>{totalIssues}</p></div>
        <div className={styles.card}><h3>Resolved</h3><p>{resolved}</p></div>
        <div className={styles.card}><h3>Upvotes</h3><p>{upvotes}</p></div>
        <div className={styles.card}><h3>Comments</h3><p>{comments}</p></div>
      </section>

      {/* Line Chart */}
      <section className={styles.section}>
        <h2>Issues Over Time</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={timeline}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#60a5fa" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* Pie Chart */}
      <section className={styles.section}>
        <h2>Status Breakdown</h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80} label>
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </section>

      {/* Bar Chart */}
      <section className={styles.section}>
        <h2>Top Categories</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={barData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#a78bfa" />
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
