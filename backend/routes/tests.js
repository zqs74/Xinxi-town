// backend/routes/tests.js

import express from 'express';
const router = express.Router();
import TestResult from '../models/TestResult.js';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

// ✅ 正确导入testAnalyzer
import testAnalyzer from '../services/testAnalyzer.js';
// 从testQuestions.js中导入基本函数
import { getQuestions, getTestDescription } from '../services/testQuestions.js';

// 获取测试问题 - 更新支持所有测试类型
router.get('/questions/:testType', async (req, res) => {
  try {
    const { testType } = req.params;
    
    // ✅ 更新：添加所有测试类型
    const validTestTypes = ['emotion', 'stress', 'sleep', 'personality', 'mbti', 'enneagram', 'depression', 'anxiety', 'self_esteem'];
    if (!validTestTypes.includes(testType)) {
      return res.status(400).json({
        success: false,
        error: '无效的测试类型',
        validTypes: validTestTypes
      });
    }
    
    const questions = getQuestions(testType);
    const description = getTestDescription(testType);
    
    res.json({
      success: true,
      data: questions,
      testType,
      description,
      questionCount: questions.length,
      estimatedTime: Math.ceil(questions.length * 0.5)
    });
  } catch (error) {
    console.error('获取测试问题错误:', error);
    res.status(500).json({ 
      success: false, 
      error: '获取测试问题失败'
    });
  }
});

