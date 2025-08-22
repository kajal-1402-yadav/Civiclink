import { useState } from "react";
import api from "../api";
import styles from "../styles/ReportIssue.module.css";
import Navbar from "../components/Navbar";
import Modal from "../components/Modal";

function ReportIssue() {
  const LOW_CONF_THRESHOLD = 0.35; 
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [address, setAddress] = useState("");
  const [priority, setPriority] = useState("");
  const [aiCategory, setAiCategory] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [isUnknown, setIsUnknown] = useState(false);
  const [modal, setModal] = useState({ open: false, title: "", message: "" });

  const compressImage = (file, maxDim = 1024, quality = 0.8) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        let { width, height } = img;
        if (width < 256 || height < 256) {
          URL.revokeObjectURL(url);
          return reject(new Error('Image too small'));
        }
        const scale = Math.min(1, maxDim / Math.max(width, height));
        const targetW = Math.round(width * scale);
        const targetH = Math.round(height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, targetW, targetH);
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Compression failed'));
            const compressed = new File([blob], file.name.replace(/\.(png|jpg|jpeg|webp)$/i, '.jpg'), { type: 'image/jpeg' });
            URL.revokeObjectURL(url);
            resolve(compressed);
          },
          'image/jpeg',
          quality
        );
      };

  const isAnimatedPNG = async (file) => {
    try {
      const buf = await file.arrayBuffer();
      const bytes = new Uint8Array(buf);
      const sig = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
      for (let i = 0; i < sig.length; i++) {
        if (bytes[i] !== sig[i]) return false;
      }
      for (let i = 8; i < bytes.length - 4; i++) {
        if (
          bytes[i] === 0x61 && // 'a'
          bytes[i + 1] === 0x63 && // 'c'
          bytes[i + 2] === 0x54 && // 'T'
          bytes[i + 3] === 0x4C // 'L'
        ) {
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  };
      img.onerror = reject;
      img.src = url;
    });

  const showModal = (title, message) => setModal({ open: true, title, message });
  const closeModal = () => setModal((m) => ({ ...m, open: false }));


  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const mime = (file.type || '').toLowerCase();
    if (mime === 'image/png') {
      const animated = await isAnimatedPNG(file);
      if (animated) {
        showModal(
          "Animated Images Not Allowed",
          "APNG files are not supported. Please upload a single-frame PNG or JPG."
        );
        e.target.value = "";
        setImage(null); setPreview(null); setAiCategory(null); setConfidence(null); setIsUnknown(false);
        return;
      }
    }

    const token = localStorage.getItem("access");
    let compressedFile = file;
    try {
      compressedFile = await compressImage(file);
    } catch (err) {
      showModal(
        "Image Too Small",
        "The selected image is too small (minimum 256x256). Please choose a clearer, larger photo of the issue."
      );
      e.target.value = "";
      setImage(null);
      setPreview(null);
      setAiCategory(null);
      setConfidence(null);
      setIsUnknown(false);
      return;
    }
    const formData = new FormData();
    formData.append("image", compressedFile);

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
        showModal(
          "Uncertain Image Classification",
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

      if (category === 'other' && (typeof confidence === 'number') && confidence < LOW_CONF_THRESHOLD) {
        showModal(
          "Low Confidence — Unclear Category",
          `The AI predicted 'Other' with low confidence (${(confidence * 100).toFixed(1)}%).\nPlease upload a clearer image related to a community issue (e.g., road, garbage, water, electricity).`
        );
        e.target.value = "";
        setImage(null);
        setPreview(null);
        setAiCategory(null);
        setConfidence(null);
        setIsUnknown(false);
        return;
      }

      setImage(compressedFile);
      setPreview(URL.createObjectURL(compressedFile));

    } catch (err) {
      console.error(err);
      showModal("Image Check Failed", "Error checking image. Please try again.");
      e.target.value = "";
      setImage(null);
      setPreview(null);
      setAiCategory(null);
      setConfidence(null);
      setIsUnknown(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return showModal("Missing Image", "Please upload a valid image!");

    if (aiCategory === 'other' && (typeof confidence === 'number') && confidence < LOW_CONF_THRESHOLD) {
      return showModal(
        "Low Confidence — Cannot Submit",
        `The AI predicted 'Other' with low confidence (${(confidence * 100).toFixed(1)}%). Please choose a clearer image for a specific category.`
      );
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("image", image);
    formData.append("address", address);
    formData.append("priority", priority);
    formData.append("category", aiCategory);
    if (typeof confidence === 'number') {
      formData.append("confidence", confidence);
    }

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

      showModal(
        "Issue Reported Successfully",
        `AI Predicted Category: ${category}\nConfidence: ${(confidence * 100).toFixed(2)}%`
      );

      setTitle(""); setDescription(""); setImage(null);
      setPreview(null); setAddress(""); setPriority("");
      setAiCategory(null); setConfidence(null); setIsUnknown(false);

    } catch (error) {
      console.error("Error reporting issue:", error);
      showModal(
        "Failed to Report Issue",
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

          <Modal
            isOpen={modal.open}
            title={modal.title}
            message={modal.message}
            onClose={closeModal}
          />

        </div>
      </div>
    </div>
  );
}

export default ReportIssue;
