import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import TestResult from '../../models/TestResult.js';

describe('TestResult Model', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await TestResult.deleteMany({});
  });

  describe('TestResult Creation', () => {
    test('should create a valid test result', async () => {
      const validResult = {
        userId: new mongoose.Types.ObjectId(),
        testType: 'emotion',
        testName: '情绪地图测试',
        scores: { 1: 60, 2: 80 },
        totalScore: 50,
        title: '情绪有些波动',
        description: '你的情绪有一定波动',
        suggestions: ['建议关注情绪变化'],
        answers: { 1: 3, 2: 4 },
        questionCount: 2
      };

      const result = await TestResult.create(validResult);

      expect(result).toBeDefined();
      expect(result.userId.toString()).toBe(validResult.userId.toString());
      expect(result.testType).toBe('emotion');
      expect(result.testName).toBe('情绪地图测试');
      expect(result.totalScore).toBe(50);
      expect(result.level).toBe('medium');
    });

    test('should fail without required userId', async () => {
      const invalidResult = {
        testType: 'emotion',
        totalScore: 70
      };

      await expect(TestResult.create(invalidResult)).rejects.toThrow();
    });

    test('should use default testType', async () => {
      const result = await TestResult.create({
        userId: new mongoose.Types.ObjectId(),
        totalScore: 50
      });

      expect(result.testType).toBe('emotion');
    });

    test('should use default empty objects for scores and answers', async () => {
      const result = await TestResult.create({
        userId: new mongoose.Types.ObjectId(),
        totalScore: 50
      });

      expect(result.scores).toBeDefined();
      expect(result.answers).toBeDefined();
      expect(result.scores.size).toBe(0);
      expect(result.answers.size).toBe(0);
    });

    test('should use default empty array for suggestions', async () => {
      const result = await TestResult.create({
        userId: new mongoose.Types.ObjectId(),
        totalScore: 50
      });

      expect(Array.isArray(result.suggestions)).toBe(true);
      expect(result.suggestions.length).toBe(0);
    });

    test('should use default 0 for questionCount', async () => {
      const result = await TestResult.create({
        userId: new mongoose.Types.ObjectId(),
        totalScore: 50
      });

      expect(result.questionCount).toBe(0);
    });

    test('should use default 0 for testDuration', async () => {
      const result = await TestResult.create({
        userId: new mongoose.Types.ObjectId(),
        totalScore: 50
      });

      expect(result.testDuration).toBe(0);
    });
  });

  describe('Virtual Field: level', () => {
    test('should return high level for low scores', async () => {
      const result = await TestResult.create({
        userId: new mongoose.Types.ObjectId(),
        totalScore: 30
      });

      expect(result.level).toBe('high');
    });

    test('should return medium level for medium scores', async () => {
      const result = await TestResult.create({
        userId: new mongoose.Types.ObjectId(),
        totalScore: 55
      });

      expect(result.level).toBe('medium');
    });

    test('should return low level for high scores', async () => {
      const result = await TestResult.create({
        userId: new mongoose.Types.ObjectId(),
        totalScore: 85
      });

      expect(result.level).toBe('low');
    });

    test('should return unknown for undefined totalScore', async () => {
      const result = await TestResult.create({
        userId: new mongoose.Types.ObjectId()
      });

      expect(result.level).toBe('unknown');
    });
  });

  describe('Timestamps', () => {
    test('should have createdAt timestamp', async () => {
      const result = await TestResult.create({
        userId: new mongoose.Types.ObjectId(),
        totalScore: 50
      });

      expect(result.createdAt).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    test('should have updatedAt timestamp', async () => {
      const result = await TestResult.create({
        userId: new mongoose.Types.ObjectId(),
        totalScore: 50
      });

      expect(result.updatedAt).toBeDefined();
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    test('should update updatedAt on save', async () => {
      const result = await TestResult.create({
        userId: new mongoose.Types.ObjectId(),
        totalScore: 50
      });

      const initialUpdatedAt = result.updatedAt;
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      result.totalScore = 60;
      await result.save();

      expect(result.updatedAt.getTime()).toBeGreaterThan(initialUpdatedAt.getTime());
    });
  });

  describe('Field Validation', () => {
    test('should validate totalScore min and max', async () => {
      const result = await TestResult.create({
        userId: new mongoose.Types.ObjectId(),
        totalScore: 0
      });

      expect(result.totalScore).toBe(0);

      const result2 = await TestResult.create({
        userId: new mongoose.Types.ObjectId(),
        totalScore: 100
      });

      expect(result2.totalScore).toBe(100);
    });

    test('should store Map type for scores', async () => {
      const result = await TestResult.create({
        userId: new mongoose.Types.ObjectId(),
        scores: { dimension1: 75, dimension2: 85 },
        totalScore: 80
      });

      expect(result.scores.get('dimension1')).toBe(75);
      expect(result.scores.get('dimension2')).toBe(85);
    });

    test('should store Map type for answers', async () => {
      const result = await TestResult.create({
        userId: new mongoose.Types.ObjectId(),
        answers: { q1: 3, q2: 4, q3: 2 },
        totalScore: 60
      });

      expect(result.answers.get('q1')).toBe(3);
      expect(result.answers.get('q2')).toBe(4);
      expect(result.answers.get('q3')).toBe(2);
    });
  });

  describe('Test Types', () => {
    const testTypes = ['emotion', 'stress', 'sleep', 'personality', 'mbti', 'enneagram', 'depression', 'anxiety', 'self_esteem'];

    test.each(testTypes)('should accept %s test type', async (testType) => {
      const result = await TestResult.create({
        userId: new mongoose.Types.ObjectId(),
        testType,
        totalScore: 50
      });

      expect(result.testType).toBe(testType);
    });
  });

  describe('Complex Data Structures', () => {
    test('should store questions array', async () => {
      const questions = [
        { id: 1, text: 'Question 1' },
        { id: 2, text: 'Question 2' }
      ];

      const result = await TestResult.create({
        userId: new mongoose.Types.ObjectId(),
        questions,
        totalScore: 50
      });

      expect(Array.isArray(result.questions)).toBe(true);
      expect(result.questions.length).toBe(2);
      expect(result.questions[0].id).toBe(1);
    });

    test('should store analysis object', async () => {
      const analysis = {
        aiEnhanced: true,
        sentimentAnalysis: { sentiment: 0.5, confidence: 0.9 },
        aiSummary: 'AI生成的分析摘要'
      };

      const result = await TestResult.create({
        userId: new mongoose.Types.ObjectId(),
        analysis,
        totalScore: 50
      });

      expect(result.analysis).toBeDefined();
      expect(result.analysis.aiEnhanced).toBe(true);
      expect(result.analysis.sentimentAnalysis).toBeDefined();
    });

    test('should store test time information', async () => {
      const startTime = new Date(Date.now() - 60000);
      const endTime = new Date();

      const result = await TestResult.create({
        userId: new mongoose.Types.ObjectId(),
        testStartTime: startTime,
        testEndTime: endTime,
        testDuration: 60000,
        totalScore: 50
      });

      expect(result.testStartTime).toBeDefined();
      expect(result.testEndTime).toBeDefined();
      expect(result.testDuration).toBe(60000);
    });
  });

  describe('MBTI Specific Fields', () => {
    test('should store MBTI specific fields', async () => {
      const result = await TestResult.create({
        userId: new mongoose.Types.ObjectId(),
        testType: 'mbti',
        totalScore: 0,
        analysis: {
          mbtiType: 'INTJ',
          mbtiTypeName: '建筑师',
          mbtiDescription: '战略家、独立、有远见',
          mbtiStrengths: ['有远见', '理性', '独立'],
          mbtiWeaknesses: ['傲慢', '过度批判']
        }
      });

      expect(result.analysis).toBeDefined();
      expect(result.analysis.mbtiType).toBe('INTJ');
      expect(result.analysis.mbtiTypeName).toBe('建筑师');
      expect(result.analysis.mbtiDescription).toBe('战略家、独立、有远见');
      expect(Array.isArray(result.analysis.mbtiStrengths)).toBe(true);
      expect(Array.isArray(result.analysis.mbtiWeaknesses)).toBe(true);
    });
  });

  describe('Clinical Test Fields', () => {
    test('should store depression severity', async () => {
      const result = await TestResult.create({
        userId: new mongoose.Types.ObjectId(),
        testType: 'depression',
        totalScore: 15,
        analysis: {
          severity: '中度抑郁',
          warning: '建议寻求专业心理帮助'
        }
      });

      expect(result.analysis).toBeDefined();
      expect(result.analysis.severity).toBe('中度抑郁');
      expect(result.analysis.warning).toBe('建议寻求专业心理帮助');
    });

    test('should store anxiety severity', async () => {
      const result = await TestResult.create({
        userId: new mongoose.Types.ObjectId(),
        testType: 'anxiety',
        totalScore: 12,
        analysis: {
          severity: '中度焦虑',
          warning: '可能有中度焦虑'
        }
      });

      expect(result.analysis).toBeDefined();
      expect(result.analysis.severity).toBe('中度焦虑');
      expect(result.analysis.warning).toBe('可能有中度焦虑');
    });
  });

  describe('Query Operations', () => {
    beforeEach(async () => {
      const userId = new mongoose.Types.ObjectId();
      const results = [
        { userId, testType: 'emotion', totalScore: 50 },
        { userId, testType: 'stress', totalScore: 40 },
        { userId, testType: 'depression', totalScore: 8 }
      ];
      await TestResult.insertMany(results);
    });

    test('should find results by userId', async () => {
      const userId = new mongoose.Types.ObjectId();
      await TestResult.create({ userId, testType: 'emotion', totalScore: 50 });

      const results = await TestResult.find({ userId });

      expect(results.length).toBe(1);
      expect(results[0].userId.toString()).toBe(userId.toString());
    });

    test('should find results by testType', async () => {
      const results = await TestResult.find({ testType: 'emotion' });

      expect(results.length).toBeGreaterThan(0);
      results.forEach(result => {
        expect(result.testType).toBe('emotion');
      });
    });

    test('should sort results by createdAt', async () => {
      const userId = new mongoose.Types.ObjectId();
      await TestResult.create({ userId, testType: 'emotion', totalScore: 50 });
      await new Promise(resolve => setTimeout(resolve, 10));
      await TestResult.create({ userId, testType: 'stress', totalScore: 40 });

      const results = await TestResult.find({ userId }).sort({ createdAt: -1 });

      expect(results[0].testType).toBe('stress');
      expect(results[1].testType).toBe('emotion');
    });
  });
});