// TestResult Model 
import mongoose from 'mongoose';

const TestResultSchema = new mongoose.Schema({
  // 用户信息
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // 测试信息
  testType: {
    type: String,
    default: 'emotion'
  },
  testName: {
    type: String
  },
  
  // 测试结果
  scores: {
    type: Map,
    of: Number, // 各维度得分
    default: {}
  },
  totalScore: {
    type: Number,
    min: 0,
    max: 100
  },
  
  // AI评估
  title: {
    type: String
  },
  description: {
    type: String
  },
  suggestions: {
    type: [String],
    default: []
  },
  
  // 测试详情
  answers: {
    type: Map,
    of: mongoose.Schema.Types.Mixed, // 支持数字和数组（多选题）
    default: {}
  },
  questionCount: {
    type: Number,
    default: 0
  },
  questions: {
    type: Array,
    default: [] // 完整的测试题目
  },
  
  // 测试时间信息
  testStartTime: {
    type: Date
  },
  testEndTime: {
    type: Date
  },
  testDuration: {
    type: Number, // 测试用时（毫秒）
    default: 0
  },
  
  // AI分析结果
  analysis: {
    type: Object,
    default: {} // 完整的AI分析结果
  },
  
  // 系统字段
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 更新时间中间件
TestResultSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// 添加虚拟字段：测试结果等级
TestResultSchema.virtual('level').get(function() {
  if (!this.totalScore) return 'unknown';
  
  if (this.totalScore < 40) return 'high';
  if (this.totalScore < 70) return 'medium';
  return 'low';
});

export default mongoose.model('TestResult', TestResultSchema);
