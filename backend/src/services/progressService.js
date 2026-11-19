const AppError = require('../utils/AppError');
const dataStore = require('../config/dataStore');

const getStudentProgress = async (courseId, studentId) => {
  const courses = dataStore.getTable('courses');
  const course = courses.find((c) => Number(c.id) === Number(courseId));
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  // 1. Materials Completion %
  const modules = dataStore.getTable('modules').filter((m) => Number(m.course_id) === Number(courseId));
  const moduleIds = modules.map((m) => Number(m.id));
  const allMaterials = dataStore.getTable('materials').filter((mat) => moduleIds.includes(Number(mat.module_id)));
  const totalMaterials = allMaterials.length;

  const progressRecords = dataStore.getTable('material_progress').filter(
    (p) => Number(p.student_id) === Number(studentId) && Number(p.course_id) === Number(courseId) && p.completed
  );
  const completedMaterialsCount = progressRecords.length;
  const materialsPercent = totalMaterials > 0 ? Math.round((completedMaterialsCount / totalMaterials) * 100) : 0;

  // 2. Quiz Performance
  const quizzes = dataStore.getTable('quizzes').filter((q) => Number(q.course_id) === Number(courseId));
  const attempts = dataStore.getTable('quiz_attempts');

  const quizSummaries = quizzes.map((q) => {
    const studentAttempts = attempts.filter(
      (a) => Number(a.quiz_id) === Number(q.id) && Number(a.student_id) === Number(studentId) && a.state === 'EVALUATED'
    );
    const bestScore = studentAttempts.length > 0
      ? Math.max(...studentAttempts.map((a) => Number(a.score) || 0))
      : null;

    return {
      quiz_id: q.id,
      title: q.title,
      total_marks: q.total_marks,
      passing_marks: q.passing_marks,
      best_score: bestScore,
      passed: bestScore !== null ? bestScore >= q.passing_marks : false,
      attempted: studentAttempts.length > 0,
    };
  });

  const attemptedQuizzes = quizSummaries.filter((q) => q.attempted);
  const quizPercent = attemptedQuizzes.length > 0
    ? Math.round(
        (attemptedQuizzes.reduce((acc, q) => acc + (q.best_score / q.total_marks), 0) /
          attemptedQuizzes.length) * 100
      )
    : 0;

  // 3. Assignment Grades
  const assignments = dataStore.getTable('assignments').filter((a) => Number(a.course_id) === Number(courseId));
  const submissions = dataStore.getTable('submissions');

  const assignmentSummaries = assignments.map((a) => {
    const sub = submissions.find(
      (s) => Number(s.assignment_id) === Number(a.id) && Number(s.student_id) === Number(studentId)
    );

    return {
      assignment_id: a.id,
      title: a.title,
      total_marks: a.total_marks,
      state: sub ? sub.state : 'PENDING',
      grade: sub ? sub.grade : null,
      feedback: sub ? sub.feedback : null,
    };
  });

  const gradedAssignments = assignmentSummaries.filter((a) => a.grade !== null);
  const assignmentPercent = gradedAssignments.length > 0
    ? Math.round(
        (gradedAssignments.reduce((acc, a) => acc + (a.grade / a.total_marks), 0) /
          gradedAssignments.length) * 100
      )
    : 0;

  // 4. Overall Progress Bar Calculation
  // Weighted: 50% Material Completion, 25% Quizzes, 25% Assignments
  const overallProgress = Math.round(
    materialsPercent * 0.5 + (quizzes.length ? quizPercent * 0.25 : 25) + (assignments.length ? assignmentPercent * 0.25 : 25)
  );

  return {
    course: {
      id: course.id,
      title: course.title,
    },
    materials: {
      total: totalMaterials,
      completed: completedMaterialsCount,
      percentage: materialsPercent,
    },
    quizzes: {
      total: quizzes.length,
      summaries: quizSummaries,
      percentage: quizPercent,
    },
    assignments: {
      total: assignments.length,
      summaries: assignmentSummaries,
      percentage: assignmentPercent,
    },
    overall_progress_percent: Math.min(100, overallProgress),
  };
};

const getClassProgress = async (courseId, instructorId, role) => {
  const courses = dataStore.getTable('courses');
  const course = courses.find((c) => Number(c.id) === Number(courseId));
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  if (role !== 'ADMIN' && Number(course.instructor_id) !== Number(instructorId)) {
    throw new AppError('Unauthorized: You can only view class progress for your own courses', 403);
  }

  const enrollments = dataStore.getTable('enrollments').filter(
    (e) => Number(e.course_id) === Number(courseId) && e.status === 'ENROLLED'
  );

  const users = dataStore.getTable('users');

  const studentProgressList = await Promise.all(
    enrollments.map(async (e) => {
      const student = users.find((u) => Number(u.id) === Number(e.student_id));
      const progress = await getStudentProgress(courseId, e.student_id);

      return {
        student_id: e.student_id,
        student_name: student ? student.name : 'Unknown',
        student_email: student ? student.email : '',
        enrolled_at: e.enrolled_at,
        materials_completed: `${progress.materials.completed} / ${progress.materials.total}`,
        materials_percent: progress.materials.percentage,
        overall_progress_percent: progress.overall_progress_percent,
        quizzes: progress.quizzes.summaries,
        assignments: progress.assignments.summaries,
      };
    })
  );

  return {
    course: {
      id: course.id,
      title: course.title,
    },
    enrolled_count: enrollments.length,
    students: studentProgressList,
  };
};

module.exports = {
  getStudentProgress,
  getClassProgress,
};
