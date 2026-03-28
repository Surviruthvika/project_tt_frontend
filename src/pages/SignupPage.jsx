import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import './Auth.css';

const BRANCHES = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL'];

export default function SignupPage() {
  const [role, setRole] = useState('STUDENT');
  const [form, setForm] = useState({
    rollNumber: '', name: '', branch: 'CSE', section: '',
    phone: '', password: '', email: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (role === 'STUDENT') {
        await api.post('/auth/student/signup', {
          rollNumber: form.rollNumber,
          name: form.name,
          branch: form.branch,
          section: form.section,
          phone: form.phone,
          password: form.password,
        });
      } else {
        await api.post('/auth/admin/signup', {
          name: form.name,
          email: form.email,
          password: form.password,
        });
      }
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSwitch = (newRole) => {
    setRole(newRole);
    setError('');
    setSuccess('');
  };

  return (
    <div className="auth-bg">
      <div className="auth-card wide">
        <div className="auth-logo">
          <div className="logo-circle">🎓</div>
          <h1>Create Account</h1>
          <p>Register for AU Exam Hall Locator</p>
        </div>

        <div className="role-tabs">
          <button
            type="button"
            className={`role-tab ${role === 'STUDENT' ? 'active' : ''}`}
            onClick={() => handleRoleSwitch('STUDENT')}
          >
            👨‍🎓 Student
          </button>
          <button
            type="button"
            className={`role-tab ${role === 'ADMIN' ? 'active' : ''}`}
            onClick={() => handleRoleSwitch('ADMIN')}
          >
            👨‍💼 Admin
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {role === 'STUDENT' ? (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Roll Number</label>
                  <input
                    placeholder="22B01A0501"
                    value={form.rollNumber}
                    onChange={set('rollNumber')}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    placeholder="Your full name"
                    value={form.name}
                    onChange={set('name')}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Branch</label>
                  <select value={form.branch} onChange={set('branch')}>
                    {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Section</label>
                  <input
                    placeholder="A, B, C..."
                    value={form.section}
                    onChange={set('section')}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Phone Number (with country code)</label>
                <input
                  placeholder="+919876543210"
                  value={form.phone}
                  onChange={set('phone')}
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  placeholder="Admin full name"
                  value={form.name}
                  onChange={set('name')}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="admin@anurag.edu.in"
                  value={form.email}
                  onChange={set('email')}
                  required
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Create a strong password"
              value={form.password}
              onChange={set('password')}
              required
              minLength={6}
            />
          </div>

          {error && <div className="auth-error">⚠️ {error}</div>}
          {success && <div className="auth-success">✅ {success}</div>}

          <button className="btn btn-primary auth-btn" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>

        <p className="auth-link">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
