const AppError = require('../utils/AppError');
const dataStore = require('../config/dataStore');

const getCourseAssignments = async (courseId, studentId = null) => {
  const assignments = dataStore.getTable('assignments').filter(
    (a) => Number(a.course_id) === Number(courseId)
  );

  const submissions = dataStore.getTable('submissions');

  return assignments.map((assignment) => {
    let studentSubmission = null;
    if (studentId) {
      studentSubmission = submissions.find(
        (s) =>
          Number(s.assignment_id) === Number(assignment.id) &&
          Number(s.student_id) === Number(studentId)
      ) || null;
    }

    const isPastDeadline = new Date(assignment.deadline) < new Date();

    return {
      ...assignment,
      is_past_deadline: isPastDeadline,
      submission: studentSubmission,
      submission_state: studentSubmission ? studentSubmission.state : (isPastDeadline ? 'PENDING' : 'PENDING'),
    };
  });
};

const getAssignmentById = async (assignmentId) => {
  const assignments = dataStore.getTable('assignments');
  const assignment = assignments.find((a) => Number(a.id) === Number(assignmentId));
  if (!assignment) {
    throw new AppError('Assignment not found', 404);
  }
  return assignment;
};

const createAssignment = async ({ course_id, module_id = null, title, description, deadline, total_marks = 100 }, userId, role) => {
  if (!course_id || !title || !description || !deadline) {
    throw new AppError('Course, title, description, and deadline are required', 400);
  }

  const courses = dataStore.getTable('courses');
  const course = courses.find((c) => Number(c.id) === Number(course_id));
  if (role !== 'ADMIN' && Number(course.instructor_id) !== Number(userId)) {
    throw new AppError('Unauthorized: You can only create assignments for your own courses', 403);
  }

  const newAssignment = dataStore.insert('assignments', {
    course_id: Number(course_id),
    module_id: module_id ? Number(module_id) : null,
    title: title.trim(),
    description: description.trim(),
    deadline: new Date(deadline).toISOString(),
    total_marks: Number(total_marks) || 100,
  });

  return newAssignment;
};

const submitAssignment = async ({ assignment_id, student_id, submission_type = 'TEXT', content }) => {
  if (!content || !content.trim()) {
    throw new AppError('Submission content cannot be empty', 400);
  }

  const assignments = dataStore.getTable('assignments');
  const assignment = assignments.find((a) => Number(a.id) === Number(assignment_id));
  if (!assignment) {
    throw new AppError('Assignment not found', 404);
  }

  const now = new Date();
  const deadlineDate = new Date(assignment.deadline);
  const isLate = now > deadlineDate;
  const targetState = isLate ? 'LATE' : 'SUBMITTED';

  const submissions = dataStore.getTable('submissions');
  const existing = submissions.find(
    (s) => Number(s.assignment_id) === Number(assignment_id) && Number(s.student_id) === Number(student_id)
  );

  if (existing) {
    if (existing.state === 'GRADED') {
      throw new AppError('This assignment has already been graded and cannot be re-submitted', 400);
    }
    const updated = dataStore.update('submissions', existing.id, {
      submission_type,
      content: content.trim(),
      submitted_at: now.toISOString(),
      state: targetState,
    });
    return updated;
  }

  const created = dataStore.insert('submissions', {
    assignment_id: Number(assignment_id),
    student_id: Number(student_id),
    submission_type,
    content: content.trim(),
    submitted_at: now.toISOString(),
    state: targetState,
    grade: null,
    feedback: null,
    graded_by: null,
    graded_at: null,
  });

  return created;
};

const gradeSubmission = async (submissionId, instructorId, { grade, feedback }) => {
  if (grade === undefined || grade === null) {
    throw new AppError('A numerical grade is required', 400);
  }

  const submissions = dataStore.getTable('submissions');
  const submission = submissions.find((s) => Number(s.id) === Number(submissionId));
  if (!submission) {
    throw new AppError('Submission record not found', 404);
  }

  const updated = dataStore.update('submissions', submission.id, {
    grade: Number(grade),
    feedback: (feedback || '').trim(),
    state: 'GRADED',
    graded_by: Number(instructorId),
    graded_at: new Date().toISOString(),
  });

  return updated;
};

const getSubmissionsForAssignment = async (assignmentId) => {
  const submissions = dataStore.getTable('submissions').filter(
    (s) => Number(s.assignment_id) === Number(assignmentId)
  );

  const users = dataStore.getTable('users');

  return submissions.map((sub) => {
    const student = users.find((u) => Number(u.id) === Number(sub.student_id));
    return {
      ...sub,
      student_name: student ? student.name : 'Unknown Student',
      student_email: student ? student.email : '',
    };
  });
};

module.exports = {
  getCourseAssignments,
  getAssignmentById,
  createAssignment,
  submitAssignment,
  gradeSubmission,
  getSubmissionsForAssignment,
};
