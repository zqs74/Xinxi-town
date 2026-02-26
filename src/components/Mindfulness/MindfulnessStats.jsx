import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mindfulnessAPI } from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';
import DesignTokens from '../../constants/DesignTokens';
import { Chart, registerables } from 'chart.js';
import StatsExport from './StatsExport';

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

const MindfulnessStats = () => {
  const { theme } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');
  
  // Chart引用
  const trendChartRef = useRef(null);
  const distributionChartRef = useRef(null);
  const frequencyChartRef = useRef(null);
  
  // 图表实例
  const trendChartInstance = useRef(null);
  const distributionChartInstance = useRef(null);
  const frequencyChartInstance = useRef(null);

  // 获取统计数据
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await mindfulnessAPI.getStats({ timeRange });
      if (response.success) {
        console.log('获取到的统计数据:', response.data);
        console.log('dailyStats:', response.data?.dailyStats);
        console.log('dailyStats 长度:', response.data?.dailyStats?.length);
        setStats(response.data);
      } else {
        setError('获取统计数据失败');
      }
    } catch (err) {
      console.error('获取统计数据错误:', err);
      setError('网络错误，请检查连接');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  // 初始化图表
  const initCharts = () => {
    if (!stats || !stats.dailyStats || stats.dailyStats.length === 0) {
      console.log('没有数据，跳过图表初始化');
      return;
    }

    // 销毁现有图表
    if (trendChartInstance.current) {
      trendChartInstance.current.destroy();
    }
    if (distributionChartInstance.current) {
      distributionChartInstance.current.destroy();
    }
    if (frequencyChartInstance.current) {
      frequencyChartInstance.current.destroy();
    }

    // 准备数据
    const dailyData = stats.dailyStats || [];
    const labels = dailyData.map(item => item.date);
    const minutes = dailyData.map(item => item.totalMinutes);
    const counts = dailyData.map(item => item.count);
    
    // 智能计算Y轴刻度范围
    const calculateNiceScale = (data) => {
      if (data.length === 0) return { min: 0, max: 10, step: 2 };
      
      const max = Math.max(...data, 0);
      const min = 0;
      
      if (max === 0) return { min: 0, max: 10, step: 2 };
      
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
      const niceMax = Math.ceil(max / step) * step;
      
      return { min, max: niceMax, step };
    };
    
    const minutesScale = calculateNiceScale(minutes);
    const countScale = calculateNiceScale(counts);
    
    // 主题颜色
    const primaryColor = theme.colors.primary;
    const secondaryColor = theme.colors.secondary;
    const backgroundColor = theme.colors.background;
    const textColor = theme.colors.text || DesignTokens.colors.neutral.gray800;

    // 1. 每日练习时长趋势图
    if (trendChartRef.current) {
      trendChartInstance.current = new Chart(trendChartRef.current, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: '练习时长（分钟）',
            data: minutes,
            borderColor: primaryColor,
            backgroundColor: `${primaryColor}20`,
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: primaryColor,
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
                color: textColor
              }
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              backgroundColor: `${backgroundColor}CC`,
              titleColor: textColor,
              bodyColor: textColor,
              borderColor: primaryColor,
              borderWidth: 1
            }
          },
          scales: {
            x: {
              grid: {
                color: `${textColor}20`,
                drawBorder: false
              },
              ticks: {
                color: textColor,
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
                color: `${textColor}20`,
                drawBorder: false
              },
              ticks: {
                color: textColor,
                font: {
                  size: 12,
                  weight: '500'
                },
                stepSize: minutesScale.step
              },
              border: {
                display: false
              },
              beginAtZero: true,
              min: minutesScale.min,
              max: minutesScale.max
            }
          }
        }
      });
    }

    // 2. 练习类型分布（饼图）
    if (distributionChartRef.current) {
      // 模拟练习类型数据
      const exerciseTypes = [
        { name: '5分钟快速放松', value: 12 },
        { name: '15分钟深度冥想', value: 8 },
        { name: '睡前助眠引导', value: 5 },
        { name: '专注力训练', value: 7 }
      ];

      distributionChartInstance.current = new Chart(distributionChartRef.current, {
        type: 'pie',
        data: {
          labels: exerciseTypes.map(item => item.name),
          datasets: [{
            data: exerciseTypes.map(item => item.value),
            backgroundColor: [
              primaryColor,
              secondaryColor,
              DesignTokens.colors.morandi.green,
              DesignTokens.colors.morandi.pink
            ],
            borderColor: backgroundColor,
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
                color: textColor,
                padding: 20,
                font: {
                  size: 12,
                  weight: '500'
                }
              }
            },
            tooltip: {
              backgroundColor: `${backgroundColor}CC`,
              titleColor: textColor,
              bodyColor: textColor,
              borderColor: primaryColor,
              borderWidth: 1
            }
          }
        }
      });
    }

    // 3. 练习频率分析（柱状图）
    if (frequencyChartRef.current) {
      // 按星期几分组
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      const weeklyData = Array(7).fill(0);
      
      // 模拟数据：根据日期计算星期几并统计
      dailyData.forEach(item => {
        const date = new Date(item.date);
        const day = date.getDay();
        weeklyData[day] += item.count;
      });

      frequencyChartInstance.current = new Chart(frequencyChartRef.current, {
        type: 'bar',
        data: {
          labels: weekdays,
          datasets: [{
            label: '练习次数',
            data: weeklyData,
            backgroundColor: `${primaryColor}80`,
            borderColor: primaryColor,
            borderWidth: 1,
            borderRadius: 8,
            barThickness: 24
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              labels: {
                color: textColor
              }
            },
            tooltip: {
              backgroundColor: `${backgroundColor}CC`,
              titleColor: textColor,
              bodyColor: textColor,
              borderColor: primaryColor,
              borderWidth: 1
            }
          },
          scales: {
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: textColor,
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
                color: `${textColor}20`,
                drawBorder: false
              },
              ticks: {
                color: textColor,
                font: {
                  size: 12,
                  weight: '500'
                },
                stepSize: countScale.step
              },
              border: {
                display: false
              },
              beginAtZero: true,
              min: countScale.min,
              max: countScale.max
            }
          }
        }
      });
    }
  };

  // 获取统计数据
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // 初始化图表
  useEffect(() => {
    if (stats) {
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
      if (frequencyChartInstance.current) {
        frequencyChartInstance.current.destroy();
      }
    };
  }, [stats, theme]);

  // 时间范围选项
  const timeRangeOptions = [
    { value: '7d', label: '最近7天' },
    { value: '30d', label: '最近30天' },
    { value: '90d', label: '最近90天' },
    { value: '365d', label: '最近一年' },
    { value: 'all', label: '全部时间' }
  ];

  if (loading) {
    return (
      <div className="town-card p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载统计数据中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="town-card p-6">
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  if (!stats || !stats.dailyStats || stats.dailyStats.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="town-card p-6"
      >
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-2xl font-handwriting text-morandi-purple mb-2">
            暂无练习数据
          </h3>
          <p className="text-gray-600 mb-6">
            开始你的第一次正念练习，记录你的进步吧！
          </p>
          <button
            onClick={() => window.location.href = '/mindfulness'}
            className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            开始练习
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="town-card p-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h3 className="text-2xl font-handwriting text-morandi-purple mb-2">
            📊 正念练习统计
          </h3>
          <p className="text-gray-600">追踪你的练习进度和习惯</p>
        </div>
        <div className="flex gap-2">
          {timeRangeOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setTimeRange(option.value)}
              className={`px-4 py-2 rounded-full text-sm transition-all ${timeRange === option.value
                ? 'bg-purple-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
        >
          <div className="text-2xl text-purple-500 mb-2">🎯</div>
          <h4 className="text-gray-500 text-sm mb-1">总练习次数</h4>
          <p className="text-3xl font-bold text-gray-800">
            {stats?.totalSessions || 0}
          </p>
        </motion.div>
        
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
        >
          <div className="text-2xl text-blue-500 mb-2">⏱️</div>
          <h4 className="text-gray-500 text-sm mb-1">累计练习时间</h4>
          <p className="text-3xl font-bold text-gray-800">
            {formatSeconds(stats?.totalSeconds || 0)}
          </p>
        </motion.div>
        
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
        >
          <div className="text-2xl text-green-500 mb-2">📈</div>
          <h4 className="text-gray-500 text-sm mb-1">平均练习时长</h4>
          <p className="text-3xl font-bold text-gray-800">
            {formatSeconds(Math.round((stats?.avgDuration || 0)))}
          </p>
        </motion.div>
        
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
        >
          <div className="text-2xl text-pink-500 mb-2">🔥</div>
          <h4 className="text-gray-500 text-sm mb-1">连续练习天数</h4>
          <p className="text-3xl font-bold text-gray-800">7 天</p>
        </motion.div>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 每日练习时长趋势图 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">每日练习时长趋势</h4>
          <div style={{ height: 300 }}>
            <canvas ref={trendChartRef}></canvas>
          </div>
        </div>

        {/* 练习类型分布 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">练习类型分布</h4>
          <div style={{ height: 300 }}>
            <canvas ref={distributionChartRef}></canvas>
          </div>
        </div>

        {/* 练习频率分析 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 lg:col-span-2">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">练习频率分析</h4>
          <div style={{ height: 300 }}>
            <canvas ref={frequencyChartRef}></canvas>
          </div>
        </div>
      </div>

      {/* 数据洞察 */}
      <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">💡 练习洞察</h4>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            你最近的练习频率稳定，继续保持！
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            建议在工作日增加晨间练习，提升专注力。
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            睡前助眠引导对你的睡眠质量有明显改善。
          </li>
        </ul>
      </div>

      {/* 数据导出 */}
      <div className="mt-8">
        <StatsExport statsData={stats} timeRange={timeRange} />
      </div>
    </motion.div>
  );
};

export default MindfulnessStats;