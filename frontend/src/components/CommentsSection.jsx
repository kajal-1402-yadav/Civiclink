import React, { useEffect, useState } from "react";
import api from "../api";

function CommentsSection({ issueId, onCommentCountChange }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  // Edit mode tracking
  const [editingCommentId, setEditingCommentId] = useState(null);

  const loggedInUserName = localStorage.getItem("username") || "";

  useEffect(() => {
    fetchComments();
    cancelEditing();  // reset on issue change
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
        // Save edited comment
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
        // Add new comment
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
    window.scrollTo({ top: 0, behavior: "smooth" }); // scroll to input box for UX
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setNewComment("");
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
        <button onClick={handleAddOrEditComment}>
          {editingCommentId ? "Save" : "Post"}
        </button>
        {editingCommentId && (
          <button onClick={cancelEditing} style={{ marginLeft: "0.5rem" }}>
            Cancel
          </button>
        )}
      </div>

      {comments.map((comment) => {
        const canEdit = comment.user_username === loggedInUserName;
        return (
          <div key={comment.id} style={{ marginBottom: "1rem" }}>
            <strong>{comment.user_username || comment.user?.username || "Unknown"}</strong>
            <p>{comment.text}</p>
            {canEdit && !editingCommentId && (
              <>
                <button onClick={() => startEditing(comment)}>Edit</button>
                <button onClick={() => handleDeleteComment(comment.id)}>Delete</button>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default CommentsSection;
