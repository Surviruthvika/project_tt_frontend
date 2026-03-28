import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './Dashboard.css';

const BRANCHES = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL'];
const TABS = ['Students', 'Hall Allocations', 'Notifications'];

const EMPTY_ALLOC = {
  branch: 'CSE', section: '', rollNumberStart: '', rollNumberEnd: '',
  hallName: '', roomNumber: '', subject: '', examDate: '', examTime: '',
};

const EMPTY_NOTIF = {
  message: '', date: '', time: '', type: 'ALL_BRANCH',
  branch: 'CSE', rollNumbers: '', sendSms: false,
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
    } catch { /* silent */ }
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      const res = await api.get('/admin/notifications');
      setNotifications(res.data);
    } catch { /* silent */ }
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
      showMsg('✅ Hall allocation created successfully!');
      setAllocForm(EMPTY_ALLOC);
      loadAllocations();
    } catch (err) {
      showMsg('❌ ' + (err.response?.data?.error || 'Failed to create allocation'), 'error');
    }
  };

  const handleDeleteAllocation = async (id) => {
    if (!window.confirm('Delete this allocation?')) return;
    try {
      await api.delete(`/admin/hall-allocations/${id}`);
      showMsg('✅ Allocation deleted');
      loadAllocations();
    } catch {
      showMsg('❌ Failed to delete', 'error');
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
        sendSms: notifForm.sendSms,
        branch: notifForm.branch,
        rollNumbers: notifForm.rollNumbers
          ? notifForm.rollNumbers.split(',').map((r) => r.trim()).filter(Boolean)
          : [],
      };
      await api.post('/admin/notifications', payload);
      showMsg('✅ Notification sent successfully!');
      setNotifForm(EMPTY_NOTIF);
      loadNotifications();
    } catch (err) {
      showMsg('❌ ' + (err.response?.data?.error || 'Failed to send notification'), 'error');
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const setAlloc = (field) => (e) => setAllocForm({ ...allocForm, [field]: e.target.value });
  const setNotif = (field) => (e) =>
    setNotifForm({ ...notifForm, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="nav-brand">🎓 AU Exam Hall — <span>Admin Panel</span></div>
        <div className="nav-right">
          <span className="nav-user">👨‍💼 {user?.name}</span>
          <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="dash-body">

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-label">Total Students</div>
            <div className="stat-value">{students.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏛️</div>
            <div className="stat-label">Hall Allocations</div>
            <div className="stat-value">{allocations.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔔</div>
            <div className="stat-label">Notifications Sent</div>
            <div className="stat-value">{notifications.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏫</div>
            <div className="stat-label">Branches</div>
            <div className="stat-value">5</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {TABS.map((t) => (
            <button key={t} className={`tab ${tab === t ? 'active' : ''}`}
              onClick={() => { setTab(t); setMsg({ text: '', type: '' }); }}>
              {t === 'Students' ? '👥' : t === 'Hall Allocations' ? '🏛️' : '🔔'} {t}
            </button>
          ))}
        </div>

        {msg.text && <div className={`flash-msg ${msg.type}`}>{msg.text}</div>}

        {/* ── STUDENTS TAB ── */}
        {tab === 'Students' && (
          <div className="card">
            <div className="page-header">
              <div>
                <h1>Student Directory</h1>
                <p>{students.length} student{students.length !== 1 ? 's' : ''} found</p>
              </div>
              <div className="filter-row">
                <select value={branchFilter} onChange={(e) => handleBranchFilter(e.target.value)}>
                  <option value="">All Branches</option>
                  {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
                {branchFilter && (
                  <button className="btn btn-outline btn-sm" onClick={() => handleBranchFilter('')}>
                    Clear
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="loading">⏳ Loading students...</div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Roll Number</th>
                      <th>Name</th>
                      <th>Branch</th>
                      <th>Section</th>
                      <th>Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.length === 0 ? (
                      <tr><td colSpan={6} className="empty-cell">No students found</td></tr>
                    ) : (
                      students.map((s, i) => (
                        <tr key={s.id}>
                          <td style={{ color: '#94a3b8', fontSize: '13px' }}>{i + 1}</td>
                          <td><code>{s.rollNumber}</code></td>
                          <td style={{ fontWeight: 500 }}>{s.name}</td>
                          <td><span className="badge badge-blue">{s.branch}</span></td>
                          <td><span className="badge badge-purple">{s.section}</span></td>
                          <td style={{ color: '#64748b' }}>{s.phone}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── HALL ALLOCATIONS TAB ── */}
        {tab === 'Hall Allocations' && (
          <div className="split-layout">
            {/* Form */}
            <div className="card">
              <h2 className="section-title">➕ Create Allocation</h2>
              <form onSubmit={handleCreateAllocation}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Branch</label>
                    <select value={allocForm.branch} onChange={setAlloc('branch')}>
                      {BRANCHES.map((b) => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Section</label>
                    <input placeholder="e.g. A" value={allocForm.section} onChange={setAlloc('section')} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Roll No. Start</label>
                    <input placeholder="22B01A0501" value={allocForm.rollNumberStart} onChange={setAlloc('rollNumberStart')} required />
                  </div>
                  <div className="form-group">
                    <label>Roll No. End</label>
                    <input placeholder="22B01A0530" value={allocForm.rollNumberEnd} onChange={setAlloc('rollNumberEnd')} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Hall Name</label>
                    <input placeholder="Block A" value={allocForm.hallName} onChange={setAlloc('hallName')} required />
                  </div>
                  <div className="form-group">
                    <label>Room Number</label>
                    <input placeholder="101" value={allocForm.roomNumber} onChange={setAlloc('roomNumber')} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Subject</label>
                  <input placeholder="e.g. Data Structures and Algorithms" value={allocForm.subject} onChange={setAlloc('subject')} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Exam Date</label>
                    <input type="date" value={allocForm.examDate} onChange={setAlloc('examDate')} required />
                  </div>
                  <div className="form-group">
                    <label>Exam Time</label>
                    <input placeholder="10:00 AM" value={allocForm.examTime} onChange={setAlloc('examTime')} required />
                  </div>
                </div>
                <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>
                  Create Allocation
                </button>
              </form>
            </div>

            {/* Table */}
            <div className="card">
              <h2 className="section-title">🏛️ All Allocations ({allocations.length})</h2>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Branch</th><th>Sec</th><th>Roll Range</th>
                      <th>Hall</th><th>Room</th><th>Subject</th><th>Date</th><th>Time</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {allocations.length === 0 ? (
                      <tr><td colSpan={9} className="empty-cell">No allocations yet</td></tr>
                    ) : (
                      allocations.map((a) => (
                        <tr key={a.id}>
                          <td><span className="badge badge-blue">{a.branch}</span></td>
                          <td><span className="badge badge-purple">{a.section}</span></td>
                          <td><code style={{ fontSize: '11px' }}>{a.rollNumberStart}–{a.rollNumberEnd}</code></td>
                          <td>{a.hallName}</td>
                          <td>{a.roomNumber}</td>
                          <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.subject}</td>
                          <td style={{ whiteSpace: 'nowrap' }}>{a.examDate}</td>
                          <td style={{ whiteSpace: 'nowrap' }}>{a.examTime}</td>
                          <td>
                            <button className="btn btn-danger btn-sm"
                              onClick={() => handleDeleteAllocation(a.id)}>
                              🗑
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── NOTIFICATIONS TAB ── */}
        {tab === 'Notifications' && (
          <div className="split-layout">
            {/* Form */}
            <div className="card">
              <h2 className="section-title">📢 Send Notification</h2>
              <form onSubmit={handleSendNotification}>
                <div className="form-group">
                  <label>Message</label>
                  <textarea
                    rows={4}
                    placeholder="Type your notification message here..."
                    value={notifForm.message}
                    onChange={setNotif('message')}
                    required
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Date</label>
                    <input type="date" value={notifForm.date} onChange={setNotif('date')} required />
                  </div>
                  <div className="form-group">
                    <label>Time</label>
                    <input type="time" value={notifForm.time} onChange={setNotif('time')} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Send To</label>
                  <select value={notifForm.type} onChange={setNotif('type')}>
                    <option value="ALL_BRANCH">🌐 All Students</option>
                    <option value="BRANCH_SPECIFIC">🏫 Specific Branch</option>
                    <option value="SPECIFIC_STUDENTS">👤 Specific Roll Numbers</option>
                  </select>
                </div>
                {notifForm.type === 'BRANCH_SPECIFIC' && (
                  <div className="form-group">
                    <label>Select Branch</label>
                    <select value={notifForm.branch} onChange={setNotif('branch')}>
                      {BRANCHES.map((b) => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                )}
                {notifForm.type === 'SPECIFIC_STUDENTS' && (
                  <div className="form-group">
                    <label>Roll Numbers (comma separated)</label>
                    <input
                      placeholder="22B01A0501, 22B01A0502, 22B01A0503"
                      value={notifForm.rollNumbers}
                      onChange={setNotif('rollNumbers')}
                    />
                  </div>
                )}
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={notifForm.sendSms}
                      onChange={setNotif('sendSms')}
                    />
                    📱 Also send SMS via Twilio
                  </label>
                </div>
                <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>
                  Send Notification
                </button>
              </form>
            </div>

            {/* Notification History */}
            <div className="card">
              <h2 className="section-title">🔔 Sent Notifications ({notifications.length})</h2>
              {notifications.length === 0 ? (
                <div className="empty-state">
                  <div className="icon">🔕</div>
                  <p>No notifications sent yet</p>
                </div>
              ) : (
                <div className="notif-list">
                  {[...notifications].reverse().map((n) => (
                    <div key={n.id} className="notif-item">
                      <div className="notif-msg">{n.message}</div>
                      <div className="notif-meta">
                        <span>📅 {n.date}</span>
                        <span>🕐 {n.time}</span>
                        <span className={`badge ${
                          n.type === 'ALL_BRANCH' ? 'badge-blue'
                          : n.type === 'BRANCH_SPECIFIC' ? 'badge-orange'
                          : 'badge-green'
                        }`}>
                          {n.type === 'ALL_BRANCH' ? '🌐 All'
                            : n.type === 'BRANCH_SPECIFIC' ? `🏫 ${n.target}`
                            : '👤 Specific'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
