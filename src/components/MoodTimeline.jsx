import { useState, useEffect, useRef, useCallback } from 'react';
import { userAPI, treeholeAPI } from '../services/api';
import { apiUtils } from '../services/api';
import { Chart, registerables } from 'chart.js';
import './MoodTimeline.css';

// 注册Chart.js组件
Chart.register(...registerables);

const MoodTimeline = () => {
  const [moodRecords, setMoodRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [treeholePosts, setTreeholePosts] = useState([]);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [timeRange, setTimeRange] = useState('7d');
  
  // Chart引用
  const trendChartRef = useRef(null);
  const distributionChartRef = useRef(null);
  
  // 图表实例
  const trendChartInstance = useRef(null);
  const distributionChartInstance = useRef(null);

  // 情绪选项
  const moodOptions = [
    { emoji: '😊', label: '平静', value: 'calm' },
    { emoji: '😢', label: '难过', value: 'sad' },
    { emoji: '🤯', label: '焦虑', value: 'anxious' },
    { emoji: '😴', label: '疲惫', value: 'tired' },
    { emoji: '🎉', label: '兴奋', value: 'excited' },
    { emoji: '😠', label: '愤怒', value: 'angry' },
    { emoji: '😌', label: '放松', value: 'relaxed' },
    { emoji: '😰', label: '紧张', value: 'nervous' },
    { emoji: '🤗', label: '温暖', value: 'warm' },
    { emoji: '😓', label: '压力', value: 'stressed' }
  ];

  // 获取心情记录
  const fetchMoodRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let allRecords = [];
      
      // 从后端获取心情记录（优先使用后端数据）
      if (apiUtils.isLoggedIn()) {
        try {
          const response = await userAPI.getMoodHistory({ timeRange });
          if (response.success && response.data) {
            // 转换后端记录格式，确保包含emoji和label字段
            const backendRecords = response.data.map(record => {
              // 从记录中提取emoji和label
              let emoji = '😊';
              let label = record.mood;
              
              // 解析记录的note字段，提取emoji和label
              if (record.note) {
                const emojiMatch = record.note.match(/\(([^)]+)\)/);
                if (emojiMatch && emojiMatch[1]) {
                  emoji = emojiMatch[1];
                }
                
                const labelMatch = record.note.match(/情绪打卡：([^\(]+)/);
                if (labelMatch && labelMatch[1]) {
                  label = labelMatch[1].trim();
                }
              }
              
              return {
                _id: record._id || `backend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                mood: record.mood,
                note: record.note || '',
                createdAt: record.date || record.createdAt,
                emoji: emoji,
                label: label,
                isLocal: false
              };
            });
            
            allRecords = backendRecords;
          } else {
            console.error('获取心情记录失败:', response.error);
          }
        } catch (apiError) {
          console.error('获取心情记录失败:', apiError);
        }
      }
      
      // 只有当后端没有返回数据时，才使用localStorage中的数据
      if (allRecords.length === 0) {
        // 从localStorage获取本地心情记录
        const localRecords = [];
        
        // 获取所有本地历史记录
        const moodHistory = JSON.parse(localStorage.getItem('moodHistory') || '[]');
        if (moodHistory.length > 0) {
          // 根据时间范围过滤本地记录
          const now = new Date();
          let days = 7;
          if (timeRange === '30d') days = 30;
          else if (timeRange === '90d') days = 90;
          else if (timeRange === '365d') days = 365;
          else if (timeRange === 'all') days = 3650; // 约10年
          
          const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
          
          const filteredRecords = moodHistory.filter(record => {
            const recordDate = new Date(record.checkInTimestamp);
            return recordDate >= cutoffDate;
          });
          
          localRecords.push(...filteredRecords.map(record => ({
            _id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            mood: record.moodValue,
            note: `情绪打卡：${record.moodLabel} (${record.emoji})`,
            createdAt: record.checkInTimestamp,
            emoji: record.emoji,
            label: record.moodLabel,
            isLocal: true
          })));
        } else {
          // 兼容旧格式，获取最后一条记录
          const lastMoodCheckIn = localStorage.getItem('lastMoodCheckIn');
          const lastMood = localStorage.getItem('lastMood');
          const lastMoodTimestamp = localStorage.getItem('lastMoodTimestamp');
          const lastMoodEmoji = localStorage.getItem('lastMoodEmoji');
          const lastMoodLabel = localStorage.getItem('lastMoodLabel');
          
          if (lastMoodCheckIn && lastMood && lastMoodTimestamp) {
            localRecords.push({
              _id: `local_${Date.now()}`,
              mood: lastMood,
              note: `今日情绪打卡：${lastMoodLabel}${lastMoodEmoji ? ` (${lastMoodEmoji})` : ''}`,
              createdAt: lastMoodTimestamp,
              emoji: lastMoodEmoji,
              label: lastMoodLabel,
              isLocal: true
            });
          }
        }
        
        allRecords = localRecords;
      }
      
      // 按时间倒序排序
      allRecords.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setMoodRecords(allRecords);
    } catch (error) {
      console.error('获取心情记录错误:', error);
      setError('获取心情记录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  // 获取树洞帖子
  const fetchTreeholePosts = async () => {
    try {
      if (apiUtils.isLoggedIn()) {
        const response = await treeholeAPI.getPosts({ limit: 50 });
        if (response.success) {
          setTreeholePosts(response.data || []);
        } else {
          console.error('获取树洞帖子失败:', response.error);
        }
      }
    } catch (error) {
      console.error('获取树洞帖子错误:', error);
    }
  };

  // 初始化数据
  useEffect(() => {
    fetchMoodRecords();
    fetchTreeholePosts();
  }, [fetchMoodRecords]);

  // 切换展开/收起状态
  const toggleExpand = (recordId) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(recordId)) {
        newSet.delete(recordId);
      } else {
        newSet.add(recordId);
      }
      return newSet;
    });
  };

  // 获取情绪对应的表情和标签
  const getMoodInfo = (moodValue) => {
    // 检查是否为自定义情绪
    if (moodValue.startsWith('custom_')) {
      const customMood = localStorage.getItem('lastCustomMood');
      if (customMood) {
        try {
          const parsed = JSON.parse(customMood);
          if (parsed.value === moodValue) {
            return {
              emoji: parsed.emoji,
              label: parsed.label
            };
          }
        } catch (error) {
          console.error('解析自定义情绪失败:', error);
        }
      }
      return {
        emoji: '😊',
        label: '自定义'
      };
    }
    
    // 查找预设情绪
    const moodInfo = moodOptions.find(m => m.value === moodValue);
    return moodInfo || {
      emoji: '😊',
      label: '其他'
    };
  };

  // 格式化时间
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // 格式化日期
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  // 获取与心情记录相关的树洞帖子
  const getRelatedTreeholePosts = (recordTimestamp) => {
    const recordDate = new Date(recordTimestamp);
    
    // 找到当前记录在排序后的记录列表中的索引
    const sortedRecords = [...moodRecords].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const recordIndex = sortedRecords.findIndex(r => r.createdAt === recordTimestamp);
    
    // 确定当前心情状态的结束时间
    let endTime;
    if (recordIndex < sortedRecords.length - 1) {
      // 如果不是最后一条记录，使用下一条记录的时间作为结束时间
      endTime = new Date(sortedRecords[recordIndex + 1].createdAt);
    } else {
      // 如果是最后一条记录，使用当前时间作为结束时间
      endTime = new Date();
    }
    
    // 过滤出在当前心情状态期间发布的树洞帖子
    return treeholePosts.filter(post => {
      if (!post.createdAt) return false;
      const postDate = new Date(post.createdAt);
      return postDate >= recordDate && postDate < endTime;
    });
  };
  
  // 按日期分组记录
  const groupRecordsByDate = () => {
    const grouped = {};
    
    moodRecords.forEach(record => {
      const date = new Date(record.createdAt).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(record);
    });
    
    return grouped;
  };

  const groupedRecords = groupRecordsByDate();
  const sortedDates = Object.keys(groupedRecords).sort((a, b) => new Date(b) - new Date(a));

  // 初始化图表
  const initCharts = () => {
    if (!moodRecords.length) {
      console.log('没有心情记录，跳过图表初始化');
      return;
    }

    // 销毁现有图表
    if (trendChartInstance.current) {
      trendChartInstance.current.destroy();
    }
    if (distributionChartInstance.current) {
      distributionChartInstance.current.destroy();
    }

    // 准备时间范围数据
    const now = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // 过滤时间范围内的记录
    const filteredRecords = moodRecords.filter(record => {
      const recordDate = new Date(record.createdAt);
      return recordDate >= startDate && recordDate <= now;
    });

    // 1. 情绪变化趋势图
    if (trendChartRef.current) {
      // 按日期分组情绪数据
      const dailyMoods = {};
      filteredRecords.forEach(record => {
        const date = new Date(record.createdAt).toISOString().split('T')[0];
        if (!dailyMoods[date]) {
          dailyMoods[date] = [];
        }
        dailyMoods[date].push(record);
      });

      // 准备图表数据
      const labels = Object.keys(dailyMoods).sort();
      const data = labels.map(date => {
        // 计算每天的主要情绪
        const dayRecords = dailyMoods[date];
        const moodCounts = {};
        
        dayRecords.forEach(record => {
          const moodInfo = getMoodInfo(record.mood);
          moodCounts[moodInfo.label] = (moodCounts[moodInfo.label] || 0) + 1;
        });

        // 找出最常见的情绪
        let mainMood = '平静';
        let maxCount = 0;
        Object.entries(moodCounts).forEach(([mood, count]) => {
          if (count > maxCount) {
            mainMood = mood;
            maxCount = count;
          }
        });

        return mainMood;
      });

      // 情绪映射到数值
      const moodValues = {
        '平静': 0,
        '难过': -2,
        '焦虑': -1,
        '疲惫': -1,
        '兴奋': 2,
        '愤怒': -2,
        '放松': 1,
        '紧张': -1,
        '温暖': 2,
        '压力': -1,
        '其他': 0
      };

      const moodColors = {
        '平静': '#6366f1',
        '难过': '#f43f5e',
        '焦虑': '#fb923c',
        '疲惫': '#94a3b8',
        '兴奋': '#22c55e',
        '愤怒': '#ef4444',
        '放松': '#8b5cf6',
        '紧张': '#f59e0b',
        '温暖': '#ec4899',
        '压力': '#14b8a6',
        '其他': '#6366f1'
      };

      const numericalData = data.map(mood => moodValues[mood] || 0);
      const backgroundColor = data.map(mood => moodColors[mood] || '#6366f1');
      
      // 计算情绪数据的实际范围
      const minMood = Math.min(...numericalData, -3);
      const maxMood = Math.max(...numericalData, 3);
      const moodRange = maxMood - minMood;
      
      // 智能计算Y轴刻度
      const calculateMoodScale = (min, max) => {
        const range = max - min;
        const targetSteps = 6;
        const roughStep = range / targetSteps;
        
        const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
        const normalizedStep = roughStep / magnitude;
        
        let niceStep;
        if (normalizedStep < 1.5) {
          niceStep = 1;
        } else if (normalizedStep < 3) {
          niceStep = 2;
        } else if (normalizedStep < 7) {
          niceStep = 5;
        } else {
          niceStep = 10;
        }
        
        const step = niceStep * magnitude;
        const niceMin = Math.floor(min / step) * step;
        const niceMax = Math.ceil(max / step) * step;
        
        return { min: niceMin, max: niceMax, step };
      };
      
      const moodScale = calculateMoodScale(minMood, maxMood);

      trendChartInstance.current = new Chart(trendChartRef.current, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: '情绪趋势',
            data: numericalData,
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: backgroundColor,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              labels: {
                color: '#6366f1',
                font: {
                  size: 12,
                  weight: '500'
                }
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const index = context.dataIndex;
                  return `情绪: ${data[index]}`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: {
                color: 'rgba(99, 102, 241, 0.2)',
                drawBorder: false
              },
              ticks: {
                color: '#6366f1',
                font: {
                  size: 12,
                  weight: '500'
                }
              },
              border: {
                display: false
              }
            },
            y: {
              grid: {
                color: 'rgba(99, 102, 241, 0.2)',
                drawBorder: false
              },
              ticks: {
                color: '#6366f1',
                font: {
                  size: 12,
                  weight: '500'
                },
                stepSize: moodScale.step
              },
              border: {
                display: false
              },
              beginAtZero: false,
              min: moodScale.min,
              max: moodScale.max
            }
          }
        }
      });
    }

    // 2. 情绪分布饼图
    if (distributionChartRef.current) {
      // 统计情绪分布
      const moodDistribution = {};
      filteredRecords.forEach(record => {
        const moodInfo = getMoodInfo(record.mood);
        moodDistribution[moodInfo.label] = (moodDistribution[moodInfo.label] || 0) + 1;
      });

      const labels = Object.keys(moodDistribution);
      const data = Object.values(moodDistribution);
      const backgroundColors = labels.map(label => moodColors[label] || '#6366f1');

      distributionChartInstance.current = new Chart(distributionChartRef.current, {
        type: 'pie',
        data: {
          labels,
          datasets: [{
            data,
            backgroundColor,
            borderColor: '#fff',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#6366f1',
                font: {
                  size: 12,
                  weight: '500'
                }
              }
            }
          }
        }
      });
    }
  };

  // 初始化图表
  useEffect(() => {
    if (moodRecords.length > 0) {
      initCharts();
    }

    // 清理函数
    return () => {
      if (trendChartInstance.current) {
        trendChartInstance.current.destroy();
      }
      if (distributionChartInstance.current) {
        distributionChartInstance.current.destroy();
      }
    };
  }, [moodRecords, timeRange]);

  return (
    <div className="mood-timeline">
      {loading ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-500">加载心情记录中...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-red-500 mb-2">{error}</p>
          <button 
            className="text-morandi-purple hover:underline"
            onClick={fetchMoodRecords}
          >
            重试
          </button>
        </div>
      ) : moodRecords.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-gray-500">还没有心情记录</p>
          <p className="text-gray-400 text-sm mt-2">开始记录你的心情吧</p>
        </div>
      ) : (
        <>
          {/* 情绪图表区域 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h3 className="text-xl font-semibold text-morandi-purple mb-2">
                  📈 情绪变化分析
                </h3>
                <p className="text-gray-600">了解你的情绪变化趋势</p>
              </div>
              <div className="flex gap-2">
                {
                  [
                    { value: '7d', label: '7天' },
                    { value: '30d', label: '30天' },
                    { value: '90d', label: '90天' },
                    { value: '365d', label: '1年' },
                    { value: 'all', label: '全部' }
                  ].map(range => (
                    <button
                      key={range.value}
                      onClick={() => setTimeRange(range.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all ${timeRange === range.value
                        ? 'bg-purple-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      {range.label}
                    </button>
                  ))
                }
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 情绪变化趋势图 */}
              <div>
                <h4 className="text-lg font-medium text-gray-800 mb-3">情绪趋势</h4>
                <div style={{ height: 300 }}>
                  <canvas ref={trendChartRef}></canvas>
                </div>
              </div>

              {/* 情绪分布饼图 */}
              <div>
                <h4 className="text-lg font-medium text-gray-800 mb-3">情绪分布</h4>
                <div style={{ height: 300 }}>
                  <canvas ref={distributionChartRef}></canvas>
                </div>
              </div>
            </div>
          </div>

          {/* 心情记录时间轴 */}
          <div className="space-y-8">
            {sortedDates.map((date, dateIndex) => (
              <div key={date} className="timeline-date-group">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-morandi-purple">
                    {formatDate(groupedRecords[date][0].createdAt)}
                  </h3>
                </div>
                
                <div className="relative">
                  {/* 时间轴主线 */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  
                  {/* 记录列表 */}
                  <div className="space-y-6">
                    {groupedRecords[date].map((record, index) => {
                      const moodInfo = getMoodInfo(record.mood);
                      const isExpanded = expandedItems.has(record._id);
                      const relatedPosts = getRelatedTreeholePosts(record.createdAt);
                      
                      return (
                        <div 
                          key={record._id} 
                          className="timeline-item relative pl-12"
                          style={{ animationDelay: `${dateIndex * 0.1 + index * 0.05}s` }}
                        >
                          {/* 时间轴节点 */}
                          <div className="absolute left-2 top-2 w-4 h-4 rounded-full bg-morandi-purple transform -translate-x-1/2"></div>
                          
                          {/* 记录内容 */}
                          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="text-2xl">{moodInfo.emoji}</div>
                                <div>
                                  <h4 className="font-medium text-gray-800">{moodInfo.label}</h4>
                                  <p className="text-sm text-gray-500">{formatTime(record.createdAt)}</p>
                                </div>
                              </div>
                              <button
                                className="text-gray-400 hover:text-morandi-purple transition-colors"
                                onClick={() => toggleExpand(record._id)}
                              >
                                {isExpanded ? '▼' : '▶'}
                              </button>
                            </div>
                            
                            {/* 展开内容 */}
                            {isExpanded && (
                              <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
                                <p className="text-sm text-gray-600 mb-4">{record.note || '无备注'}</p>
                                 
                                {/* 相关树洞帖子 */}
                                {relatedPosts.length > 0 && (
                                  <div className="mt-4">
                                    <h5 className="text-sm font-medium text-gray-500 mb-3">相关树洞帖子</h5>
                                    <div className="space-y-3">
                                      {relatedPosts.map((post) => (
                                        <div key={post._id} className="bg-gray-50 rounded-lg p-3 text-sm">
                                          <p className="text-gray-700 mb-2 line-clamp-2">{post.content}</p>
                                          <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>
                                              {post.isAnonymous ? '匿名用户' : post.userId?.username || '用户'}
                                            </span>
                                            <span>{new Date(post.createdAt).toLocaleString('zh-CN')}</span>
                                          </div>
                                          {post.emotionAnalysis && (
                                            <div className="mt-2 flex items-center space-x-2">
                                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                                {post.emotionAnalysis.sentiment || '平静'}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MoodTimeline;