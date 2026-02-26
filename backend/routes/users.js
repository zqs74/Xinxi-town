import express from 'express';
const router = express.Router();
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

// 获取用户信息 - 需要认证
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // 用户信息已经在认证中间件中附加到req.user
    const user = req.user;
    
    // 获取用户的完整统计信息
    const stats = await getUserStats(user._id);
    
    res.json({
      success: true,
      user,
      stats
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ success: false, error: '获取用户信息失败' });
  }
});

// 更新用户信息 - 需要认证
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const { username, avatar, school, grade, major, studentId } = req.body;
    const userId = req.user._id;
    
    // 构建更新对象
    const updates = {};
    if (username && username.length >= 2) updates.username = username;
    if (avatar) updates.avatar = avatar;
    if (school) updates.school = school;
    if (grade) updates.grade = grade;
    if (major) updates.major = major;
    if (studentId) updates.studentId = studentId;
    
    // 如果没有任何更新字段
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: '没有提供要更新的信息'
      });
    }
    
    // 更新用户信息
    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      });
    }
    
    res.json({
      success: true,
      message: '用户信息更新成功',
      user
    });
  } catch (error) {
    console.error('更新用户信息错误:', error);
    
    // 处理验证错误
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: errors.join(', ')
      });
    }
    
    // 处理重复键错误（如重复用户名）
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: '该用户名已被使用'
      });
    }
    
    res.status(500).json({
      success: false,
      error: '更新用户信息失败'
    });
  }
});

// 更新用户密码 - 需要认证
router.put('/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: '请提供当前密码和新密码'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: '新密码至少需要6个字符'
      });
    }
    
    // 获取用户（包含密码字段）
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      });
    }
    
    // 验证当前密码
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: '当前密码不正确'
      });
    }
    
    // 更新密码
    user.password = newPassword;
    await user.save();
    
    res.json({
      success: true,
      message: '密码修改成功'
    });
  } catch (error) {
    console.error('修改密码错误:', error);
    res.status(500).json({ success: false, error: '修改密码失败' });
  }
});

// 更新用户心情 - 需要认证
router.post('/mood', authMiddleware, async (req, res) => {
  try {
    const { mood, note, tags } = req.body;
    const userId = req.user._id;
    
    if (!mood) {
      return res.status(400).json({
        success: false,
        error: '请选择心情状态'
      });
    }
    
    // 获取用户
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      });
    }
    
    // 更新心情
    user.updateMood(mood, note || '', tags || []);
    await user.save();
    
    // 返回更新后的用户信息（排除密码）
    const userResponse = user.toObject();
    delete userResponse.password;
    
    // 检查是否获得新徽章
    const newBadges = [];
    const moodCount = user.moodHistory.length;
    
    if (moodCount === 1 && !user.badges.some(b => b.name === '心情记录者')) {
      newBadges.push({
        name: '心情记录者',
        icon: '📝',
        description: '记录第一次心情'
      });
    }
    
    if (moodCount === 7 && !user.badges.some(b => b.name === '心情观察员')) {
      newBadges.push({
        name: '心情观察员',
        icon: '🔍',
        description: '连续记录一周心情'
      });
    }
    
    // 添加新徽章
    newBadges.forEach(badge => user.addBadge(badge));
    if (newBadges.length > 0) {
      await user.save();
    }
    
    res.json({
      success: true,
      message: '心情已更新',
      mood: user.currentMood,
      history: user.moodHistory.slice(-7), // 返回最近7条记录
      badges: newBadges,
      user: userResponse
    });
  } catch (error) {
    console.error('更新心情错误:', error);
    res.status(500).json({ success: false, error: '更新心情失败' });
  }
});

