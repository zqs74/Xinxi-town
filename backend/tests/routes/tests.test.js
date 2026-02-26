import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import testsRoutes from '../../routes/tests.js';
import User from '../../models/User.js';
import TestResult from '../../models/TestResult.js';

describe('Tests API Routes', () => {
  let app;
  let mongoServer;
  let authToken;
  let userId;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    app = express();
    app.use(express.json());
    app.use('/api/tests', testsRoutes);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await TestResult.deleteMany({});

    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: hashedPassword,
      school: '测试学校'
    });
    await user.save();
    userId = user._id;

    authToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'xinxi-town-secret-key',
      { expiresIn: '1h' }
    );
  });

  afterEach(async () => {
    await User.deleteMany({});
    await TestResult.deleteMany({});
  });

  describe('GET /api/tests/questions/:testType', () => {
    test('should return emotion test questions', async () => {
      const response = await request(app)
        .get('/api/tests/questions/emotion')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('testType', 'emotion');
      expect(response.body).toHaveProperty('questionCount');
      expect(response.body).toHaveProperty('estimatedTime');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('should return stress test questions', async () => {
      const response = await request(app)
        .get('/api/tests/questions/stress')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.testType).toBe('stress');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should return MBTI test questions', async () => {
      const response = await request(app)
        .get('/api/tests/questions/mbti')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.testType).toBe('mbti');
      expect(response.body.data.length).toBe(10);
    });

    test('should return depression test questions (PHQ-9)', async () => {
      const response = await request(app)
        .get('/api/tests/questions/depression')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.testType).toBe('depression');
      expect(response.body.data.length).toBe(9);
    });

    test('should return anxiety test questions (GAD-7)', async () => {
      const response = await request(app)
        .get('/api/tests/questions/anxiety')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.testType).toBe('anxiety');
      expect(response.body.data.length).toBe(7);
    });

    test('should return error for invalid test type', async () => {
      const response = await request(app)
        .get('/api/tests/questions/invalid_type')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('validTypes');
      expect(Array.isArray(response.body.validTypes)).toBe(true);
    });
  });

  describe('POST /api/tests/submit', () => {
    test('should submit emotion test successfully', async () => {
      const testData = {
        testType: 'emotion',
        answers: { 1: 3, 2: 4, 3: 3, 4: 2, 5: 3, 6: 4, 7: 2, 8: 3 },
        startTime: new Date(Date.now() - 60000).toISOString(),
        endTime: new Date().toISOString(),
        duration: 60000
      };

      const response = await request(app)
        .post('/api/tests/submit')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data).toHaveProperty('testType', 'emotion');
      expect(response.body.data).toHaveProperty('totalScore');
      expect(response.body.data).toHaveProperty('title');
      expect(response.body.data).toHaveProperty('description');
      expect(response.body.data).toHaveProperty('suggestions');
      expect(response.body.data).toHaveProperty('analysis');
    });

    test('should submit depression test (PHQ-9) successfully', async () => {
      const testData = {
        testType: 'depression',
        answers: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1, 9: 0 },
        startTime: new Date(Date.now() - 60000).toISOString(),
        endTime: new Date().toISOString(),
        duration: 60000
      };

      const response = await request(app)
        .post('/api/tests/submit')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalScore).toBe(8);
      expect(response.body.data.analysis).toHaveProperty('severity');
      expect(response.body.data.analysis).toHaveProperty('level');
    });

    test('should submit anxiety test (GAD-7) successfully', async () => {
      const testData = {
        testType: 'anxiety',
        answers: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1 },
        startTime: new Date(Date.now() - 60000).toISOString(),
        endTime: new Date().toISOString(),
        duration: 60000
      };

      const response = await request(app)
        .post('/api/tests/submit')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalScore).toBe(7);
      expect(response.body.data.analysis).toHaveProperty('severity');
      expect(response.body.data.analysis).toHaveProperty('level');
    });

    test('should submit MBTI test successfully', async () => {
      const testData = {
        testType: 'mbti',
        answers: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 },
        startTime: new Date(Date.now() - 60000).toISOString(),
        endTime: new Date().toISOString(),
        duration: 60000
      };

      const response = await request(app)
        .post('/api/tests/submit')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('analysis');
      expect(response.body.data.analysis).toHaveProperty('type');
      expect(response.body.data.analysis).toHaveProperty('typeName');
      expect(response.body.data.analysis).toHaveProperty('description');
      expect(response.body.data.analysis).toHaveProperty('strengths');
      expect(response.body.data.analysis).toHaveProperty('weaknesses');
    });

    test('should return error without authentication', async () => {
      const testData = {
        testType: 'emotion',
        answers: { 1: 3 },
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        duration: 0
      };

      const response = await request(app)
        .post('/api/tests/submit')
        .send(testData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    test('should return error for invalid test type', async () => {
      const testData = {
        testType: 'invalid_type',
        answers: { 1: 3 },
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        duration: 0
      };

      const response = await request(app)
        .post('/api/tests/submit')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
    });

    test('should return error for empty answers', async () => {
      const testData = {
        testType: 'emotion',
        answers: {},
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        duration: 0
      };

      const response = await request(app)
        .post('/api/tests/submit')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('请完成所有测试问题');
    });

    test('should save test result to database', async () => {
      const testData = {
        testType: 'emotion',
        answers: { 1: 3, 2: 4, 3: 3, 4: 2, 5: 3, 6: 4, 7: 2, 8: 3 },
        startTime: new Date(Date.now() - 60000).toISOString(),
        endTime: new Date().toISOString(),
        duration: 60000
      };

      await request(app)
        .post('/api/tests/submit')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testData);

      const savedResult = await TestResult.findOne({ userId });

      expect(savedResult).toBeDefined();
      expect(savedResult.testType).toBe('emotion');
      expect(savedResult.userId.toString()).toBe(userId.toString());
      expect(savedResult.answers).toBeDefined();
    });

    test('should increment user test completed count', async () => {
      const testData = {
        testType: 'emotion',
        answers: { 1: 3 },
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        duration: 0
      };

      const userBefore = await User.findById(userId);
      const countBefore = userBefore.testCompleted || 0;

      await request(app)
        .post('/api/tests/submit')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testData);

      const userAfter = await User.findById(userId);
      expect(userAfter.testCompleted).toBe(countBefore + 1);
    });
  });

  describe('GET /api/tests/history', () => {
    beforeEach(async () => {
      const testResults = [
        {
          userId,
          testType: 'emotion',
          testName: '情绪地图测试',
          totalScore: 50,
          answers: { 1: 3 },
          questionCount: 1,
          level: 'medium'
        },
        {
          userId,
          testType: 'stress',
          testName: '压力水平评估',
          totalScore: 40,
          answers: { 1: 2 },
          questionCount: 1,
          level: 'low'
        }
      ];

      await TestResult.insertMany(testResults);
    });

    test('should return test history', async () => {
      const response = await request(app)
        .get('/api/tests/history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body.data[0]).toHaveProperty('testType');
      expect(response.body.data[0]).toHaveProperty('totalScore');
      expect(response.body.data[0]).toHaveProperty('createdAt');
    });

    test('should return error without authentication', async () => {
      const response = await request(app)
        .get('/api/tests/history')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    test('should limit results by query parameter', async () => {
      const response = await request(app)
        .get('/api/tests/history?limit=1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(1);
    });

    test('should return results sorted by date descending', async () => {
      const response = await request(app)
        .get('/api/tests/history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const dates = response.body.data.map(r => new Date(r.createdAt).getTime());
      for (let i = 0; i < dates.length - 1; i++) {
        expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1]);
      }
    });
  });

  describe('GET /api/tests/result/:id', () => {
    let testResultId;

    beforeEach(async () => {
      const testResult = new TestResult({
        userId,
        testType: 'emotion',
        testName: '情绪地图测试',
        totalScore: 50,
        answers: { 1: 3 },
        questionCount: 1,
        level: 'medium',
        description: '测试描述'
      });
      await testResult.save();
      testResultId = testResult._id;
    });

    test('should return test result details', async () => {
      const response = await request(app)
        .get(`/api/tests/result/${testResultId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id.toString()).toBe(testResultId.toString());
      expect(response.body.data).toHaveProperty('testType');
      expect(response.body.data).toHaveProperty('totalScore');
      expect(response.body.data).toHaveProperty('answers');
      expect(response.body.data).toHaveProperty('questions');
    });

    test('should return error for non-existent result', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/tests/result/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('未找到测试结果');
    });

    test('should return error without authentication', async () => {
      const response = await request(app)
        .get(`/api/tests/result/${testResultId}`)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    test('should only return user\'s own test results', async () => {
      const otherUser = new User({
        username: 'otheruser',
        email: 'other@example.com',
        password: await bcrypt.hash('password123', 10),
        school: '其他学校'
      });
      await otherUser.save();

      const otherToken = jwt.sign(
        { userId: otherUser._id },
        process.env.JWT_SECRET || 'xinxi-town-secret-key',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get(`/api/tests/result/${testResultId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});