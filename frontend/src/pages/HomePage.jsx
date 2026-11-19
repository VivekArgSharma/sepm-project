import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Database, Server, Layout, CheckCircle, ArrowRight, ShieldCheck, 
  Layers, Users, BookOpen, Clock, FileCheck, Award
} from 'lucide-react';

export default function HomePage() {
  const schemaTables = [
    { name: 'users', role: 'Authentication & Roles', count: '1 Admin, 2 Instructors, 5 Students' },
    { name: 'courses', role: 'Course Catalog & Metadata', count: '3 Pre-seeded Courses' },
    { name: 'modules', role: 'Course Sections / Chapters', count: '6 Course Modules' },
    { name: 'materials', role: 'Lessons (PDF/Video/Links/Text)', count: '10 Learning Materials' },
    { name: 'material_progress', role: 'Per-Student Completion Tracking', count: 'Student Progress Records' },
    { name: 'quizzes', role: 'Timed Assessments & Passing Criteria', count: '3 Pre-seeded Quizzes' },
    { name: 'questions', role: 'MCQ Assessment Items', count: '9 Evaluation Questions' },
    { name: 'options', role: 'Answer Choices & Correct Key', count: '36 Question Options' },
    { name: 'quiz_attempts', role: 'Live Attempt State Machine', count: 'States: NOT_STARTED, IN_PROGRESS, SUBMITTED, EVALUATED' },
    { name: 'attempt_answers', role: 'Selected Choices & Auto-grading', count: 'Question-level Breakdown' },
    { name: 'assignments', role: 'Course Tasks & Deadlines', count: '3 Assignments' },
    { name: 'submissions', role: 'Student Submissions & Evaluation', count: 'States: PENDING, SUBMITTED, LATE, GRADED' },
    { name: 'enrollments', role: 'Student Registration Mapping', count: '7 Pre-seeded Enrollments' }
  ];

  const phases = [
    { num: 1, title: 'Project Setup & Database', status: 'Completed', current: true },
    { num: 2, title: 'Auth & Role-Based Access Control', status: 'Next Phase', current: false },
    { num: 3, title: 'Courses & Learning Materials', status: 'Pending', current: false },
    { num: 4, title: 'Quizzes & Countdown Engine', status: 'Pending', current: false },
    { num: 5, title: 'Assignments & Submissions', status: 'Pending', current: false },
    { num: 6, title: 'Student Progress & Admin Panel', status: 'Pending', current: false },
    { num: 7, title: 'Testing, Diagrams & Final Report', status: 'Pending', current: false },
  ];

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl overflow-hidden relative">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Phase 1 Completed: Project Scaffold & PostgreSQL Schema
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            SkillBridge Learning Management System
          </h1>
          <p className="text-indigo-100/90 text-base sm:text-lg leading-relaxed">
            Full-stack online skill-based learning and course management platform built with React, Vite, Tailwind CSS, 
            Node.js/Express layered architecture, and PostgreSQL relational database.
          </p>
          <div className="pt-2 flex flex-wrap gap-4">
            <Link
              to="/status"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-indigo-950 font-semibold shadow hover:bg-indigo-50 transition"
            >
              <Database className="w-4 h-4 text-indigo-600" />
              Check System & DB Health
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#schema"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-700/60 hover:bg-indigo-700 text-white font-medium border border-indigo-500/40 transition"
            >
              <Layers className="w-4 h-4" />
              View 13 Database Tables
            </a>
          </div>
        </div>
      </section>

      {/* Tech Stack Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Layout className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Modern Frontend</h3>
          <p className="text-sm text-slate-600">
            Vite + React 18 with Tailwind CSS, React Router v6, Axios interceptors, responsive accessible UI.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Server className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Layered REST API</h3>
          <p className="text-sm text-slate-600">
            Node.js & Express with strict separation of routes, controllers, services, middlewares, and centralized error handling.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">PostgreSQL Relational DB</h3>
          <p className="text-sm text-slate-600">
            13 normalized tables (3NF/BCNF compliant), foreign keys with cascade rules, custom check constraints, and performance indexes.
          </p>
        </div>
      </section>

      {/* Database Schema Overview */}
      <section id="schema" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Database Schema & Demo Dataset (Phase 1)</h2>
            <p className="text-sm text-slate-500">
              Normalized tables defined in <code className="text-xs bg-slate-100 px-1 py-0.5 rounded text-indigo-700">backend/database/schema.sql</code> and populated by <code className="text-xs bg-slate-100 px-1 py-0.5 rounded text-indigo-700">backend/database/seed.sql</code>.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold">
            <CheckCircle className="w-4 h-4 text-indigo-600" />
            13 Normalized Tables
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schemaTables.map((t) => (
            <div key={t.name} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-indigo-50/30 hover:border-indigo-200 transition">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-sm font-bold text-indigo-900">{t.name}</span>
                <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                  Table
                </span>
              </div>
              <p className="text-xs font-medium text-slate-700">{t.role}</p>
              <p className="text-[11px] text-slate-500 mt-1">{t.count}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Project Implementation Roadmap */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Development Phases (PRD Controlled)</h2>
            <p className="text-sm text-slate-500">Execution following the specified 7-phase delivery method.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {phases.map((p) => (
            <div
              key={p.num}
              className={`p-4 rounded-xl border transition ${
                p.current
                  ? 'border-emerald-300 bg-emerald-50/50 shadow-sm'
                  : 'border-slate-200 bg-slate-50/50 text-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${p.current ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  Phase {p.num}
                </span>
                <span className={`text-xs font-semibold ${p.current ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {p.status}
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-800">{p.title}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
