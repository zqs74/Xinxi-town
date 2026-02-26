import { authAPI } from './api';

class AuthService {
  // 注册
  async register(userData) {
    try {
      const response = await authAPI.register(userData);
      
      if (response && response.success) {
        // 保存token和用户信息
        this._saveAuthData(response.token, response.user);
        return { success: true, data: response };
      } else {
        return { 
          success: false, 
          error: response?.error || '注册失败，请稍后重试' 
        };
      }
    } catch (error) {
      console.error('注册失败:', error);
      return { 
        success: false, 
        error: error?.error || error?.message || '网络错误，请检查连接' 
      };
    }
  }

  // 登录
  async login(credentials) {
    try {
      const response = await authAPI.login(credentials);
      
      if (response && response.success) {
        // 保存token和用户信息
        this._saveAuthData(response.token, response.user);
        return { success: true, data: response };
      } else {
        return { 
          success: false, 
          error: response?.error || '登录失败，请稍后重试' 
        };
      }
    } catch (error) {
      console.error('登录失败:', error);
      return { 
        success: false, 
        error: error?.error || error?.message || '网络错误，请检查连接' 
      };
    }
  }

  // 私有方法：保存认证数据
  _saveAuthData(token, user) {
    if (token) {
      localStorage.setItem('token', token);
    }
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  // 登出
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // 跳转到登录页
    window.location.href = '/login';
  }

  // 获取当前用户
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        return JSON.parse(userStr);
      }
    } catch (parseError) {
      console.error('解析用户信息失败:', parseError);
      this.logout(); // 清除损坏的数据
    }
    return null;
  }

  // 检查是否已登录
  isLoggedIn() {
    const token = localStorage.getItem('token');
    return !!token;
  }

  // 获取token
  getToken() {
    return localStorage.getItem('token');
  }

  // 验证token是否有效（简单检查）
  isTokenValid() {
    const token = this.getToken();
    if (!token) return false;
    
    // 这里可以添加更复杂的token验证逻辑
    // 比如检查过期时间等
    return true;
  }
}

// 创建单例实例
const authService = new AuthService();
export default authService;