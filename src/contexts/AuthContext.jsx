import { createContext, useState, useEffect, useContext } from 'react';
import { authAPI, apiUtils } from '../services/api';

const AuthContext = createContext({});

// 单独的useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth必须在AuthProvider内部使用');
  }
  return context;
};

// AuthProvider组件
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 检查本地存储的token有效性
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await authAPI.getMe();
          if (response.success) {
            setUser(response.user);
            apiUtils.setUser(response.user);
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('初始化认证失败:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // 登录函数
  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      if (response.success) {
        setUser(response.user);
        apiUtils.setToken(response.token);
        apiUtils.setUser(response.user);
        setError(null);
        return { success: true, user: response.user };
      } else {
        setError(response.error);
        return { success: false, error: response.error };
      }
    } catch (error) {
      setError(error.error || '登录失败');
      return { success: false, error: error.error || '登录失败' };
    }
  };

  // 注册函数
  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      if (response.success) {
        setUser(response.user);
        apiUtils.setToken(response.token);
        apiUtils.setUser(response.user);
        setError(null);
        return { success: true, user: response.user };
      } else {
        setError(response.error);
        return { success: false, error: response.error };
      }
    } catch (error) {
      setError(error.error || '注册失败');
      return { success: false, error: error.error || '注册失败' };
    }
  };

  // 登出函数
  const logout = () => {
    setUser(null);
    apiUtils.logout();
    setError(null);
  };

  // 更新用户信息
  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
    apiUtils.setUser({ ...user, ...userData });
  };

  // 更新心情
  const updateMood = async (mood, note, tags) => {
    try {
      const response = await authAPI.updateMood(mood, note, tags);
      if (response.success) {
        updateUser(response.user);
        return { success: true };
      }
      return { success: false, error: response.error };
    } catch (error) {
      return { success: false, error: error.error };
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    updateMood,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;