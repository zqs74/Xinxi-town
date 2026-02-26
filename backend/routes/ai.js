import express from 'express';
const router = express.Router();
import AIService from '../services/aiService.js';
import arkAIService from '../services/arkAIService.js';
import { authMiddleware } from '../middleware/auth.js';

// 分析文本情感 - 需要认证
router.post('/analyze', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        error: '请提供要分析的文本' 
      });
    }
    
    // 调用AI服务进行情感分析
    const analysis = await AIService.analyzeSentiment(text);
    
    // 构建响应对象
    const response = {
      sentiment: analysis.sentiment,
      emotion: analysis.sentiment,
      score: (analysis.positiveProb || 0) - (analysis.negativeProb || 0),
      keywords: analysis.keywords || [],
      suggestions: analysis.suggestions || [],
      riskLevel: analysis.riskLevel || 'none'
    };
    
    res.json({ 
      success: true, 
      data: response 
    });
  } catch (error) {
    console.error('AI分析错误:', error);
    res.status(500).json({ 
      success: false, 
      error: 'AI分析失败，请稍后重试' 
    });
  }
});

// AI对话 - 需要认证
router.post('/chat', authMiddleware, async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ 
        success: false, 
        error: '请提供对话历史' 
      });
    }
    
    // 调用ARK AI服务进行对话
    const response = await arkAIService.chat(messages);
    
    res.json({ 
      success: true, 
      data: {
        response: response
      } 
    });
  } catch (error) {
    console.error('AI对话错误:', error);
    res.status(500).json({ 
      success: false, 
      error: 'AI对话失败，请稍后重试' 
    });
  }
});

export default router;