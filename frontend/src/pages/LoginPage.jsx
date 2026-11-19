import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Shield, GraduationCap, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to login with provided credentials');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <div className="max-w-md mx-auto my-6 space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <LogIn className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Sign in to SkillBridge</h1>
          <p className="text-xs text-slate-500">Access your courses, quizzes, assignments, and grades.</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@college.edu"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-100 disabled:opacity-50 transition"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
            Register as a Student or Instructor
          </Link>
        </div>
      </div>

      {/* One-Click Quick Login for Viva Evaluator */}
      <div className="bg-slate-100/70 rounded-2xl border border-slate-200 p-4 space-y-3">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
          One-Click Demo Credentials (Viva Quick Fill)
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => fillDemo('admin@skillbridge.edu')}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:border-purple-300 text-center transition group shadow-2xs"
          >
            <div className="text-[11px] font-bold text-purple-700">Admin</div>
            <div className="text-[9px] text-slate-400">admin@...</div>
          </button>
          <button
            type="button"
            onClick={() => fillDemo('dr.smith@skillbridge.edu')}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:border-blue-300 text-center transition group shadow-2xs"
          >
            <div className="text-[11px] font-bold text-blue-700">Instructor</div>
            <div className="text-[9px] text-slate-400">dr.smith@...</div>
          </button>
          <button
            type="button"
            onClick={() => fillDemo('alice@student.edu')}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 text-center transition group shadow-2xs"
          >
            <div className="text-[11px] font-bold text-emerald-700">Student</div>
            <div className="text-[9px] text-slate-400">alice@...</div>
          </button>
        </div>
      </div>
    </div>
  );
}
