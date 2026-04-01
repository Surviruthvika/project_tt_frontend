import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './Dashboard.css';

//const BRANCHES = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL'];
//const TABS = ['Students', 'Hall Allocations', 'Notifications'];

const EMPTY_ALLOC = {
  branch: 'CSE', section: '', rollNumberStart: '', rollNumberEnd: '',
  hallName: '', roomNumber: '', subject: '', examDate: '', examTime: '',
};

const EMPTY_NOTIF = {
  message: '', date: '', time: '', type: 'ALL_BRANCH',
  branch: 'CSE', rollNumbers: '',
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Students');
  const [students, setStudents] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [branchFilter, setBranchFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [allocForm, setAllocForm] = useState(EMPTY_ALLOC);
  const [notifForm, setNotifForm] = useState(EMPTY_NOTIF);

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 4000);
  };

  const loadStudents = useCallback(async (branch = '') => {
    setLoading(true);
    try {
      const url = branch ? `/admin/students/branch/${branch}` : '/admin/students';
      const res = await api.get(url);
      setStudents(res.data);
    } catch {
      showMsg('Failed to load students', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAllocations = useCallback(async () => {
    try {
      const res = await api.get('/admin/hall-allocations');
      setAllocations(res.data);
    } catch {}
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      const res = await api.get('/admin/notifications');
      setNotifications(res.data);
    } catch {}
  }, []);

  useEffect(() => {
    loadStudents();
    loadAllocations();
    loadNotifications();
  }, [loadStudents, loadAllocations, loadNotifications]);

  const handleBranchFilter = (b) => {
    setBranchFilter(b);
    loadStudents(b);
  };

  const handleCreateAllocation = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/hall-allocations', allocForm);
      showMsg('✅ Hall allocation created!');
      setAllocForm(EMPTY_ALLOC);
      loadAllocations();
    } catch (err) {
      showMsg('❌ Failed to create allocation', 'error');
    }
  };

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
      loadNotifications();
    } catch {
      showMsg('❌ Failed to send notification', 'error');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const setAlloc = (field) => (e) => setAllocForm({ ...allocForm, [field]: e.target.value });
  const setNotif = (field) => (e) =>
    setNotifForm({ ...notifForm, [field]: e.target.value });

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div>🎓 Admin Panel</div>
        <button onClick={handleLogout}>Logout</button>
      </nav>

      {msg.text && <div>{msg.text}</div>}

      {tab === 'Students' && (
        <div>
          <h2>Students</h2>
          {students.map((s) => (
            <div key={s.id}>{s.name} ({s.rollNumber})</div>
          ))}
        </div>
      )}

      {tab === 'Hall Allocations' && (
        <div>
          <h2>Allocations</h2>
          {allocations.map((a) => (
            <div key={a.id}>
              {a.subject} - {a.hallName}
              <button onClick={() => handleDeleteAllocation(a.id)}>Delete</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'Notifications' && (
        <form onSubmit={handleSendNotification}>
          <textarea
            placeholder="Message"
            value={notifForm.message}
            onChange={setNotif('message')}
          />
          <button type="submit">Send</button>
        </form>
      )}
    </div>
  );
}