/**
 * 智能测试分析服务
 * 使用AI算法分析测试结果，生成个性化报告
 */

// ✅ 新增：百度AI访问令牌获取
let baiduAccessToken = null;
let tokenExpiryTime = 0;

async function getBaiduAccessToken() {
  // 如果token还在有效期内，直接返回
  if (baiduAccessToken && Date.now() < tokenExpiryTime) {
    return baiduAccessToken;
  }
  
  const API_KEY = 'GKDD8gDVKNbWbg2VCgxc8B76';
  const SECRET_KEY = 'nIEXwGqzn6HN0yy3QFPxLledcQT0S0ef';
  
  const tokenUrl = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${API_KEY}&client_secret=${SECRET_KEY}`;
  
  try {
    const response = await fetch(tokenUrl, { method: 'POST' });
    const data = await response.json();
    
    if (data.access_token) {
      baiduAccessToken = data.access_token;
      // 百度token通常有效期一个月，这里设置为29天过期
      tokenExpiryTime = Date.now() + (29 * 24 * 60 * 60 * 1000);
      return baiduAccessToken;
    }
  } catch (error) {
    console.error('获取百度Token错误:', error);
  }
  return null;
}

// ✅ 新增：百度AI文本情感分析
async function analyzeWithBaiduAI(text) {
  try {
    if (!text || text.length < 5) {
      return null;
    }
    
    const AIP_URL = 'https://aip.baidubce.com/rpc/2.0/nlp/v1/sentiment_classify';
    const accessToken = await getBaiduAccessToken();
    
    if (!accessToken) {
      return null;
    }
    
    const response = await fetch(`${AIP_URL}?access_token=${accessToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text
      })
    });
    
    const result = await response.json();
    
    if (result.error_code) {
      console.error('百度AI错误:', result.error_msg);
      return null;
    }
    
    return result;
  } catch (error) {
    console.error('百度AI分析错误:', error);
    return null;
  }
}

