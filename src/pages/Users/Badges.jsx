import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { userAPI } from '../../services/api';

const Badges = () => {
  const { user } = useAuth();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await userAPI.getBadges();
      if (response.success) {
        setBadges(response.data || []);
      } else {
        setError(response.error || '获取徽章失败');
      }
    } catch (err) {
      console.error('获取徽章错误:', err);
      setError('网络错误，请检查后端服务是否启动');
    } finally {
      setLoading(false);
    }
  };

  const getBadgeIcon = (badgeName) => {
    const iconMap = {
      '新手树洞': '🌱',
      '正念初学者': '🧘',
      '测试达人': '📊',
      '温暖使者': '💖',
      '倾诉达人': '🗣️',
      '正念大师': '🧙'
    };
    return iconMap[badgeName] || '🏆';
  };

  const getBadgeDescription = (badgeName) => {
    const descMap = {
      '新手树洞': '发布第一条树洞帖子',
      '正念初学者': '完成第一次正念练习',
      '测试达人': '完成3次心理测试',
      '温暖使者': '获得10个点赞',
      '倾诉达人': '发布10条树洞帖子',
      '正念大师': '完成10次正念练习'
    };
    return descMap[badgeName] || '完成特定任务获得';
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-handwriting text-morandi-purple">我的徽章</h1>
          <p className="text-gray-600 mt-2">记录你的成长与成就</p>
        </div>

        {error && (
          <div className="bg-emotion-red/10 border border-emotion-red rounded-xl p-3 mb-4">
            <p className="text-emotion-red text-sm">{error}</p>
          </div>
        )}

        <div className="town-card p-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">加载中...</p>
            </div>
          ) : badges.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">还没有获得徽章</p>
              <p className="text-gray-400 text-sm mt-2">完成任务解锁徽章</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {badges.map((badge, index) => (
                <div key={index} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="text-4xl">{getBadgeIcon(badge.name)}</div>
                    <div>
                      <h3 className="font-medium text-morandi-purple">{badge.name}</h3>
                      <p className="text-xs text-gray-500">
                        {badge.earnedAt ? new Date(badge.earnedAt).toLocaleDateString('zh-CN') : '未获得'}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{getBadgeDescription(badge.name)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Badges;