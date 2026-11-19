const AppError = require('../utils/AppError');
const dataStore = require('../config/dataStore');

const getCourseQuizzes = async (courseId, studentId = null) => {
  const quizzes = dataStore.getTable('quizzes').filter(
    (q) => Number(q.course_id) === Number(courseId)
  );

  const attempts = dataStore.getTable('quiz_attempts');

  return quizzes.map((quiz) => {
    let studentAttempts = [];
    if (studentId) {
      studentAttempts = attempts.filter(
        (a) => Number(a.quiz_id) === Number(quiz.id) && Number(a.student_id) === Number(studentId)
      );
    }

    const latestAttempt = studentAttempts.sort((a, b) => b.attempt_number - a.attempt_number)[0] || null;

    return {
      ...quiz,
      attempts_taken: studentAttempts.length,
      latest_attempt: latestAttempt,
      can_attempt: studentAttempts.length < (quiz.max_attempts || 1),
    };
  });
};

const getQuizById = async (quizId, role = 'STUDENT') => {
  const quizzes = dataStore.getTable('quizzes');
  const quiz = quizzes.find((q) => Number(q.id) === Number(quizId));
  if (!quiz) {
    throw new AppError('Quiz not found', 404);
  }

  const allQuestions = dataStore.getTable('questions');
  const allOptions = dataStore.getTable('options');

  const quizQuestions = allQuestions
    .filter((q) => Number(q.quiz_id) === Number(quizId))
    .sort((a, b) => a.order_index - b.order_index)
    .map((q) => {
      const questionOptions = allOptions
        .filter((opt) => Number(opt.question_id) === Number(q.id))
        .sort((a, b) => a.order_index - b.order_index)
        .map((opt) => {
          // Hide is_correct from students taking the quiz!
          if (role === 'STUDENT') {
            const { is_correct, ...safeOption } = opt;
            return safeOption;
          }
          return opt;
        });

      return {
        ...q,
        options: questionOptions,
      };
    });

  return {
    ...quiz,
    questions: quizQuestions,
  };
};

const createQuiz = async (quizData, userId, role) => {
  const {
    course_id,
    module_id = null,
    title,
    description = '',
    time_limit_minutes = 15,
    passing_marks = 5,
    max_attempts = 1,
    questions = [],
  } = quizData;

  if (!course_id || !title) {
    throw new AppError('Course ID and quiz title are required', 400);
  }

  // Calculate total marks from questions
  let calculatedTotal = 0;
  questions.forEach((q) => {
    calculatedTotal += Number(q.marks) || 1;
  });

  const newQuiz = dataStore.insert('quizzes', {
    course_id: Number(course_id),
    module_id: module_id ? Number(module_id) : null,
    title: title.trim(),
    description: description.trim(),
    time_limit_minutes: Number(time_limit_minutes) || 15,
    total_marks: calculatedTotal || 10,
    passing_marks: Number(passing_marks) || 5,
    max_attempts: Number(max_attempts) || 1,
  });

  // Insert Questions and Options
  questions.forEach((q, qIdx) => {
    const newQuestion = dataStore.insert('questions', {
      quiz_id: newQuiz.id,
      question_text: q.question_text.trim(),
      marks: Number(q.marks) || 1,
      order_index: qIdx + 1,
    });

    (q.options || []).forEach((opt, optIdx) => {
      dataStore.insert('options', {
        question_id: newQuestion.id,
        option_text: opt.option_text.trim(),
        is_correct: Boolean(opt.is_correct),
        order_index: optIdx + 1,
      });
    });
  });

  return newQuiz;
};

