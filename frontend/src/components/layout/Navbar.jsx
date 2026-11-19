import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, Activity, BookOpen, Layers, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const navLinks = [
    { label: 'Overview', to: '/', icon: BookOpen },
    { label: 'Table Explorer', to: '/tables', icon: Layers },
    { label: 'System & DB Health', to: '/status', icon: Activity },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 group-hover:bg-indigo-700 transition">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-violet-700 bg-clip-text text-transparent">
                SkillBridge
              </span>
              <span className="text-xs text-slate-500 block leading-tight font-medium">LMS Platform</span>
            </div>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-4">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="pl-2 border-l border-slate-200 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Phase 1 Active
              </span>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
