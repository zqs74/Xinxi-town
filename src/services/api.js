import axios from 'axios';

// 使用环境变量
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// 创建axios实例
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// 请求拦截器：添加token认证
api.interceptors.request.use(
  (config) => {
    console.log('发起API请求:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      headers: config.headers,
      data: config.data
    });
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('请求配置错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器：处理错误
api.interceptors.response.use(
  (response) => {
    // 直接返回响应数据（后端统一格式：{ success, data, message, error }）
    return response.data;
  },
  (error) => {
    console.error('API响应错误:', error);
    console.error('错误详情:', {
      message: error.message,
      config: error.config,
      response: error.response,
      request: error.request
    });
    
    if (error.response) {
      // 服务器返回了错误状态码
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // token过期或无效
          console.warn('认证失败，请重新登录');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
        case 403:
          alert('权限不足，请检查账户状态');
          break;
        case 404:
          console.warn('API端点不存在:', error.config.url);
          break;
        case 422:
          // 数据验证错误
          console.warn('数据验证失败:', data.error);
          break;
        case 500:
          console.error('服务器内部错误，请稍后再试');
          break;
        default:
          console.error('请求失败:', status, data?.error || error.message);
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.error('网络错误，请检查网络连接');
      console.error('请求配置:', error.config);
      // 只在开发环境显示详细错误信息
      if (import.meta.env.DEV) {
        alert(`无法连接到服务器: ${error.message}\n请检查网络或确认后端服务是否启动在 ${BASE_URL}`);
      } else {
        alert('无法连接到服务器，请检查网络或确认后端服务是否启动');
      }
    } else {
      // 请求配置出错
      console.error('请求配置错误:', error.message);
    }
    
    // 返回统一的错误格式
    return Promise.reject({
      success: false,
      error: error.response?.data?.error || error.message || '网络错误'
    });
  }
);

// API调用封装函数
export const apiCall = async (method, url, data = null, config = {}) => {
  try {
    const requestConfig = {
      method,
      url,
      ...config
    };
    
    // 只有当data不为null或undefined时才添加到请求中
    if (data !== null && data !== undefined) {
      requestConfig.data = data;
    }
    
    const response = await api(requestConfig);
    return response;
  } catch (error) {
    console.error(`API调用错误 [${method} ${url}]:`, error);
    throw error;
  }
};

// 用户认证API
export const authAPI = {
  // 注册
  register: (userData) => apiCall('POST', '/auth/register', userData),
  
  // 登录
  login: (credentials) => apiCall('POST', '/auth/login', credentials),
  
  // 获取当前用户信息
  getMe: () => apiCall('GET', '/auth/me'),
  
  // 更新心情状态
  updateMood: (mood, note, tags) => apiCall('POST', '/auth/mood', { mood, note, tags })
};

// 树洞API
export const treeholeAPI = {
  // 获取帖子列表
  getPosts: (params = {}) => {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = params;
    return apiCall('GET', '/treehole', null, { 
      params: { page, limit, sort, order }
    });
  },
  
  // 创建帖子
  createPost: (postData) => apiCall('POST', '/treehole', postData),
  
  // 获取帖子详情
  getPost: (postId) => apiCall('GET', `/treehole/${postId}`),
  
  // 点赞/取消点赞
  likePost: (postId) => apiCall('POST', `/treehole/${postId}/like`),
  
  // 添加评论
  addComment: (postId, content, isAnonymous = true) => 
    apiCall('POST', `/treehole/${postId}/comments`, { content, isAnonymous }),
  
  // 添加温暖回应
  addWarmResponse: (postId, response) => 
    apiCall('POST', `/treehole/${postId}/warm-response`, { response }),
  
  // 删除帖子
  deletePost: (postId) => apiCall('DELETE', `/treehole/${postId}`)
};

// 测试API - 修复提交测试方法
export const testAPI = {
  // 获取测试问题
  getQuestions: (testType = 'emotion') => apiCall('GET', `/tests/questions/${testType}`),
  
  // 提交测试（修复版）
  submitTest: async (testType, answers, questions, analysisResult, startTime, endTime, duration) => {
    try {
      console.log('🔄 提交测试到API:', { testType, answers, questions: questions?.length || 0, hasAnalysis: !!analysisResult, startTime, endTime, duration });
      
      // 格式化答案，确保所有值都是数字或数组（多选题），并过滤quick_mood
      const formattedAnswers = {};
      
      Object.keys(answers).forEach(key => {
        // 跳过快速情绪选择
        if (key === 'quick_mood') return;
        
        const value = answers[key];
        // 只处理有效值
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            // 处理多选题答案（数组）
            formattedAnswers[key] = value;
          } else {
            // 处理单选题答案
            const numValue = parseInt(value);
            if (!isNaN(numValue)) {
              formattedAnswers[key] = numValue;
            } else {
              console.warn(`问题 ${key} 的答案不是数字:`, value);
              formattedAnswers[key] = 0; // 默认值
            }
          }
        }
      });
      
      console.log('✅ 格式化后的答案:', formattedAnswers);
      console.log(`📊 共 ${Object.keys(formattedAnswers).length} 个有效答案`);
      
      // 检查是否有足够的问题答案
      if (Object.keys(formattedAnswers).length === 0) {
        throw new Error('没有有效的答案，请先完成测试');
      }
      
      // 准备提交数据
      const submitData = {
        testType,
        answers: formattedAnswers,
        startTime,
        endTime,
        duration
      };
      
      // 如果提供了问题，也一起提交
      if (questions && questions.length > 0) {
        submitData.questions = questions;
        console.log('✅ 提交测试题目:', questions.length, '个问题');
      }
      
      // 如果提供了分析结果，也一起提交
      if (analysisResult) {
        submitData.analysis = analysisResult;
      }
      
      const response = await apiCall('POST', '/tests/submit', submitData);
      
      console.log('✅ API响应成功:', {
        成功: response.success,
        消息: response.message,
        是否有分析数据: !!response.data?.analysis,
        建议数量: response.data?.analysis?.suggestions?.length || 0
      });
      
      return response;
    } catch (error) {
      console.error('❌ 提交测试API错误:', error);
      throw {
        success: false,
        error: error.error || '提交测试失败，请检查网络连接',
        details: error.message || error.details
      };
    }
  },
  
  // 获取测试历史
  getHistory: (params = {}) => {
    const { page = 1, limit = 10, testType } = params;
    return apiCall('GET', '/tests/history', null, { 
      params: { page, limit, testType }
    });
  },
  
  // 获取最新测试结果
  getLatest: () => apiCall('GET', '/tests/latest'),
  
  // 获取测试结果详情
  getResult: (resultId) => apiCall('GET', `/tests/result/${resultId}`),
  
  // 删除测试结果
  deleteResult: (resultId) => apiCall('DELETE', `/tests/result/${resultId}`)
};

