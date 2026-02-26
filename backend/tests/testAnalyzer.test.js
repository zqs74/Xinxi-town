import testAnalyzer from '../services/testAnalyzer.js';

describe('TestAnalyzer', () => {
  describe('analyzeEmotionTest', () => {
    test('should analyze emotion test with low score', () => {
      const answers = { 1: 4, 2: 4, 3: 4, 4: 1, 5: 4, 6: 4, 7: 1, 8: 4 };
      const totalScore = 25;

      const result = testAnalyzer.analyzeEmotionTest(answers, totalScore);

      expect(result).toHaveProperty('scores');
      expect(result).toHaveProperty('totalScore', totalScore);
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('suggestions');
      expect(result).toHaveProperty('level', 'low');
      expect(result).toHaveProperty('analysis');
      expect(result).toHaveProperty('strengths');
      expect(result).toHaveProperty('areasForImprovement');
      expect(result).toHaveProperty('trend');
    });

    test('should analyze emotion test with high score', () => {
      const answers = { 1: 1, 2: 1, 3: 1, 4: 5, 5: 1, 6: 1, 7: 5, 8: 1 };
      const totalScore = 85;

      const result = testAnalyzer.analyzeEmotionTest(answers, totalScore);

      expect(result.level).toBe('high');
      expect(result.title).toContain('需要关注');
    });

    test('should generate correct emotion title based on score', () => {
      expect(testAnalyzer.getEmotionTitle(25)).toBe('情绪状态良好');
      expect(testAnalyzer.getEmotionTitle(55)).toBe('情绪有些波动');
      expect(testAnalyzer.getEmotionTitle(85)).toBe('情绪需要关注');
    });
  });

  describe('analyzeStressTest', () => {
    test('should analyze stress test correctly', () => {
      const answers = { 1: 2, 2: [0, 1], 3: 2, 4: 3, 5: 3 };
      const totalScore = 40;

      const result = testAnalyzer.analyzeStressTest(answers, totalScore);

      expect(result).toHaveProperty('scores');
      expect(result).toHaveProperty('totalScore', totalScore);
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('suggestions');
      expect(result).toHaveProperty('level');
      expect(result).toHaveProperty('sources');
      expect(result).toHaveProperty('copingStrategies');
      expect(result).toHaveProperty('preventionTips');
    });

    test('should identify stress sources from answers', () => {
      const answers = { 1: 3, 2: [0, 1, 2], 3: 2, 4: 3, 5: 3 };

      const sources = testAnalyzer.identifyStressSources(answers);

      expect(Array.isArray(sources)).toBe(true);
      expect(sources.length).toBeGreaterThan(0);
    });

    test('should generate correct stress title based on score', () => {
      expect(testAnalyzer.getStressTitle(20)).toBe('压力水平较低');
      expect(testAnalyzer.getStressTitle(45)).toBe('压力水平中等');
      expect(testAnalyzer.getStressTitle(80)).toBe('压力水平较高');
    });
  });

  describe('analyzeDepressionTest (PHQ-9)', () => {
    test('should analyze depression test with no symptoms', () => {
      const answers = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
      const totalScore = 0;

      const result = testAnalyzer.analyzeDepressionTest(answers, totalScore);

      expect(result.level).toBe('none');
      expect(result.severity).toBe('无抑郁');
      expect(result.title).toBe('无明显抑郁症状');
      expect(result.warning).toBe('当前状态良好');
    });

    test('should analyze depression test with mild symptoms', () => {
      const answers = { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1, 9: 0 };
      const totalScore = 8;

      const result = testAnalyzer.analyzeDepressionTest(answers, totalScore);

      expect(result.level).toBe('mild');
      expect(result.severity).toBe('轻度抑郁');
      expect(result.title).toBe('轻度抑郁症状');
    });

    test('should analyze depression test with severe symptoms', () => {
      const answers = { 1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 3 };
      const totalScore = 27;

      const result = testAnalyzer.analyzeDepressionTest(answers, totalScore);

      expect(result.level).toBe('severe');
      expect(result.severity).toBe('重度抑郁');
      expect(result.warning).toBe('建议寻求专业心理帮助');
    });

    test('should calculate PHQ-9 scores correctly', () => {
      const answers = { 1: 2, 2: 1, 3: 0, 4: 2, 5: 1 };

      const scores = testAnalyzer.calculatePHQ9Scores(answers);

      expect(scores[1]).toBe(2);
      expect(scores[2]).toBe(1);
      expect(scores[3]).toBe(0);
      expect(scores.total).toBe(6);
    });
  });

  describe('analyzeAnxietyTest (GAD-7)', () => {
    test('should analyze anxiety test with minimal symptoms', () => {
      const answers = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
      const totalScore = 0;

      const result = testAnalyzer.analyzeAnxietyTest(answers, totalScore);

      expect(result.level).toBe('minimal');
      expect(result.severity).toBe('无焦虑');
      expect(result.title).toBe('无明显焦虑症状');
    });

    test('should analyze anxiety test with moderate symptoms', () => {
      const answers = { 1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2 };
      const totalScore = 14;

      const result = testAnalyzer.analyzeAnxietyTest(answers, totalScore);

      expect(result.level).toBe('moderate');
      expect(result.severity).toBe('中度焦虑');
      expect(result.title).toBe('中度焦虑症状');
    });

    test('should calculate GAD-7 scores correctly', () => {
      const answers = { 1: 1, 2: 2, 3: 1, 4: 0, 5: 2 };

      const scores = testAnalyzer.calculateGAD7Scores(answers);

      expect(scores[1]).toBe(1);
      expect(scores[2]).toBe(2);
      expect(scores[3]).toBe(1);
      expect(scores.total).toBe(6);
    });
  });

  describe('analyzeMBTITest', () => {
    test('should determine MBTI type correctly', () => {
      const answers = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
        7: 0,
        8: 0,
        9: 0,
        10: 0
      };

      const result = testAnalyzer.analyzeMBTITest(answers);

      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('typeName');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('strengths');
      expect(result).toHaveProperty('weaknesses');
      expect(result).toHaveProperty('careerRecommendations');
      expect(result).toHaveProperty('relationshipTips');
      expect(result).toHaveProperty('growthSuggestions');
      expect(result).toHaveProperty('compatibility');
      expect(result).toHaveProperty('scores');
    });

    test('should get MBTI type name correctly', () => {
      expect(testAnalyzer.getMBTITypeName('ISTJ')).toBe('物流师');
      expect(testAnalyzer.getMBTITypeName('ENFP')).toBe('竞选者');
      expect(testAnalyzer.getMBTITypeName('ENTJ')).toBe('指挥官');
    });

    test('should get MBTI description correctly', () => {
      const desc = testAnalyzer.getMBTIDescription('INTJ');
      expect(desc).toContain('战略家');
      expect(desc).toContain('独立');
    });
  });

  describe('analyzeEnneagramTest', () => {
    test('should analyze enneagram test correctly', () => {
      const answers = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 };

      const result = testAnalyzer.analyzeEnneagramTest(answers);

      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('typeName');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('coreFear');
      expect(result).toHaveProperty('coreDesire');
      expect(result).toHaveProperty('healthyLevel');
      expect(result).toHaveProperty('averageLevel');
      expect(result).toHaveProperty('unhealthyLevel');
      expect(result).toHaveProperty('growthPath');
      expect(result).toHaveProperty('stressPath');
      expect(result).toHaveProperty('integrationLevel');
    });

    test('should get enneagram type name correctly', () => {
      expect(testAnalyzer.getEnneagramTypeName(1)).toBe('完美主义者');
      expect(testAnalyzer.getEnneagramTypeName(5)).toBe('探索者');
      expect(testAnalyzer.getEnneagramTypeName(9)).toBe('和平缔造者');
    });
  });

  describe('analyzeSleepTest', () => {
    test('should analyze sleep test correctly', () => {
      const answers = { 1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: [0, 1] };
      const totalScore = 40;

      const result = testAnalyzer.analyzeSleepTest(answers, totalScore);

      expect(result).toHaveProperty('scores');
      expect(result).toHaveProperty('totalScore', totalScore);
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('suggestions');
      expect(result).toHaveProperty('problems');
      expect(result).toHaveProperty('severity');
      expect(result).toHaveProperty('sleepHygieneTips');
      expect(result).toHaveProperty('bedtimeRoutine');
      expect(result).toHaveProperty('warningSigns');
    });

    test('should identify sleep problems from answers', () => {
      const answers = { 1: 4, 2: 4, 3: 4, 4: 4, 5: 4, 6: [0, 1, 2, 3, 4, 5] };

      const problems = testAnalyzer.identifySleepProblems(answers);

      expect(Array.isArray(problems)).toBe(true);
    });

    test('should get correct sleep title based on score', () => {
      expect(testAnalyzer.getSleepTitle(20)).toBe('睡眠质量良好');
      expect(testAnalyzer.getSleepTitle(45)).toBe('睡眠质量一般');
      expect(testAnalyzer.getSleepTitle(75)).toBe('睡眠质量较差');
    });
  });

  describe('analyzePersonalityTest', () => {
    test('should analyze personality test correctly', () => {
      const answers = { 1: 3, 2: 3, 3: 3, 4: 3, 5: 3 };
      const totalScore = 50;

      const result = testAnalyzer.analyzePersonalityTest(answers, totalScore);

      expect(result).toHaveProperty('scores');
      expect(result).toHaveProperty('totalScore', totalScore);
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('suggestions');
      expect(result).toHaveProperty('level');
      expect(result).toHaveProperty('traits');
    });
  });

  describe('analyzeGenericTest', () => {
    test('should analyze generic test correctly', () => {
      const totalScore = 60;

      const result = testAnalyzer.analyzeGenericTest({}, totalScore);

      expect(result).toHaveProperty('totalScore', totalScore);
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('suggestions');
      expect(result).toHaveProperty('level', 'medium');
    });
  });

  describe('Helper Functions', () => {
    test('should determine risk level correctly', () => {
      expect(testAnalyzer.determineRiskLevel(30)).toBe('low');
      expect(testAnalyzer.determineRiskLevel(55)).toBe('medium');
      expect(testAnalyzer.determineRiskLevel(80)).toBe('high');
    });

    test('should determine risk level with custom thresholds', () => {
      expect(testAnalyzer.determineRiskLevel(25, [30, 60])).toBe('low');
      expect(testAnalyzer.determineRiskLevel(45, [30, 60])).toBe('medium');
      expect(testAnalyzer.determineRiskLevel(70, [30, 60])).toBe('high');
    });

    test('should generate suggestions based on category', () => {
      const suggestions = testAnalyzer.generateSuggestions('emotion', {}, 50);

      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
    });

    test('should generate default suggestions', () => {
      const suggestions = testAnalyzer.generateDefaultSuggestions(30);

      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.includes('400-123-4567'))).toBe(true);
    });

    test('should calculate dimension scores correctly', () => {
      const answers = { 1: 3, 2: 4, 3: 2 };

      const scores = testAnalyzer.calculateDimensionScores(answers, 'emotion');

      expect(scores[1]).toBe(60);
      expect(scores[2]).toBe(80);
      expect(scores[3]).toBe(40);
    });
  });

  describe('analyzeTest - Main Entry Point', () => {
    test('should route to correct analyzer based on test type', async () => {
      const emotionResult = await testAnalyzer.analyzeTest('emotion', { 1: 3 }, 60);
      expect(emotionResult).toHaveProperty('title');

      const stressResult = await testAnalyzer.analyzeTest('stress', { 1: 3 }, 60);
      expect(stressResult).toHaveProperty('title');

      const mbtiResult = await testAnalyzer.analyzeTest('mbti', { 1: 0 }, 0);
      expect(mbtiResult).toHaveProperty('type');
    });

    test('should handle unknown test type', async () => {
      const result = await testAnalyzer.analyzeTest('unknown', {}, 50);

      expect(result).toHaveProperty('totalScore', 50);
      expect(result).toHaveProperty('title');
    });
  });
});