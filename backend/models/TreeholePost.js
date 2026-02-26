// TreeholePost Model 
import mongoose from 'mongoose';

const TreeholePostSchema = new mongoose.Schema({
  // 发布者信息
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isAnonymous: {
    type: Boolean,
    default: true
  },
  
  // 内容
  content: {
    type: String,
    required: true,
    maxlength: 1000,
    minlength: 3
  },
  tags: [String],
  images: [String], // 图片URL数组
  
  // AI情感分析
  emotionAnalysis: {
    emotion: {
      type: String,
      default: 'neutral'
    },
    score: {
      type: Number,
      min: -1,
      max: 1,
      default: 0
    },
    keywords: [String],
    riskLevel: {
      type: String,
      default: 'none'
    },
    sentiment: {
      type: String,
      default: '平静'
    },
    suggestions: [String]
  },
  
  // 互动数据
  likes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: { type: Date, default: Date.now }
  }],
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    isAnonymous: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    likes: [mongoose.Schema.Types.ObjectId]
  }],
  warmResponses: [{
    type: String,
    default: ['加油！', '抱抱你', '一切都会好的', '你很棒']
  }],
  viewCount: {
    type: Number,
    default: 0
  },
  
  // 隐私设置
  visibility: {
    type: String,
    enum: ['public', 'private', 'friends'],
    default: 'public'
  },
  
  // 系统字段
  isReported: { type: Boolean, default: false },
  reports: [{
    userId: mongoose.Schema.Types.ObjectId,
    reason: String,
    createdAt: Date
  }],
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 文本索引，支持搜索
TreeholePostSchema.index({ content: 'text', tags: 'text' });

// 软删除方法
TreeholePostSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
};

// 添加评论的方法
TreeholePostSchema.methods.addComment = function(userId, content, isAnonymous = true) {
  this.comments.push({
    userId,
    content,
    isAnonymous,
    createdAt: new Date()
  });
};

// 点赞方法
TreeholePostSchema.methods.addLike = function(userId) {
  if (!this.likes.some(like => like.userId.toString() === userId.toString())) {
    this.likes.push({ userId, createdAt: new Date() });
    return true;
  }
  return false;
};

export default mongoose.model('TreeholePost', TreeholePostSchema);