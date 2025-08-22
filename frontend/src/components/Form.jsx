import { useState } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import styles from "../styles/Form.module.css";
import LoadingIndicator from "./LoadingIndicator";

function Form({ route, method }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const name = method === "login" ? "Login" : "Register";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      if (method === "register" && password !== confirmPassword) {
        setErrors((prev) => ({ ...prev, confirm_password: "Passwords do not match." }));
        return; // finally will turn off loading
      }

      const payload =
        method === "register"
          ? { username, email, password, confirm_password: confirmPassword }
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
      // Map backend errors into field-level messages
      const status = error?.response?.status;
      const data = error?.response?.data;
      // Special-case login failures with unknown users
      if (
        method === "login" &&
        (status === 401 || status === 400) &&
        (typeof data?.detail === "string")
      ) {
        setErrors({
          non_field_errors:
            "Invalid credentials or account not found. Please register first or try again.",
        });
      } else if (data && typeof data === "object") {
        const mapped = {};
        Object.entries(data).forEach(([key, val]) => {
          if (Array.isArray(val)) {
            mapped[key] = val.join(" \n");
          } else if (typeof val === "string") {
            mapped[key] = val;
          } else if (val && typeof val === "object") {
            mapped[key] = Object.values(val).flat().join(" \n");
          }
        });
        setErrors(mapped);
      } else {
        setErrors({ non_field_errors: "Request failed. Please try again." });
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
            onChange={(e) => {
              setUsername(e.target.value);
              if (errors.username) setErrors({ ...errors, username: undefined });
            }}
            placeholder="Username"
            required
          />
          {errors.username && (
            <div className={styles.errorText}>{errors.username}</div>
          )}

          {method === "register" && (
            <input
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              placeholder="Email"
              required
            />
          )}
          {method === "register" && errors.email && (
            <div className={styles.errorText}>{errors.email}</div>
          )}

          <input
            className={styles.input}
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors({ ...errors, password: undefined });
            }}
            placeholder="Password"
            required
          />
          {errors.password && (
            <div className={styles.errorText}>
              {typeof errors.password === "string"
                ? errors.password
                : String(errors.password)}
            </div>
          )}

          {method === "register" && (
            <input
              className={styles.input}
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirm_password)
                  setErrors({ ...errors, confirm_password: undefined });
              }}
              placeholder="Confirm Password"
              required
            />
          )}
          {method === "register" && errors.confirm_password && (
            <div className={styles.errorText}>{errors.confirm_password}</div>
          )}

          {loading && <LoadingIndicator />}

          <button className={styles.button} type="submit">
            {name}
          </button>

          {errors.non_field_errors && (
            <p className={styles.errorText} role="alert">
              {errors.non_field_errors}
            </p>
          )}

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
