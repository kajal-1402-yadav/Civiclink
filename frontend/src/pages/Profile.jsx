import React, { useState, useEffect, useRef } from "react";
import { FiEdit } from "react-icons/fi"; 
import api from "../api";
import styles from "../styles/Profile.module.css";
import Navbar from "../components/Navbar";

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
  const fileInputRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await api.get("/api/user/info/");
        setUser(res.data);
        setFormData((prev) => ({
          ...prev,
          username: res.data.username,
          email: res.data.email,
        }));
      } catch (err) {
        console.error("Auth check failed:", err);
        window.location.href = "/login";
      }
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

    try {
      await api.put("/api/user/update/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const res = await api.get("/api/user/info/");
      setUser(res.data);
      setEditMode(false);
      setPreview(null);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const cancelEdit = () => {
    setFormData({
      username: user?.username || "",
      email: user?.email || "",
      password: "",
      profile_picture: null,
    });
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setEditMode(false);
  };

  if (!user) return <div className={styles.loading}>Loading...</div>;

  return (
    <>
      <Navbar />

      <div className={styles.profileWrapper}>
        <div className={styles.profileContainer}>
          <div className={styles.card}>
            <h2 className={styles.pageTitle}>My Profile</h2>

            <div className={styles.profileTop}>
              <div className={styles.avatarWrapper}>
                <div className={styles.avatarClickArea}>
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
                    <label htmlFor="profilePicInput" className={styles.avatarCenterIcon} title="Change photo">
                      <FiEdit size={28} />
                    </label>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  id="profilePicInput"
                  name="profile_picture"
                  onChange={handleChange}
                  accept="image/*"
                  disabled={!editMode}
                  className={styles.hiddenFileInput}
                />
              </div>
            </div>

            <div className={styles.profileDetails}>
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
                      onClick={cancelEdit}
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
        </div>
      </div>
    </>
  );
};

export default Profile;
