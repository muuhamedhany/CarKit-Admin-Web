import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Lock, Mail, AlertCircle, Loader2, Zap } from 'lucide-react';
import logo from '../assets/carkit-logo.png';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Required: Identity Protocol & Security Cipher');
      return;
    }

    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setError('Access Denied: Invalid Authentication Segment');
    }
  };

  return (
    <div className="login-page">
      {/* Background Ambience Orbs */}
      <div className="login-bg-orb login-bg-orb-1" />
      <div className="login-bg-orb login-bg-orb-2" />
      <div className="login-bg-orb login-bg-orb-3" />

      <div className="login-container">
        {/* Logo/Brand Section */}
        <div className="login-logo-wrapper">
          <img src={logo} alt="CarKit" className="login-logo" />
        </div>
        <h1 className="login-title">CarKit</h1>
        <p className="login-subtitle">Admin Control Panel</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label className="login-label">Identity Token</label>
            <div className="login-input-wrapper">
              <Mail className="login-input-icon" size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input"
                placeholder="identity@carkit.io"
                required
              />
            </div>
          </div>

          <div className="login-field">
            <label className="login-label">Access Cipher</label>
            <div className="login-input-wrapper">
              <Lock className="login-input-icon" size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
                placeholder="••••••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="login-toggle-password"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="login-error">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading} className="login-button">
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <span>Initialize Session</span>
              </>
            )}
          </button>
        </form>

        <p className="login-footer">
          Proprietary System &middot; &copy; 2026 CarKit Registry
        </p>
      </div>
    </div>
  );
};

export default Login;
