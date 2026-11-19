import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, Layers, CheckCircle2, Circle, Clock, Award, 
  FileText, ExternalLink, Video, Link2, FileCheck, Send, 
  BarChart3, Users, AlertCircle, RefreshCw, ChevronRight, PlayCircle, Plus
} from 'lucide-react';

export default function CourseDetailPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [progress, setProgress] = useState(null);
  const [classProgress, setClassProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lessons'); // 'lessons' | 'quizzes' | 'assignments' | 'progress' | 'class'

  // Modals
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDesc, setModuleDesc] = useState('');
  const [moduleLoading, setModuleLoading] = useState(false);

  const [activeModuleForLesson, setActiveModuleForLesson] = useState(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDesc, setLessonDesc] = useState('');
  const [lessonType, setLessonType] = useState('VIDEO');
  const [lessonUrl, setLessonUrl] = useState('');
  const [lessonLoading, setLessonLoading] = useState(false);

  // Assignment submission modal state
  const [submittingAssignment, setSubmittingAssignment] = useState(null);
  const [subType, setSubType] = useState('LINK');
  const [subContent, setSubContent] = useState('');
  const [subLoading, setSubLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchCourseData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/courses/${id}`);
      setCourse(res.data);

      if (isAuthenticated) {
        const [qRes, aRes] = await Promise.all([
          api.get(`/quizzes/course/${id}`).catch(() => ({ data: [] })),
          api.get(`/assignments/course/${id}`).catch(() => ({ data: [] })),
        ]);
        setQuizzes(qRes.data || []);
        setAssignments(aRes.data || []);

        if (user.role === 'STUDENT') {
          const pRes = await api.get(`/progress/courses/${id}/student`).catch(() => ({ data: null }));
          setProgress(pRes.data);
        }

        if (user.role === 'INSTRUCTOR' || user.role === 'ADMIN') {
          const cpRes = await api.get(`/progress/courses/${id}/class`).catch(() => ({ data: null }));
          setClassProgress(cpRes.data);
        }
      }
    } catch (err) {
      console.error('Failed to load course details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [id, isAuthenticated, user?.role]);

  const handleEnrollToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      if (course?.is_enrolled) {
        await api.delete(`/courses/${id}/unenroll`);
        setMessage('Unregistered from course');
      } else {
        await api.post(`/courses/${id}/enroll`);
        setMessage('Successfully enrolled in course!');
      }
      fetchCourseData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert(err.message || 'Operation failed');
    }
  };

  const handleToggleLessonComplete = async (materialId) => {
    if (!isAuthenticated || user?.role !== 'STUDENT') return;
    try {
      await api.post(`/materials/${materialId}/toggle-complete`);
      fetchCourseData();
    } catch (err) {
      console.error('Error toggling completion:', err);
    }
  };

  const handleAddModule = async (e) => {
    e.preventDefault();
    if (!moduleTitle.trim()) return;
    setModuleLoading(true);
    try {
      await api.post('/materials/modules', {
        course_id: id,
        title: moduleTitle,
        description: moduleDesc,
        order_index: (course.modules?.length || 0) + 1,
      });
      setMessage('New module added successfully!');
      setShowAddModuleModal(false);
      setModuleTitle('');
      setModuleDesc('');
      fetchCourseData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to add module');
    } finally {
      setModuleLoading(false);
    }
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    if (!lessonTitle.trim() || !lessonUrl.trim()) return;
    setLessonLoading(true);
    try {
      await api.post('/materials', {
        module_id: activeModuleForLesson.id,
        title: lessonTitle,
        description: lessonDesc,
        content_type: lessonType,
        url_or_path: lessonUrl,
        order_index: (activeModuleForLesson.materials?.length || 0) + 1,
      });
      setMessage('New lesson added to module!');
      setActiveModuleForLesson(null);
      setLessonTitle('');
      setLessonDesc('');
      setLessonUrl('');
      fetchCourseData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to add lesson');
    } finally {
      setLessonLoading(false);
    }
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    if (!subContent.trim()) return;
    setSubLoading(true);
    try {
      await api.post(`/assignments/${submittingAssignment.id}/submit`, {
        submission_type: subType,
        content: subContent,
      });
      setMessage('Assignment submitted successfully!');
      setSubmittingAssignment(null);
      setSubContent('');
      fetchCourseData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert(err.message || 'Submission failed');
    } finally {
      setSubLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-20 text-center text-slate-400 flex flex-col items-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-sm">Loading course details...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-12 text-center text-slate-500">
        <p className="text-lg font-bold">Course not found</p>
        <Link to="/courses" className="text-indigo-600 text-sm mt-2 inline-block">
          Return to course catalog
        </Link>
      </div>
    );
  }

  const isInstructor = user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN';

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Course Hero Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                {course.category}
              </span>
              <span className="text-xs font-semibold text-slate-500">{course.level}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              {course.title}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">{course.description}</p>
            <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
              <span>Instructor: <strong className="text-slate-800">{course.instructor_name}</strong></span>
              <span>•</span>
              <span>{course.modules?.length || 0} Modules</span>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
            {user?.role === 'STUDENT' && (
              <button
                onClick={handleEnrollToggle}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm ${
                  course.is_enrolled
                    ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
                }`}
              >
                {course.is_enrolled ? 'Drop Course' : 'Register for Course'}
              </button>
            )}

            {isInstructor && (
              <button
                onClick={() => setShowAddModuleModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                Add Module
              </button>
            )}

            {progress && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 w-48 text-right space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-500">My Progress:</span>
                  <span className="text-indigo-600">{progress.overall_progress_percent}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress.overall_progress_percent}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {message && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
          <button
            onClick={() => setActiveTab('lessons')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'lessons'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Modules & Lessons ({course.modules?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('quizzes')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'quizzes'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            Quizzes ({quizzes.length})
          </button>

          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'assignments'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            Assignments ({assignments.length})
          </button>

          {user?.role === 'STUDENT' && progress && (
            <button
              onClick={() => setActiveTab('progress')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'progress'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              My Progress
            </button>
          )}

          {isInstructor && classProgress && (
            <button
              onClick={() => setActiveTab('class')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'class'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              Class Analytics ({classProgress.enrolled_count} Students)
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: Lessons & Modules */}
      {activeTab === 'lessons' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Curriculum Outline</h2>
            {isInstructor && (
              <button
                onClick={() => setShowAddModuleModal(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Module
              </button>
            )}
          </div>

          {(!course.modules || course.modules.length === 0) ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-500 text-xs">
              No modules published yet for this course.
            </div>
          ) : (
            course.modules.map((mod, idx) => (
              <div key={mod.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                      Module {idx + 1}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{mod.title}</h3>
                    {mod.description && <p className="text-xs text-slate-500">{mod.description}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-medium">
                      {mod.materials?.length || 0} Lessons
                    </span>
                    {isInstructor && (
                      <button
                        onClick={() => setActiveModuleForLesson(mod)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition"
                      >
                        <Plus className="w-3 h-3 text-indigo-600" />
                        Add Lesson
                      </button>
                    )}
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {mod.materials?.map((mat) => (
                    <div
                      key={mat.id}
                      className="p-4 flex items-center justify-between gap-4 hover:bg-indigo-50/20 transition"
                    >
                      <div className="flex items-center gap-3">
                        {user?.role === 'STUDENT' ? (
                          <button
                            onClick={() => handleToggleLessonComplete(mat.id)}
                            className="text-slate-400 hover:text-indigo-600 transition"
                            title={mat.completed ? 'Mark incomplete' : 'Mark completed'}
                          >
                            {mat.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <Circle className="w-5 h-5" />
                            )}
                          </button>
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            {mat.content_type === 'VIDEO' ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-800">{mat.title}</h4>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                              {mat.content_type}
                            </span>
                          </div>
                          {mat.description && <p className="text-[11px] text-slate-500">{mat.description}</p>}
                        </div>
                      </div>

                      <a
                        href={mat.url_or_path}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-200 text-indigo-700 text-xs font-semibold transition shrink-0"
                      >
                        <span>Access Lesson</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: Quizzes */}
      {activeTab === 'quizzes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.length === 0 ? (
            <div className="col-span-2 bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-500 text-xs">
              No quizzes published yet.
            </div>
          ) : (
            quizzes.map((q) => (
              <div key={q.id} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700">
                      Timed MCQ Quiz
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {q.time_limit_minutes} mins
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base">{q.title}</h3>
                  <p className="text-xs text-slate-600">{q.description}</p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span>Total Marks: <strong>{q.total_marks}</strong></span>
                    <span>Pass: <strong>{q.passing_marks}</strong></span>
                    <span>Attempts: <strong>{q.attempts_taken} / {q.max_attempts}</strong></span>
                  </div>

                  {q.latest_attempt && (
                    <div className="p-2.5 bg-slate-50 rounded-xl text-xs flex items-center justify-between">
                      <span className="text-slate-500">Last Score:</span>
                      <span className="font-bold text-emerald-600">
                        {q.latest_attempt.score} / {q.total_marks} ({q.latest_attempt.state})
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  {user?.role === 'STUDENT' ? (
                    <Link
                      to={`/quiz/${q.id}`}
                      className={`w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition ${
                        q.can_attempt
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed pointer-events-none'
                      }`}
                    >
                      <PlayCircle className="w-4 h-4" />
                      {q.can_attempt ? 'Start Quiz Attempt' : 'Max Attempts Reached'}
                    </Link>
                  ) : (
                    <Link
                      to={`/quiz/${q.id}`}
                      className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1"
                    >
                      Preview Quiz Questions
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: Assignments */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          {assignments.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-500 text-xs">
              No assignments posted yet.
            </div>
          ) : (
            assignments.map((a) => (
              <div key={a.id} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{a.title}</h3>
                    <p className="text-xs text-slate-500">
                      Due: {new Date(a.deadline).toLocaleDateString()} at {new Date(a.deadline).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {a.total_marks} Marks
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      a.submission?.state === 'GRADED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : a.submission?.state === 'LATE'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : a.submission?.state === 'SUBMITTED'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {a.submission?.state || (a.is_past_deadline ? 'DEADLINE PASSED' : 'NOT SUBMITTED')}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">{a.description}</p>

                {a.submission && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                    <div className="flex justify-between items-center font-semibold">
                      <span className="text-slate-700">Your Submission ({a.submission.submission_type}):</span>
                      <span className="text-[11px] text-slate-400">
                        Submitted: {new Date(a.submission.submitted_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-800 font-mono text-[11px] bg-white p-2 rounded border border-slate-200 truncate">
                      {a.submission.content}
                    </p>
                    {a.submission.grade !== null && (
                      <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-700">Grade Awarded:</span>
                        <span className="font-bold text-emerald-700 text-sm">
                          {a.submission.grade} / {a.total_marks}
                        </span>
                      </div>
                    )}
                    {a.submission.feedback && (
                      <div className="text-[11px] text-slate-600 italic">
                        Feedback: "{a.submission.feedback}"
                      </div>
                    )}
                  </div>
                )}

                {user?.role === 'STUDENT' && (!a.submission || a.submission.state !== 'GRADED') && (
                  <button
                    onClick={() => setSubmittingAssignment(a)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {a.submission ? 'Update Submission' : 'Submit Solution'}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: Student Progress Detail */}
      {activeTab === 'progress' && progress && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Your Academic Progress Record</h2>
              <p className="text-xs text-slate-500">Real-time completion tracking across lessons, quizzes, and tasks.</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-indigo-600">{progress.overall_progress_percent}%</span>
              <span className="block text-[10px] text-slate-400 uppercase font-semibold">Overall Course Progress</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="text-xs text-slate-500 font-bold uppercase">Learning Materials</div>
              <div className="text-xl font-bold text-slate-800">{progress.materials.percentage}%</div>
              <div className="text-xs text-slate-600">
                {progress.materials.completed} of {progress.materials.total} lessons completed
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="text-xs text-slate-500 font-bold uppercase">Quizzes Average</div>
              <div className="text-xl font-bold text-slate-800">{progress.quizzes.percentage}%</div>
              <div className="text-xs text-slate-600">{progress.quizzes.total} total assessments</div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="text-xs text-slate-500 font-bold uppercase">Assignments Performance</div>
              <div className="text-xl font-bold text-slate-800">{progress.assignments.percentage}%</div>
              <div className="text-xs text-slate-600">{progress.assignments.total} practical projects</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Class Analytics (Instructor View) */}
      {activeTab === 'class' && classProgress && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Class Grade & Progress Matrix</h2>
              <p className="text-xs text-slate-500">Comprehensive overview of enrolled student completions and submissions.</p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-purple-50 text-purple-700 font-bold text-xs">
              {classProgress.enrolled_count} Students Enrolled
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Lessons Done</th>
                  <th className="px-4 py-3">Overall Progress</th>
                  <th className="px-4 py-3">Quizzes</th>
                  <th className="px-4 py-3">Assignments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classProgress.students.map((st) => (
                  <tr key={st.student_id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800">{st.student_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{st.student_email}</div>
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-slate-700">
                      {st.materials_completed} ({st.materials_percent}%)
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full"
                            style={{ width: `${st.overall_progress_percent}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-indigo-700">{st.overall_progress_percent}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        {st.quizzes?.map((q, qIdx) => (
                          <div key={qIdx} className="text-[11px] text-slate-600">
                            {q.title}: <strong>{q.best_score !== null ? `${q.best_score} pts` : 'Not taken'}</strong>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        {st.assignments?.map((a, aIdx) => (
                          <div key={aIdx} className="text-[11px] text-slate-600">
                            {a.title}: <strong>{a.grade !== null ? `${a.grade} pts` : a.state}</strong>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Module Modal (Instructor / Admin only) */}
      {showAddModuleModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Add New Module</h3>
            <form onSubmit={handleAddModule} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Module Title</label>
                <input
                  type="text"
                  required
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  placeholder="e.g. Module 3: Advanced State & Custom Hooks"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Module Description</label>
                <textarea
                  rows="3"
                  value={moduleDesc}
                  onChange={(e) => setModuleDesc(e.target.value)}
                  placeholder="What will students learn in this module?"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModuleModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={moduleLoading}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow disabled:opacity-50"
                >
                  {moduleLoading ? 'Adding...' : 'Create Module'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Lesson Modal (Instructor / Admin only) */}
      {activeModuleForLesson && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">
              Add Lesson to: {activeModuleForLesson.title}
            </h3>
            <form onSubmit={handleAddLesson} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Lesson Title</label>
                <input
                  type="text"
                  required
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="e.g. Understanding useCallback and useMemo"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Content Type</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {['VIDEO', 'PDF', 'LINK', 'TEXT'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setLessonType(t)}
                      className={`py-1.5 rounded-lg text-[11px] font-semibold border transition ${
                        lessonType === t
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  {lessonType === 'TEXT' ? 'Lesson Notes / Content' : 'Resource URL (YouTube, PDF, Doc link)'}
                </label>
                {lessonType === 'TEXT' ? (
                  <textarea
                    rows="3"
                    required
                    value={lessonUrl}
                    onChange={(e) => setLessonUrl(e.target.value)}
                    placeholder="Enter learning notes..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  ></textarea>
                ) : (
                  <input
                    type="url"
                    required
                    value={lessonUrl}
                    onChange={(e) => setLessonUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Short Description (Optional)</label>
                <input
                  type="text"
                  value={lessonDesc}
                  onChange={(e) => setLessonDesc(e.target.value)}
                  placeholder="Brief summary..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModuleForLesson(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={lessonLoading}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow disabled:opacity-50"
                >
                  {lessonLoading ? 'Saving...' : 'Add Lesson'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assignment Submission Modal */}
      {submittingAssignment && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">
              Submit Solution: {submittingAssignment.title}
            </h3>
            <p className="text-xs text-slate-500">
              Submit your project repository link, cloud drive URL, or direct text answer.
            </p>

            <form onSubmit={handleAssignmentSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Submission Type</label>
                <div className="flex gap-2">
                  {['LINK', 'TEXT'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSubType(t)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition ${
                        subType === t
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {t === 'LINK' ? 'Repository / URL Link' : 'Direct Text Answer'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  {subType === 'LINK' ? 'Project Link (GitHub, Drive, Demo)' : 'Text Answer'}
                </label>
                {subType === 'LINK' ? (
                  <input
                    type="url"
                    required
                    value={subContent}
                    onChange={(e) => setSubContent(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <textarea
                    rows="5"
                    required
                    value={subContent}
                    onChange={(e) => setSubContent(e.target.value)}
                    placeholder="Type or paste your answer solution..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  ></textarea>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSubmittingAssignment(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={subLoading}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm disabled:opacity-50"
                >
                  {subLoading ? 'Submitting...' : 'Confirm Submission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
