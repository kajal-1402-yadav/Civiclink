import { useState } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import styles from "../styles/Form.module.css";
import LoadingIndicator from "./LoadingIndicator";

function Form({ route, method }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const name = method === "login" ? "Login" : "Register";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload =
        method === "register"
          ? { username, email, password }
          : { username, password };

      const res = await api.post(route, payload);

      if (method === "login") {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        localStorage.setItem("username", username);

        try {
          const userRes = await api.get("/api/user/info/");
          const userData = userRes.data;

          localStorage.setItem("role", userData.role);
          localStorage.setItem("username", userData.username);
          localStorage.setItem("user_id", String(userData.id)); // <-- ADD THIS
          localStorage.setItem(
            "date_joined",
            userData.date_joined.split("T")[0]
          );

          if (userData.role === "admin") {
            navigate("/admin-dashboard");
          } else {
            navigate("/home");
          }
        } catch (error) {
          console.error("[❌] Failed to fetch user info:", error);
          navigate("/");
        }

        window.dispatchEvent(new Event("storage"));
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Authentication failed:", error);
      if (error.response && error.response.data) {
        alert(JSON.stringify(error.response.data, null, 2));
      } else {
        alert("Authentication failed! " + (error.message || ""));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formWrapper}>
      <div className={styles.formContent}>
        <h1 className={styles.heading}>
          {name} to <span className={styles.gradientText}>CivicLink</span>
        </h1>
        <p className={styles.description}>
          {method === "login"
            ? "Welcome back! Sign in to track, report, and connect with your community."
            : "Join CivicLink to report and resolve civic issues in your neighborhood."}
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            className={styles.input}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
          />

          {method === "register" && (
            <input
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
          )}

          <input
            className={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />

          {loading && <LoadingIndicator />}

          <button className={styles.button} type="submit">
            {name}
          </button>

          {method === "login" ? (
            <p className={styles.link}>
              Don&apos;t have an account?{" "}
              <Link to="/register">Register here</Link>
            </p>
          ) : (
            <p className={styles.link}>
              Already have an account? <Link to="/login">Login here</Link>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default Form;