const startAttempt = async (quizId, studentId) => {
  const quiz = await getQuizById(quizId, 'STUDENT');

  const attempts = dataStore.getTable('quiz_attempts');
  const pastAttempts = attempts.filter(
    (a) => Number(a.quiz_id) === Number(quizId) && Number(a.student_id) === Number(studentId)
  );

  if (pastAttempts.length >= quiz.max_attempts) {
    throw new AppError(
      `Maximum attempt limit (${quiz.max_attempts}) reached for this quiz.`,
      400
    );
  }

  // Check if an existing attempt is currently IN_PROGRESS
  const inProgressAttempt = pastAttempts.find((a) => a.state === 'IN_PROGRESS');
  if (inProgressAttempt) {
    return {
      attempt: inProgressAttempt,
      quiz,
      resumed: true,
    };
  }

  const nextAttemptNum = pastAttempts.length + 1;
  const newAttempt = dataStore.insert('quiz_attempts', {
    quiz_id: Number(quizId),
    student_id: Number(studentId),
    attempt_number: nextAttemptNum,
    start_time: new Date().toISOString(),
    submit_time: null,
    score: 0.0,
    state: 'IN_PROGRESS',
  });

  return {
    attempt: newAttempt,
    quiz,
    resumed: false,
  };
};

const submitAttempt = async (attemptId, studentId, answers = [], isAutoExpired = false) => {
  const attempts = dataStore.getTable('quiz_attempts');
  const attempt = attempts.find((a) => Number(a.id) === Number(attemptId));

  if (!attempt) {
    throw new AppError('Attempt record not found', 404);
  }

  if (Number(attempt.student_id) !== Number(studentId)) {
    throw new AppError('Unauthorized: Attempt does not belong to you', 403);
  }

  if (attempt.state === 'EVALUATED' || attempt.state === 'SUBMITTED') {
    throw new AppError('This attempt has already been submitted and evaluated', 400);
  }

  const quizzes = dataStore.getTable('quizzes');
  const quiz = quizzes.find((q) => Number(q.id) === Number(attempt.quiz_id));
  const questions = dataStore.getTable('questions').filter((q) => Number(q.quiz_id) === Number(quiz.id));
  const options = dataStore.getTable('options');

  let totalScore = 0;
  const answerBreakdown = [];

  // Evaluate each answer
  questions.forEach((q) => {
    const studentAns = answers.find((ans) => Number(ans.question_id) === Number(q.id));
    const selectedOptionId = studentAns ? Number(studentAns.selected_option_id) : null;

    let isCorrect = false;
    let marksAwarded = 0;

    if (selectedOptionId) {
      const correctOption = options.find(
        (opt) => Number(opt.question_id) === Number(q.id) && opt.is_correct
      );
      if (correctOption && Number(correctOption.id) === Number(selectedOptionId)) {
        isCorrect = true;
        marksAwarded = Number(q.marks);
        totalScore += marksAwarded;
      }
    }

    // Save to attempt_answers
    const savedAns = dataStore.insert('attempt_answers', {
      attempt_id: attempt.id,
      question_id: q.id,
      selected_option_id: selectedOptionId,
      is_correct: isCorrect,
      marks_awarded: marksAwarded,
    });

    answerBreakdown.push({
      question_id: q.id,
      question_text: q.question_text,
      selected_option_id: selectedOptionId,
      is_correct: isCorrect,
      marks_awarded: marksAwarded,
      marks_possible: q.marks,
    });
  });

  // Update attempt state to EVALUATED
  const updatedAttempt = dataStore.update('quiz_attempts', attempt.id, {
    score: totalScore,
    submit_time: new Date().toISOString(),
    state: 'EVALUATED',
  });

  const passed = totalScore >= (quiz.passing_marks || 0);

  return {
    attempt: updatedAttempt,
    total_score: totalScore,
    passing_marks: quiz.passing_marks,
    total_marks: quiz.total_marks,
    passed,
    auto_expired: isAutoExpired,
    answer_breakdown: answerBreakdown,
  };
};

module.exports = {
  getCourseQuizzes,
  getQuizById,
  createQuiz,
  startAttempt,
  submitAttempt,
};
