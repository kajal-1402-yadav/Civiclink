import { Outlet } from "react-router-dom";
import styles from "../styles/Dashboard.module.css";
import useUserStats from "../hooks/useUserStats";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const Dashboard = () => {
  const { total, resolved, upvotes, comments, activity, loading } =
    useUserStats();

  return (
    <div className={styles.dashboardWrapper}>
      <Navbar />

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

        {/* Nested routes will render here */}
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
