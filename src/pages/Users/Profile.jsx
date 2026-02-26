import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { userAPI } from '../../services/api';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    school: '',
    studentId: '',
    grade: '',
    major: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        school: user.school || '',
        studentId: user.studentId || '',
        grade: user.grade || '',
        major: user.major || ''
      });
    }
  }, [user]);

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
    setSuccess('');

    try {
      const response = await userAPI.updateProfile(formData);
      if (response.success) {
        updateUser(response.user);
        setSuccess('个人信息更新成功');
      } else {
        setError(response.error || '更新失败，请重试');
      }
    } catch (err) {
      console.error('更新个人信息错误:', err);
      setError('网络错误，请检查后端服务是否启动');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-handwriting text-morandi-purple">个人中心</h1>
          <p className="text-gray-600 mt-2">管理你的个人信息</p>
        </div>

        <div className="town-card p-6">
          {error && (
            <div className="bg-emotion-red/10 border border-emotion-red rounded-xl p-3 mb-4">
              <p className="text-emotion-red text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-emotion-green/10 border border-emotion-green rounded-xl p-3 mb-4">
              <p className="text-emotion-green text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">昵称</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="你的昵称"
                className="input-field"
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
                placeholder="你的学号"
                className="input-field"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">年级</label>
              <input
                type="text"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                placeholder="例如：2024级"
                className="input-field"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">专业</label>
              <input
                type="text"
                name="major"
                value={formData.major}
                onChange={handleChange}
                placeholder="你的专业"
                className="input-field"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`btn-primary w-full mt-6 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? '保存中...' : '保存修改'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;