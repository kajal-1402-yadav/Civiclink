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
          localStorage.setItem("role", userRes.data.role);

          if (userRes.data.role === "admin") {
            navigate("/admin-dashboard");
          } else {
            navigate("/");
          }
        } catch (error) {
          console.error("[❌] Failed to fetch user role:", error);
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
    <form onSubmit={handleSubmit} className={styles.container}>
      <h1 className={styles.title}>{name}</h1>

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

      {method === "login" && (
        <p className={styles.link}>
          Don&apos;t have an account? <Link to="/register">Register here</Link>
        </p>
      )}
    </form>
  );
}

export default Form;
