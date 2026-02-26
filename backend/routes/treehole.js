// Treehole Routes 
import express from 'express';
const router = express.Router();
import TreeholePost from '../models/TreeholePost.js';
import User from '../models/User.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js';
import treeholeAIService from '../services/treeholeAIService.js';

// 获取帖子列表-可选认证（匿名也可以查看）
router.get('/',  optionalAuthMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;
    
    const skip = (page - 1) * limit;
    const sortOption = { [sort]: order === 'desc' ? -1 : 1 };
     // 构建查询条件
    let query = { isDeleted: false };
    
    // 如果是登录用户，可以查看公开的和自己的私有帖子
    if (req.user) {
      query = {
        isDeleted: false,
        $or: [
          { visibility: 'public' },
          { userId: req.user._id } // 自己的帖子，无论可见性
        ]
      };
    } else {
      // 匿名用户只能查看公开帖子
      query = { isDeleted: false, visibility: 'public' };
    }
    const posts = await TreeholePost.find(query)
      .populate('userId', 'username avatar')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));
    
    const total = await TreeholePost.countDocuments(query);
    
    // 计算今日更新数量
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayQuery = { ...query, createdAt: { $gte: today } };
    const todayCount = await TreeholePost.countDocuments(todayQuery);
    
    res.json({
      success: true,
      data: posts,
      total,
      todayCount,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取帖子列表错误:', error);
    res.status(500).json({ success: false, error: '获取帖子列表失败' });
  }
});

// 创建帖子 - 需要认证
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { content, tags = [], isAnonymous = true, visibility = 'public', aiEnabled = true } = req.body;
    const userId = req.user._id;
    
    if (!content || content.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: '帖子内容至少需要3个字符'
      });
    }
    
    let aiAnalysis = null;
    let keywords = [];
    let suggestions = [];
    let emotionAnalysis = null;
    
    // 只有当aiEnabled为true时才进行AI分析
    if (aiEnabled) {
      // AI情感分析
      aiAnalysis = await treeholeAIService.analyzeSentiment(content);
      keywords = aiAnalysis.keywords || [];
      suggestions = aiAnalysis.suggestions || [];
      
      // 构建情感分析对象
      emotionAnalysis = {
        emotion: aiAnalysis.sentiment,
        score: (aiAnalysis.positiveProb || 0) - (aiAnalysis.negativeProb || 0),
        keywords,
        riskLevel: aiAnalysis.riskLevel,
        sentiment: aiAnalysis.sentiment,
        suggestions: suggestions
      };
    }
    
    const post = new TreeholePost({
      userId,
      content: content.trim(),
      tags,
      isAnonymous,
      visibility,
      emotionAnalysis: aiEnabled ? emotionAnalysis : null
    });
    
    await post.save();
    
    // 更新用户的帖子计数
    await User.findByIdAndUpdate(userId, { $inc: { treeholePostsCount: 1 } });
    
    // 如果是高风险帖子，可以触发预警（这里可以扩展）
    if (aiAnalysis && aiAnalysis.riskLevel === 'high') {
      console.warn(`⚠️ 高风险帖子预警 - 用户: ${userId}, 帖子ID: ${post._id}`);
      // 这里可以发送邮件、通知管理员等
    }
    
    //返回完整的AI分析结果
    res.status(201).json({
      success: true,
      message: '帖子创建成功',
      data: post,
      aiAnalysis: aiEnabled ? {
        sentiment: aiAnalysis?.sentiment || '中性',
        confidence: aiAnalysis?.confidence || 0.5,
        positiveProb: aiAnalysis?.positiveProb || 0,
        negativeProb: aiAnalysis?.negativeProb || 0,
        riskLevel: aiAnalysis?.riskLevel || 'none',
        keywords: keywords,
        suggestions: suggestions,
        isFallback: aiAnalysis?.isFallback || false
      } : null
    });
  } catch (error) {
    console.error('创建帖子错误:', error);
    res.status(500).json({ success: false, error: '创建帖子失败' });
  }
});

// 生成建议的方法
function generateSuggestions(aiAnalysis) {
  const suggestions = [];
  
  if (aiAnalysis.riskLevel === 'high') {
    suggestions.push(
      '检测到高风险内容，建议立即联系专业心理咨询师',
      '24小时心理援助热线：400-123-4567'
    );
  } else if (aiAnalysis.riskLevel === 'medium') {
    suggestions.push(
      '你的情绪需要关注，建议尝试正念练习',
      '可以预约专业心理咨询师进行交流'
    );
  } else if (aiAnalysis.sentiment === '悲伤') {
    suggestions.push(
      '试着和朋友或家人聊聊天',
      '推荐尝试"黑熊正念庭院"的放松练习'
    );
  } else if (aiAnalysis.sentiment === '焦虑') {
    suggestions.push(
      '深呼吸，慢慢来，一切都会好起来的',
      '可以试试"鼹鼠轻诊室"的压力测试'
    );
  } else {
    suggestions.push(
      '感谢分享你的感受',
      '继续保持积极的心态'
    );
  }
  
  return suggestions;
}

