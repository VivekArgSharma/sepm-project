import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, BookOpen, Plus, Users, Layers, Award, 
  FileText, CheckCircle2, RefreshCw, ArrowRight 
} from 'lucide-react';

export default function InstructorDashboardPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Course Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [level, setLevel] = useState('Beginner');
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState('');

  const fetchTeachingCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/courses/my/teaching');
      setCourses(res.data || []);
    } catch (err) {
      console.error('Failed to load instructor courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachingCourses();
  }, []);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/courses', {
        title,
        description,
        category,
        level,
      });
      setMessage('Course created successfully!');
      setShowCreateModal(false);
      setTitle('');
      setDescription('');
      fetchTeachingCourses();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to create course');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-600" />
            Instructor Management Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your curriculum, review enrolled students, and publish assessments.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create New Course
        </button>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Teaching Courses Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          Courses You Teach ({courses.length})
        </h2>

        {loading ? (
          <div className="p-16 text-center text-slate-400 flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
            Loading teaching courses...
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
            <p className="text-sm font-semibold text-slate-700">No courses published under your instructor ID yet.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Create Your First Course
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                      {c.category}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {c.students_enrolled || 0} Students
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm leading-snug">{c.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{c.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to={`/courses/${c.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    Course View & Class Matrix
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Create New Course</h3>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Course Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Cloud Architecture with Docker & Kubernetes"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Category</label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Cloud Computing"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Difficulty Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Course Overview</label>
                <textarea
                  rows="3"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain curriculum objectives and prerequisites..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow disabled:opacity-50"
                >
                  {creating ? 'Publishing...' : 'Publish Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
