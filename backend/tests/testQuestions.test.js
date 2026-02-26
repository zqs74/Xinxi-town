import { getQuestions, getTestDescription, getTestMetadata, getAllTestTypes, analyzeMBTI, analyzeEnneagram } from '../services/testQuestions.js';

describe('testQuestions', () => {
  describe('getQuestions', () => {
    test('should return emotion test questions', () => {
      const questions = getQuestions('emotion');

      expect(Array.isArray(questions)).toBe(true);
      expect(questions.length).toBeGreaterThan(0);
      expect(questions[0]).toHaveProperty('id');
      expect(questions[0]).toHaveProperty('text');
      expect(questions[0]).toHaveProperty('type');
      expect(questions[0]).toHaveProperty('options');
      expect(questions[0]).toHaveProperty('weight');
      expect(questions[0]).toHaveProperty('testType', 'emotion');
      expect(questions[0]).toHaveProperty('metadata');
    });

    test('should return stress test questions', () => {
      const questions = getQuestions('stress');

      expect(Array.isArray(questions)).toBe(true);
      expect(questions.length).toBeGreaterThan(0);
      expect(questions.some(q => q.isMultiple === true)).toBe(true);
    });

    test('should return MBTI test questions', () => {
      const questions = getQuestions('mbti');

      expect(Array.isArray(questions)).toBe(true);
      expect(questions.length).toBe(10);
      expect(questions.every(q => q.hasOwnProperty('dimension'))).toBe(true);
    });

    test('should return depression test questions (PHQ-9)', () => {
      const questions = getQuestions('depression');

      expect(Array.isArray(questions)).toBe(true);
      expect(questions.length).toBe(9);
      expect(questions.some(q => q.isCritical === true)).toBe(true);
      expect(questions[8].type).toBe('suicidal_thought');
    });

    test('should return anxiety test questions (GAD-7)', () => {
      const questions = getQuestions('anxiety');

      expect(Array.isArray(questions)).toBe(true);
      expect(questions.length).toBe(7);
    });

    test('should return self_esteem test questions (RSES)', () => {
      const questions = getQuestions('self_esteem');

      expect(Array.isArray(questions)).toBe(true);
      expect(questions.length).toBe(10);
    });

    test('should return default emotion questions for unknown test type', () => {
      const questions = getQuestions('unknown_type');

      expect(Array.isArray(questions)).toBe(true);
      expect(questions.length).toBe(8);
      expect(questions[0].testType).toBe('emotion');
    });

    test('should have correct question structure for emotion test', () => {
      const questions = getQuestions('emotion');
      const firstQuestion = questions[0];

      expect(firstQuestion.id).toBe(1);
      expect(firstQuestion.text).toBe('最近一周，你感到快乐的时间有多少？');
      expect(firstQuestion.type).toBe('happiness');
      expect(firstQuestion.options).toHaveLength(5);
      expect(firstQuestion.weight).toHaveLength(5);
      expect(firstQuestion.weight).toEqual([1, 2, 3, 4, 5]);
    });

    test('should handle reverse scoring questions', () => {
      const questions = getQuestions('emotion');
      const anxietyQuestion = questions.find(q => q.type === 'anxiety');

      expect(anxietyQuestion.weight).toEqual([5, 4, 3, 2, 1]);
    });

    test('should handle multiple choice questions', () => {
      const questions = getQuestions('stress');
      const multipleChoiceQuestion = questions.find(q => q.isMultiple === true);

      expect(multipleChoiceQuestion).toBeDefined();
      expect(multipleChoiceQuestion.options).toBeInstanceOf(Array);
      expect(multipleChoiceQuestion.weight).toBeInstanceOf(Array);
    });
  });

  describe('getTestDescription', () => {
    test('should return correct description for emotion test', () => {
      const description = getTestDescription('emotion');

      expect(typeof description).toBe('string');
      expect(description.length).toBeGreaterThan(0);
    });

    test('should return correct description for stress test', () => {
      const description = getTestDescription('stress');

      expect(typeof description).toBe('string');
      expect(description).toContain('压力');
    });

    test('should return correct description for MBTI test', () => {
      const description = getTestDescription('mbti');

      expect(typeof description).toBe('string');
      expect(description).toContain('16型');
      expect(description).toContain('人格测试');
    });

    test('should return correct description for depression test', () => {
      const description = getTestDescription('depression');

      expect(typeof description).toBe('string');
      expect(description).toContain('抑郁');
      expect(description).toContain('筛查');
    });

    test('should return default description for unknown test type', () => {
      const description = getTestDescription('unknown');

      expect(description).toBe('心理评估测试');
    });
  });

  describe('getTestMetadata', () => {
    test('should return complete metadata for emotion test', () => {
      const metadata = getTestMetadata('emotion');

      expect(metadata).toHaveProperty('name');
      expect(metadata).toHaveProperty('description');
      expect(metadata).toHaveProperty('icon');
      expect(metadata).toHaveProperty('questionCount');
      expect(metadata).toHaveProperty('estimatedTime');
      expect(metadata).toHaveProperty('difficulty');
    });

    test('should return correct metadata for depression test', () => {
      const metadata = getTestMetadata('depression');

      expect(metadata.name).toBe('抑郁症筛查量表(PHQ-9)');
      expect(metadata.questionCount).toBe(9);
      expect(metadata.isClinical).toBe(true);
      expect(metadata.warningThreshold).toBe(10);
      expect(metadata.criticalThreshold).toBe(15);
    });

    test('should return correct metadata for anxiety test', () => {
      const metadata = getTestMetadata('anxiety');

      expect(metadata.name).toBe('焦虑症筛查量表(GAD-7)');
      expect(metadata.questionCount).toBe(7);
      expect(metadata.isClinical).toBe(true);
      expect(metadata.warningThreshold).toBe(5);
      expect(metadata.criticalThreshold).toBe(10);
    });

    test('should return default metadata for unknown test type', () => {
      const metadata = getTestMetadata('unknown');

      expect(metadata).toHaveProperty('name');
      expect(metadata.name).toBe('情绪地图测试');
    });
  });

  describe('getAllTestTypes', () => {
    test('should return all available test types', () => {
      const allTypes = getAllTestTypes();

      expect(Array.isArray(allTypes)).toBe(true);
      expect(allTypes.length).toBeGreaterThan(0);
      expect(allTypes[0]).toHaveProperty('id');
      expect(allTypes[0]).toHaveProperty('name');
      expect(allTypes[0]).toHaveProperty('description');
      expect(allTypes[0]).toHaveProperty('icon');
    });

    test('should include all expected test types', () => {
      const allTypes = getAllTestTypes();
      const typeIds = allTypes.map(t => t.id);

      expect(typeIds).toContain('emotion');
      expect(typeIds).toContain('stress');
      expect(typeIds).toContain('mbti');
      expect(typeIds).toContain('enneagram');
      expect(typeIds).toContain('sleep');
      expect(typeIds).toContain('depression');
      expect(typeIds).toContain('anxiety');
      expect(typeIds).toContain('self_esteem');
    });
  });

  describe('analyzeMBTI', () => {
    test('should calculate MBTI dimensions correctly', () => {
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

      const result = analyzeMBTI(answers);

      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('dimensions');
      expect(result).toHaveProperty('details');
      expect(result).toHaveProperty('scores');
      expect(result.type).toMatch(/^[E|I][S|N][T|F][J|P]$/);
    });

    test('should determine E vs I correctly', () => {
      const extrovertAnswers = { 1: 0, 2: 0 };
      const introvertAnswers = { 1: 3, 2: 3 };

      const extrovertResult = analyzeMBTI(extrovertAnswers);
      const introvertResult = analyzeMBTI(introvertAnswers);

      expect(extrovertResult.type[0]).toBe('E');
      expect(introvertResult.type[0]).toBe('I');
    });

    test('should determine S vs N correctly', () => {
      const sensingAnswers = { 3: 0, 4: 0, 9: 0 };
      const intuitiveAnswers = { 3: 3, 4: 3, 9: 3 };

      const sensingResult = analyzeMBTI(sensingAnswers);
      const intuitiveResult = analyzeMBTI(intuitiveAnswers);

      expect(sensingResult.type[1]).toBe('S');
      expect(intuitiveResult.type[1]).toBe('N');
    });

    test('should determine T vs F correctly', () => {
      const thinkingAnswers = { 5: 0, 6: 0, 10: 0 };
      const feelingAnswers = { 5: 3, 6: 3, 10: 3 };

      const thinkingResult = analyzeMBTI(thinkingAnswers);
      const feelingResult = analyzeMBTI(feelingAnswers);

      expect(thinkingResult.type[2]).toBe('T');
      expect(feelingResult.type[2]).toBe('F');
    });

    test('should determine J vs P correctly', () => {
      const judgingAnswers = { 7: 0, 8: 0 };
      const perceivingAnswers = { 7: 3, 8: 3 };

      const judgingResult = analyzeMBTI(judgingAnswers);
      const perceivingResult = analyzeMBTI(perceivingAnswers);

      expect(judgingResult.type[3]).toBe('J');
      expect(perceivingResult.type[3]).toBe('P');
    });

    test('should return MBTI details', () => {
      const answers = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 };
      const result = analyzeMBTI(answers);

      expect(result.details).toHaveProperty('name');
      expect(result.details).toHaveProperty('description');
      expect(result.details).toHaveProperty('strengths');
      expect(result.details).toHaveProperty('weaknesses');
      expect(result.details).toHaveProperty('careers');
      expect(result.details).toHaveProperty('famous');
    });

    test('should return dimension scores', () => {
      const answers = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 };
      const result = analyzeMBTI(answers);

      expect(result.scores).toHaveProperty('EI');
      expect(result.scores).toHaveProperty('SN');
      expect(result.scores).toHaveProperty('TF');
      expect(result.scores).toHaveProperty('JP');
      expect(result.scores.EI).toHaveProperty('E');
      expect(result.scores.EI).toHaveProperty('I');
    });
  });

  describe('analyzeEnneagram', () => {
    test('should calculate enneagram type correctly', () => {
      const answers = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 };

      const result = analyzeEnneagram(answers);

      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('typeName');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('scores');
      expect(result.type).toBeGreaterThanOrEqual(1);
      expect(result.type).toBeLessThanOrEqual(9);
    });

    test('should return correct type name for each type', () => {
      const type1Result = analyzeEnneagram({ 1: 0 });
      const type5Result = analyzeEnneagram({ 1: 4 });
      const type9Result = analyzeEnneagram({ 1: 8 });

      expect(type1Result.typeName).toBe('完美主义者');
      expect(type5Result.typeName).toBe('探索者');
      expect(type9Result.typeName).toBe('和平缔造者');
    });

    test('should return enneagram scores', () => {
      const answers = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 };
      const result = analyzeEnneagram(answers);

      expect(result.scores).toBeInstanceOf(Array);
      expect(result.scores).toHaveLength(9);
    });

    test('should calculate wing type', () => {
      const answers = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 };
      const result = analyzeEnneagram(answers);

      expect(result).toHaveProperty('wing');
      expect(result.wing).toBeGreaterThanOrEqual(1);
      expect(result.wing).toBeLessThanOrEqual(9);
    });

    test('should calculate health level', () => {
      const answers = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      const result = analyzeEnneagram(answers);

      expect(result).toHaveProperty('healthLevel');
      expect(['健康', '一般', '不健康']).toContain(result.healthLevel);
    });

    test('should return complete enneagram analysis', () => {
      const answers = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 };
      const result = analyzeEnneagram(answers);

      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('typeName');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('scores');
      expect(result).toHaveProperty('wing');
      expect(result).toHaveProperty('healthLevel');
    });
  });
});