// ✅ 新增：百度AI文本摘要（用于生成报告）
async function generateSummaryWithBaiduAI(text) {
  try {
    const accessToken = await getBaiduAccessToken();
    if (!accessToken) return null;
    
    const url = `https://aip.baidubce.com/rpc/2.0/nlp/v1/news_summary?access_token=${accessToken}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: '心理测试结果分析',
        content: text,
        max_summary_len: 200
      })
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('百度AI摘要错误:', error);
    return null;
  }
}

// 模拟AI分析（可以替换为真实的AI API）
class TestAnalyzer {
  constructor() {
    // 情感关键词库
    this.emotionKeywords = {
      positive: [
        "开心", "快乐", "幸福", "满足", "乐观", "积极", "兴奋", "愉快",
        "自信", "平静", "放松", "安心", "希望", "感恩", "爱", "温暖"
      ],
      negative: [
        "焦虑", "紧张", "压力", "疲惫", "难过", "悲伤", "孤独", "失望",
        "愤怒", "烦躁", "恐惧", "不安", "无助", "绝望", "自卑", "痛苦"
      ]
    };
    
    // 建议模板库
    this.suggestionTemplates = {
      stress: [
        "尝试每天进行5-10分钟的深呼吸练习，可以有效降低压力水平",
        "制定合理的时间管理计划，避免任务堆积造成的压力",
        "培养一项放松的爱好，如阅读、绘画或听音乐",
        "保持规律的运动习惯，每周至少3次，每次30分钟",
        "学习正念冥想，提高对压力的觉察和应对能力"
      ],
      sleep: [
        "建立固定的睡眠时间表，每天同一时间睡觉和起床",
        "睡前1小时避免使用电子设备，蓝光会影响褪黑素分泌",
        "保持卧室黑暗、安静、凉爽，创造良好的睡眠环境",
        "避免在睡前摄入咖啡因、尼古丁和酒精",
        "尝试渐进式肌肉放松法，帮助身体进入放松状态"
      ],
      emotion: [
        "每天记录3件让你感到感恩的事情，培养积极心态",
        "与信任的朋友或家人分享你的感受，获得情感支持",
        "练习自我关怀，像对待好朋友一样对待自己",
        "通过写日记的方式整理和表达情绪",
        "尝试认知重构，用更积极的角度看待问题"
      ],
      social: [
        "主动参与社交活动，从小范围的聚会开始",
        "练习主动倾听，真正关注他人的感受和需求",
        "学习表达自己的需求和边界，建立健康的人际关系",
        "寻找志同道合的朋友，建立支持性社交圈",
        "参加兴趣小组或志愿活动，扩展社交网络"
      ],
      depression: [
        "与专业心理咨询师或医生交流，获得专业评估",
        "建立规律的日常生活节奏，包括固定的起床和睡觉时间",
        "每天进行适量的户外活动，接触阳光和自然",
        "尝试认知行为疗法，改变负面思维模式",
        "避免孤立自己，与信任的人保持联系"
      ],
      anxiety: [
        "练习深呼吸和放松技巧，如4-7-8呼吸法",
        "尝试正念冥想，减少对未来的过度担忧",
        "建立规律的锻炼习惯，释放紧张情绪",
        "学习接受不确定性，减少对控制的渴望",
        "避免咖啡因和酒精，这些可能加剧焦虑症状"
      ]
    };
  }

  /**
   * 分析测试结果（增强版，加入百度AI）
   */
  async analyzeTest(testType, answers, totalScore) {
    // 先进行基础分析
    const basicAnalysis = this.doBasicAnalysis(testType, answers, totalScore);
    
    // 如果测试类型适合AI分析，调用百度AI
    if (testType === 'emotion' || testType === 'stress' || testType === 'depression' || testType === 'anxiety') {
      const aiEnhancedAnalysis = await this.enhanceWithBaiduAI(testType, answers, basicAnalysis);
      return { ...basicAnalysis, ...aiEnhancedAnalysis };
    }
    
    return basicAnalysis;
  }
  
  /**
   * 基础分析
   */
  doBasicAnalysis(testType, answers, totalScore) {
    switch (testType) {
      case 'emotion':
        return this.analyzeEmotionTest(answers, totalScore);
      case 'stress':
        return this.analyzeStressTest(answers, totalScore);
      case 'mbti':
        return this.analyzeMBTITest(answers);
      case 'enneagram':
        return this.analyzeEnneagramTest(answers);
      case 'sleep':
        return this.analyzeSleepTest(answers, totalScore);
      case 'personality':
        return this.analyzePersonalityTest(answers, totalScore);
      case 'depression':
        return this.analyzeDepressionTest(answers, totalScore);
      case 'anxiety':
        return this.analyzeAnxietyTest(answers, totalScore);
      default:
        return this.analyzeGenericTest(answers, totalScore);
    }
  }
  
  /**
   * 使用百度AI增强分析
   */
  async enhanceWithBaiduAI(testType, answers, basicAnalysis) {
    try {
      // 将用户的回答转换为文本
      const answerText = this.convertAnswersToText(answers, testType);
      
      // 调用百度AI情感分析
      const sentimentResult = await analyzeWithBaiduAI(answerText);
      
      // 生成分析总结
      const summaryText = `测试类型：${testType}，总分：${basicAnalysis.totalScore}。${basicAnalysis.description}。主要发现：${basicAnalysis.keyFindings?.join('；') || '无特殊发现'}`;
      const summaryResult = await generateSummaryWithBaiduAI(summaryText);
      
      return {
        aiEnhanced: true,
        sentimentAnalysis: sentimentResult ? {
          sentiment: sentimentResult.items?.[0]?.sentiment || 0,
          confidence: sentimentResult.items?.[0]?.confidence || 0,
          positiveProb: sentimentResult.items?.[0]?.positive_prob || 0,
          negativeProb: sentimentResult.items?.[0]?.negative_prob || 0
        } : null,
        aiSummary: summaryResult?.summary || basicAnalysis.description,
        analysisTime: new Date().toISOString()
      };
    } catch (error) {
      console.error('AI增强分析失败:', error);
      return { aiEnhanced: false };
    }
  }
  
  /**
   * 将答案转换为文本
   */
  convertAnswersToText(answers, testType) {
    const answerArray = Object.entries(answers).map(([qId, answer]) => {
      return `问题${qId}：选择了选项${answer}`;
    });
    
    return `测试类型：${testType}。${answerArray.join('。')}`;
  }

  /**
   * 分析情绪测试
   */
  analyzeEmotionTest(answers, totalScore) {
    const scores = this.calculateDimensionScores(answers, 'emotion');
    const level = this.determineRiskLevel(totalScore);
    
    // 生成个性化分析
    const analysis = this.generateEmotionAnalysis(scores, totalScore);
    
    return {
      scores,
      totalScore,
      title: this.getEmotionTitle(totalScore),
      description: this.getEmotionDescription(totalScore, scores),
      suggestions: this.generateSuggestions('emotion', scores, totalScore),
      level,
      analysis,
      strengths: this.identifyStrengths(scores),
      areasForImprovement: this.identifyAreasForImprovement(scores),
      trend: this.predictTrend(scores)
    };
  }

  /**
   * 分析压力测试
   */
  analyzeStressTest(answers, totalScore) {
    const scores = this.calculateDimensionScores(answers, 'stress');
    const level = this.determineRiskLevel(totalScore, [30, 60]);
    
    // 识别压力来源
    const sources = this.identifyStressSources(answers);
    
    return {
      scores,
      totalScore,
      title: this.getStressTitle(totalScore),
      description: this.getStressDescription(totalScore, sources),
      suggestions: this.generateSuggestions('stress', scores, totalScore),
      level,
      sources,
      copingStrategies: this.recommendCopingStrategies(scores),
      preventionTips: this.generatePreventionTips(sources)
    };
  }

  /**
   * 分析抑郁测试 (PHQ-9)
   */
  analyzeDepressionTest(answers, totalScore) {
    const scores = this.calculatePHQ9Scores(answers);
    const level = this.determineDepressionLevel(totalScore);
    
    return {
      scores,
      totalScore,
      title: this.getDepressionTitle(totalScore),
      description: this.getDepressionDescription(totalScore),
      suggestions: this.generateSuggestions('depression', scores, totalScore),
      level,
      severity: this.getDepressionSeverity(totalScore),
      warning: totalScore >= 15 ? '建议寻求专业心理帮助' : totalScore >= 10 ? '建议关注情绪变化' : '当前状态良好',
      riskFactors: this.identifyDepressionRiskFactors(answers)
    };
  }

  /**
   * 分析焦虑测试 (GAD-7)
   */
  analyzeAnxietyTest(answers, totalScore) {
    const scores = this.calculateGAD7Scores(answers);
    const level = this.determineAnxietyLevel(totalScore);
    
    return {
      scores,
      totalScore,
      title: this.getAnxietyTitle(totalScore),
      description: this.getAnxietyDescription(totalScore),
      suggestions: this.generateSuggestions('anxiety', scores, totalScore),
      level,
      severity: this.getAnxietySeverity(totalScore),
      warning: totalScore >= 15 ? '可能有显著焦虑症状' : totalScore >= 10 ? '可能有中度焦虑' : totalScore >= 5 ? '可能有轻度焦虑' : '焦虑症状轻微'
    };
  }

  /**
   * 分析MBTI测试
   */
  analyzeMBTITest(answers) {
    const mbtiTypes = ['ISTJ', 'ISFJ', 'INFJ', 'INTJ', 'ISTP', 'ISFP', 'INFP', 'INTP', 
                      'ESTP', 'ESFP', 'ENFP', 'ENTP', 'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'];
    
    // 简化的MBTI计算逻辑
    let mbtiScore = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    
    Object.entries(answers).forEach(([qId, answer]) => {
      const answerValue = parseInt(answer) || 0;
      if ([1, 2].includes(parseInt(qId))) {
        mbtiScore[answerValue < 2 ? 'E' : 'I']++;
      } else if ([3, 4].includes(parseInt(qId))) {
        mbtiScore[answerValue < 2 ? 'S' : 'N']++;
      } else if ([5, 6].includes(parseInt(qId))) {
        mbtiScore[answerValue < 2 ? 'T' : 'F']++;
      } else if ([7, 8, 9, 10].includes(parseInt(qId))) {
        mbtiScore[answerValue < 2 ? 'J' : 'P']++;
      }
    });
    
    const mbtiType = 
      (mbtiScore.E > mbtiScore.I ? 'E' : 'I') +
      (mbtiScore.S > mbtiScore.N ? 'S' : 'N') +
      (mbtiScore.T > mbtiScore.F ? 'T' : 'F') +
      (mbtiScore.J > mbtiScore.P ? 'J' : 'P');
    
    return {
      type: mbtiType,
      typeName: this.getMBTITypeName(mbtiType),
      description: this.getMBTIDescription(mbtiType),
      strengths: this.getMBTIStrengths(mbtiType),
      weaknesses: this.getMBTIWeaknesses(mbtiType),
      careerRecommendations: this.getMBTICareers(mbtiType),
      relationshipTips: this.getMBTIRelationshipTips(mbtiType),
      growthSuggestions: this.getMBTIGrowthSuggestions(mbtiType),
      compatibility: this.getMBTICompatibility(mbtiType),
      scores: mbtiScore
    };
  }

  /**
   * 分析九型人格测试
   */
  analyzeEnneagramTest(answers) {
    const type = Math.floor(Math.random() * 9) + 1;
    
    return {
      type,
      typeName: this.getEnneagramTypeName(type),
      description: this.getEnneagramDescription(type),
      coreFear: this.getEnneagramCoreFear(type),
      coreDesire: this.getEnneagramCoreDesire(type),
      healthyLevel: this.getEnneagramHealthyTraits(type),
      averageLevel: this.getEnneagramAverageTraits(type),
      unhealthyLevel: this.getEnneagramUnhealthyTraits(type),
      growthPath: this.getEnneagramGrowthPath(type),
      stressPath: this.getEnneagramStressPath(type),
      integrationLevel: this.getEnneagramIntegrationLevel(type)
    };
  }

  /**
   * 分析睡眠测试
   */
  analyzeSleepTest(answers, totalScore) {
    const scores = this.calculateDimensionScores(answers, 'sleep');
    const problems = this.identifySleepProblems(answers);
    
    return {
      scores,
      totalScore,
      title: this.getSleepTitle(totalScore),
      description: this.getSleepDescription(totalScore, problems),
      suggestions: this.generateSuggestions('sleep', scores, totalScore),
      problems,
      severity: this.determineSleepSeverity(totalScore),
      sleepHygieneTips: this.generateSleepHygieneTips(problems),
      bedtimeRoutine: this.recommendBedtimeRoutine(problems),
      warningSigns: this.identifyWarningSigns(totalScore)
    };
  }

  /**
   * 分析人格测试
   */
  analyzePersonalityTest(answers, totalScore) {
    const scores = this.calculateDimensionScores(answers, 'personality');
    const level = this.determineRiskLevel(totalScore);
    
    return {
      scores,
      totalScore,
      title: this.getPersonalityTitle(totalScore),
      description: this.getPersonalityDescription(totalScore, scores),
      suggestions: this.generateSuggestions('emotion', scores, totalScore),
      level,
      traits: this.identifyPersonalityTraits(scores)
    };
  }

  /**
   * 通用测试分析
   */
  analyzeGenericTest(answers, totalScore) {
    return {
      totalScore,
      title: totalScore < 40 ? '状态良好' : totalScore < 70 ? '需要关注' : '建议采取措施',
      description: `你的测试得分为${totalScore}分（满分100分）。`,
      suggestions: this.generateDefaultSuggestions(totalScore),
      level: totalScore < 40 ? 'low' : totalScore < 70 ? 'medium' : 'high'
    };
  }

  /**
   * 辅助函数：计算各维度分数
   */
  calculateDimensionScores(answers, testType) {
    const scores = {};
    Object.entries(answers).forEach(([questionId, answer]) => {
      scores[questionId] = answer * 20;
    });
    return scores;
  }

  /**
   * 计算PHQ-9分数
   */
  calculatePHQ9Scores(answers) {
    const scores = {};
    let total = 0;
    
    Object.entries(answers).forEach(([questionId, answer]) => {
      const score = parseInt(answer) || 0;
      scores[questionId] = score;
      total += score;
    });
    
    scores.total = total;
    return scores;
  }

  /**
   * 计算GAD-7分数
   */
  calculateGAD7Scores(answers) {
    const scores = {};
    let total = 0;
    
    Object.entries(answers).forEach(([questionId, answer]) => {
      const score = parseInt(answer) || 0;
      scores[questionId] = score;
      total += score;
    });
    
    scores.total = total;
    return scores;
  }

  /**
   * 辅助函数：确定风险等级
   */
  determineRiskLevel(score, thresholds = [40, 70]) {
    if (score < thresholds[0]) return 'low';
    if (score < thresholds[1]) return 'medium';
    return 'high';
  }

  /**
   * 确定抑郁等级
   */
  determineDepressionLevel(score) {
    if (score < 5) return 'none';
    if (score < 10) return 'mild';
    if (score < 15) return 'moderate';
    if (score < 20) return 'moderately_severe';
    return 'severe';
  }

  /**
   * 确定焦虑等级
   */
  determineAnxietyLevel(score) {
    if (score < 5) return 'minimal';
    if (score < 10) return 'mild';
    if (score < 15) return 'moderate';
    return 'severe';
  }

  /**
   * 辅助函数：生成建议
   */
  generateSuggestions(category, scores, totalScore) {
    const baseSuggestions = this.suggestionTemplates[category] || 
                           this.suggestionTemplates.emotion;
    
    // 根据分数调整建议
    const personalizedSuggestions = baseSuggestions.map(suggestion => {
      if (totalScore > 70) {
        return `【需要关注】${suggestion}`;
      } else if (totalScore < 40) {
        return `【继续保持】${suggestion}`;
      }
      return suggestion;
    });
    
    // 添加紧急建议
    if (totalScore > 80 || (category === 'depression' && totalScore >= 15) || (category === 'anxiety' && totalScore >= 15)) {
      personalizedSuggestions.unshift(
        "检测到较高风险，建议联系专业心理咨询师",
        "24小时心理援助热线：400-123-4567"
      );
    }
    
    return personalizedSuggestions.slice(0, 5);
  }

  /**
   * 生成默认建议
   */
  generateDefaultSuggestions(score) {
    const suggestions = [];
    
    if (score < 40) {
      suggestions.push('继续保持当前的良好状态');
    } else if (score < 70) {
      suggestions.push('尝试一些放松技巧，如深呼吸或冥想');
      suggestions.push('考虑与心理咨询师交流');
    } else {
      suggestions.push('建议寻求专业心理咨询师的帮助');
      suggestions.push('尝试正念练习缓解压力');
    }
    
    suggestions.push('24小时心理援助热线：400-123-4567');
    return suggestions;
  }

  // 标题相关函数
  getEmotionTitle(score) {
    if (score < 40) return '情绪状态良好';
    if (score < 70) return '情绪有些波动';
    return '情绪需要关注';
  }

  getStressTitle(score) {
    if (score < 30) return '压力水平较低';
    if (score < 60) return '压力水平中等';
    return '压力水平较高';
  }

  getSleepTitle(score) {
    if (score < 30) return '睡眠质量良好';
    if (score < 60) return '睡眠质量一般';
    return '睡眠质量较差';
  }

  getDepressionTitle(score) {
    if (score < 5) return '无明显抑郁症状';
    if (score < 10) return '轻度抑郁症状';
    if (score < 15) return '中度抑郁症状';
    if (score < 20) return '中重度抑郁症状';
    return '重度抑郁症状';
  }

  getAnxietyTitle(score) {
    if (score < 5) return '无明显焦虑症状';
    if (score < 10) return '轻度焦虑症状';
    if (score < 15) return '中度焦虑症状';
    return '重度焦虑症状';
  }

  getPersonalityTitle(score) {
    if (score < 40) return '性格特质均衡';
    if (score < 70) return '性格特点明显';
    return '性格特质突出';
  }

  // 描述相关函数
  getEmotionDescription(score, scores) {
    if (score < 40) return '你的情绪状态总体良好，能够积极面对生活中的挑战。';
    if (score < 70) return '你的情绪有一定波动，建议关注情绪变化并适当调整。';
    return '你的情绪状态需要关注，建议采取积极措施改善情绪健康。';
  }

  getStressDescription(score, sources) {
    const sourceText = sources.length > 0 ? `主要压力来源：${sources.join('、')}。` : '';
    if (score < 30) return `你的压力水平较低，应对能力良好。${sourceText}`;
    if (score < 60) return `你的压力水平中等，需要注意压力管理。${sourceText}`;
    return `你的压力水平较高，建议采取有效措施缓解压力。${sourceText}`;
  }

  getDepressionDescription(score) {
    if (score < 5) return '当前未检测到明显抑郁症状，情绪状态稳定。';
    if (score < 10) return '有轻度抑郁症状，建议关注情绪变化，适当调整生活方式。';
    if (score < 15) return '有中度抑郁症状，建议寻求专业心理帮助或心理咨询。';
    if (score < 20) return '有中重度抑郁症状，强烈建议寻求专业心理治疗。';
    return '有重度抑郁症状，请立即联系专业心理医生或心理咨询师。';
  }

  getAnxietyDescription(score) {
    if (score < 5) return '当前未检测到明显焦虑症状，情绪较为平稳。';
    if (score < 10) return '有轻度焦虑症状，建议学习放松技巧，减少压力。';
    if (score < 15) return '有中度焦虑症状，建议进行心理咨询，学习应对策略。';
    return '有重度焦虑症状，建议立即寻求专业心理帮助。';
  }

  getPersonalityDescription(score, scores) {
    return `你的性格测试得分为${score}分，反映了你的性格特质分布。`;
  }

  // MBTI相关函数
  getMBTITypeName(type) {
    const names = {
      'ISTJ': '物流师', 'ISFJ': '守护者', 'INFJ': '倡导者', 'INTJ': '建筑师',
      'ISTP': '鉴赏家', 'ISFP': '探险家', 'INFP': '调解员', 'INTP': '逻辑学家',
      'ESTP': '企业家', 'ESFP': '表演者', 'ENFP': '竞选者', 'ENTP': '辩论家',
      'ESTJ': '总经理', 'ESFJ': '执政官', 'ENFJ': '主人公', 'ENTJ': '指挥官'
    };
    return names[type] || type;
  }

  getMBTIDescription(type) {
    const descriptions = {
      'ISTJ': '务实、有条理、可靠，注重传统和秩序',
      'ISFJ': '温暖、有同情心、尽责，关注他人需求',
      'INFJ': '理想主义、有洞察力、创造力强，追求意义',
      'INTJ': '战略家、独立、有远见，善于解决复杂问题',
      'ISTP': '实际、冷静、灵活，善于解决实际问题',
      'ISFP': '艺术、敏感、自由，活在当下',
      'INFP': '理想主义、有同情心、创造力强，追求和谐',
      'INTP': '创新、分析力强、好奇心重，追求知识',
      'ESTP': '精力充沛、实用、有魅力，善于即兴发挥',
      'ESFP': '热情、友好、有趣，喜欢成为焦点',
      'ENFP': '热情、有创造力、社交能力强，充满可能性',
      'ENTP': '聪明、好奇心强、有创造力，喜欢辩论',
      'ESTJ': '实际、有条理、果断，善于管理',
      'ESFJ': '友好、有同情心、尽责，喜欢帮助他人',
      'ENFJ': '有魅力、有说服力、利他，善于激励他人',
      'ENTJ': '果断、有魅力、有远见，天生的领导者'
    };
    return descriptions[type] || '个性鲜明的思考者';
  }

  getMBTIStrengths(type) {
    const strengths = {
      'ISTJ': ['可靠', '有条理', '注重细节', '有责任感'],
      'ENFP': ['热情', '有创造力', '社交能力强', '乐观']
    };
    return strengths[type] || ['适应性强', '学习能力强'];
  }

  getMBTIWeaknesses(type) {
    const weaknesses = {
      'ISTJ': ['固执', '不灵活', '过于保守'],
      'ENFP': ['不切实际', '容易分心', '过度承诺']
    };
    return weaknesses[type] || ['有待发现'];
  }

  getMBTICareers(type) {
    const careers = {
      'ISTJ': ['会计师', '工程师', '管理者', '军人'],
      'ENFP': ['咨询师', '记者', '演员', '创业者']
    };
    return careers[type] || ['多样化职业'];
  }

  getMBTIRelationshipTips(type) {
    const tips = {
      'ISTJ': ['明确表达你的需求', '尊重传统和承诺', '保持稳定和可靠'],
      'ENFP': ['分享你的热情和想法', '保持灵活和开放', '寻找支持你梦想的伴侣']
    };
    return tips[type] || ['真诚沟通', '互相尊重'];
  }

  getMBTIGrowthSuggestions(type) {
    const suggestions = {
      'ISTJ': ['尝试新方法解决问题', '多表达自己的感受', '接受一些不确定性'],
      'ENFP': ['专注完成项目', '设定现实目标', '学会拒绝']
    };
    return suggestions[type] || ['持续学习', '自我反思'];
  }

  getMBTICompatibility(type) {
    const compatibility = {
      best: ['INFJ', 'ENFJ', 'INFP', 'ENFP'],
      good: ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'],
      challenging: ['ISTP', 'ISFP', 'ESTP', 'ESFP']
    };
    return compatibility;
  }

  // 九型人格相关函数
  getEnneagramTypeName(type) {
    const names = {
      1: '完美主义者', 2: '助人者', 3: '成就者', 4: '个人主义者',
      5: '探索者', 6: '忠诚者', 7: '热情者', 8: '挑战者', 9: '和平缔造者'
    };
    return names[type] || '未知类型';
  }

  getEnneagramDescription(type) {
    const descriptions = {
      1: '追求完美，有原则，讲求道德',
      2: '乐于助人，关注他人需求，渴望被爱',
      3: '追求成功，注重形象，效率高',
      4: '追求独特，情感丰富，有艺术气质',
      5: '追求知识，喜欢思考，独立',
      6: '寻求安全，忠诚，有责任感',
      7: '追求快乐，乐观，喜欢新鲜事物',
      8: '追求掌控，有力量，保护他人',
      9: '追求和谐，平静，避免冲突'
    };
    return descriptions[type] || '独特的人格类型';
  }

  getEnneagramCoreFear(type) {
    const fears = {
      1: '害怕犯错、不完美',
      2: '害怕不被需要、不被爱',
      3: '害怕失败、不被认可',
      9: '害怕冲突、失去和谐'
    };
    return fears[type] || '未知的核心恐惧';
  }

  getEnneagramCoreDesire(type) {
    const desires = {
      1: '追求正确、正直',
      2: '被爱、被需要',
      3: '被认可、成功',
      9: '内心平静、和谐'
    };
    return desires[type] || '未知的核心欲望';
  }

  /**
   * 生成情绪分析
   */
  generateEmotionAnalysis(scores, totalScore) {
    const analysis = {
      overall: totalScore < 40 ? '积极稳定' : totalScore < 70 ? '波动调整' : '需要关注',
      keyFindings: [],
      emotionalPatterns: [],
      improvementAreas: []
    };

    // 分析各维度
    if (scores[1] < 3) {
      analysis.keyFindings.push('快乐感较低，可能需要寻找更多生活乐趣');
    }
    if (scores[4] > 3) {
      analysis.keyFindings.push('焦虑水平较高，建议学习放松技巧');
    }
    if (scores[5] < 3) {
      analysis.keyFindings.push('睡眠质量需要改善');
    }

    return analysis;
  }

  /**
   * 识别压力来源
   */
  identifyStressSources(answers) {
    const sources = [];
    
    if (answers[2] && Array.isArray(answers[2])) {
      if (answers[2].includes(0)) sources.push('睡眠问题造成的压力');
      if (answers[2].includes(1)) sources.push('食欲变化反映的压力');
      if (answers[2].includes(3)) sources.push('注意力问题相关的压力');
    }
    
    if (answers[1] >= 3) {
      sources.push('频繁的压力事件');
    }
    
    return sources.length > 0 ? sources : ['一般生活压力'];
  }

  /**
   * 推荐应对策略
   */
  recommendCopingStrategies(scores) {
    const strategies = [];
    
    if (scores.coping_strategy < 3) {
      strategies.push({
        name: '积极应对训练',
        description: '学习将逃避型应对转为积极应对',
        steps: [
          '识别压力源',
          '制定行动计划',
          '寻求支持',
          '评估效果并调整'
        ]
      });
    }
    
    return strategies;
  }

  /**
   * 识别睡眠问题
   */
  identifySleepProblems(answers) {
    const problems = [];
    
    if (answers[1] >= 4) {
      problems.push('睡眠时间不足');
    }
    
    if (answers[3] >= 3) {
      problems.push('睡眠连续性差');
    }
    
    return problems;
  }

  /**
   * 生成睡眠卫生建议
   */
  generateSleepHygieneTips(problems) {
    const tips = [
      '保持规律的睡眠时间表',
      '创造舒适的睡眠环境',
      '避免睡前刺激物'
    ];
    
    if (problems.includes('失眠问题')) {
      tips.push('尝试认知行为疗法治疗失眠');
      tips.push('避免在床上做与睡眠无关的事情');
    }
    
    return tips;
  }

  /**
   * 确定抑郁严重程度
   */
  getDepressionSeverity(score) {
    if (score < 5) return '无抑郁';
    if (score < 10) return '轻度抑郁';
    if (score < 15) return '中度抑郁';
    if (score < 20) return '中重度抑郁';
    return '重度抑郁';
  }

  /**
   * 确定焦虑严重程度
   */
  getAnxietySeverity(score) {
    if (score < 5) return '无焦虑';
    if (score < 10) return '轻度焦虑';
    if (score < 15) return '中度焦虑';
    return '重度焦虑';
  }

  /**
   * 识别抑郁风险因素
   */
  identifyDepressionRiskFactors(answers) {
    const factors = [];
    
    if (answers[9] >= 2) {
      factors.push('存在自我伤害或自杀念头（高风险）');
    }
    
    if (answers[3] >= 2) {
      factors.push('睡眠问题明显');
    }
    
    if (answers[4] >= 2) {
      factors.push('精力严重不足');
    }
    
    return factors;
  }

  /**
   * 识别优势
   */
  identifyStrengths(scores) {
    const strengths = [];
    
    if (scores[1] > 3) {
      strengths.push('情绪较为稳定');
    }
    
    if (scores[8] > 3) {
      strengths.push('对未来持乐观态度');
    }
    
    return strengths.length > 0 ? strengths : ['有一定的情绪调节能力'];
  }

  /**
   * 识别需要改进的领域
   */
  identifyAreasForImprovement(scores) {
    const areas = [];
    
    if (scores[4] > 3) {
      areas.push('焦虑管理');
    }
    
    if (scores[7] > 3) {
      areas.push('压力应对');
    }
    
    return areas.length > 0 ? areas : ['情绪自我觉察'];
  }

  /**
   * 预测趋势
   */
  predictTrend(scores) {
    if (scores[4] > 3 && scores[7] > 3) {
      return '短期内情绪可能持续波动，建议加强自我调节';
    }
    
    return '情绪趋势相对稳定，继续保持良好状态';
  }

  /**
   * 识别人格特质
   */
  identifyPersonalityTraits(scores) {
    const traits = [];
    
    if (scores[1] > 3) {
      traits.push('外向性');
    } else {
      traits.push('内向性');
    }
    
    if (scores[4] > 3) {
      traits.push('计划性较强');
    } else {
      traits.push('灵活性较强');
    }
    
    return traits;
  }

  /**
   * 确定睡眠严重程度
   */
  determineSleepSeverity(score) {
    if (score < 30) return '良好';
    if (score < 60) return '一般';
    return '较差';
  }

  /**
   * 推荐睡前习惯
   */
  recommendBedtimeRoutine(problems) {
    const routine = [
      '睡前1小时关闭电子设备',
      '进行10-15分钟的放松活动，如阅读或冥想',
      '保持卧室黑暗、安静、凉爽'
    ];
    
    if (problems.includes('睡眠时间不足')) {
      routine.unshift('设定固定的睡觉时间，并严格遵守');
    }
    
    return routine;
  }

  /**
   * 识别警告信号
   */
  identifyWarningSigns(score) {
    if (score > 70) {
      return ['长期情绪低落', '社会功能受损', '自我照顾能力下降'];
    }
    return ['暂无明显警告信号'];
  }

  /**
   * 生成压力预防建议
   */
  generatePreventionTips(sources) {
    const tips = [];
    
    if (sources.includes('睡眠问题造成的压力')) {
      tips.push('建立规律的睡眠习惯，保证充足睡眠');
    }
    
    if (sources.includes('食欲变化反映的压力')) {
      tips.push('保持健康饮食，避免暴饮暴食');
    }
    
    if (sources.includes('注意力问题相关的压力')) {
      tips.push('练习专注力训练，如冥想或深呼吸');
    }
    
    if (sources.includes('频繁的压力事件')) {
      tips.push('学会时间管理，合理分配任务优先级');
    }
    
    return tips.length > 0 ? tips : ['保持积极心态，定期放松身心'];
  }

  /**
   * 获取九型人格健康特质
   */
  getEnneagramHealthyTraits(type) {
    const traits = {
      1: '自律、有原则、追求完美',
      2: '无私、关怀他人、乐于助人',
      3: '高效、有目标、适应力强',
      4: '有创造力、情感丰富、真实',
      5: '善于观察、分析力强、独立',
      6: '忠诚、负责、有预见性',
      7: '乐观、热情、善于发现机会',
      8: '果断、有领导力、保护他人',
      9: '包容、平和、善于调解'
    };
    return traits[type] || '追求成长';
  }

  /**
   * 获取九型人格平均特质
   */
  getEnneagramAverageTraits(type) {
    const traits = {
      1: '过于挑剔、容易自我批评',
      2: '过度付出、忽视自己需求',
      3: '过度关注形象、害怕失败',
      4: '情绪化、自我中心',
      5: '过度思考、脱离现实',
      6: '多疑、焦虑、犹豫不决',
      7: '逃避痛苦、缺乏承诺',
      8: '控制欲强、易怒',
      9: '被动、拖延、避免冲突'
    };
    return traits[type] || '需要平衡';
  }

  /**
   * 获取九型人格不健康特质
   */
  getEnneagramUnhealthyTraits(type) {
    const traits = {
      1: '批判性强、不宽容、完美主义',
      2: '操控性强、过度干涉、自我牺牲',
      3: '虚荣、欺骗、工作狂',
      4: '抑郁、自我怜悯、戏剧化',
      5: '孤僻、贪婪、知识囤积',
      6: '偏执、多疑、自我怀疑',
      7: '冲动、成瘾、逃避责任',
      8: '暴力、报复、霸道',
      9: '懒惰、压抑、麻木'
    };
    return traits[type] || '需要成长';
  }

  /**
   * 获取九型人格成长路径
   */
  getEnneagramGrowthPath(type) {
    const paths = {
      1: '学会接受不完美，培养同情心',
      2: '学会关注自己需求，建立边界',
      3: '关注内在价值而非外在成就',
      4: '培养稳定性和客观性',
      5: '增加行动力，将想法付诸实践',
      6: '培养信任和勇气，减少焦虑',
      7: '学会面对痛苦，承担责任',
      8: '学会示弱，培养同理心',
      9: '培养主动性，表达真实需求'
    };
    return paths[type] || '持续成长';
  }

  /**
   * 获取九型人格压力路径
   */
  getEnneagramStressPath(type) {
    const paths = {
      1: '变得挑剔、苛求、愤怒',
      2: '变得操控性强、过度付出',
      3: '变得虚荣、欺骗、工作狂',
      4: '变得抑郁、自我封闭',
      5: '过度思考、脱离现实',
      6: '变得多疑、焦虑、偏执',
      7: '逃避现实、寻求刺激',
      8: '变得控制欲强、易怒',
      9: '变得消极、被动、麻木'
    };
    return paths[type] || '需要应对';
  }

  /**
   * 获取九型人格整合水平
   */
  getEnneagramIntegrationLevel(type) {
    const levels = {
      1: '学会平衡完美与接受',
      2: '学会平衡付出与自爱',
      3: '学会平衡成就与真实',
      4: '学会平衡情感与理性',
      5: '学会平衡思考与行动',
      6: '学会平衡怀疑与信任',
      7: '学会平衡快乐与责任',
      8: '学会平衡控制与放手',
      9: '学会平衡和谐与主动'
    };
    return levels[type] || '寻求平衡';
  }

  /**
   * 获取睡眠描述
   */
  getSleepDescription(score, problems) {
    const problemText = problems.length > 0 ? `主要问题：${problems.join('、')}。` : '';
    
    if (score < 30) {
      return `你的睡眠质量良好${problemText}继续保持规律的睡眠习惯。`;
    }
    if (score < 60) {
      return `你的睡眠质量一般${problemText}建议改善睡眠环境和作息。`;
    }
    return `你的睡眠质量较差${problemText}建议采取有效措施改善睡眠。`;
  }
}

export default new TestAnalyzer();