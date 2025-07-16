import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/Home.module.css";
import Symbol from "../assets/Symbol.png";


export default function Home() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login");
  };

  return (
    <div className={styles.homeWrapper}>
      {/* Navbar */}
      <header className={styles.navbar}>
        <div className={styles.logoArea}>
          <div className={styles.iconContainer}>
            <div className={styles.iconCircle}>
              <img src={Symbol} alt="CivicLink Logo" />
            </div>
          </div>{"    "}
          <span className={styles.logoText}>CivicLink</span>
        </div>
        <nav className={styles.navLinks}>
          <Link to="/dashboard" className={styles.navLink}>
            Dashboard
          </Link>
          <Link to="/api/public-issues" className={styles.navLink}>
            Community
          </Link>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Logout
          </button>
        </nav>
      </header>

      {/* Hero */}
      <main className={styles.hero}>
        <h1 className={styles.title}>Let’s Fix Our Streets Together</h1>
        <p className={styles.subtitle}>
          Join the movement. Report local issues. Improve your city.
        </p>
        <Link to="/dashboard" className={styles.ctaButton}>
          Get Started
        </Link>
      </main>
    </div>
  );
}
