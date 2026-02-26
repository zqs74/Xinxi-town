import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { userAPI, mindfulnessAPI } from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';
import DesignTokens from '../../constants/DesignTokens';
import PageTransition from '../../components/Transition/PageTransition';
import { Chart, registerables } from 'chart.js';

// 注册Chart.js组件
Chart.register(...registerables);

// 格式化秒为"X分Y秒"格式
const formatSeconds = (totalSeconds) => {
  if (!totalSeconds || totalSeconds === 0) return '0秒';
  
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  if (minutes === 0) {
    return `${seconds}秒`;
  } else if (seconds === 0) {
    return `${minutes}分`;
  } else {
    return `${minutes}分${seconds}秒`;
  }
};

const Dashboard = () => {
  const { theme } = useTheme();
  const [userStats, setUserStats] = useState(null);
  const [mindfulnessStats, setMindfulnessStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // 获取用户统计数据
  const fetchUserStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // 并行请求多个API
      const [userStatsResponse, mindfulnessStatsResponse] = await Promise.all([
        userAPI.getStats(),
        mindfulnessAPI.getStats()
      ]);

      if (userStatsResponse.success) {
        setUserStats(userStatsResponse.data);
      }

      if (mindfulnessStatsResponse.success) {
        setMindfulnessStats(mindfulnessStatsResponse.data);
      }
    } catch (err) {
      console.error('获取统计数据错误:', err);
      setError('获取统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始化数据
  useEffect(() => {
    fetchUserStats();
  }, []);

  // 模拟活动热力图数据
  const generateHeatmapData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // 随机生成活动强度（0-3）
      const intensity = Math.floor(Math.random() * 4);
      
      data.push({
        date: date.toISOString().split('T')[0],
        intensity
      });
    }
    
    return data;
  };

  const heatmapData = generateHeatmapData();

  // 渲染热力图
  const renderHeatmap = () => {
    return (
      <div className="grid grid-cols-53 gap-1">
        {heatmapData.map((item, index) => {
          const intensityColors = ['bg-gray-100', 'bg-blue-200', 'bg-blue-400', 'bg-blue-600'];
          return (
            <div
              key={index}
              className={`w-2 h-2 rounded ${intensityColors[item.intensity]}`}
              title={`${item.date}: ${['无活动', '轻度', '中度', '高度'][item.intensity]}活动`}
            ></div>
          );
        })}
      </div>
    );
  };

  // 模拟成就数据
  const achievements = [
    {
      id: 1,
      title: '正念初学者',
      description: '完成60分钟正念练习',
      icon: '🌿',
      unlocked: true,
      date: '2024-01-15'
    },
    {
      id: 2,
      title: '情绪记录者',
      description: '记录10次情绪状态',
      icon: '📊',
      unlocked: true,
      date: '2024-01-20'
    },
    {
      id: 3,
      title: '树洞参与者',
      description: '发布5个树洞帖子',
      icon: '🌳',
      unlocked: true,
      date: '2024-01-25'
    },
    {
      id: 4,
      title: '正念达人',
      description: '完成300分钟正念练习',
      icon: '🕊️',
      unlocked: false,
      progress: 75
    },
    {
      id: 5,
      title: '情绪大师',
      description: '记录30次情绪状态',
      icon: '🧠',
      unlocked: false,
      progress: 33
    },
    {
      id: 6,
      title: '社区活跃者',
      description: '发布20个树洞帖子',
      icon: '🌟',
      unlocked: false,
      progress: 25
    }
  ];

  if (loading) {
    return (
      <PageTransition variant="fadeSlideUp" className="min-h-screen">
        <div className="max-w-6xl mx-auto p-4">
          <div className="text-center py-24">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-6 text-gray-600">加载仪表盘数据中...</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition variant="fadeSlideUp" className="min-h-screen">
        <div className="max-w-6xl mx-auto p-4">
          <div className="text-center py-24">
            <p className="text-red-500 mb-6">{error}</p>
            <button
              onClick={fetchUserStats}
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              重试
            </button>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition variant="fadeSlideUp" className="min-h-screen">
      <div className="max-w-6xl mx-auto p-4">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-handwriting text-morandi-purple">
            🐻 个人仪表盘
          </h1>
          <p className="text-gray-600 mt-2">你的心理健康成长中心</p>
        </div>

        {/* 标签页导航 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-8">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'overview', label: '概览', icon: '📋' },
              { id: 'activity', label: '活动', icon: '🔥' },
              { id: 'achievements', label: '成就', icon: '🏆' },
              { id: 'insights', label: '洞察', icon: '💡' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all ${activeTab === tab.id
                  ? 'border-b-2 border-purple-500 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 标签页内容 */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* 统计卡片 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                >
                  <div className="text-3xl text-purple-500 mb-3">🧘</div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">总练习次数</h3>
                  <p className="text-3xl font-bold text-gray-800">
                    {mindfulnessStats?.totalSessions || 0}
                  </p>
                  <p className="text-xs text-green-500 mt-2">↗ 较上周 +12%</p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                >
                  <div className="text-3xl text-blue-500 mb-3">⏱️</div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">累计练习时间</h3>
                  <p className="text-3xl font-bold text-gray-800">
                    {formatSeconds(mindfulnessStats?.totalSeconds || 0)}
                  </p>
                  <p className="text-xs text-green-500 mt-2">↗ 较上周 +8%</p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                >
                  <div className="text-3xl text-green-500 mb-3">😊</div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">情绪稳定度</h3>
                  <p className="text-3xl font-bold text-gray-800">
                    78%
                  </p>
                  <p className="text-xs text-green-500 mt-2">↗ 较上周 +5%</p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                >
                  <div className="text-3xl text-yellow-500 mb-3">🏆</div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">获得徽章</h3>
                  <p className="text-3xl font-bold text-gray-800">
                    {achievements.filter(a => a.unlocked).length}
                  </p>
                  <p className="text-xs text-blue-500 mt-2">总计 6 个</p>
                </motion.div>
              </div>

              {/* 活动概览 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* 最近活动 */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <span>📅</span>
                    最近活动
                  </h3>
                  <div className="space-y-4">
                    {[
                      {
                        icon: '🧘',
                        title: '完成正念练习',
                        description: '15分钟深度冥想',
                        time: '今天 14:30'
                      },
                      {
                        icon: '😊',
                        title: '记录心情',
                        description: '心情状态：平静',
                        time: '今天 10:15'
                      },
                      {
                        icon: '🌳',
                        title: '发布树洞',
                        description: '分享了一条心情',
                        time: '昨天 20:45'
                      },
                      {
                        icon: '🧘',
                        title: '完成正念练习',
                        description: '5分钟快速放松',
                        time: '昨天 09:30'
                      }
                    ].map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <div className="text-xl mt-0.5">{activity.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">{activity.title}</h4>
                          <p className="text-sm text-gray-500">{activity.description}</p>
                        </div>
                        <div className="text-xs text-gray-400 whitespace-nowrap">
                          {activity.time}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* 练习习惯 */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <span>📊</span>
                    练习习惯
                  </h3>
                  <div className="space-y-4">
                    {[
                      { label: '每日练习', value: 75, target: 80 },
                      { label: '周末坚持', value: 90, target: 70 },
                      { label: '连续天数', value: 12, target: 30 },
                      { label: '平均时长', value: 12, target: 15 }
                    ].map((habit, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">{habit.label}</span>
                          <span className="text-sm font-medium text-gray-700">
                            {habit.label === '连续天数' || habit.label === '平均时长' 
                              ? `${habit.value} ${habit.label === '平均时长' ? '分钟' : '天'}`
                              : `${habit.value}%`}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, (habit.value / habit.target) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* 活动热力图 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span>🔥</span>
                  活动热力图
                </h3>
                <p className="text-sm text-gray-500 mb-6">过去一年的活动强度</p>
                <div className="overflow-x-auto">
                  <div className="min-w-max">
                    {renderHeatmap()}
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">活动强度：</span>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map(intensity => (
                        <div
                          key={intensity}
                          className={`w-3 h-3 rounded ${[
                            'bg-gray-100',
                            'bg-blue-200',
                            'bg-blue-400',
                            'bg-blue-600'
                          ][intensity]}`}
                        ></div>
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">过去 365 天</span>
                </div>
              </div>

              {/* 活动趋势 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span>📈</span>
                  活动趋势
                </h3>
                <div style={{ height: 300 }}>
                  {/* 这里可以添加活动趋势图表 */}
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400">活动趋势图表</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* 成就列表 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <span>🏆</span>
                  我的成就
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`rounded-xl p-5 border ${achievement.unlocked
                        ? 'bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200'
                        : 'bg-gray-50 border-gray-200'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-3xl">{achievement.icon}</div>
                        {achievement.unlocked ? (
                          <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            已解锁
                          </div>
                        ) : (
                          <div className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            进行中
                          </div>
                        )}
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-1">{achievement.title}</h4>
                      <p className="text-sm text-gray-500 mb-3">{achievement.description}</p>
                      {!achievement.unlocked && (
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-500">进度</span>
                            <span className="text-xs font-medium text-gray-700">
                              {achievement.progress}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                              style={{ width: `${achievement.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      {achievement.unlocked && (
                        <p className="text-xs text-gray-500 mt-2">
                          解锁于: {achievement.date}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* 个人洞察 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span>💡</span>
                  个人洞察
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      title: '练习建议',
                      content: '你在工作日的练习频率较低，建议在早上添加5分钟的快速放松练习，提升专注力。',
                      icon: '🧘',
                      color: 'purple'
                    },
                    {
                      title: '情绪趋势',
                      content: '你的情绪在周末较为稳定，工作日下午容易出现焦虑，建议在这个时段进行呼吸练习。',
                      icon: '😊',
                      color: 'blue'
                    },
                    {
                      title: '成长轨迹',
                      content: '你已经连续练习12天，继续保持这个习惯，30天后将获得"坚持达人"徽章。',
                      icon: '🚀',
                      color: 'green'
                    }
                  ].map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border ${insight.color === 'purple'
                        ? 'bg-purple-50 border-purple-200'
                        : insight.color === 'blue'
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-green-50 border-green-200'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-xl mt-0.5">{insight.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800 mb-1">{insight.title}</h4>
                          <p className="text-sm text-gray-600">{insight.content}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* 目标设定 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span>🎯</span>
                  目标设定
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      title: '每日练习',
                      current: 4, // 每周天数
                      target: 7,
                      unit: '天/周'
                    },
                    {
                      title: '练习时长',
                      current: 45,
                      target: 60,
                      unit: '分钟/周'
                    },
                    {
                      title: '心情记录',
                      current: 3,
                      target: 7,
                      unit: '次/周'
                    }
                  ].map((goal, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">{goal.title}</span>
                        <span className="text-sm font-medium text-gray-700">
                          {goal.current}/{goal.target} {goal.unit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (goal.current / goal.target) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="mt-6 w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  更新目标
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

export default Dashboard;