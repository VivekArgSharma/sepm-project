const AppError = require('../utils/AppError');
const dataStore = require('../config/dataStore');

const createModule = async ({ course_id, title, description = '', order_index = 1 }, userId, role) => {
  const courses = dataStore.getTable('courses');
  const course = courses.find((c) => Number(c.id) === Number(course_id));
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  if (role !== 'ADMIN' && Number(course.instructor_id) !== Number(userId)) {
    throw new AppError('Unauthorized: You can only add modules to your own courses', 403);
  }

  const newModule = dataStore.insert('modules', {
    course_id: Number(course_id),
    title: title.trim(),
    description: description.trim(),
    order_index: Number(order_index) || 1,
  });

  return newModule;
};

const createMaterial = async ({ module_id, title, description = '', content_type = 'LINK', url_or_path, order_index = 1 }, userId, role) => {
  const modules = dataStore.getTable('modules');
  const courseModule = modules.find((m) => Number(m.id) === Number(module_id));
  if (!courseModule) {
    throw new AppError('Module not found', 404);
  }

  const courses = dataStore.getTable('courses');
  const course = courses.find((c) => Number(c.id) === Number(courseModule.course_id));
  if (role !== 'ADMIN' && Number(course.instructor_id) !== Number(userId)) {
    throw new AppError('Unauthorized: You can only add materials to your own courses', 403);
  }

  const validTypes = ['VIDEO', 'PDF', 'LINK', 'TEXT'];
  const type = validTypes.includes(content_type.toUpperCase()) ? content_type.toUpperCase() : 'LINK';

  const newMaterial = dataStore.insert('materials', {
    module_id: Number(module_id),
    title: title.trim(),
    description: description.trim(),
    content_type: type,
    url_or_path: url_or_path.trim(),
    order_index: Number(order_index) || 1,
  });

  return newMaterial;
};

const toggleMaterialCompletion = async (materialId, studentId) => {
  const materials = dataStore.getTable('materials');
  const material = materials.find((m) => Number(m.id) === Number(materialId));
  if (!material) {
    throw new AppError('Material not found', 404);
  }

  const modules = dataStore.getTable('modules');
  const courseModule = modules.find((m) => Number(m.id) === Number(material.module_id));
  const courseId = courseModule ? courseModule.course_id : 1;

  const progressList = dataStore.getTable('material_progress');
  const existing = progressList.find(
    (p) => Number(p.student_id) === Number(studentId) && Number(p.material_id) === Number(materialId)
  );

  if (existing) {
    const updated = dataStore.update('material_progress', existing.id, {
      completed: !existing.completed,
      completed_at: !existing.completed ? new Date().toISOString() : null,
    });
    return updated;
  }

  const created = dataStore.insert('material_progress', {
    student_id: Number(studentId),
    course_id: Number(courseId),
    material_id: Number(materialId),
    completed: true,
    completed_at: new Date().toISOString(),
  });

  return created;
};

module.exports = {
  createModule,
  createMaterial,
  toggleMaterialCompletion,
};
