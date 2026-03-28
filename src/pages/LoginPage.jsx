import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './Auth.css';

export default function LoginPage() {
  const [role, setRole] = useState('STUDENT');
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let res;
      if (role === 'STUDENT') {
        res = await api.post('/auth/student/login', {
          rollNumber: form.identifier,
          password: form.password,
        });
      } else {
        res = await api.post('/auth/admin/login', {
          email: form.identifier,
          password: form.password,
        });
      }
      login(res.data);
      navigate(role === 'ADMIN' ? '/admin' : '/student');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSwitch = (newRole) => {
    setRole(newRole);
    setError('');
    setForm({ identifier: '', password: '' });
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-circle">🎓</div>
          <h1>AU Exam Hall Locator</h1>
          <p>Anurag University — Sign in to continue</p>
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
          <div className="form-group">
            <label>{role === 'STUDENT' ? 'Roll Number' : 'Email Address'}</label>
            <input
              type={role === 'ADMIN' ? 'email' : 'text'}
              placeholder={role === 'STUDENT' ? 'e.g. 22B01A0501' : 'admin@anurag.edu.in'}
              value={form.identifier}
              onChange={(e) => setForm({ ...form, identifier: e.target.value })}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          {error && <div className="auth-error">⚠️ {error}</div>}

          <button className="btn btn-primary auth-btn" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <p className="auth-link">
          Don't have an account? <Link to="/signup">Sign up here</Link>
        </p>
      </div>
    </div>
  );
}