// 获取用户的心情历史 - 需要认证
router.get('/mood/history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 30, timeRange, startDate, endDate } = req.query;
    
    const user = await User.findById(userId).select('moodHistory');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      });
    }
    
    let moodHistory = user.moodHistory || [];
    
    // 计算时间范围
    if (timeRange && !startDate && !endDate) {
      const now = new Date();
      let startTime;
      
      switch (timeRange) {
        case '7d':
          startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startTime = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '365d':
          startTime = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        case 'all':
          startTime = new Date(0);
          break;
        default:
          startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }
      
      moodHistory = moodHistory.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= startTime;
      });
    } else if (startDate || endDate) {
      // 按日期过滤
      moodHistory = moodHistory.filter(record => {
        const recordDate = new Date(record.date);
        if (startDate && recordDate < new Date(startDate)) return false;
        if (endDate && recordDate > new Date(endDate)) return false;
        return true;
      });
    }
    
    // 按日期排序（最近的在前）
    moodHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // 限制数量
    if (limit) {
      moodHistory = moodHistory.slice(0, parseInt(limit));
    }
    
    // 统计心情分布
    const moodStats = {};
    moodHistory.forEach(record => {
      moodStats[record.mood] = (moodStats[record.mood] || 0) + 1;
    });
    
    // 计算心情趋势（最近7天 vs 前7天）
    const recentMoods = moodHistory.slice(0, 7);
    const previousMoods = moodHistory.slice(7, 14);
    
    const recentAvg = calculateMoodAverage(recentMoods);
    const previousAvg = calculateMoodAverage(previousMoods);
    
    let trend = 'stable';
    if (recentMoods.length > 0 && previousMoods.length > 0) {
      if (recentAvg > previousAvg + 0.5) trend = 'improving';
      else if (recentAvg < previousAvg - 0.5) trend = 'declining';
    }
    
    res.json({
      success: true,
      data: moodHistory,
      stats: {
        total: moodHistory.length,
        distribution: moodStats,
        recentAverage: recentAvg,
        previousAverage: previousAvg,
        trend
      }
    });
  } catch (error) {
    console.error('获取心情历史错误:', error);
    res.status(500).json({ success: false, error: '获取心情历史失败' });
  }
});

// 获取用户的统计数据 - 需要认证
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const stats = await getUserStats(userId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('获取用户统计数据错误:', error);
    res.status(500).json({ success: false, error: '获取用户统计数据失败' });
  }
});

// 获取用户的徽章 - 需要认证
router.get('/badges', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId).select('badges');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      });
    }
    
    // 按获得时间排序（最近的在前）
    const badges = user.badges.sort((a, b) => 
      new Date(b.earnedAt) - new Date(a.earnedAt)
    );
    
    // 徽章分类
    const badgeCategories = {
      mood: badges.filter(b => ['心情记录者', '心情观察员'].includes(b.name)),
      mindfulness: badges.filter(b => ['正念初学者', '正念达人'].includes(b.name)),
      test: badges.filter(b => ['初次测试'].includes(b.name)),
      other: badges.filter(b => !['心情记录者', '心情观察员', '正念初学者', '正念达人', '初次测试'].includes(b.name))
    };
    
    res.json({
      success: true,
      data: badges,
      categories: badgeCategories,
      total: badges.length
    });
  } catch (error) {
    console.error('获取用户徽章错误:', error);
    res.status(500).json({ success: false, error: '获取用户徽章失败' });
  }
});

// 删除用户账户 - 需要认证
router.delete('/account', authMiddleware, async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user._id;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        error: '请提供密码确认删除账户'
      });
    }
    
    // 获取用户（包含密码字段）
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      });
    }
    
    // 验证密码
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: '密码不正确'
      });
    }
    
    // 软删除：标记用户为不活跃，而不是真正删除
    user.isActive = false;
    user.deactivatedAt = new Date();
    await user.save();
    
    res.json({
      success: true,
      message: '账户已成功删除',
      note: '如需恢复账户，请联系客服'
    });
  } catch (error) {
    console.error('删除账户错误:', error);
    res.status(500).json({ success: false, error: '删除账户失败' });
  }
});

