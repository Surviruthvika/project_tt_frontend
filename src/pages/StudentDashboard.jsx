import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './Dashboard.css';

const TABS = ['My Hall', 'Notifications', 'Profile'];

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('My Hall');
  const [profile, setProfile] = useState(null);
  const [allocations, setAllocations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [profileRes, allocRes, notifRes] = await Promise.all([
          api.get('/student/profile'),
          api.get('/student/hall-allocations'),
          api.get('/student/notifications'),
        ]);
        setProfile(profileRes.data);
        setAllocations(allocRes.data);
        setNotifications(notifRes.data);
      } catch (err) {
        console.error('Failed to load data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="nav-brand">🎓 AU Exam Hall — <span>Student Portal</span></div>
        <div className="nav-right">
          <span className="nav-user">👨‍🎓 {user?.name}</span>
          <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="dash-body">

        {/* Stats */}
        {profile && (
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-icon">🎫</div>
              <div className="stat-label">Roll Number</div>
              <div className="stat-value" style={{ fontSize: '18px', fontFamily: 'JetBrains Mono, monospace' }}>
                {profile.rollNumber}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏫</div>
              <div className="stat-label">Branch</div>
              <div className="stat-value" style={{ fontSize: '22px' }}>{profile.branch}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏛️</div>
              <div className="stat-label">Hall Allocations</div>
              <div className="stat-value">{allocations.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔔</div>
              <div className="stat-label">Notifications</div>
              <div className="stat-value">{notifications.length}</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="tabs">
          {TABS.map((t) => (
            <button key={t} className={`tab ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}>
              {t === 'My Hall' ? '🏛️' : t === 'Notifications' ? '🔔' : '👤'} {t}
            </button>
          ))}
        </div>

        {loading && <div className="loading">⏳ Loading your data...</div>}

        {/* ── MY HALL TAB ── */}
        {!loading && tab === 'My Hall' && (
          <div className="card">
            <div className="page-header">
              <div>
                <h1>My Exam Hall</h1>
                <p>Your allocated exam rooms and schedule</p>
              </div>
            </div>
            {allocations.length === 0 ? (
              <div className="empty-state">
                <div className="icon">🏛️</div>
                <p>No hall allocations found for your roll number.</p>
                <p style={{ marginTop: 8, fontSize: 13 }}>Check back later or contact admin.</p>
              </div>
            ) : (
              <div className="alloc-grid">
                {allocations.map((a) => (
                  <div key={a.id} className="alloc-card">
                    <div className="alloc-header">
                      <span className="badge badge-blue">{a.branch}</span>
                      <span className="badge badge-purple">Section {a.section}</span>
                    </div>
                    <div className="alloc-subject">{a.subject}</div>
                    <div className="alloc-location">
                      <span>🏛️ {a.hallName}</span>
                      <span>🚪 Room {a.roomNumber}</span>
                    </div>
                    <div className="alloc-datetime">
                      <span>📅 {a.examDate}</span>
                      <span>🕐 {a.examTime}</span>
                    </div>
                    <div className="alloc-range">
                      Roll Range: <code>{a.rollNumberStart} – {a.rollNumberEnd}</code>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── NOTIFICATIONS TAB ── */}
        {!loading && tab === 'Notifications' && (
          <div className="card">
            <div className="page-header">
              <div>
                <h1>Notifications</h1>
                <p>Messages and alerts from administration</p>
              </div>
            </div>
            {notifications.length === 0 ? (
              <div className="empty-state">
                <div className="icon">🔕</div>
                <p>No notifications yet.</p>
              </div>
            ) : (
              <div className="notif-list">
                {[...notifications].reverse().map((n) => (
                  <div key={n.id} className="notif-item">
                    <div className="notif-msg">{n.message}</div>
                    <div className="notif-meta">
                      <span>📅 {n.date}</span>
                      <span>🕐 {n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PROFILE TAB ── */}
        {!loading && tab === 'Profile' && profile && (
          <div className="card" style={{ maxWidth: 520 }}>
            <h2 className="section-title">👤 My Profile</h2>
            <div className="profile-grid">
              <div className="profile-item">
                <label>Roll Number</label>
                <span><code>{profile.rollNumber}</code></span>
              </div>
              <div className="profile-item">
                <label>Full Name</label>
                <span>{profile.name}</span>
              </div>
              <div className="profile-item">
                <label>Branch</label>
                <span><span className="badge badge-blue">{profile.branch}</span></span>
              </div>
              <div className="profile-item">
                <label>Section</label>
                <span><span className="badge badge-purple">{profile.section}</span></span>
              </div>
              <div className="profile-item">
                <label>Phone Number</label>
                <span>{profile.phone}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
