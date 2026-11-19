import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  GraduationCap, BookOpen, Layers, Activity, User, 
  LogOut, Shield, ChevronDown, Check, Sparkles, BookMarked
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout, switchDemoUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  const demoAccounts = [
    { label: 'Admin (System)', email: 'admin@skillbridge.edu', role: 'ADMIN', color: 'text-purple-600' },
    { label: 'Dr. Smith (Instructor)', email: 'dr.smith@skillbridge.edu', role: 'INSTRUCTOR', color: 'text-blue-600' },
    { label: 'Alice (Student)', email: 'alice@student.edu', role: 'STUDENT', color: 'text-emerald-600' },
  ];

  const handleDemoSwitch = async (email) => {
    try {
      await switchDemoUser(email);
      setDemoMenuOpen(false);
      navigate('/');
    } catch (err) {
      console.error('Demo switch error:', err);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100 group-hover:bg-indigo-700 transition">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold bg-gradient-to-r from-indigo-700 to-violet-700 bg-clip-text text-transparent">
                SkillBridge
              </span>
              <span className="text-[10px] text-slate-500 block leading-tight font-semibold uppercase tracking-wider">
                LMS Platform
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-3">
            <Link
              to="/courses"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition ${
                location.pathname === '/courses'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Courses</span>
            </Link>

            {isAuthenticated && user?.role === 'STUDENT' && (
              <Link
                to="/student"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition ${
                  location.pathname === '/student'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BookMarked className="w-4 h-4" />
                <span>My Dashboard</span>
              </Link>
            )}

            {isAuthenticated && (user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN') && (
              <Link
                to="/instructor"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition ${
                  location.pathname === '/instructor'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Teaching</span>
              </Link>
            )}

            {isAuthenticated && user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition ${
                  location.pathname === '/admin'
                    ? 'bg-purple-50 text-purple-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Shield className="w-4 h-4 text-purple-600" />
                <span>Admin Panel</span>
              </Link>
            )}

            <Link
              to="/tables"
              className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition ${
                location.pathname === '/tables'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Tables</span>
            </Link>

            {/* Quick Demo Switcher Dropdown (Viva essential!) */}
            <div className="relative">
              <button
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition"
                title="Switch demo persona for testing"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Demo Persona</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {demoMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Quick Role Switch (Viva Demo)
                  </div>
                  {demoAccounts.map((acc) => {
                    const isCurrent = user?.email === acc.email;
                    return (
                      <button
                        key={acc.email}
                        onClick={() => handleDemoSwitch(acc.email)}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                          isCurrent ? 'bg-indigo-50/50 font-bold' : ''
                        }`}
                      >
                        <div>
                          <div className={`font-semibold ${acc.color}`}>{acc.label}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{acc.email}</div>
                        </div>
                        {isCurrent && <Check className="w-4 h-4 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* User Profile or Login */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="hidden sm:block text-right">
                  <span className="block text-xs font-bold text-slate-800 leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
