import React, { useEffect, useState } from "react";
import api from "../api";
import { useParams, useNavigate } from "react-router-dom";
import styles from "../styles/EditIssue.module.css";

function EditIssue() {
  const { issueId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const response = await api.get(`/api/update-issue/${issueId}/`);
        const issue = response.data;
        setTitle(issue.title);
        setDescription(issue.description);
        setAddress(issue.address);
        setCategory(issue.category);
      } catch (error) {
        console.error("Error fetching issue:", error);
      }
    };

    fetchIssue();
  }, [issueId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedData = { title, description, address, category };

    try {
      await api.patch(`/api/update-issue/${issueId}/`, updatedData);
      console.log("Issue updated successfully");
      navigate("/my-issues");
    } catch (error) {
      console.error("Error updating issue:", error);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Edit Issue</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Title:</label>
          <input
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Description:</label>
          <textarea
            className={styles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Address:</label>
          <input
            className={styles.input}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Category:</label>
          <select
            className={styles.select}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="road">Road</option>
            <option value="garbage">Garbage</option>
            <option value="water">Water</option>
            <option value="electricity">Electricity</option>
            <option value="other">Other</option>
          </select>
        </div>

        <button type="submit" className={styles.button}>
          Update Issue
        </button>
      </form>
    </div>
  );
}

export default EditIssue;
