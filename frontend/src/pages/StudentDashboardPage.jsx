import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  BookMarked, BookOpen, Clock, Award, CheckCircle2, 
  ArrowRight, RefreshCw, Layers 
} from 'lucide-react';

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEnrolledCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/courses/my/enrolled');
      setEnrolledCourses(res.data || []);
    } catch (err) {
      console.error('Failed to fetch enrolled courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
            <BookMarked className="w-3.5 h-3.5 text-indigo-400" />
            Student Learning Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Welcome back, {user?.name}!</h1>
          <p className="text-xs sm:text-sm text-indigo-100/80">
            Track your registered courses, take scheduled quizzes, and view submitted assignment grades.
          </p>
        </div>

        <Link
          to="/courses"
          className="px-5 py-2.5 rounded-xl bg-white text-indigo-950 font-semibold text-xs hover:bg-indigo-50 transition shrink-0 shadow"
        >
          Browse More Courses
        </Link>
      </div>

      {/* Enrolled Courses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            My Enrolled Courses ({enrolledCourses.length})
          </h2>
          <button
            onClick={fetchEnrolledCourses}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-400 flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
            Loading registered courses...
          </div>
        ) : enrolledCourses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
            <p className="text-sm font-semibold text-slate-700">You are not enrolled in any courses yet.</p>
            <Link
              to="/courses"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Explore Course Catalog
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                      ENROLLED
                    </span>
                    <span className="text-xs text-slate-400">{c.level}</span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition">
                    {c.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2">{c.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">By {c.instructor_name}</span>
                  <Link
                    to={`/courses/${c.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition"
                  >
                    Enter Course
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
