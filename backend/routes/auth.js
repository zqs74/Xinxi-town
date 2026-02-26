// Auth Routes 
import express from 'express';
const router = express.Router();
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// 注册-不需要认证
router.post('/register', async (req, res) => {
  try {
    const { email, password, username, school, grade, major, studentId } = req.body;
    
    // 验证必填字段
    if (!email || !password || !username || !school) {
      return res.status(400).json({
        success: false,
        error: '请填写所有必填字段'
      });
    }
    
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: '邮箱格式不正确'
      });
    }
    
    // // // 验证是否为校园邮箱（简单检查）
    // const isSchoolEmail = email.includes('.edu') || email.includes('@school');
    // if (!isSchoolEmail) {
    //   return res.status(400).json({
    //     success: false,
    //     error: '请使用校园邮箱注册'
    //   });
    // }
    
    // 检查邮箱是否已存在
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: '该邮箱已注册'
      });
    }
    
    // 创建新用户
    const user = new User({
      email: email.toLowerCase(),
      password,
      username,
      school,
      grade,
      major,
      studentId,
      isVerified: true, // 简化流程，实际应发送验证邮件
      lastLogin: new Date()
    });
    
    await user.save();
    
    // 生成JWT令牌
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'xinxi-town-secret-key',
      { expiresIn: '7d' }
    );
    
    // 返回用户信息（排除密码）
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json({
      success: true,
      message: '注册成功',
      token,
      user: userResponse
    });
    
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      success: false,
      error: '注册失败，请稍后重试'
    });
  }
});

// 登录-不需要认证
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 验证必填字段
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: '请提供邮箱和密码'
      });
    }
    
    // 查找用户（包含密码字段）
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: '邮箱或密码错误'
      });
    }
    
    // 检查账户是否激活
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: '账户已被禁用'
      });
    }
    
    // 验证密码
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: '邮箱或密码错误'
      });
    }
    
    // 更新最后登录时间
    user.lastLogin = new Date();
    await user.save();
    
    // 生成JWT令牌
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'xinxi-town-secret-key',
      { expiresIn: '7d' }
    );
    
    // 返回用户信息（排除密码）
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({
      success: true,
      message: '登录成功',
      token,
      user: userResponse
    });
    
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      error: '登录失败，请稍后重试'
    });
  }
});

// 获取当前用户信息-需要认证
router.get('/me', async (req, res) => {
  try {
    // 从请求头获取token
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        error: '未提供认证令牌'
      });
    }
    
    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'xinxi-town-secret-key');
    
    // 查找用户
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      });
    }
    
    res.json({
      success: true,
      user
    });
    
  } catch (error) {
    console.error('获取用户信息错误:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: '无效的认证令牌'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: '认证令牌已过期'
      });
    }
    res.status(500).json({
      success: false,
      error: '获取用户信息失败'
    });
  }
});

// 更新心情状态-需要认证
router.post('/mood', async (req, res) => {
  try {
    const { mood, note, tags } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: '未提供认证令牌'
      });
    }
    
    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'xinxi-town-secret-key');
    
    // 查找并更新用户
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      });
    }
    
    // 更新心情
    user.updateMood(mood, note, tags || []);
    await user.save();
    // 返回用户信息（排除密码）
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({
      success: true,
      message: '心情已更新',
      mood: user.currentMood,
      history: user.moodHistory.slice(-5),// 返回最近5条记录
      user:userResponse
    });
    
  } catch (error) {
    console.error('更新心情错误:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: '无效的认证令牌'
      });
    }
    res.status(500).json({
      success: false,
      error: '更新心情失败'
    });
  }
});

export default router;