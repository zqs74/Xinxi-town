# 心栖小镇项目目录说明

## 本文件夹作用
本文件夹包含心栖小镇项目的完整代码，是一个基于AI技术的学生心理健康支持平台。项目采用前后端分离架构，融合了树洞倾诉、正念练习、心理咨询、心理测试等功能，旨在为学生提供全方位的心理健康服务。

## 文件结构及描述

### 主要目录

1. **backend/** - 后端代码目录
   - `middleware/` - 中间件（如认证中间件）
   - `models/` - 数据模型（用户、树洞帖子、测试结果等）
   - `routes/` - API路由（认证、树洞、正念、测试等）
   - `services/` - 服务层（AI服务、测试分析等）
   - `tests/` - 测试文件
   - `utils/` - 工具函数
   - `server.js` - 后端服务器入口文件
   - `package.json` - 后端依赖配置

2. **src/** - 前端代码目录
   - `assets/` - 静态资源
   - `components/` - 通用组件（布局、交互、UI等）
   - `pages/` - 页面组件（首页、登录、树洞、正念等）
   - `services/` - API服务
   - `contexts/` - 上下文（认证、主题等）
   - `App.jsx` - 前端应用入口
   - `main.jsx` - 前端渲染入口

3. **dist/** - 前端构建输出目录
   - 包含构建后的静态文件

4. **public/** - 公共静态资源
   - 包含favicon、图片等

5. **运行代码、API文档、开发文档、用户手册等/** - 项目文档目录
   - 包含API文档、开发文档、用户手册等

### 配置文件

- `.env` - 环境变量配置
- `package.json` - 前端依赖配置
- `vite.config.js` - Vite构建配置
- `tailwind.config.js` - TailwindCSS配置
- `eslint.config.js` - ESLint配置

### 文档文件

- `INSTALLATION_AND_USAGE.md` - 安装及使用说明文档
- `README.md` - 项目说明文档

## 技术栈

- **前端**：React 19 + Vite + TailwindCSS + React Router 7
- **后端**：Express.js + MongoDB + Mongoose + JWT
- **AI集成**：OpenAI API、百度AI API

## 运行项目

### 本地开发
1. 安装依赖：`npm install`（前端）和 `cd backend && npm install`（后端）
2. 启动MongoDB服务
3. 启动后端服务：`cd backend && npm run dev`
4. 启动前端服务：`npm run dev`
5. 访问前端应用：http://localhost:5173

### GitHub Pages部署
1. 确保代码已推送到GitHub的main分支
2. 登录GitHub，进入仓库设置
3. 进入"Pages"设置，选择main分支的/build目录作为部署源
4. 等待自动部署完成
5. 访问部署后的网站：https://zqs74.github.io/Xinxi-town/

## 项目特点

- 前后端分离架构
- 现代化技术栈
- AI驱动的心理健康服务
- 响应式设计
- 模块化代码结构

心栖小镇 - 用心守护每一位学生的心理健康
