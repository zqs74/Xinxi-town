import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 路由导入
import authRoutes from './routes/auth.js';
import treeholeRoutes from './routes/treehole.js';
import mindfulnessRoutes from './routes/mindfulness.js';
import testsRoutes from './routes/tests.js';
import consultantsRoutes from './routes/consultants.js';
import usersRoutes from './routes/users.js';
import aiRoutes from './routes/ai.js';

// ES6 模块没有 __dirname，需要这样获取
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

// 中间件
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://localhost:8080'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// 路由
app.get('/', (req, res) => {
  res.json({
    message: '心栖小镇后端服务 (ES6 模块)',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// 注册路由
app.use('/api/auth', authRoutes);
app.use('/api/treehole', treeholeRoutes);
app.use('/api/mindfulness', mindfulnessRoutes);
app.use('/api/tests', testsRoutes);
app.use('/api/consultants', consultantsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/ai', aiRoutes);

// 数据库连接
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/xinxi-town', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB 数据库连接成功');
  } catch (error) {
    console.warn('⚠️ MongoDB 数据库连接失败:', error.message);
    console.warn('⚠️ 服务器将在无数据库连接的情况下启动');
  }
};

const PORT = process.env.PORT || 5000;

// 启动服务器
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 后端服务启动成功 (ES6 模块)`);
    console.log(`📡 http://localhost:${PORT}`);
  });
};

startServer();