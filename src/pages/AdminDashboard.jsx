/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './Dashboard.css';

const EMPTY_ALLOC = {
  branch: 'CSE', section: '', rollNumberStart: '', rollNumberEnd: '',
  hallName: '', roomNumber: '', subject: '', examDate: '', examTime: '',
};

const EMPTY_NOTIF = {
  message: '', date: '', time: '', type: 'ALL_BRANCH',
  branch: 'CSE', rollNumbers: '',
};

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [allocForm, setAllocForm] = useState(EMPTY_ALLOC);
  const [notifForm, setNotifForm] = useState(EMPTY_NOTIF);

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 4000);
  };

  const loadStudents = useCallback(async (branch = '') => {
    try {
      const url = branch ? `/admin/students/branch/${branch}` : '/admin/students';
      const res = await api.get(url);
      setStudents(res.data);
    } catch {
      showMsg('Failed to load students', 'error');
    }
  }, [showMsg]);

  const loadAllocations = useCallback(async () => {
    try {
      const res = await api.get('/admin/hall-allocations');
      setAllocations(res.data);
    } catch {}
  }, []);

  useEffect(() => {
    loadStudents();
    loadAllocations();
  }, [loadStudents, loadAllocations]);

  const handleDeleteAllocation = async (id) => {
    if (!window.confirm('Delete this allocation?')) return;
    try {
      await api.delete(`/admin/hall-allocations/${id}`);
      showMsg('✅ Deleted');
      loadAllocations();
    } catch {
      showMsg('❌ Failed', 'error');
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        message: notifForm.message,
        date: notifForm.date || null,
        time: notifForm.time ? notifForm.time + ':00' : null,
        type: notifForm.type,
        branch: notifForm.branch,
        rollNumbers: notifForm.rollNumbers
          ? notifForm.rollNumbers.split(',').map((r) => r.trim()).filter(Boolean)
          : [],
      };

      await api.post('/admin/notifications', payload);
      showMsg('✅ Notification sent!');
      setNotifForm(EMPTY_NOTIF);
    } catch {
      showMsg('❌ Failed to send notification', 'error');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const setNotif = (field) => (e) =>
    setNotifForm({ ...notifForm, [field]: e.target.value });

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div>🎓 Admin Panel</div>
        <button onClick={handleLogout}>Logout</button>
      </nav>

      {msg.text && <div>{msg.text}</div>}

      <div>
        <h2>Students</h2>
        {students.map((s) => (
          <div key={s.id}>{s.name} ({s.rollNumber})</div>
        ))}
      </div>

      <div>
        <h2>Allocations</h2>
        {allocations.map((a) => (
          <div key={a.id}>
            {a.subject} - {a.hallName}
            <button onClick={() => handleDeleteAllocation(a.id)}>Delete</button>
          </div>
        ))}
      </div>

      <form onSubmit={handleSendNotification}>
        <h2>Send Notification</h2>
        <textarea
          placeholder="Message"
          value={notifForm.message}
          onChange={setNotif('message')}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}