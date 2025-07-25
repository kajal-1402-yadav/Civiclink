import React, { useState, useEffect } from "react";
import api from "../api";
import styles from "../styles/Profile.module.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    profile_picture: null,
  });
  const [preview, setPreview] = useState(null);

  useEffect(() => {
  const fetchUser = async () => {
    const res = await api.get("/api/user/info/");
    console.log("User info response:", res.data); // ✅ ADD THIS HERE
    setUser(res.data);
    setFormData((prev) => ({
      ...prev,
      username: res.data.username,
      email: res.data.email,
    }));
  };
  fetchUser();
}, []);


  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profile_picture") {
      const file = files[0];
      setFormData((prev) => ({ ...prev, profile_picture: file }));
      setPreview(URL.createObjectURL(file));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("username", formData.username);
    data.append("email", formData.email);
    if (formData.password) data.append("password", formData.password);
    if (formData.profile_picture)
      data.append("profile_picture", formData.profile_picture);

    const res = await api.put("/api/user/update/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });


    setUser(res.data);
    setEditMode(false);
    setPreview(null);
  };

  if (!user) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.profileContainer}>
      <div className={styles.card}>
        <h2 className={styles.title}>My Profile</h2>

        <div className={styles.avatarWrapper}>
          <img
            className={styles.avatar}
            src={
              preview
                ? preview
                : user.profile_picture
                ? user.profile_picture
                : "/assets/user-placeholder.png"
            }
            alt="Profile"
          />

          {editMode && (
            <>
              <label htmlFor="profilePicInput" className={styles.editIcon}>
                ✏️
              </label>
              <input
                type="file"
                id="profilePicInput"
                name="profile_picture"
                onChange={handleChange}
                accept="image/*"
                className={styles.hiddenFileInput}
              />
            </>
          )}
        </div>

        {editMode ? (
          <form onSubmit={handleSubmit} className={styles.form}>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              className={styles.input}
              required
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className={styles.input}
              required
            />
            <input
              type="password"
              name="password"
              onChange={handleChange}
              placeholder="New Password (optional)"
              className={styles.input}
            />
            <div className={styles.actions}>
              <button type="submit" className={styles.saveBtn}>
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className={styles.cancelBtn}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <p className={styles.text}>
              <strong>Username:</strong> {user.username}
            </p>
            <p className={styles.text}>
              <strong>Email:</strong> {user.email}
            </p>
            <p className={styles.text}>
              <strong>Role:</strong> {user.role}
            </p>
            <p className={styles.text}>
  <strong>Joined:</strong>{" "}
  {user.date_joined
    ? new Date(user.date_joined).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown"}
</p>


            <button
              onClick={() => setEditMode(true)}
              className={styles.editBtn}
            >
              Edit Profile
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
