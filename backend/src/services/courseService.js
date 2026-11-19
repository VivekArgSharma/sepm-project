const AppError = require('../utils/AppError');
const dataStore = require('../config/dataStore');

const getAllCourses = async ({ search = '', category = '', level = '' } = {}) => {
  let courses = [...dataStore.getTable('courses')].filter((c) => c.status !== 'ARCHIVED');
  const users = dataStore.getTable('users');
  const modules = dataStore.getTable('modules');
  const enrollments = dataStore.getTable('enrollments');

  if (category) {
    courses = courses.filter((c) => c.category.toLowerCase() === category.toLowerCase());
  }

  if (level) {
    courses = courses.filter((c) => c.level.toLowerCase() === level.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    courses = courses.filter(
      (c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
    );
  }

  // Enrich with instructor info and counts
  return courses.map((course) => {
    const instructor = users.find((u) => Number(u.id) === Number(course.instructor_id));
    const courseModules = modules.filter((m) => Number(m.course_id) === Number(course.id));
    const courseEnrollments = enrollments.filter(
      (e) => Number(e.course_id) === Number(course.id) && e.status === 'ENROLLED'
    );

    return {
      ...course,
      instructor_name: instructor ? instructor.name : 'Unknown Instructor',
      modules_count: courseModules.length,
      students_enrolled: courseEnrollments.length,
    };
  });
};

const getCourseById = async (courseId, currentUserId = null) => {
  const courses = dataStore.getTable('courses');
  const course = courses.find((c) => Number(c.id) === Number(courseId));
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  const users = dataStore.getTable('users');
  const instructor = users.find((u) => Number(u.id) === Number(course.instructor_id));

  const modules = dataStore.getTable('modules')
    .filter((m) => Number(m.course_id) === Number(courseId))
    .sort((a, b) => a.order_index - b.order_index);

  const materials = dataStore.getTable('materials');
  const progressList = dataStore.getTable('material_progress');

  const populatedModules = modules.map((m) => {
    const moduleMaterials = materials
      .filter((mat) => Number(mat.module_id) === Number(m.id))
      .sort((a, b) => a.order_index - b.order_index)
      .map((mat) => {
        const isCompleted = currentUserId
          ? progressList.some(
              (p) =>
                Number(p.student_id) === Number(currentUserId) &&
                Number(p.material_id) === Number(mat.id) &&
                p.completed
            )
          : false;

        return {
          ...mat,
          completed: isCompleted,
        };
      });

    return {
      ...m,
      materials: moduleMaterials,
    };
  });

  // Check enrollment status for current user
  let isEnrolled = false;
  if (currentUserId) {
    const enrollments = dataStore.getTable('enrollments');
    isEnrolled = enrollments.some(
      (e) =>
        Number(e.student_id) === Number(currentUserId) &&
        Number(e.course_id) === Number(courseId) &&
        e.status === 'ENROLLED'
    );
  }

  return {
    ...course,
    instructor_name: instructor ? instructor.name : 'Unknown Instructor',
    instructor_bio: instructor ? instructor.bio : '',
    modules: populatedModules,
    is_enrolled: isEnrolled,
  };
};

const createCourse = async ({ title, description, category, level = 'Beginner', instructorId }) => {
  if (!title || !description || !category) {
    throw new AppError('Course title, description, and category are required', 400);
  }

  const newCourse = dataStore.insert('courses', {
    title: title.trim(),
    description: description.trim(),
    category: category.trim(),
    level,
    instructor_id: Number(instructorId),
    status: 'PUBLISHED',
  });

  return newCourse;
};

const updateCourse = async (courseId, updates, userId, role) => {
  const courses = dataStore.getTable('courses');
  const course = courses.find((c) => Number(c.id) === Number(courseId));
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  if (role !== 'ADMIN' && Number(course.instructor_id) !== Number(userId)) {
    throw new AppError('Unauthorized: You can only edit your own courses', 403);
  }

  const updated = dataStore.update('courses', courseId, updates);
  return updated;
};

const deleteCourse = async (courseId, userId, role) => {
  const courses = dataStore.getTable('courses');
  const course = courses.find((c) => Number(c.id) === Number(courseId));
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  if (role !== 'ADMIN' && Number(course.instructor_id) !== Number(userId)) {
    throw new AppError('Unauthorized: You can only delete your own courses', 403);
  }

  dataStore.delete('courses', courseId);
  return true;
};

const enrollStudent = async (courseId, studentId) => {
  const courses = dataStore.getTable('courses');
  const course = courses.find((c) => Number(c.id) === Number(courseId));
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  const enrollments = dataStore.getTable('enrollments');
  const existing = enrollments.find(
    (e) => Number(e.student_id) === Number(studentId) && Number(e.course_id) === Number(courseId)
  );

  if (existing) {
    if (existing.status === 'ENROLLED') {
      throw new AppError('You are already registered for this course', 409);
    }
    // Re-enroll
    return dataStore.update('enrollments', existing.id, {
      status: 'ENROLLED',
      enrolled_at: new Date().toISOString(),
    });
  }

  return dataStore.insert('enrollments', {
    student_id: Number(studentId),
    course_id: Number(courseId),
    status: 'ENROLLED',
    enrolled_at: new Date().toISOString(),
  });
};

const unenrollStudent = async (courseId, studentId) => {
  const enrollments = dataStore.getTable('enrollments');
  const existing = enrollments.find(
    (e) => Number(e.student_id) === Number(studentId) && Number(e.course_id) === Number(courseId)
  );

  if (!existing || existing.status !== 'ENROLLED') {
    throw new AppError('You are not currently enrolled in this course', 400);
  }

  return dataStore.update('enrollments', existing.id, { status: 'DROPPED' });
};

const getStudentCourses = async (studentId) => {
  const enrollments = dataStore.getTable('enrollments').filter(
    (e) => Number(e.student_id) === Number(studentId) && e.status === 'ENROLLED'
  );

  const courses = dataStore.getTable('courses');
  const users = dataStore.getTable('users');

  return enrollments.map((e) => {
    const course = courses.find((c) => Number(c.id) === Number(e.course_id));
    const instructor = course ? users.find((u) => Number(u.id) === Number(course.instructor_id)) : null;

    return {
      enrollment_id: e.id,
      enrolled_at: e.enrolled_at,
      ...course,
      instructor_name: instructor ? instructor.name : 'Unknown',
    };
  }).filter(Boolean);
};

const getInstructorCourses = async (instructorId) => {
  const courses = dataStore.getTable('courses').filter(
    (c) => Number(c.instructor_id) === Number(instructorId)
  );
  const enrollments = dataStore.getTable('enrollments');

  return courses.map((course) => {
    const enrolledCount = enrollments.filter(
      (e) => Number(e.course_id) === Number(course.id) && e.status === 'ENROLLED'
    ).length;

    return {
      ...course,
      students_enrolled: enrolledCount,
    };
  });
};

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollStudent,
  unenrollStudent,
  getStudentCourses,
  getInstructorCourses,
};
