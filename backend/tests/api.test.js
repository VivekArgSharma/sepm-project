const request = require('supertest');
const app = require('../src/app');

describe('Full SkillBridge API Integration Test Suite', () => {
  let studentToken = '';
  let instructorToken = '';
  let adminToken = '';

  // 1. Authentication Tests
  describe('Phase 2: Auth Endpoints', () => {
    it('POST /api/auth/login - should authenticate student', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'alice@student.edu', password: 'Password123!' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.role).toBe('STUDENT');
      studentToken = res.body.data.token;
    });

    it('POST /api/auth/login - should authenticate instructor', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'dr.smith@skillbridge.edu', password: 'Password123!' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.user.role).toBe('INSTRUCTOR');
      instructorToken = res.body.data.token;
    });

    it('POST /api/auth/login - should authenticate admin', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@skillbridge.edu', password: 'Password123!' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.user.role).toBe('ADMIN');
      adminToken = res.body.data.token;
    });

    it('POST /api/auth/login - should reject invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'alice@student.edu', password: 'WrongPassword' });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/auth/me - should return current authenticated user', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.email).toBe('alice@student.edu');
    });
  });

  // 2. Courses & Materials Tests
  describe('Phase 3: Courses Endpoints', () => {
    it('GET /api/courses - should return course catalog', async () => {
      const res = await request(app).get('/api/courses');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('GET /api/courses/:id - should return single course with modules', async () => {
      const res = await request(app).get('/api/courses/1');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.id).toBe(1);
      expect(Array.isArray(res.body.data.modules)).toBe(true);
    });

    it('POST /api/courses/:id/enroll - should enroll student', async () => {
      // Bob Miller enrolls in course 2
      const bobRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'bob@student.edu', password: 'Password123!' });

      const bobToken = bobRes.body.data.token;

      const res = await request(app)
        .post('/api/courses/2/enroll')
        .set('Authorization', `Bearer ${bobToken}`);

      expect([201, 409]).toContain(res.statusCode);
    });
  });

  // 3. Quizzes Tests
  describe('Phase 4: Quizzes Endpoints', () => {
    it('GET /api/quizzes/course/:courseId - should return quizzes for course', async () => {
      const res = await request(app)
        .get('/api/quizzes/course/1')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('POST /api/quizzes/:id/start - should initialize attempt', async () => {
      // Use student Diana who hasn't attempted Quiz 1 yet
      const dianaRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'diana@student.edu', password: 'Password123!' });

      const dianaToken = dianaRes.body.data.token;

      const res = await request(app)
        .post('/api/quizzes/1/start')
        .set('Authorization', `Bearer ${dianaToken}`);

      expect(res.statusCode).toBe(201);
      expect(res.body.data.attempt.state).toBe('IN_PROGRESS');

      // Now submit the attempt
      const attemptId = res.body.data.attempt.id;
      const submitRes = await request(app)
        .post(`/api/quizzes/${attemptId}/submit`)
        .set('Authorization', `Bearer ${dianaToken}`)
        .send({
          answers: [
            { question_id: 1, selected_option_id: 1 },
            { question_id: 2, selected_option_id: 6 },
          ],
        });

      expect(submitRes.statusCode).toBe(200);
      expect(submitRes.body.data.attempt.state).toBe('EVALUATED');
      expect(submitRes.body.data).toHaveProperty('total_score');
    });
  });

  // 4. Assignments Tests
  describe('Phase 5: Assignments Endpoints', () => {
    it('GET /api/assignments/course/:courseId - should return assignments', async () => {
      const res = await request(app)
        .get('/api/assignments/course/1')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('POST /api/assignments/:id/submit - should submit solution', async () => {
      const res = await request(app)
        .post('/api/assignments/1/submit')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          submission_type: 'LINK',
          content: 'https://github.com/alice/assignment-solution',
        });

      expect([200, 201]).toContain(res.statusCode);
      expect(res.body.data).toHaveProperty('state');
    });
  });

  // 5. Progress Tracking Tests
  describe('Phase 6: Progress Tracking Endpoints', () => {
    it('GET /api/progress/courses/:courseId/student - should return student completion %', async () => {
      const res = await request(app)
        .get('/api/progress/courses/1/student')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('overall_progress_percent');
      expect(res.body.data.materials).toHaveProperty('percentage');
    });
  });

  // 6. Admin Panel Tests
  describe('Phase 6: Admin Endpoints', () => {
    it('GET /api/admin/reports - should return system wide metric counts', async () => {
      const res = await request(app)
        .get('/api/admin/reports')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.users_count.total).toBeGreaterThan(0);
      expect(res.body.data.courses_count.total).toBeGreaterThan(0);
    });

    it('GET /api/admin/users - should return user list for admin', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/admin/users - should reject student access (RBAC)', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.statusCode).toBe(403);
    });
  });
});
