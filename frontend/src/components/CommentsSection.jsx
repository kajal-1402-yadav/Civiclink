import React, { useEffect, useState } from "react";
import api from "../api";

function CommentsSection({ issueId, onCommentCountChange }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    fetchComments();
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

  const handleAddComment = async () => {
  if (!newComment.trim()) return;

  const token = localStorage.getItem("access");
  if (!token) {
    alert("You must be logged in to comment.");
    return;
  }

  try {
    const res = await api.post(`/api/issue/${issueId}/comments/`, {
      text: newComment,
    });
    setComments((prev) => [...prev, res.data]);
    onCommentCountChange(comments.length + 1);
    setNewComment("");
  } catch (error) {
    console.error("Failed to add comment:", error);
    alert("Failed to post comment.");
  }
};


  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/api/comment/${commentId}/delete/`);

      // Remove from UI
      setComments((prev) => {
        const updated = prev.filter((comment) => comment.id !== commentId);
        onCommentCountChange(updated.length);
        return updated;
      });
    } catch (error) {
      if (error.response?.status === 403) {
        alert("You can only delete your own comments.");
      } else {
        console.error("Failed to delete comment:", error);
        alert("Something went wrong while deleting.");
      }
    }
  };

  return (
    <div className="comments-section">
      <h4>Comments</h4>

      <div className="comment-input">
        <input
          type="text"
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button onClick={handleAddComment}>Post</button>
      </div>

      {comments.map((comment) => (
        <div key={comment.id} className="comment-box">
          <p>
            <strong>{comment.user_username}</strong>: {comment.text}
          </p>
          {comment.user === parseInt(localStorage.getItem("user_id")) && (
            <button
              className="delete-comment"
              onClick={() => handleDeleteComment(comment.id)}
            >
              🗑️
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default CommentsSection;
