import React, { useState } from 'react';
import { loginUser } from '../utils/api';

const Login = ({ onLogin, onNavigate }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      return setError('Please enter your email and password.');
    }

    setLoading(true);
    try {
      const res = await loginUser(formData);
      const { token, user } = res.data;

      // Store JWT token and user info
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      onLogin(user);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <i className="bi bi-search-heart logo-icon"></i>
          <h2>Lost & Found</h2>
          <p>Campus Item Management System</p>
        </div>

        <h5 className="text-center mb-4 fw-bold text-muted">Welcome Back</h5>

        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-circle me-2"></i>{error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Email Address</label>
            <input
              type="email"
              className="form-control mt-1"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="mb-4">
            <label>Password</label>
            <input
              type="password"
              className="form-control mt-1"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-auth" disabled={loading}>
            {loading ? (
              <><span className="spinner-border spinner-border-sm me-2"></span>Logging in...</>
            ) : (
              <><i className="bi bi-box-arrow-in-right me-2"></i>Login</>
            )}
          </button>
        </form>

        <div className="auth-switch mt-3">
          Don't have an account?{' '}
          <a onClick={() => onNavigate('register')}>Register here</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