// 辅助函数：获取用户统计信息
async function getUserStats(userId) {
  const user = await User.findById(userId).select('treeholePostsCount mindfulnessMinutes testCompleted badges moodHistory');
  
  if (!user) {
    return null;
  }
  
  // 计算心情统计
  const moodCount = user.moodHistory.length;
  const recentMoods = user.moodHistory.slice(-7);
  const moodAverage = calculateMoodAverage(recentMoods);
  
  // 徽章统计
  const badgeCount = user.badges.length;
  const recentBadges = user.badges
    .sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt))
    .slice(0, 3);
  
  // 计算活跃度评分（0-100）
  const activityScore = calculateActivityScore(
    user.treeholePostsCount,
    user.mindfulnessMinutes,
    user.testCompleted,
    moodCount
  );
  
  return {
    basic: {
      treeholePosts: user.treeholePostsCount,
      mindfulnessMinutes: user.mindfulnessMinutes,
      testsCompleted: user.testCompleted,
      moodRecords: moodCount
    },
    mood: {
      current: user.currentMood,
      recentAverage: moodAverage,
      recentCount: recentMoods.length
    },
    badges: {
      total: badgeCount,
      recent: recentBadges
    },
    activity: {
      score: activityScore,
      level: getActivityLevel(activityScore)
    },
    summary: generateUserSummary(user)
  };
}

// 辅助函数：计算心情平均值
function calculateMoodAverage(moodRecords) {
  if (!moodRecords || moodRecords.length === 0) return 0;
  
  const moodValues = {
    '兴奋': 5,
    '高兴': 4,
    '平静': 3,
    '疲惫': 2,
    '难过': 1,
    '焦虑': 1,
    '未设置': 0
  };
  
  const total = moodRecords.reduce((sum, record) => {
    return sum + (moodValues[record.mood] || 0);
  }, 0);
  
  return total / moodRecords.length;
}

// 辅助函数：计算活跃度评分
function calculateActivityScore(posts, minutes, tests, moods) {
  // 权重分配
  const postScore = Math.min(posts * 5, 30); // 最多30分
  const mindfulnessScore = Math.min(minutes / 10, 30); // 每分钟0.1分，最多30分
  const testScore = Math.min(tests * 10, 20); // 每次测试10分，最多20分
  const moodScore = Math.min(moods * 2, 20); // 每次记录2分，最多20分
  
  return Math.round(postScore + mindfulnessScore + testScore + moodScore);
}

// 辅助函数：获取活跃度等级
function getActivityLevel(score) {
  if (score >= 80) return '非常高';
  if (score >= 60) return '高';
  if (score >= 40) return '中等';
  if (score >= 20) return '低';
  return '非常低';
}

// 辅助函数：生成用户总结
function generateUserSummary(user) {
  const strengths = [];
  const suggestions = [];
  
  // 根据统计数据生成总结
  if (user.moodHistory.length >= 7) {
    strengths.push('你经常记录心情，具有很好的自我觉察能力');
  } else {
    suggestions.push('尝试每天记录心情，增强自我觉察');
  }
  
  if (user.mindfulnessMinutes >= 60) {
    strengths.push('你有良好的正念练习习惯');
  } else {
    suggestions.push('可以尝试正念练习来提升专注力和减压');
  }
  
  if (user.testCompleted >= 2) {
    strengths.push('你关注自己的心理健康状态');
  } else {
    suggestions.push('定期进行心理测试，了解自己的状态变化');
  }
  
  if (user.treeholePostsCount >= 3) {
    strengths.push('你善于表达和分享自己的感受');
  } else {
    suggestions.push('试着在树洞分享你的感受，获得支持');
  }
  
  return {
    strengths: strengths.length > 0 ? strengths : ['你刚刚开始使用心栖小镇，继续探索吧！'],
    suggestions: suggestions.length > 0 ? suggestions : ['继续保持当前的健康习惯']
  };
}

export default router;