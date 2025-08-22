import styles from "../styles/Dashboard.module.css";
import useUserStats from "../hooks/useUserStats";
import Navbar from "../components/Navbar";

const Dashboard = () => {
  const { total, resolved, votes, comments, activity, loading } =
    useUserStats();

  return (
    <> <Navbar />
    <div className={styles.dashboardWrapper}>
     

<h1 className={styles.pageTitle}>My Stats</h1>

      {/* Main Dashboard Content */}
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
            <h3>votes</h3>
            <p>{loading ? "Loading..." : votes}</p>
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

          
        </section>
    </div>
    </>
  );
};

export default Dashboard;
