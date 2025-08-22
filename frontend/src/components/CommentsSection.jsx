import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa"; 
import api from "../api";
import styles from "../styles/CommunityIssues.module.css";

function CommentsSection({ issueId, onCommentCountChange }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const loggedInUserName = localStorage.getItem("username") || "";

  useEffect(() => {
    fetchComments();
    cancelEditing();
  }, [issueId]);

  const fetchComments = async () => {
    try {
      const res = await api.get(`/api/issue/${issueId}/comments/`);
      setComments(res.data);
      onCommentCountChange(res.data.length);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };

  const handleAddOrEditComment = async () => {
    if (!newComment.trim()) return;

    try {
      if (editingCommentId) {
        const res = await api.put(`/api/comment/${editingCommentId}/update/`, {
          text: newComment,
        });

        if (res.status === 200) {
          setComments((prev) =>
            prev.map((c) =>
              c.id === editingCommentId ? { ...c, text: newComment } : c
            )
          );
          cancelEditing();
        } else {
          alert("Failed to update comment.");
        }
      } else {
        const res = await api.post(`/api/issue/${issueId}/comments/`, {
          issue: issueId,
          text: newComment,
        });

        if (res.status === 201 || res.status === 200) {
          setComments((prev) => [...prev, res.data]);
          onCommentCountChange(comments.length + 1);
          setNewComment("");
        } else {
          alert("Unexpected response from server");
        }
      }
    } catch (error) {
      console.error("Failed to add or update comment:", error.response?.data || error);
      alert("Failed to add or update comment");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/api/comment/${commentId}/delete/`);
      const updatedComments = comments.filter((c) => c.id !== commentId);
      setComments(updatedComments);
      onCommentCountChange(updatedComments.length);

      if (editingCommentId === commentId) {
        cancelEditing();
      }
    } catch (error) {
      alert("Failed to delete comment");
    }
  };

  const startEditing = (comment) => {
    setEditingCommentId(comment.id);
    setNewComment(comment.text);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setNewComment("");
  };

  return (
    <div className={styles.commentsSection}>
      <h4 className={styles.commentsSectionTitle}>Comments</h4>

      <div className={styles.commentInputRow}>
        <input
          type="text"
          className={styles.commentInputBox}
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          className={`${styles.commentBtn} ${styles.commentPostBtn}`}
          onClick={handleAddOrEditComment}
        >
          {editingCommentId ? "Save" : "Post"}
        </button>
        {editingCommentId && (
          <button
            className={`${styles.commentBtn} ${styles.commentCancelBtn}`}
            onClick={cancelEditing}
          >
            Cancel
          </button>
        )}
      </div>

      <div className={styles.commentsList}>
        {comments.map((comment) => {
          const canEdit = comment.user_username === loggedInUserName;
          return (
            <div className={styles.commentItem} key={comment.id}>
              <div className={styles.commentContent}>
                <div>
                  <span className={styles.commentUser}>
                    {comment.user_username || comment.user?.username || "Unknown"}
                  </span>
                  <p className={styles.commentText}>{comment.text}</p>
                </div>
                {canEdit && !editingCommentId && (
                  <div className={styles.commentActions}>
                    <FaEdit
                      className={styles.iconBtn}
                      onClick={() => startEditing(comment)}
                    />
                    <FaTrash
                      className={styles.iconBtn}
                      onClick={() => handleDeleteComment(comment.id)}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CommentsSection;
