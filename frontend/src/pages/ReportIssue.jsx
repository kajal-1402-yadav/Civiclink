import { useState } from "react";
import api from "../api";
import styles from "../styles/ReportIssue.module.css";

function ReportIssue() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [address, setAddress] = useState("");
  const [priority, setPriority] = useState("");
  const [aiCategory, setAiCategory] = useState(null);
  const [confidence, setConfidence] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("image", image);
    formData.append("address", address);
    formData.append("priority", priority);

    const token = localStorage.getItem("access");

    try {
      const response = await api.post("/api/report/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      const { category, confidence } = response.data;

      setAiCategory(category);
      setConfidence(confidence);

      alert(
        `Issue reported successfully!\nAI Predicted Category: ${category}\nConfidence: ${(confidence * 100).toFixed(2)}%`
      );

      setTitle("");
      setDescription("");
      setImage(null);
      setPreview(null);
      setAddress("");
      setPriority("");
    } catch (error) {
      console.error("Error reporting issue:", error);
      alert(
        error.response?.data
          ? JSON.stringify(error.response.data, null, 2)
          : "Failed to report issue."
      );
    }
  };

  return (
    <div className={styles.reportIssueContainer}>
      <h2>Report an Issue</h2>
      <form onSubmit={handleSubmit} className={styles.reportIssueForm}>
        <div className={styles.imageUploadSection}>
          <label htmlFor="image-upload" className={styles.imageUploadBox}>
            {preview ? (
              <img src={preview} alt="Preview" className={styles.imagePreview} />
            ) : (
              <>
                <span className={styles.uploadIcon}>📷</span>
                <p className={styles.uploadText}>Click to Upload Image</p>
                <p className={styles.imageHint}>PNG, JPG, up to 10MB</p>
              </>
            )}
          </label>
          <input
            type="file"
            id="image-upload"
            onChange={handleImageChange}
            accept="image/*"
            hidden
          />
        </div>

        <label className={styles.inputLabel}>Issue Title</label>
        <input
          type="text"
          placeholder="Issue Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <label className={styles.inputLabel}>Issue Description</label>
        <textarea
          placeholder="Provide detailed information about the issue..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <label className={styles.inputLabel}>Address</label>
        <input
          type="text"
          placeholder="Street address or nearest landmark"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />

        <label className={styles.inputLabel}>Priority</label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          required
        >
          <option value="">Select Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <button type="submit">Submit Issue</button>
      </form>
    </div>
  );
}

export default ReportIssue;
