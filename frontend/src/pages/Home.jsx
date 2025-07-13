import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import styles from "../styles/Home.module.css";
import navbarStyles from "../styles/Navbar.module.css";
import Symbol from "../assets/Symbol.png"; // Assuming you have a logo image

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(localStorage.getItem("access")));

  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(Boolean(localStorage.getItem("access")));
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setIsLoggedIn(false);
    navigate("/login");
  };

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 1,
      delay,
      ease: [0.25, 0.4, 0.25, 1],
    },
  });

  return (
    <div className={styles.homeRoot}>
      {/* ✅ Merged Navbar */}
      <nav className={navbarStyles.navbar}>
        <div className={navbarStyles.navbarLeft}>
<div className={styles.iconContainer}>
                <div className={styles.iconCircle}>
                  <img src={Symbol} alt="CivicLink Logo" />
                </div>
              </div>          <span className={navbarStyles.navbarTitle}>CivicLink</span>
        </div>

        <div className={navbarStyles.navbarCenter}>
          <Link to="/" className={navbarStyles.navbarLink}>Home</Link>
          <Link to="/report" className={navbarStyles.navbarLink}>Report Issue</Link>
          <Link to="/issues-map" className={navbarStyles.navbarLink}>Map</Link>
          <Link to="/my-issues" className={navbarStyles.navbarLink}>My Issues</Link>
          <Link to="/api/public-issues" className={navbarStyles.navbarLink}>Community</Link>
        </div>

        <div className={navbarStyles.navbarRight}>
          {isLoggedIn ? (
            <button onClick={handleLogout} className={`${navbarStyles.navbarBtn} ${navbarStyles.logoutBtn}`}>
              Logout
            </button>
          ) : (
            <Link to="/login" className={`${navbarStyles.navbarBtn} ${navbarStyles.loginBtn}`}>
              Sign In
            </Link>
          )}
        </div>
      </nav>

      {/* Background Gradient */}
      <div className={styles.gradientBg} />

      <div className={styles.heroContent}>
        <motion.h1 className={styles.heroTitle} {...fadeUp(0.2)}>
          Let’s Fix Our Streets Together
        </motion.h1>

        <motion.p className={styles.heroSubtitle} {...fadeUp(0.4)}>
          Spotted a pothole? A leaking pipe? Report it in seconds and help your neighborhood stay safe and clean.
        </motion.p>

        <motion.div {...fadeUp(0.6)}>
          <Link to="/report" className={styles.heroButton}>
            🚀 Report an Issue
          </Link>
        </motion.div>
      </div>

      {/* Recent Reports Section */}
      <div className={`${styles.section} ${styles.darkSection}`}>
        <h2 className={styles.sectionTitle}>What’s Happening Around You</h2>
        <p className={styles.sectionSubtitle}>
          Live updates from your locality. See what's reported—and what’s being fixed.
        </p>
        <div className={styles.sectionBox}>[Map / Visualization Coming Soon]</div>
      </div>

      {/* How It Works */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>How It All Works</h2>
        <p className={styles.sectionSubtitle}>Because small actions create big changes.</p>
        <div className={styles.howCards}>
          {[
            {
              icon: "📷",
              title: "Snap & Submit",
              desc: "Click a photo, write a few words, and hit submit. That’s all it takes.",
            },
            {
              icon: "🔀",
              title: "Smart Routing",
              desc: "Your report is sent directly to the right department. No guesswork.",
            },
            {
              icon: "📡",
              title: "Stay in the Loop",
              desc: "Track the status of your report and get notified when it’s resolved.",
            },
          ].map((card, i) => (
            <motion.div key={i} className={styles.howCard} {...fadeUp(0.3 + i * 0.2)}>
              <div className={styles.howIcon}>{card.icon}</div>
              <h3 className={styles.howTitle}>{card.title}</h3>
              <p className={styles.howDesc}>{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className={`${styles.section} ${styles.ctaSection}`}>
        <h2 className={styles.sectionTitle}>Your Voice. Your Streets.</h2>
        <p className={styles.sectionSubtitle}>
          Be part of a growing community that believes in action over complaints.
        </p>
        <Link to="/report" className={styles.ctaButton}>
          Report Now — It Matters
        </Link>
      </div>
    </div>
  );
}
