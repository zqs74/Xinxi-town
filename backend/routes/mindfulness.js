// Mindfulness Routes 
import express from 'express';
const router = express.Router();
import MindfulnessSession from '../models/MindfulnessSession.js';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

// 获取用户的正念练习记录
router.get('/sessions',authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, error: '未提供认证令牌' });
    }
    
    // 这里应该验证token并获取userId，暂时假设userId为固定值
    const userId = '64f3b0b0b0b0b0b0b0b0b0b0'; // 示例userId
    
    const skip = (page - 1) * limit;
    
    const sessions = await MindfulnessSession.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await MindfulnessSession.countDocuments({ userId });
    
    res.json({
      success: true,
      data: sessions,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取正念练习记录错误:', error);
    res.status(500).json({ success: false, error: '获取正念练习记录失败' });
  }
});

// 创建新的正念练习会话 - 需要认证
router.post('/sessions', authMiddleware, async (req, res) => {
  try {
    const { exerciseId, exerciseName, duration } = req.body;
    const userId = req.user._id; // 从认证中间件获取真实userId
    
    if (!exerciseId || !duration) {
      return res.status(400).json({
        success: false,
        error: '请提供练习ID和时长'
      });
    }
    
    const session = new MindfulnessSession({
      userId,
      exerciseId,
      exerciseName: exerciseName || `正念练习 ${exerciseId}`,
      duration,
      status: 'started'
    });
    
    await session.save();
    
    res.status(201).json({
      success: true,
      message: '正念练习会话创建成功',
      data: session
    });
  } catch (error) {
    console.error('创建正念练习会话错误:', error);
    res.status(500).json({ success: false, error: '创建正念练习会话失败' });
  }
});

// 更新正念练习会话（结束练习）- 需要认证
router.put('/sessions/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { actualDuration } = req.body;
    const userId = req.user._id; // 从认证中间件获取真实userId
    
    if (!actualDuration || actualDuration < 0) {
      return res.status(400).json({
        success: false,
        error: '请提供有效的练习时长'
      });
    }
    
    const session = await MindfulnessSession.findOne({ _id: id, userId });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: '正念练习会话不存在或无权访问'
      });
    }
    
    // 完成练习
    session.complete(actualDuration);
    await session.save();
    
    // 更新用户的正念练习时长（秒，保持原始精度）
    await User.findByIdAndUpdate(userId, {
      $inc: { mindfulnessSeconds: actualDuration }
    });
    
    // 检查是否获得新徽章
    const user = await User.findById(userId);
    const totalMinutes = user.mindfulnessMinutes + minutes;
    
    // 徽章逻辑（可扩展）
    const newBadges = [];
    if (totalMinutes >= 60 && !user.badges.some(b => b.name === '正念初学者')) {
      newBadges.push({
        name: '正念初学者',
        icon: '🌿',
        description: '完成60分钟正念练习'
      });
    }
    
    if (totalMinutes >= 300 && !user.badges.some(b => b.name === '正念达人')) {
      newBadges.push({
        name: '正念达人',
        icon: '🕊️',
        description: '完成300分钟正念练习'
      });
    }
    
    // 添加新徽章
    newBadges.forEach(badge => user.addBadge(badge));
    if (newBadges.length > 0) {
      await user.save();
    }
    
    res.json({
      success: true,
      message: '正念练习会话更新成功',
      data: session,
      badges: newBadges
    });
  } catch (error) {
    console.error('更新正念练习会话错误:', error);
    res.status(500).json({ success: false, error: '更新正念练习会话失败' });
  }
});

// 获取正念练习统计 - 需要认证
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { timeRange = '7d', startDate, endDate } = req.query;
    
    // 计算时间范围
    let startTime;
    if (startDate && endDate) {
      startTime = new Date(startDate);
      const endTime = new Date(endDate);
      
      // 验证时间范围
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        return res.status(400).json({ success: false, error: '无效的时间范围' });
      }
    } else {
      // 根据时间范围参数计算
      startTime = new Date();
      switch (timeRange) {
        case '7d':
          startTime.setDate(startTime.getDate() - 7);
          break;
        case '30d':
          startTime.setDate(startTime.getDate() - 30);
          break;
        case '90d':
          startTime.setDate(startTime.getDate() - 90);
          break;
        case '365d':
          startTime.setFullYear(startTime.getFullYear() - 1);
          break;
        case 'all':
          // 所有时间
          startTime = new Date(0);
          break;
        default:
          // 默认7天
          startTime.setDate(startTime.getDate() - 7);
      }
    }
    
    const recentSessions = await MindfulnessSession.find({
      userId,
      status: 'completed',
      completedAt: { $gte: startTime }
    }).sort({ completedAt: -1 });
    
    console.log('查询到的会话数量:', recentSessions.length);
    console.log('时间范围:', { startTime, timeRange });
    console.log('前3条会话:', recentSessions.slice(0, 3));
    
    // 按日期分组统计
    const dailyStats = {};
    recentSessions.forEach(session => {
      const date = session.completedAt.toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = {
          date,
          count: 0,
          totalMinutes: 0,
          totalSeconds: 0
        };
      }
      dailyStats[date].count++;
      dailyStats[date].totalSeconds += session.actualDuration;
      dailyStats[date].totalMinutes += Math.round((session.actualDuration / 60) * 10) / 10;
    });
    
    console.log('生成的 dailyStats:', dailyStats);
    
    // 转换为数组并按日期排序
    const dailyStatsArray = Object.values(dailyStats).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    console.log('dailyStatsArray:', dailyStatsArray);
    
    // 计算当前时间范围内的总统计
    const totalSessions = recentSessions.length;
    const totalSeconds = recentSessions.reduce((sum, session) => sum + session.actualDuration, 0);
    const totalMinutes = Math.round((totalSeconds / 60) * 10) / 10;
    const avgSeconds = totalSessions > 0 
      ? totalSeconds / totalSessions 
      : 0;
    const avgDuration = avgSeconds;
    
    res.json({
      success: true,
      data: {
        dailyStats: dailyStatsArray,
        totalSessions,
        totalSeconds,
        totalMinutes,
        avgDuration
      }
    });
  } catch (error) {
    console.error('获取正念统计错误:', error);
    res.status(500).json({ success: false, error: '获取正念统计失败' });
  }
});

export default router;