// 正念API
export const mindfulnessAPI = {
  // 获取正念练习记录
  getSessions: (params = {}) => {
    const { page = 1, limit = 10 } = params;
    return apiCall('GET', '/mindfulness/sessions', null, { 
      params: { page, limit }
    });
  },
  
  // 创建正念练习会话
  startSession: (sessionData) => apiCall('POST', '/mindfulness/sessions', sessionData),
  
  // 更新正念练习会话（结束练习）
  endSession: (sessionId, actualDuration) => 
    apiCall('PUT', `/mindfulness/sessions/${sessionId}`, { actualDuration }),
  
  // 获取正念统计
  getStats: (params = {}) => {
    const { timeRange, startDate, endDate } = params;
    return apiCall('GET', '/mindfulness/stats', null, { 
      params: { timeRange, startDate, endDate }
    });
  }
};

// 咨询师API
export const consultantAPI = {
  // 获取咨询师列表
  getConsultants: (params = {}) => {
    const { expertise, available, search } = params;
    return apiCall('GET', '/consultants', null, { 
      params: { expertise, available, search }
    });
  },
  
  // 获取咨询师详情
  getConsultant: (consultantId) => apiCall('GET', `/consultants/${consultantId}`),
  
  // 预约咨询师
  bookAppointment: (appointmentData) => apiCall('POST', '/consultants/appointments', appointmentData),
  
  // 获取用户的预约记录
  getMyAppointments: (params = {}) => {
    const { status } = params;
    return apiCall('GET', '/consultants/appointments/my', null, { 
      params: { status }
    });
  },
  
  // 取消预约
  cancelAppointment: (appointmentId) => apiCall('PUT', `/consultants/appointments/${appointmentId}/cancel`)
};

// 用户API
export const userAPI = {
  // 获取用户信息
  getMe: () => apiCall('GET', '/users/me'),
  
  // 更新用户信息
  updateProfile: (userData) => apiCall('PUT', '/users/me', userData),
  
  // 修改密码
  updatePassword: (currentPassword, newPassword) => 
    apiCall('PUT', '/users/password', { currentPassword, newPassword }),
  
  // 更新心情（用户路由的）
  updateMood: (mood, note, tags) => apiCall('POST', '/users/mood', { mood, note, tags }),
  
  // 获取心情历史
  getMoodHistory: (params = {}) => {
    const { limit = 30, timeRange, startDate, endDate } = params;
    return apiCall('GET', '/users/mood/history', null, { 
      params: { limit, timeRange, startDate, endDate }
    });
  },

  // 分析情绪（基于心情和树洞内容）
  analyzeEmotion: (text) => apiCall('POST', '/ai/analyze', { text }),

  // 获取用户统计数据
  getStats: () => apiCall('GET', '/users/stats'),
  
  // 获取用户徽章
  getBadges: () => apiCall('GET', '/users/badges'),
  
  // 删除账户
  deleteAccount: (password) => apiCall('DELETE', '/users/account', { password })
};

// AI API
export const aiAPI = {
  // 与AI对话
  chat: (messages) => apiCall('POST', '/ai/chat', { messages })
};

// 全局API方法
export const apiUtils = {
  // 设置token
  setToken: (token) => {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },
  
  // 清除token
  clearToken: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  },
  
  // 检查是否已登录
  isLoggedIn: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },
  
  // 获取当前token
  getToken: () => localStorage.getItem('token'),
  
  // 设置用户信息
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  },
  
  // 获取用户信息
  getUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  // 登出
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    window.location.href = '/login';
  }
};

export default api;