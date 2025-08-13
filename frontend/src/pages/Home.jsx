import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import Symbol from "../assets/Symbol.png";

export default function Home() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/");
  };

  useEffect(() => {
    fetch("http://localhost:8000/api/recent-activity/") // change to your backend URL
      .then((res) => res.json())
      .then((data) => setActivities(data))
      .catch((err) => console.error("Error fetching recent activity:", err));
  }, []);

  // Pick an emoji based on category
  const getIcon = (category) => {
    switch (category) {
      case "road":
        return "🚧";
      case "electricity":
        return "💡";
      case "garbage":
        return "🗑️";
      case "water":
        return "💧";
      case "park":
        return "🌳";
      case "other":
        return "📌";
      default:
        return "📍";
    }
  };

  // Helper function to show relative time like "3 minutes ago"
  function timeAgo(dateString) {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;

    const seconds = Math.floor(diffMs / 1000);
    if (seconds < 60) return "Just now";

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;

    // For older than a week, show formatted date like "Aug 5"
    return past.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

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
                Spot a pothole, broken streetlight, or graffiti? Report it
                instantly with photos and location details.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>👥</div>
              <h3 className={styles.featureTitle}>Community Support</h3>
              <p className={styles.featureDescription}>
                Connect with neighbors, vote on priority issues, and work
                together for community improvement.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🏛️</div>
              <h3 className={styles.featureTitle}>Government Response</h3>
              <p className={styles.featureDescription}>
                Local authorities receive reports directly and provide updates
                on resolution progress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className={styles.activitySection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Recent Community Activity</h2>
          <div className={styles.activityFeed}>
            {activities.length > 0 ? (
              activities.slice(0, 3).map((activity) => (
                <div key={activity.id} className={styles.activityItem}>
                  <div className={styles.activityIcon}>
                    {getIcon(activity.category)}
                  </div>
                  <div className={styles.activityContent}>
                    <h4 className={styles.activityTitle}>{activity.title}</h4>
                    <p className={styles.activityDescription}>
                      {activity.description}
                    </p>
                    <span className={styles.activityTime}>
                      {timeAgo(activity.created_at)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p>No recent activity yet.</p>
            )}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <h2 className={styles.ctaTitle}>Ready to Make a Difference?</h2>
          <p className={styles.ctaDescription}>
            Your voice matters. Start reporting issues and help build a better
            community today.
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
                Empowering citizens to create positive change in their
                communities.
              </p>
            </div>
            <div className={styles.footerLinks}>
              <div className={styles.footerColumn}>
                <h4 className={styles.footerHeading}>Platform</h4>
                <Link to="/dashboard" className={styles.footerLink}>
                  Dashboard
                </Link>
                <Link to="/api/public-issues" className={styles.footerLink}>
                  Community
                </Link>
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