// ✅ 完全重写：提交测试，真正使用testAnalyzer
router.post('/submit', authMiddleware, async (req, res) => {
  try {
    const { testType = 'emotion', answers, questions, startTime, endTime, duration, analysis: frontEndAnalysis } = req.body;
    const userId = req.user._id;
    
    console.log('收到测试提交:', { testType, answers, questions: questions?.length || 0, hasAnalysis: !!frontEndAnalysis, startTime, endTime, duration, userId });
    
    // 验证测试类型
    const validTestTypes = ['emotion', 'stress', 'sleep', 'personality', 'mbti', 'enneagram', 'depression', 'anxiety', 'self_esteem'];
    if (!validTestTypes.includes(testType)) {
      return res.status(400).json({
        success: false,
        error: '无效的测试类型'
      });
    }
    
    if (!answers || Object.keys(answers).length === 0) {
      return res.status(400).json({
        success: false,
        error: '请完成所有测试问题'
      });
    }
    
    // 过滤掉前端快速情绪选择（quick_mood）
    const testAnswers = { ...answers };
    delete testAnswers.quick_mood;
    
    console.log('过滤后的答案:', testAnswers);
    
    // ✅ 计算总分（根据不同测试类型）
    let totalScore = 0;
    let rawScore = 0;
    
    if (testType === 'emotion' || testType === 'stress' || testType === 'sleep' || testType === 'personality') {
      // 标准测试：4分制，转换为100分
      const answerValues = Object.values(testAnswers)
        .map(val => parseInt(val) || 0)
        .filter(val => !isNaN(val));
      
      if (answerValues.length > 0) {
        rawScore = answerValues.reduce((sum, val) => sum + val, 0);
        const maxPossibleScore = answerValues.length * 4;
        totalScore = Math.round((rawScore / maxPossibleScore) * 100);
      }
    } else if (testType === 'depression' || testType === 'anxiety') {
      // PHQ-9和GAD-7：0-3分制，转换为0-27分和0-21分
      const answerValues = Object.values(testAnswers)
        .map(val => parseInt(val) || 0)
        .filter(val => !isNaN(val));
      
      if (answerValues.length > 0) {
        rawScore = answerValues.reduce((sum, val) => sum + val, 0);
        totalScore = rawScore; // 抑郁/焦虑测试直接使用原始分
      }
    } else if (testType === 'mbti' || testType === 'enneagram') {
      // 人格测试没有总分概念
      totalScore = 0;
    }
    
    console.log('计算的总分:', totalScore, '测试类型:', testType, '原始分:', rawScore);
    
    // ✅ 核心修复：调用真正的AI分析器
    const analysis = await testAnalyzer.analyzeTest(testType, testAnswers, totalScore);
    
    console.log('AI分析结果:', {
      测试类型: testType,
      总分: analysis.totalScore || totalScore,
      标题: analysis.title,
      描述: analysis.description,
      建议数量: analysis.suggestions?.length || 0,
      风险等级: analysis.level,
      是否AI增强: analysis.aiEnhanced || false
    });
    
    // 获取测试名称
    const testName = getTestDescription(testType).split('，')[0] || '心理测试';
    
    // ✅ 构建完整的测试结果对象
    const resultData = {
      userId,
      testType,
      testName,
      scores: analysis.scores || {},
      totalScore: analysis.totalScore || totalScore,
      title: analysis.title || getDefaultTitle(totalScore, testType),
      description: analysis.description || getDefaultDescription(totalScore, testType),
      suggestions: analysis.suggestions || generateDefaultSuggestions(totalScore),
      answers: testAnswers,
      questions: questions || [], // 使用前端传递的完整测试题目
      questionCount: Object.keys(testAnswers).length,
      level: analysis.level || determineLevel(totalScore),
      // 测试时间信息
      testStartTime: startTime,
      testEndTime: endTime,
      testDuration: duration,
      // 保存完整的AI分析结果
      analysis: frontEndAnalysis || analysis || {} // 优先使用前端传递的分析结果，否则使用后端生成的
    };
    
    // ✅ 添加AI增强数据
    if (analysis.aiEnhanced) {
      resultData.aiEnhanced = true;
      resultData.sentimentAnalysis = analysis.sentimentAnalysis;
      resultData.aiSummary = analysis.aiSummary;
    }
    
    // ✅ 添加特殊测试的额外数据
    if (testType === 'mbti' && analysis.type) {
      resultData.mbtiType = analysis.type;
      resultData.mbtiTypeName = analysis.typeName;
      resultData.mbtiDescription = analysis.description;
      resultData.mbtiStrengths = analysis.strengths;
      resultData.mbtiWeaknesses = analysis.weaknesses;
    }
    
    if ((testType === 'depression' || testType === 'anxiety') && analysis.severity) {
      resultData.severity = analysis.severity;
      resultData.warning = analysis.warning;
    }
    
    // 保存到数据库
    const result = new TestResult(resultData);
    await result.save();
    
    // 更新用户测试计数
    await User.findByIdAndUpdate(userId, { $inc: { testCompleted: 1 } });
    
    // 检查是否获得新徽章
    const user = await User.findById(userId);
    
    // 根据测试类型添加徽章
    if (testType === 'mbti' && !user.badges.some(b => b.name === '人格探索者')) {
      user.addBadge({
        name: '人格探索者',
        icon: '🧩',
        description: '完成MBTI人格测试'
      });
      await user.save();
    }
    
    // ✅ 构建给前端的响应数据，包含完整的分析
    const responseData = {
      success: true,
      message: '测试提交成功',
      data: {
        ...result.toObject(),
        // 确保analysis数据能传递到前端
        analysis: {
          totalScore: analysis.totalScore || totalScore,
          level: analysis.level || determineLevel(totalScore),
          title: analysis.title,
          description: analysis.description,
          suggestions: analysis.suggestions || [],
          scores: analysis.scores || {},
          // AI增强数据
          aiEnhanced: analysis.aiEnhanced || false,
          sentimentAnalysis: analysis.sentimentAnalysis,
          aiSummary: analysis.aiSummary,
          // 特殊测试数据
          type: analysis.type,
          typeName: analysis.typeName,
          severity: analysis.severity,
          warning: analysis.warning,
          strengths: analysis.strengths,
          weaknesses: analysis.weaknesses
        }
      }
    };
    
    console.log('返回给前端的数据结构:', {
      成功: responseData.success,
      消息: responseData.message,
      数据包含分析: !!responseData.data.analysis,
      建议数量: responseData.data.analysis?.suggestions?.length || 0,
      风险等级: responseData.data.analysis?.level
    });
    
    res.json(responseData);
  } catch (error) {
    console.error('提交测试错误:', error);
    res.status(500).json({ 
      success: false, 
      error: '提交测试失败',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 获取测试历史
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 5 } = req.query;
    
    const history = await TestResult.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('testType testName totalScore createdAt level testStartTime testEndTime testDuration questions analysis');
    
    // 转换为普通对象，确保虚拟字段level正确显示
    const formattedHistory = history.map(result => ({
      ...result.toObject(),
      level: result.level // 确保level字段正确计算
    }));
    
    res.json({
      success: true,
      data: formattedHistory
    });
  } catch (error) {
    console.error('获取测试历史错误:', error);
    res.status(500).json({ 
      success: false, 
      error: '获取测试历史失败'
    });
  }
});

// 获取单个测试结果详情
router.get('/result/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const result = await TestResult.findOne({ _id: id, userId }).select('testType testName totalScore createdAt level testStartTime testEndTime testDuration answers questions analysis description');
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: '未找到测试结果'
      });
    }
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取测试结果错误:', error);
    res.status(500).json({ 
      success: false, 
      error: '获取测试结果失败'
    });
  }
});

// 辅助函数
function getDefaultTitle(score, testType) {
  if (testType === 'mbti') return 'MBTI人格分析';
  if (testType === 'enneagram') return '九型人格分析';
  
  if (score < 40) return '状态良好';
  if (score < 70) return '需要关注';
  return '建议采取措施';
}

function getDefaultDescription(score, testType) {
  if (testType === 'mbti') return '基于你的回答，AI分析了你的MBTI人格类型。';
  if (testType === 'enneagram') return '基于你的回答，AI分析了你的九型人格类型。';
  
  return `你的测试得分为${score}分（满分100分）。`;
}

function generateDefaultSuggestions(score) {
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
  
  suggestions.push('24小时心理援助热线：400-161-9995');
  return suggestions;
}

function determineLevel(score) {
  if (score < 40) return 'low';
  if (score < 70) return 'medium';
  return 'high';
}

// 导出路由
export default router;