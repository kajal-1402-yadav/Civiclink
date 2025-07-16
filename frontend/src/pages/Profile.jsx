import React, { useEffect, useState } from "react";
import styles from "../styles/Profile.module.css";
import api from "../api";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [profilePic, setProfilePic] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api
      .get("/api/user/info/")
      .then((res) => {
        setUser(res.data);
        setForm({
          username: res.data.username || "",
          email: res.data.email || "",
          password: "",
        });
      })
      .catch((err) => console.error("Error fetching user info:", err));
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("username", form.username);
    formData.append("email", form.email);
    if (form.password.trim()) formData.append("password", form.password);
    if (profilePic) formData.append("profile_picture", profilePic);

    try {
      await api.put("/api/user/update/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const res = await api.get("/api/user/info/");
      setUser(res.data);
      setForm({ ...form, password: "" });
      setProfilePic(null);
      setMessage("Profile updated successfully!");
      setEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setMessage("Update failed. Try again.");
    }
  };

  if (!user) {
    return <div className={styles.loading}>Loading your profile...</div>;
  }

  return (
    <div className={styles.profileContainer}>
      <h1 className={styles.title}>Your Profile</h1>

      <div className={styles.card}>
        <div className={styles.avatar}>
          <img
            src={
              user.profile_picture
                ? user.profile_picture
                : "/assets/user-placeholder.png"
            }
            alt="User Avatar"
          />
        </div>

        <div className={styles.details}>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>Joined:</strong> {new Date(user.date_joined).toDateString()}</p>
        </div>
      </div>

      <div className={styles.editSection}>
        <h2>Edit Info</h2>

        {!editing ? (
          <button className={styles.editBtn} onClick={() => setEditing(true)}>
            Edit Profile
          </button>
        ) : (
          <form onSubmit={handleSubmit} className={styles.editForm}>
            <label>
              Username:
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Email:
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              New Password:
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Leave blank to keep current"
              />
            </label>

            <label>
              Profile Picture:
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProfilePic(e.target.files[0])}
              />
            </label>

            <div className={styles.buttonRow}>
              <button type="submit" className={styles.saveBtn}>
                Save
              </button>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {message && <p className={styles.message}>{message}</p>}
      </div>
    </div>
  );
};

export default Profile;
