// MindfulnessSession Model 
import mongoose from 'mongoose';

const MindfulnessSessionSchema = new mongoose.Schema({
  // 用户信息
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // 练习信息
  exerciseId: {
    type: Number,
    required: true
  },
  exerciseName: {
    type: String
  },
  duration: {
    type: Number,
    required: true, // 计划时长（秒）
    min: 60 // 最短1分钟
  },
  actualDuration: {
    type: Number, // 实际时长（秒）
    min: 0
  },
  
  // 练习状态
  status: {
    type: String,
    enum: ['started', 'completed', 'interrupted'],
    default: 'started'
  },
  
  // 系统字段
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
});

// 更新时间中间件
MindfulnessSessionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// 结束会话方法
MindfulnessSessionSchema.methods.complete = function(actualDuration) {
  this.status = 'completed';
  this.actualDuration = actualDuration;
  this.completedAt = Date.now();
};

// 中断会话方法
MindfulnessSessionSchema.methods.interrupt = function(actualDuration) {
  this.status = 'interrupted';
  this.actualDuration = actualDuration;
  this.completedAt = Date.now();
};

export default mongoose.model('MindfulnessSession', MindfulnessSessionSchema);
