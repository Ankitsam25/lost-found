import React, { useState } from 'react';
import { registerUser } from '../utils/api';

const Register = ({ onNavigate }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.email || !formData.password) {
      return setError('All fields are required.');
    }
    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setLoading(true);
    try {
      await registerUser(formData);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => onNavigate('login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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

        <h5 className="text-center mb-4 fw-bold text-muted">Create Account</h5>

        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-circle me-2"></i>{error}
          </div>
        )}
        {success && (
          <div className="alert alert-success" role="alert">
            <i className="bi bi-check-circle me-2"></i>{success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Full Name</label>
            <input
              type="text"
              className="form-control mt-1"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
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
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-auth" disabled={loading}>
            {loading ? (
              <><span className="spinner-border spinner-border-sm me-2"></span>Registering...</>
            ) : (
              <><i className="bi bi-person-plus me-2"></i>Register</>
            )}
          </button>
        </form>

        <div className="auth-switch mt-3">
          Already have an account?{' '}
          <a onClick={() => onNavigate('login')}>Login here</a>
        </div>
      </div>
    </div>
  );
};

export default Register;
