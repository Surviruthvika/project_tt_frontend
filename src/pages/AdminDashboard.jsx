import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './Dashboard.css';

const BRANCHES = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL'];
const TABS = ['Students', 'Hall Allocations', 'Notifications'];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Students');
  const [students, setStudents] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [branchFilter, setBranchFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // Hall Allocation form
  const [allocForm, setAllocForm] = useState({
    branch:'CSE', section:'', rollNumberStart:'', rollNumberEnd:'',
    hallName:'', roomNumber:'', subject:'', examDate:'', examTime:''
  });

  // Notification form
  const [notifForm, setNotifForm] = useState({
    message:'', date:'', time:'', type:'ALL_BRANCH',
    branch:'CSE', rollNumbers:'', sendSms: false
  });

  useEffect(() => { loadStudents(); loadAllocations(); loadNotifications(); }, []);

  const loadStudents = async (branch = '') => {
    setLoading(true);
    const url = branch ? `/admin/students/branch/${branch}` : '/admin/students';
    const res = await api.get(url);
    setStudents(res.data);
    setLoading(false);
  };

  const loadAllocations = async () => {
    const res = await api.get('/admin/hall-allocations');
    setAllocations(res.data);
  };

  const loadNotifications = async () => {
    const res = await api.get('/admin/notifications');
    setNotifications(res.data);
  };

  const handleBranchFilter = (b) => {
    setBranchFilter(b);
    loadStudents(b);
  };

  const handleCreateAllocation = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/hall-allocations', allocForm);
      setMsg('✅ Hall allocation created!');
      setAllocForm({ branch:'CSE', section:'', rollNumberStart:'', rollNumberEnd:'', hallName:'', roomNumber:'', subject:'', examDate:'', examTime:'' });
      loadAllocations();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.error || 'Error'));
    }
  };

  const handleDeleteAllocation = async (id) => {
    if (!window.confirm('Delete this allocation?')) return;
    await api.delete(`/admin/hall-allocations/${id}`);
    loadAllocations();
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        message: notifForm.message,
        date: notifForm.date,
        time: notifForm.time,
        type: notifForm.type,
        sendSms: notifForm.sendSms,
        branch: notifForm.branch,
        rollNumbers: notifForm.rollNumbers ? notifForm.rollNumbers.split(',').map(r => r.trim()) : []
      };
      await api.post('/admin/notifications', payload);
      setMsg('✅ Notification sent!');
      setNotifForm({ message:'', date:'', time:'', type:'ALL_BRANCH', branch:'CSE', rollNumbers:'', sendSms: false });
      loadNotifications();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.error || 'Error'));
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

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
        <div className="tabs">
          {TABS.map(t => (
            <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => { setTab(t); setMsg(''); }}>
              {t === 'Students' ? '👥' : t === 'Hall Allocations' ? '🏛️' : '🔔'} {t}
            </button>
          ))}
        </div>

        {msg && <div className={`flash-msg ${msg.startsWith('✅') ? 'success' : 'error'}`}>{msg}</div>}

        {/* STUDENTS TAB */}
        {tab === 'Students' && (
          <div className="card">
            <div className="page-header">
              <div><h1>Student Directory</h1><p>All enrolled students</p></div>
              <div className="filter-row">
                <select value={branchFilter} onChange={e => handleBranchFilter(e.target.value)}>
                  <option value="">All Branches</option>
                  {BRANCHES.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
            </div>
            {loading ? <div className="loading">Loading...</div> : (
              <div className="table-wrap">
                <table>
                  <thead><tr>
                    <th>Roll Number</th><th>Name</th><th>Branch</th><th>Section</th><th>Phone</th>
                  </tr></thead>
                  <tbody>
                    {students.length === 0 ? (
                      <tr><td colSpan={5} className="empty-cell">No students found</td></tr>
                    ) : students.map(s => (
                      <tr key={s.id}>
                        <td><code>{s.rollNumber}</code></td>
                        <td>{s.name}</td>
                        <td><span className="badge badge-blue">{s.branch}</span></td>
                        <td>{s.section}</td>
                        <td>{s.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* HALL ALLOCATIONS TAB */}
        {tab === 'Hall Allocations' && (
          <div className="split-layout">
            <div className="card">
              <h2 className="section-title">➕ Create Allocation</h2>
              <form onSubmit={handleCreateAllocation}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Branch</label>
                    <select value={allocForm.branch} onChange={e => setAllocForm({...allocForm, branch: e.target.value})}>
                      {BRANCHES.map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Section</label>
                    <input placeholder="A" value={allocForm.section} onChange={e => setAllocForm({...allocForm, section: e.target.value})} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Roll No. Start</label>
                    <input placeholder="22B01A0501" value={allocForm.rollNumberStart} onChange={e => setAllocForm({...allocForm, rollNumberStart: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Roll No. End</label>
                    <input placeholder="22B01A0530" value={allocForm.rollNumberEnd} onChange={e => setAllocForm({...allocForm, rollNumberEnd: e.target.value})} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Hall Name</label>
                    <input placeholder="Block A" value={allocForm.hallName} onChange={e => setAllocForm({...allocForm, hallName: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Room Number</label>
                    <input placeholder="101" value={allocForm.roomNumber} onChange={e => setAllocForm({...allocForm, roomNumber: e.target.value})} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Subject</label>
                  <input placeholder="Data Structures" value={allocForm.subject} onChange={e => setAllocForm({...allocForm, subject: e.target.value})} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Exam Date</label>
                    <input type="date" value={allocForm.examDate} onChange={e => setAllocForm({...allocForm, examDate: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Exam Time</label>
                    <input placeholder="10:00 AM" value={allocForm.examTime} onChange={e => setAllocForm({...allocForm, examTime: e.target.value})} required />
                  </div>
                </div>
                <button className="btn btn-primary" type="submit" style={{width:'100%'}}>Create Allocation</button>
              </form>
            </div>

            <div className="card">
              <h2 className="section-title">🏛️ All Allocations</h2>
              <div className="table-wrap">
                <table>
                  <thead><tr>
                    <th>Branch</th><th>Section</th><th>Roll Range</th><th>Hall</th><th>Room</th><th>Subject</th><th>Date</th><th></th>
                  </tr></thead>
                  <tbody>
                    {allocations.length === 0 ? (
                      <tr><td colSpan={8} className="empty-cell">No allocations yet</td></tr>
                    ) : allocations.map(a => (
                      <tr key={a.id}>
                        <td><span className="badge badge-blue">{a.branch}</span></td>
                        <td>{a.section}</td>
                        <td><code>{a.rollNumberStart} – {a.rollNumberEnd}</code></td>
                        <td>{a.hallName}</td>
                        <td>{a.roomNumber}</td>
                        <td>{a.subject}</td>
                        <td>{a.examDate}</td>
                        <td><button className="btn btn-danger" style={{padding:'4px 10px', fontSize:'12px'}} onClick={() => handleDeleteAllocation(a.id)}>Delete</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {tab === 'Notifications' && (
          <div className="split-layout">
            <div className="card">
              <h2 className="section-title">📢 Send Notification</h2>
              <form onSubmit={handleSendNotification}>
                <div className="form-group">
                  <label>Message</label>
                  <textarea rows={4} placeholder="Notification message..." value={notifForm.message}
                    onChange={e => setNotifForm({...notifForm, message: e.target.value})} required style={{resize:'vertical'}} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Date</label>
                    <input type="date" value={notifForm.date} onChange={e => setNotifForm({...notifForm, date: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Time</label>
                    <input type="time" value={notifForm.time} onChange={e => setNotifForm({...notifForm, time: e.target.value})} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Target Audience</label>
                  <select value={notifForm.type} onChange={e => setNotifForm({...notifForm, type: e.target.value})}>
                    <option value="ALL_BRANCH">All Students</option>
                    <option value="BRANCH_SPECIFIC">Specific Branch</option>
                    <option value="SPECIFIC_STUDENTS">Specific Roll Numbers</option>
                  </select>
                </div>
                {notifForm.type === 'BRANCH_SPECIFIC' && (
                  <div className="form-group">
                    <label>Select Branch</label>
                    <select value={notifForm.branch} onChange={e => setNotifForm({...notifForm, branch: e.target.value})}>
                      {BRANCHES.map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                )}
                {notifForm.type === 'SPECIFIC_STUDENTS' && (
                  <div className="form-group">
                    <label>Roll Numbers (comma-separated)</label>
                    <input placeholder="22B01A0501, 22B01A0502" value={notifForm.rollNumbers}
                      onChange={e => setNotifForm({...notifForm, rollNumbers: e.target.value})} />
                  </div>
                )}
                <div className="form-group checkbox-group">
                  <label>
                    <input type="checkbox" checked={notifForm.sendSms}
                      onChange={e => setNotifForm({...notifForm, sendSms: e.target.checked})} style={{width:'auto', marginRight:'8px'}} />
                    Also send SMS via Twilio
                  </label>
                </div>
                <button className="btn btn-primary" type="submit" style={{width:'100%'}}>Send Notification</button>
              </form>
            </div>

            <div className="card">
              <h2 className="section-title">🔔 Sent Notifications</h2>
              {notifications.length === 0 ? (
                <div className="empty-state"><div className="icon">🔕</div><p>No notifications sent yet</p></div>
              ) : (
                <div className="notif-list">
                  {notifications.map(n => (
                    <div key={n.id} className="notif-item">
                      <div className="notif-msg">{n.message}</div>
                      <div className="notif-meta">
                        <span>📅 {n.date}</span>
                        <span>🕐 {n.time}</span>
                        <span className={`badge ${n.type === 'ALL_BRANCH' ? 'badge-blue' : n.type === 'BRANCH_SPECIFIC' ? 'badge-orange' : 'badge-green'}`}>
                          {n.type.replace('_', ' ')}
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