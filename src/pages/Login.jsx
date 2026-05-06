import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Lock, Mail, AlertCircle, Loader2, ShieldCheck, Terminal, Zap } from 'lucide-react';
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
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyber-purple/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyber-pink/20 blur-[120px] rounded-full animate-pulse transition-all duration-1000" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Brand Section */}
        <div className="flex justify-center gap-2 items-center mb-6 animate-fade-in">
          <div className="rounded-3xl bg-black flex items-center justify-center mb-4">
            <img src={logo} alt="CarKit" className="h-10 w-auto" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter display-font uppercase mb-2">
            <span className="text-cyber-purple text-glow-purple">Admin</span>
          </h1>
        </div>

        {/* Login Card */}
        <div className="glass-panel p-10 border-white/5 relative overflow-hidden animate-slide-up">
          <div className="absolute top-0 left-0 w-1 h-full bg-cyber-purple opacity-30 shadow-[0_0_15px_rgba(179,136,255,0.5)]" />
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="group">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary group-focus-within:text-cyber-purple transition-colors block mb-3 ml-1">
                  Identity Token
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-4 h-4 text-text-secondary group-focus-within:text-cyber-purple transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-text-secondary/30 focus:outline-none focus:border-cyber-purple/50 focus:ring-1 focus:ring-cyber-purple/20 transition-all font-medium"
                    placeholder="PROTOCOL@CARKIT.SYSTEM"
                    required
                  />
                </div>
              </div>

              <div className="group">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary group-focus-within:text-cyber-blue transition-colors block mb-3 ml-1">
                  Access Cipher
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 h-4 text-text-secondary group-focus-within:text-cyber-blue transition-colors" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-sm text-white placeholder:text-text-secondary/30 focus:outline-none focus:border-cyber-blue/50 focus:ring-1 focus:ring-cyber-blue/20 transition-all font-medium"
                    placeholder="••••••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-cyber-pink/10 border border-cyber-pink/20 flex items-center gap-3 animate-shake">
                <ShieldCheck className="w-5 h-5 text-cyber-pink flex-shrink-0" />
                <p className="text-[10px] font-black uppercase tracking-widest text-cyber-pink leading-tight">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full cyber-button py-5 rounded-2xl bg-cyber-purple/10 border-cyber-purple/20 text-cyber-purple hover:bg-cyber-purple/20 hover:border-cyber-purple transition-all flex items-center justify-center gap-3 group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Zap className="w-5 h-5 group-hover:scale-125 transition-transform" />
                  <span className="text-[11px] font-black uppercase tracking-[0.3em]">Initialize Session</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              <span className="text-[8px] font-black text-text-secondary uppercase tracking-[0.2em]">Node 01: Online</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyber-blue animate-pulse shadow-[0_0_8px_rgba(0,242,255,0.6)]" />
              <span className="text-[8px] font-black text-text-secondary uppercase tracking-[0.2em]">AES-256 Enabled</span>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <p className="mt-8 text-center text-[9px] font-bold text-text-secondary/40 uppercase tracking-[0.3em] leading-relaxed">
          Proprietary System &middot; &copy; 2026 CarKit Registry<br/>
          Unauthorized entry is prohibited by federal directive.
        </p>
      </div>
    </div>
  );
};

export default Login;
