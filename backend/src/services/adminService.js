const AppError = require('../utils/AppError');
const dataStore = require('../config/dataStore');

const getAllUsers = async () => {
  const users = dataStore.getTable('users');
  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    bio: u.bio,
    created_at: u.created_at,
  }));
};

const updateUserStatus = async (userId, targetStatus) => {
  const validStatuses = ['ACTIVE', 'PENDING', 'DEACTIVATED'];
  if (!validStatuses.includes(targetStatus)) {
    throw new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
  }

  const users = dataStore.getTable('users');
  const user = users.find((u) => Number(u.id) === Number(userId));
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.role === 'ADMIN') {
    throw new AppError('Cannot modify status of system administrator', 403);
  }

  const updated = dataStore.update('users', userId, { status: targetStatus });
  return {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    role: updated.role,
    status: updated.status,
  };
};

const getSystemReports = async () => {
  const users = dataStore.getTable('users');
  const courses = dataStore.getTable('courses');
  const enrollments = dataStore.getTable('enrollments');
  const quizzes = dataStore.getTable('quizzes');
  const assignments = dataStore.getTable('assignments');
  const submissions = dataStore.getTable('submissions');

  return {
    users_count: {
      total: users.length,
      students: users.filter((u) => u.role === 'STUDENT').length,
      instructors: users.filter((u) => u.role === 'INSTRUCTOR').length,
      admins: users.filter((u) => u.role === 'ADMIN').length,
      active: users.filter((u) => u.status === 'ACTIVE').length,
      pending: users.filter((u) => u.status === 'PENDING').length,
      deactivated: users.filter((u) => u.status === 'DEACTIVATED').length,
    },
    courses_count: {
      total: courses.length,
      published: courses.filter((c) => c.status === 'PUBLISHED').length,
      drafts: courses.filter((c) => c.status === 'DRAFT').length,
    },
    academic_metrics: {
      total_enrollments: enrollments.filter((e) => e.status === 'ENROLLED').length,
      total_quizzes: quizzes.length,
      total_assignments: assignments.length,
      total_submissions: submissions.length,
      graded_submissions: submissions.filter((s) => s.state === 'GRADED').length,
    },
  };
};

module.exports = {
  getAllUsers,
  updateUserStatus,
  getSystemReports,
};
