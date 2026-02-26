import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  // 登录信息
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, '请输入有效的邮箱地址']
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  username: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 20
  },
  
  // 用户信息
  school: {
    type: String,
    required: true
  },
  grade: String,
  major: String,
  studentId: String,
  avatar: {
    type: String,
    default: 'default-avatar'
  },
  
  // 心理状态
  currentMood: {
    type: String,
    default: '未设置'
  },
  moodHistory: [{
    mood: String,
    date: { type: Date, default: Date.now },
    note: String,
    tags: [String]
  }],
  
  // 使用统计
  treeholePostsCount: { type: Number, default: 0 },
  mindfulnessSeconds: { type: Number, default: 0 },
  mindfulnessMinutes: { type: Number, default: 0 },
  testCompleted: { type: Number, default: 0 },
  
  // 徽章系统
  badges: [{
    name: String,
    icon: String,
    earnedAt: Date,
    description: String
  }],
  
  // 系统字段
  isVerified: { type: Boolean, default: true }, // 简化：暂时设为已验证
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 密码加密中间件
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 更新时间中间件
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// 密码验证方法
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 添加徽章的方法
UserSchema.methods.addBadge = function(badge) {
  if (!this.badges.some(b => b.name === badge.name)) {
    this.badges.push({
      ...badge,
      earnedAt: new Date()
    });
  }
};

// 更新心情的方法
UserSchema.methods.updateMood = function(mood, note = '', tags = []) {
  this.currentMood = mood;
  this.moodHistory.push({
    mood,
    note,
    tags,
    date: new Date()
  });
};

export default mongoose.model('User', UserSchema);