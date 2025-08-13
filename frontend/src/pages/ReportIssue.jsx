import { useState } from "react";
import api from "../api";
import styles from "../styles/ReportIssue.module.css";
import Navbar from "../components/Navbar";

function ReportIssue() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [address, setAddress] = useState("");
  const [priority, setPriority] = useState("");
  const [aiCategory, setAiCategory] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [isUnknown, setIsUnknown] = useState(false);

  // ✅ Handle image selection and backend pre-check
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem("access");
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await api.post("/api/predict-image/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      const { category, confidence, is_unknown } = response.data;

      setAiCategory(category);
      setConfidence(confidence);
      setIsUnknown(is_unknown);

      if (is_unknown) {
        alert(
          "This image does not match any known category or AI confidence is low. Please upload a valid issue image."
        );
        e.target.value = "";
        setImage(null);
        setPreview(null);
        setAiCategory(null);
        setConfidence(null);
        setIsUnknown(false);
        return;
      }

      // Valid image
      setImage(file);
      setPreview(URL.createObjectURL(file));

    } catch (err) {
      console.error(err);
      alert("Error checking image. Please try again.");
      e.target.value = "";
      setImage(null);
      setPreview(null);
      setAiCategory(null);
      setConfidence(null);
      setIsUnknown(false);
    }
  };

  // ✅ Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return alert("Please upload a valid image!");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("image", image);
    formData.append("address", address);
    formData.append("priority", priority);
    formData.append("category", aiCategory); // send AI category to backend

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
        `Issue reported successfully!\nAI Predicted Category: ${category}\nConfidence: ${(confidence * 100).toFixed(
          2
        )}%`
      );

      // Clear form
      setTitle(""); setDescription(""); setImage(null);
      setPreview(null); setAddress(""); setPriority("");
      setAiCategory(null); setConfidence(null); setIsUnknown(false);

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
    <div className={styles.reportIssueWrapper}>
      <Navbar />
      <div className={styles.main}>
        <div className={styles.reportIssueContainer}>
          <h2 className={styles.pageTitle}>Report an Issue</h2>

          <form onSubmit={handleSubmit} className={styles.reportIssueForm}>
  {/* Left Column: Image Upload */}
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
    {isUnknown && (
      <p className={styles.aiWarning}>
        ⚠️ AI cannot confidently classify this image. Please choose another.
      </p>
    )}
  </div>

  {/* Right Column: Form Fields */}
  <div className={styles.formSplit}>
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
      placeholder="Provide detailed information..."
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      required
    />

    <label className={styles.inputLabel}>Address</label>
    <input
      type="text"
      placeholder="Street address or landmark"
      value={address}
      onChange={(e) => setAddress(e.target.value)}
      required
    />

    <label className={styles.inputLabel}>Priority</label>
    <select value={priority} onChange={(e) => setPriority(e.target.value)} required>
      <option value="">Select Priority</option>
      <option value="low">Low</option>
      <option value="medium">Medium</option>
      <option value="high">High</option>
    </select>

    <button type="submit" disabled={!image}>Submit Issue</button>
  </div>
</form>

        </div>
      </div>
    </div>
  );
}

export default ReportIssue;
