import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    school: '',
    studentId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      
      if (isLogin) {
        // 登录
        result = await login(formData.email, formData.password);
      } else {
        // 注册
        result = await register(formData);
      }
      
      if (result.success) {
        // 跳转到首页
        navigate('/');
      } else {
        setError(result.error || '操作失败，请重试');
      }
    } catch (err) {
      console.error('表单提交错误:', err);
      setError('网络错误，请检查后端服务是否启动');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-morandi-blue/20 to-morandi-green/20 p-4">
      <div className="town-card max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-morandi-purple to-morandi-blue rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">🏡</span>
          </div>
          <h1 className="text-3xl font-handwriting text-morandi-purple">
            欢迎来到心栖小镇
          </h1>
          <p className="text-gray-600 mt-2">
            {isLogin ? '请登录你的账户' : '创建新账户'}
          </p>
        </div>

        {error && (
          <div className="bg-emotion-red/10 border border-emotion-red rounded-xl p-3 mb-4">
            <p className="text-emotion-red text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-gray-700 mb-2">昵称</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="取一个温暖的名字"
                  className="input-field"
                  required={!isLogin}
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">学校</label>
                <input
                  type="text"
                  name="school"
                  value={formData.school}
                  onChange={handleChange}
                  placeholder="你的学校名称"
                  className="input-field"
                  required={!isLogin}
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">学号</label>
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  placeholder="可选填"
                  className="input-field"
                  disabled={loading}
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-gray-700 mb-2">邮箱</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="student@school.edu.cn"
              className="input-field"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">密码</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={isLogin ? '请输入密码' : '至少6位字符'}
              className="input-field"
              required
              minLength={6}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`btn-primary w-full mt-6 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? '处理中...' : (isLogin ? '登录' : '注册')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-morandi-purple hover:underline"
            disabled={loading}
          >
            {isLogin ? '没有账户？立即注册' : '已有账户？立即登录'}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-gray-500 text-sm text-center">
            仅限在校学生使用，需使用校园邮箱注册
          </p>
          <p className="text-gray-400 text-xs text-center mt-2">
            测试阶段：任意邮箱均可注册
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;