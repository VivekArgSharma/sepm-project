import React from 'react';
import { Database, Shield, Code, GitBranch } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">SkillBridge</span>
            <span>• College Software Engineering & Project Management (SEPM)</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-600">
            <span className="flex items-center gap-1">
              <Code className="w-3.5 h-3.5 text-indigo-600" /> React 18 + Node Express
            </span>
            <span className="flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-blue-600" /> PostgreSQL
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-600" /> JWT + Role RBAC
            </span>
            <span className="flex items-center gap-1">
              <GitBranch className="w-3.5 h-3.5 text-violet-600" /> Phase 1 Setup
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
