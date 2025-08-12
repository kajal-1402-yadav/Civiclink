import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/Home.module.css";
import Symbol from "../assets/Symbol.png";

export default function Home() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/");
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
          </div>
          <span className={styles.logoText}>CivicLink</span>
        </div>
        <nav className={styles.navLinks}>
          <Link to="/dashboard" className={styles.navLink}>
            Dashboard
          </Link>
          <Link to="/all-issues" className={styles.navLink}>
            Community
          </Link>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Logout
          </button>
        </nav>
      </header>

      {/* Hero */}
      <main className={styles.hero}>
        <h1 className={styles.title}>Let's Fix Our Streets Together</h1>
        <p className={styles.subtitle}>
          Join the movement. Report local issues. Improve your city.
        </p>
        <Link to="/report" className={styles.ctaButton}>
          Get Started
        </Link>
      </main>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>How CivicLink Works</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📍</div>
              <h3 className={styles.featureTitle}>Report Issues</h3>
              <p className={styles.featureDescription}>
                Spot a pothole, broken streetlight, or graffiti? Report it instantly with photos and location details.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>👥</div>
              <h3 className={styles.featureTitle}>Community Support</h3>
              <p className={styles.featureDescription}>
                Connect with neighbors, vote on priority issues, and work together for community improvement.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🏛️</div>
              <h3 className={styles.featureTitle}>Government Response</h3>
              <p className={styles.featureDescription}>
                Local authorities receive reports directly and provide updates on resolution progress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.statsSection}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>2,847</div>
              <div className={styles.statLabel}>Issues Resolved</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>15,432</div>
              <div className={styles.statLabel}>Active Citizens</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>89%</div>
              <div className={styles.statLabel}>Response Rate</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>24hrs</div>
              <div className={styles.statLabel}>Avg Response Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className={styles.activitySection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Recent Community Activity</h2>
          <div className={styles.activityFeed}>
            <div className={styles.activityItem}>
              <div className={styles.activityIcon}>🚧</div>
              <div className={styles.activityContent}>
                <h4 className={styles.activityTitle}>Road Repair Completed</h4>
                <p className={styles.activityDescription}>Main Street pothole fixed - Thanks to community reports!</p>
                <span className={styles.activityTime}>2 hours ago</span>
              </div>
            </div>
            <div className={styles.activityItem}>
              <div className={styles.activityIcon}>💡</div>
              <div className={styles.activityContent}>
                <h4 className={styles.activityTitle}>Streetlight Installation</h4>
                <p className={styles.activityDescription}>New LED streetlights installed on Oak Avenue for better safety.</p>
                <span className={styles.activityTime}>1 day ago</span>
              </div>
            </div>
            <div className={styles.activityItem}>
              <div className={styles.activityIcon}>🌳</div>
              <div className={styles.activityContent}>
                <h4 className={styles.activityTitle}>Park Cleanup Initiative</h4>
                <p className={styles.activityDescription}>Community volunteers cleaned Central Park - 50+ participants!</p>
                <span className={styles.activityTime}>3 days ago</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <h2 className={styles.ctaTitle}>Ready to Make a Difference?</h2>
          <p className={styles.ctaDescription}>
            Your voice matters. Start reporting issues and help build a better community today.
          </p>
          <div className={styles.ctaButtons}>
            <Link to="/report" className={styles.primaryCta}>
              Report an Issue
            </Link>
            <Link to="/all-issues" className={styles.secondaryCta}>
              Browse Community Issues
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerContent}>
            <div className={styles.footerBrand}>
              <div className={styles.footerLogo}>
                <div className={styles.iconCircle}>
                  <img src={Symbol} alt="CivicLink Logo" />
                </div>
                <span className={styles.logoText}>CivicLink</span>
              </div>
              <p className={styles.footerDescription}>
                Empowering citizens to create positive change in their communities.
              </p>
            </div>
            <div className={styles.footerLinks}>
              <div className={styles.footerColumn}>
                <h4 className={styles.footerHeading}>Platform</h4>
                <Link to="/dashboard" className={styles.footerLink}>Dashboard</Link>
                <Link to="/api/public-issues" className={styles.footerLink}>Community</Link>
                <Link to="/profile" className={styles.footerLink}>Profile</Link>
              </div>
              <div className={styles.footerColumn}>
                <h4 className={styles.footerHeading}>Support</h4>
                <Link to="/help" className={styles.footerLink}>Help Center</Link>
                <Link to="/contact" className={styles.footerLink}>Contact Us</Link>
                <Link to="/feedback" className={styles.footerLink}>Feedback</Link>
              </div>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p className={styles.copyright}>© 2024 CivicLink. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
