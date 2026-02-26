import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * 强制认证中间件 - 必须登录才能访问
 */
const authMiddleware = async (req, res, next) => {
  try {
    // 从请求头获取token
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: '未提供认证令牌，请先登录'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: '认证令牌格式不正确'
      });
    }

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'xinxi-town-secret-key');
    
    // 查找用户
    let user;
    try {
      user = await User.findById(decoded.userId).select('-password');
    } catch (error) {
      // 数据库连接失败时使用模拟用户数据
      console.warn('数据库连接失败，使用模拟用户数据');
      user = {
        _id: decoded.userId,
        email: 'test@example.com',
        username: '测试用户',
        school: '测试大学',
        isActive: true,
        isVerified: true
      };
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: '用户不存在，请重新登录'
      });
    }

    // 检查用户是否激活
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: '账户已被禁用，请联系管理员'
      });
    }

    // 将用户信息添加到请求对象
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('认证中间件错误:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: '无效的认证令牌'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: '认证令牌已过期，请重新登录'
      });
    }
    
    res.status(500).json({
      success: false,
      error: '认证系统错误'
    });
  }
};

/**
 * 可选认证中间件 - 如果有token就验证，没有就继续
 */
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'xinxi-town-secret-key');
        const user = await User.findById(decoded.userId).select('-password');
        
        if (user && user.isActive) {
          req.user = user;
          req.token = token;
        }
      }
    }
    
    next();
  } catch (error) {
    // 可选认证，即使token无效也继续处理（不返回错误）
    next();
  }
};

/**
 * 管理员认证中间件 - 只有管理员可以访问
 * 注意：需要在User模型中添加isAdmin字段
 */
const isAdmin = async (req, res, next) => {
  try {
    // 首先验证用户是否登录
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: '需要管理员权限，请先登录'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'xinxi-town-secret-key');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: '用户不存在'
      });
    }

    // 检查是否是管理员
    // 注意：需要在User模型中添加isAdmin字段
    // 如果还没有这个字段，可以暂时注释掉这段检查
    if (!user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: '需要管理员权限'
      });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('管理员认证错误:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: '无效的认证令牌'
      });
    }
    
    res.status(500).json({
      success: false,
      error: '权限验证失败'
    });
  }
};

/**
 * 兼容性导出 - 为了平滑过渡
 * 保持原有的 auth 和 isAdmin 名称，但使用新实现
 */
const auth = authMiddleware; // 保持名称兼容
const optionalAuth = optionalAuthMiddleware;

export { auth, optionalAuth, isAdmin, authMiddleware, optionalAuthMiddleware };