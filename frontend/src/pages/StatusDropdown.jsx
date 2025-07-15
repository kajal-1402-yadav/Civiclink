import { useState } from 'react';
import api from '../api';

const STATUS_OPTIONS = ['Open', 'Acknowledged', 'In Progress', 'Resolved', 'Closed'];

export default function StatusDropdown({ issueId, currentStatus, onStatusChange }) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = async (e) => {
    const newStatus = e.target.value;
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await api.post(`/issue/${issueId}/update-status/`, { status: newStatus }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 200) {
        setStatus(newStatus);
        if (onStatusChange) onStatusChange(newStatus);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-200">Update Status</label>
      <select
        className="w-full p-2 bg-gray-800 text-white rounded"
        value={status}
        onChange={handleChange}
        disabled={loading}
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}
