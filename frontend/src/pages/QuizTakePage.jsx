import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { 
  Clock, Award, CheckCircle2, XCircle, AlertCircle, 
  ArrowRight, RefreshCw, Send, Check
} from 'lucide-react';

export default function QuizTakePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [secondsRemaining, setSecondsRemaining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [error, setError] = useState('');

  const timerRef = useRef(null);

  // Initialize or resume attempt
  const initQuizSession = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post(`/quizzes/${id}/start`);
      const session = res.data;
      setQuiz(session.quiz);
      setAttempt(session.attempt);

      // Compute remaining seconds based on start time & time limit
      const startTime = new Date(session.attempt.start_time).getTime();
      const timeLimitMs = session.quiz.time_limit_minutes * 60 * 1000;
      const elapsedMs = Date.now() - startTime;
      const remainingSec = Math.max(0, Math.floor((timeLimitMs - elapsedMs) / 1000));
      setSecondsRemaining(remainingSec);
    } catch (err) {
      setError(err.message || 'Failed to start quiz attempt');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initQuizSession();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [id]);

  // Timer countdown hook
  useEffect(() => {
    if (secondsRemaining === null || evaluation) return;

    if (secondsRemaining <= 0) {
      // Auto-submit on expiry!
      handleAutoExpireSubmit();
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoExpireSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [secondsRemaining, evaluation]);

  const handleSelectOption = (questionId, optionId) => {
    if (evaluation) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleAutoExpireSubmit = async () => {
    if (submitting || evaluation) return;
    await submitQuiz(true);
  };

  const submitQuiz = async (isAutoExpired = false) => {
    if (!attempt) return;
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const formattedAnswers = Object.entries(selectedAnswers).map(([qId, optId]) => ({
      question_id: Number(qId),
      selected_option_id: Number(optId),
    }));

    try {
      const res = await api.post(`/quizzes/${attempt.id}/submit`, {
        answers: formattedAnswers,
        isAutoExpired,
      });
      setEvaluation(res.data);
    } catch (err) {
      alert(err.message || 'Error submitting quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimer = (totalSeconds) => {
    if (totalSeconds === null || totalSeconds < 0) return '00:00';
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="p-20 text-center text-slate-400 flex flex-col items-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-sm">Preparing quiz assessment engine...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl border border-rose-200 p-8 text-center space-y-4">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
          !
        </div>
        <h2 className="text-lg font-bold text-slate-800">Quiz Unavailable</h2>
        <p className="text-xs text-slate-600">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
        >
          Return to Course
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Sticky Quiz Header with Countdown Timer */}
      <div className="sticky top-20 z-40 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
            Timed Assessment
          </span>
          <h1 className="text-base font-bold text-slate-900 truncate max-w-md">
            {quiz?.title}
          </h1>
        </div>

        {!evaluation && (
          <div className="flex items-center gap-2">
            <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-mono text-sm font-bold shadow-xs ${
              secondsRemaining <= 60
                ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                : 'bg-indigo-50 text-indigo-800 border-indigo-200'
            }`}>
              <Clock className="w-4 h-4" />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>

            <button
              onClick={() => submitQuiz(false)}
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Answers'}
            </button>
          </div>
        )}
      </div>

      {/* Auto-expired Notice */}
      {evaluation?.auto_expired && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>Timer reached zero. Your answers have been auto-submitted and evaluated.</span>
        </div>
      )}

      {/* Evaluation Results Banner (Shown after submission) */}
      {evaluation && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center space-y-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto text-2xl font-black ${
            evaluation.passed ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
          }`}>
            {evaluation.passed ? '✓' : '✗'}
          </div>

          <div className="space-y-1">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
              evaluation.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}>
              {evaluation.passed ? 'PASSED ASSESSMENT' : 'NEEDS IMPROVEMENT'}
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 pt-1">
              Score: {evaluation.total_score} / {evaluation.total_marks}
            </h2>
            <p className="text-xs text-slate-500">
              Passing requirement: {evaluation.passing_marks} marks
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigate(`/courses/${quiz.course_id}`)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow"
            >
              Back to Course
            </button>
          </div>
        </div>
      )}

      {/* Quiz Questions List */}
      <div className="space-y-4">
        {quiz?.questions?.map((q, idx) => {
          const evalItem = evaluation?.answer_breakdown?.find((item) => item.question_id === q.id);

          return (
            <div
              key={q.id}
              className={`bg-white rounded-2xl border p-6 shadow-sm space-y-4 transition ${
                evalItem
                  ? evalItem.is_correct
                    ? 'border-emerald-200 bg-emerald-50/10'
                    : 'border-rose-200 bg-rose-50/10'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-sm font-bold text-slate-900 leading-snug">
                    {q.question_text}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <span className="text-[11px] font-mono text-slate-500 font-semibold">
                    {q.marks} Marks
                  </span>
                  {evalItem && (
                    <span className={`block text-[10px] font-bold ${
                      evalItem.is_correct ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      Awarded: {evalItem.marks_awarded} pts
                    </span>
                  )}
                </div>
              </div>

              {/* Multiple Choice Options */}
              <div className="space-y-2 pl-9">
                {q.options?.map((opt) => {
                  const isSelected = selectedAnswers[q.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={Boolean(evaluation)}
                      onClick={() => handleSelectOption(q.id, opt.id)}
                      className={`w-full text-left p-3 rounded-xl border text-xs font-medium flex items-center justify-between transition ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>{opt.option_text}</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                      }`}>
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {!evaluation && (
        <div className="flex justify-end pt-4 pb-12">
          <button
            onClick={() => submitQuiz(false)}
            disabled={submitting}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-100 disabled:opacity-50 transition flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Submitting Assessment...' : 'Submit & Evaluate Quiz'}
          </button>
        </div>
      )}
    </div>
  );
}
