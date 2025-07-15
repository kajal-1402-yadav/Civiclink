import React from "react";
import styles from "../styles/Dashboard.module.css";
import Symbol from "../assets/Symbol.png"; // ✅ check path
import useUserStats from "../hooks/useUserStats";

const Dashboard = () => {
  const { total, resolved, upvotes, comments, activity, loading } =
    useUserStats();

  return (
    <div className={styles.dashboardWrapper}>
      {/* Top Navbar */}
      <header className={styles.navbar}>
        <div className={styles.navLeft}>
          <div className={styles.iconContainer}>
            <div className={styles.iconCircle}>
              <img src={Symbol} alt="CivicLink Logo" />
            </div>
          </div>
          {"    "}
          <div className={styles.navTitle}>CivicLink</div>
        </div>
        <nav className={styles.navLinks}>
          <a href="/home">Home</a>
          <a href="/my-issues">My Issues</a>
          <a href="/report">Report Issue</a>
          <a href="/analytics">Analytics</a>
          <a href="/home" className={styles.backBtn}>Back</a>
        </nav>
      </header>

      {/* Main Dashboard Content */}
      <main className={styles.main}>
        {/* Stats Cards */}
        <section className={styles.stats}>
          <div className={styles.card}>
            <h3>Total Issues</h3>
            <p>{loading ? "Loading..." : total}</p>
          </div>
          <div className={styles.card}>
            <h3>Resolved</h3>
            <p>{loading ? "Loading..." : resolved}</p>
          </div>
          <div className={styles.card}>
            <h3>Upvotes</h3>
            <p>{loading ? "Loading..." : upvotes}</p>
          </div>
          <div className={styles.card}>
            <h3>Comments</h3>
            <p>{loading ? "Loading..." : comments}</p>
          </div>
        </section>

        {/* Activity & Map */}
        <section className={styles.lowerSection}>
          <div className={styles.activity}>
            <h2>Recent Activity</h2>
            <ul>
              {loading ? (
                <li>Loading...</li>
              ) : activity.length === 0 ? (
                <li>No recent activity yet.</li>
              ) : (
                activity.map((item, index) => <li key={index}>{item}</li>)
              )}
            </ul>
          </div>

          <div className={styles.mapBox}>
            <h2>Reported Locations</h2>
            <div className={styles.mapPreview}>
              <span>🗺️ [Mini Map Placeholder]</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
