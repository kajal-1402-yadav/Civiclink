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

  // Custom white tooltips (value only)
  const BarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const value = payload[0]?.value;
      return (
        <div style={{ background: '#ffffff', color: '#111', padding: '8px 10px', borderRadius: 6, boxShadow: '0 2px 10px rgba(0,0,0,0.15)', fontSize: 12, fontWeight: 600 }}>
          {value}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const value = payload[0]?.value;
      const name = payload[0]?.name || payload[0]?.payload?.name;
      return (
        <div style={{ background: '#ffffff', color: '#111', padding: '8px 10px', borderRadius: 6, boxShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{name}</div>
          <div style={{ fontSize: 12, fontWeight: 600 }}>{value}</div>
        </div>
      );
    }
    return null;
  };

  // Pie chart grouping
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
            <h3>Votes</h3>
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
              <Tooltip content={<PieTooltip />} cursor={false} />
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
              <Tooltip cursor={false} content={<BarTooltip />} />
              <Bar dataKey="value">
                {barData.map((_, index) => (
                  <Cell key={`bar-cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </section>

        
      </div>
    </>
  );
};

export default Analytics;