// 获取帖子详情 - 可选认证
router.get('/:id', optionalAuthMiddleware, async (req, res) => {
  try {
    const post = await TreeholePost.findById(req.params.id)
      .populate('userId', 'username avatar')
      .populate('comments.userId', 'username avatar');
    
    if (!post || post.isDeleted) {
      return res.status(404).json({ success: false, error: '帖子不存在' });
    }
    
    // 检查权限（如果是私有帖子）
    if (post.visibility === 'private' && (!req.user || post.userId._id.toString() !== req.user._id.toString())) {
      return res.status(403).json({ success: false, error: '无权查看此帖子' });
    }
    
    // 增加浏览量
    post.viewCount += 1;
    await post.save();
    
    res.json({ success: true, data: post });
  } catch (error) {
    console.error('获取帖子详情错误:', error);
    res.status(500).json({ success: false, error: '获取帖子详情失败' });
  }
});

// 点赞/取消点赞 - 需要认证
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id; // 从认证中间件获取
    
    const post = await TreeholePost.findById(postId);
    
    if (!post || post.isDeleted) {
      return res.status(404).json({ success: false, error: '帖子不存在' });
    }
    
    const likeIndex = post.likes.findIndex(like => 
      like.userId.toString() === userId.toString()
    );
    
    if (likeIndex > -1) {
      // 取消点赞
      post.likes.splice(likeIndex, 1);
      await post.save();
      
      res.json({
        success: true,
        message: '取消点赞成功',
        liked: false,
        likeCount: post.likes.length
      });
    } else {
      // 添加点赞
      post.likes.push({ userId });
      await post.save();
      
      res.json({
        success: true,
        message: '点赞成功',
        liked: true,
        likeCount: post.likes.length
      });
    }
  } catch (error) {
    console.error('点赞错误:', error);
    res.status(500).json({ success: false, error: '点赞操作失败' });
  }
});

// 添加评论 - 需要认证
router.post('/:id/comments', authMiddleware, async (req, res) => {
  try {
    const postId = req.params.id;
    const { content, isAnonymous = true } = req.body;
    const userId = req.user._id; // 从认证中间件获取
    
    if (!content || content.trim().length < 1) {
      return res.status(400).json({
        success: false,
        error: '评论内容不能为空'
      });
    }
    
    const post = await TreeholePost.findById(postId);
    
    if (!post || post.isDeleted) {
      return res.status(404).json({ success: false, error: '帖子不存在' });
    }
    
    post.addComment(userId, content.trim(), isAnonymous);
    await post.save();
    
    res.status(201).json({
      success: true,
      message: '评论添加成功',
      comment: post.comments[post.comments.length - 1]
    });
  } catch (error) {
    console.error('添加评论错误:', error);
    res.status(500).json({ success: false, error: '添加评论失败' });
  }
});


// 添加温暖回应 - 需要认证
router.post('/:id/warm-response', authMiddleware, async (req, res) => {
  try {
    const postId = req.params.id;
    const { response } = req.body;
    const userId = req.user._id;
    
    if (!response || response.trim().length < 1) {
      return res.status(400).json({
        success: false,
        error: '回应内容不能为空'
      });
    }
    
    const post = await TreeholePost.findById(postId);
    
    if (!post || post.isDeleted) {
      return res.status(404).json({ success: false, error: '帖子不存在' });
    }
    
    // 检查是否已经回应过（可选）
    if (post.warmResponses.includes(response.trim())) {
      return res.status(400).json({
        success: false,
        error: '已添加过相同的回应'
      });
    }
    
    post.warmResponses.push(response.trim());
    await post.save();
    
    res.status(201).json({
      success: true,
      message: '温暖回应添加成功',
      response: response.trim()
    });
  } catch (error) {
    console.error('添加温暖回应错误:', error);
    res.status(500).json({ success: false, error: '添加温暖回应失败' });
  }
});

// 删除帖子 - 需要认证
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;
    
    const post = await TreeholePost.findById(postId);
    
    if (!post || post.isDeleted) {
      return res.status(404).json({ success: false, error: '帖子不存在' });
    }
    
    // 检查是否是帖子的作者
    if (post.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, error: '无权删除此帖子' });
    }
    
    // 软删除：标记为已删除，而不是物理删除
    post.isDeleted = true;
    await post.save();
    
    // 更新用户的帖子计数
    await User.findByIdAndUpdate(userId, { $inc: { treeholePostsCount: -1 } });
    
    res.json({
      success: true,
      message: '帖子删除成功'
    });
  } catch (error) {
    console.error('删除帖子错误:', error);
    res.status(500).json({ success: false, error: '删除帖子失败' });
  }
});

export default router;