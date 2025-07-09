import { Link, useLocation } from "react-router-dom";
import styles from "../styles/Navbar.module.css";
import logo from "../assets/react.svg";
import { ACCESS_TOKEN } from "../constants";

function Navbar() {
  const location = useLocation();
  const isLoggedIn = localStorage.getItem(ACCESS_TOKEN);

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarLeft}>
        <img src={logo} alt="Logo" className={styles.navbarLogo} />
        <span className={styles.navbarTitle}>CivicLink</span>
      </div>

      <div className={styles.navbarLinks}>
        <Link to="/" className={styles.navbarLink}>Home</Link>
        <Link to="/report" className={styles.navbarLink}>Report Issue</Link>
        <Link to="/my-issues" className={styles.navbarLink}>My Issues</Link>
        <Link to="/all-issues" className={styles.navbarLink}>Issues Map</Link>
        <Link to="/login" className={styles.navbarLink}>Login</Link>
        <Link to="/register" className={styles.navbarLink}>Register</Link>
      </div>

      <div className={styles.navbarAuth}>
        {isLoggedIn ? (
          <Link to="/logout">
            <button className={`${styles.navbarButton} ${styles.logout}`}>Logout</button>
          </Link>
        ) : (
          <>
            {location.pathname !== "/login" && (
              <Link to="/login">
                <button className={styles.navbarButton}>Sign In</button>
              </Link>
            )}
            {location.pathname !== "/register" && (
              <Link to="/register">
                <button className={`${styles.navbarButton} ${styles.register}`}>Register</button>
              </Link>
            )}
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
