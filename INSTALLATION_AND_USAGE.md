# 心栖小镇 - 安装及使用说明文档

## 1. 环境要求

### 前端环境
- **Node.js**：v16.0.0 或更高版本
- **npm**：v7.0.0 或更高版本
- **浏览器**：Chrome、Firefox、Safari、Edge 等现代浏览器

### 后端环境
- **Node.js**：v16.0.0 或更高版本
- **npm**：v7.0.0 或更高版本
- **MongoDB**：v4.0.0 或更高版本（本地或云服务均可）

## 2. 安装过程

### 2.1  安装前端依赖

```bash
# 在项目根目录执行
npm install
```

### 2.2 安装后端依赖

```bash
# 进入后端目录
cd backend
npm install
cd ..
```

### 2.3配置环境变量

#### 前端配置
在项目根目录创建 `.env` 文件，添加以下内容：

```env
# 前端环境变量
VITE_API_BASE_URL=http://localhost:5000/api
```

#### 后端配置
在 `backend` 目录创建 `.env` 文件，添加以下内容：

```env
# 后端环境变量
PORT=5000
MONGODB_URI=mongodb://localhost:27017/xinxi-town
JWT_SECRET=your_jwt_secret_key

# AI服务配置（可选）
OPENAI_API_KEY=your_openai_api_key
BAIDU_API_KEY=your_baidu_api_key
BAIDU_SECRET_KEY=your_baidu_secret_key
```

**注意**：
- `MONGODB_URI` 可以使用本地 MongoDB 或 MongoDB Atlas 等云服务
- `JWT_SECRET` 应设置为一个安全的随机字符串
- AI 服务配置为可选，若不配置，部分 AI 功能可能无法使用

## 3. 启动项目

### 3.1 启动 MongoDB 服务

如果使用本地 MongoDB，请确保 MongoDB 服务已启动：

```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### 3.2 启动后端服务

```bash
# 在 backend 目录执行
npm run dev
```

后端服务将在 `http://localhost:5000` 启动。

### 3.3 启动前端服务

```bash
# 在项目根目录执行
npm run dev
```

前端服务将在 `http://localhost:5173` 启动。

## 4. 典型使用流程

### 4.1 注册登录
1. 打开浏览器，访问 `http://localhost:5173`
2. 点击右上角的 "登录" 按钮
3. 在登录页面点击 "注册" 链接
4. 填写注册信息（邮箱、密码等）
5. 注册成功后自动登录系统

### 4.2 树洞街巷使用
1. 登录后，从导航栏进入 "树洞街巷"
2. 点击 "发布心情" 按钮
3. 选择情绪标签（焦虑、开心、孤独、释然等）
4. 输入心情内容
5. 点击 "发布" 按钮
6. 浏览他人发布的心情，可进行互动

### 4.3 正念庭院使用
1. 从导航栏进入 "正念庭院"
2. 选择练习类型（如呼吸练习、身体扫描）
3. 点击 "开始练习" 按钮
4. 跟随引导完成练习
5. 查看练习历史和统计数据

### 4.4 青鸟驿站使用
1. 从导航栏进入 "青鸟驿站"
2. 浏览心理健康文章、视频等资源
3. 点击 "预约咨询" 按钮预约专业心理咨询服务

### 4.5 鼹鼠轻诊室使用
1. 从导航栏进入 "鼹鼠轻诊室"
2. 选择测试类型（如焦虑量表、抑郁量表）
3. 完成测试题目
4. 查看 AI 分析报告和个性化建议

### 4.6 个人中心使用
1. 从导航栏进入 "个人中心"
2. 查看个人信息、心情历史、获得的徽章
3. 点击 "数据导出" 导出个人数据
4. 点击 "设置" 修改个人信息

## 5. 项目结构

```
├── backend/           # 后端代码
│   ├── middleware/    # 中间件（认证等）
│   ├── models/        # 数据模型
│   ├── routes/        # API路由
│   ├── services/      # 服务层（AI服务等）
│   ├── tests/         # 测试文件
│   ├── utils/         # 工具函数
│   └── server.js      # 服务器入口
├── src/               # 前端代码
│   ├── assets/        # 静态资源
│   ├── components/    # 通用组件
│   ├── pages/         # 页面组件
│   ├── services/      # API服务
│   ├── App.jsx        # 应用入口
│   └── main.jsx       # 渲染入口
└── package.json       # 项目配置
```

## 6. 常见问题及解决方案

### 6.1 MongoDB 连接失败
- 检查 MongoDB 服务是否已启动
- 检查 `.env` 文件中的 `MONGODB_URI` 配置是否正确
- 尝试使用 `mongodb://localhost:27017/xinxi-town` 作为默认连接字符串

### 6.2 前端无法连接后端
- 检查后端服务是否已启动
- 检查前端 `.env` 文件中的 `VITE_API_BASE_URL` 配置是否正确
- 确保后端服务在 `http://localhost:5000` 运行

### 6.3 依赖安装失败
- 确保 Node.js 和 npm 版本符合要求
- 尝试删除 `node_modules` 目录和 `package-lock.json` 文件，然后重新安装依赖
- 使用 `npm install --legacy-peer-deps` 命令安装依赖

## 7. 开发与部署

### 7.1 开发模式
- 前端：`npm run dev`
- 后端：`npm run dev`（使用 nodemon 实现热重载）

### 7.2 构建生产版本

```bash
# 构建前端
npm run build

# 构建后的文件将位于 dist 目录
```

### 7.3 生产部署
1. 构建前端生产版本
2. 将前端构建文件部署到静态文件服务器
3. 将后端代码部署到 Node.js 服务器
4. 配置环境变量（生产环境）
5. 启动后端服务

## 8. 测试

### 8.1 前端测试

```bash
# 运行前端测试
npm run test

# 运行测试并生成覆盖率报告
npm run test:coverage
```

### 8.2 后端测试

```bash
# 进入后端目录
cd backend

# 运行后端测试
npm run test

# 运行测试并生成覆盖率报告
npm run test:coverage
```

## 9. 技术栈

### 前端
- React 19 + Vite
- React Router 7
- TailwindCSS
- Axios
- Framer Motion
- Recharts

### 后端
- Express.js
- MongoDB + Mongoose
- JWT + bcryptjs

---

**心栖小镇** - 用心守护每一位学生的心理健康
