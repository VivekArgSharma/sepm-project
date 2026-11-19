import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  Search, BookOpen, Layers, Users, Filter, CheckCircle2, 
  ArrowRight, Sparkles, UserCheck, RefreshCw 
} from 'lucide-react';

export default function CoursesPage() {
  const { user, isAuthenticated } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [enrollingId, setEnrollingId] = useState(null);
  const [message, setMessage] = useState('');

  const categories = ['All', 'Web Development', 'Databases', 'Computer Science'];
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedLevel && selectedLevel !== 'All') params.level = selectedLevel;

      const res = await api.get('/courses', { params });
      setCourses(res.data || []);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [selectedCategory, selectedLevel]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCourses();
  };

  const handleEnroll = async (courseId) => {
    if (!isAuthenticated) {
      alert('Please log in as a student to register for this course.');
      return;
    }
    setEnrollingId(courseId);
    try {
      await api.post(`/courses/${courseId}/enroll`);
      setMessage('Successfully registered for the course!');
      fetchCourses();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert(err.message || 'Enrollment failed');
    } finally {
      setEnrollingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Explore Course Catalog</h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse skill-oriented courses, take interactive quizzes, and earn practical credentials.
          </p>
        </div>

        {isAuthenticated && (user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN') && (
          <Link
            to="/instructor"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 transition shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            Create New Course
          </Link>
        )}
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by course title or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-semibold mr-1">Category:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg transition ${
                  (selectedCategory === cat || (!selectedCategory && cat === 'All'))
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Level Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold">Level:</span>
            {levels.map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  (selectedLevel === lvl || (!selectedLevel && lvl === 'All'))
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Course Cards Grid */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm">Loading course catalog...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-2">
          <p className="font-semibold text-slate-800">No courses found</p>
          <p className="text-xs">Try adjusting your search keywords or filter options.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {course.category}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {course.level}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition leading-snug">
                  {course.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {course.description}
                </p>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                  <span className="font-medium text-slate-700">By {course.instructor_name}</span>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-slate-400" /> {course.modules_count || 0} Modules
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" /> {course.students_enrolled || 0} Enrolled
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                <Link
                  to={`/courses/${course.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-700 hover:bg-indigo-50 transition"
                >
                  View Details
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                {user?.role === 'STUDENT' && (
                  <button
                    onClick={() => handleEnroll(course.id)}
                    disabled={enrollingId === course.id}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition"
                  >
                    {enrollingId === course.id ? 'Registering...' : 'Register'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
