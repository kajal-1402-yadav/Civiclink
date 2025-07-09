import "../styles/Home.css";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const handleReportClick = () => {
    navigate("/report");
  };

  return (
    <>
      <div className="home-hero">
        <h1>Report Civic Problems Instantly with AI Assistance</h1>
        <p>
          Use the power of AI to quickly identify and report civic issues...
        </p>
        <button className="report-button">Report Issue</button>
      </div>

      <div className="recent-reports">
        <h2>Recent Reports in Your Area</h2>
        {/* Map component or dummy placeholder */}
      </div>

      <div className="how-it-works">
        <h2>How It Works</h2>
        <div className="how-step-container">
          <div className="how-step">
            <h3>AI-Powered Detection</h3>
            <p>Automatically identify issue types from photos using AI.</p>
          </div>
          <div className="how-step">
            <h3>Smart Department Routing</h3>
            <p>Issues are routed to the right department.</p>
          </div>
          <div className="how-step">
            <h3>Track Progress</h3>
            <p>Real-time updates on your reported issues.</p>
          </div>
        </div>
      </div>

      <div className="footer-cta">
        <h2>Ready to Make a Difference?</h2>
        <p>Join thousands of citizens making communities better.</p>
        <a href="/report" className="start-reporting-button">
          Start Reporting Issues
        </a>
      </div>
    </>
  );
}

export default Home;
