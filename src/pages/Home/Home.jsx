import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, consultantAPI } from '../../services/api';
import { apiUtils } from '../../services/api';

const Home = () => {
  const navigate = useNavigate();
  const features = [
    {
      title: '🌳 树洞街巷',
      desc: '匿名倾诉心事，AI情绪分析，获得温暖回应',
      color: 'morandi-purple',
      path: '/treehole'
    },
    {
      title: '🕊️ 青鸟驿站',
      desc: '专业心理咨询，AI智能匹配，在线预约',
      color: 'morandi-blue',
      path: '/resources'
    },
    {
      title: '🐻 正念庭院',
      desc: '黑熊的正念课程，呼吸练习，放松引导',
      color: 'morandi-green',
      path: '/mindfulness'
    },
    {
      title: '🦡 鼹鼠轻诊室',
      desc: '压力自测工具，情绪地图，个性化建议',
      color: 'morandi-pink',
      path: '/clinic'
    }
  ];

  // 情绪打卡状态
  const [selectedMood, setSelectedMood] = useState(null);
  const [checkInSuccess, setCheckInSuccess] = useState(false);
  const [isCustomMood, setIsCustomMood] = useState(false);
  const [customEmoji, setCustomEmoji] = useState('');
  const [customLabel, setCustomLabel] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAddMoreModal, setShowAddMoreModal] = useState(false);
  const [additionalEmoji, setAdditionalEmoji] = useState('');
  const [additionalLabel, setAdditionalLabel] = useState('');
  const [showAdditionalEmojiPicker, setShowAdditionalEmojiPicker] = useState(false);
  const [additionalMoods, setAdditionalMoods] = useState([]);

  // 常用emoji列表
  const emojiList = [
    '😊', '😢', '🤯', '😴', '🎉', '😠', '😌', '😰', '🤗', '😓',
    '😎', '🤔', '😍', '🤣', '😅', '🙄', '😏', '😇', '🤩', '😘',
    '😋', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐',
    '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌',
    '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧',
    '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐'
  ];

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

  // 检查当天是否已经打卡（移除限制，允许多次打卡）
  const checkIfCheckedInToday = () => {
    return false; // 总是返回false，允许随时打卡
  };

  // 从localStorage读取当前心情状态
  const getCurrentMoodFromStorage = () => {
    try {
      const lastMood = localStorage.getItem('lastMood');
      if (lastMood) {
        const lastCustomMood = localStorage.getItem('lastCustomMood');
        if (lastCustomMood) {
          const customMood = JSON.parse(lastCustomMood);
          return {
            mood: customMood.value,
            label: customMood.label,
            emoji: customMood.emoji,
            timestamp: localStorage.getItem('lastMoodTimestamp')
          };
        } else {
          const selectedMoodObj = moodOptions.find(m => m.value === lastMood);
          return {
            mood: lastMood,
            label: selectedMoodObj?.label || '其他',
            emoji: selectedMoodObj?.emoji || '😊',
            timestamp: localStorage.getItem('lastMoodTimestamp')
          };
        }
      }
      return null;
    } catch (error) {
      console.error('读取心情状态失败:', error);
      return null;
    }
  };

  // 初始化状态
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(checkIfCheckedInToday());
  const [currentMood, setCurrentMood] = useState(() => {
    const storedMood = getCurrentMoodFromStorage();
    return storedMood?.mood || null;
  });
  const [currentMoodLabel, setCurrentMoodLabel] = useState(() => {
    const storedMood = getCurrentMoodFromStorage();
    return storedMood?.label || '';
  });
  const [currentMoodEmoji, setCurrentMoodEmoji] = useState(() => {
    const storedMood = getCurrentMoodFromStorage();
    return storedMood?.emoji || '';
  });
  const [currentMoodTimestamp, setCurrentMoodTimestamp] = useState(() => {
    const storedMood = getCurrentMoodFromStorage();
    return storedMood?.timestamp || null;
  });
  
  // 预约信息状态
  const [myAppointments, setMyAppointments] = useState([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);

  // 处理情绪选择
  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    setCheckInSuccess(false);
  };

  // 保存心情记录到localStorage和后端
  const saveMoodRecord = async (moodData) => {
    try {
      // 保存到localStorage
      localStorage.setItem('lastMoodCheckIn', moodData.checkInDate);
      localStorage.setItem('lastMood', moodData.moodValue);
      localStorage.setItem('lastMoodTimestamp', moodData.checkInTimestamp);
      localStorage.setItem('lastMoodEmoji', moodData.emoji);
      localStorage.setItem('lastMoodLabel', moodData.moodLabel);
      
      if (moodData.isCustom) {
        localStorage.setItem('lastCustomMood', JSON.stringify({
          emoji: moodData.emoji,
          label: moodData.moodLabel,
          value: moodData.moodValue
        }));
      }
      
      // 保存到心情历史记录
      const moodHistory = JSON.parse(localStorage.getItem('moodHistory') || '[]');
      moodHistory.push(moodData);
      localStorage.setItem('moodHistory', JSON.stringify(moodHistory));
      
      // 保存到后端
      if (apiUtils.isLoggedIn()) {
        try {
          const response = await authAPI.updateMood(
            moodData.moodValue,
            `情绪打卡：${moodData.moodLabel}${moodData.isCustom ? ` (${moodData.emoji})` : ''}`,
            ['情绪打卡', moodData.isCustom ? '自定义' : '预设']
          );
          
          if (response.success) {
            console.log('心情记录同步成功');
          } else {
            console.error('同步心情记录失败:', response.error);
          }
        } catch (apiError) {
          console.error('同步心情记录失败:', apiError);
        }
      }
    } catch (error) {
      console.error('保存心情记录失败:', error);
    }
  };

  // 处理情绪打卡
  const handleCheckIn = async () => {
    if (!selectedMood) return;

    try {
      // 确定情绪标签和表情
      let moodLabel, moodEmoji;
      if (isCustomMood && customLabel) {
        moodLabel = customLabel;
        moodEmoji = customEmoji;
      } else {
        const selectedMoodObj = moodOptions.find(m => m.value === selectedMood);
        moodLabel = selectedMoodObj?.label || '其他';
        moodEmoji = selectedMoodObj?.emoji || '😊';
      }

      // 获取精确到秒的打卡时间
      const checkInTime = new Date();
      const checkInTimestamp = checkInTime.toISOString();
      const checkInDate = checkInTime.toDateString();

      // 构建心情数据
      const moodData = {
        moodValue: selectedMood,
        moodLabel: moodLabel,
        emoji: moodEmoji,
        checkInTimestamp: checkInTimestamp,
        checkInDate: checkInDate,
        isCustom: isCustomMood
      };

      // 保存心情记录
      await saveMoodRecord(moodData);
      
      // 更新状态
      setCurrentMood(selectedMood);
      setCurrentMoodLabel(moodLabel);
      setCurrentMoodEmoji(moodEmoji);
      setCurrentMoodTimestamp(checkInTimestamp);
      setCheckInSuccess(true);
      setAlreadyCheckedIn(true);
      
      // 触发彩带动画
      const celebration = document.createElement('div');
      celebration.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
        overflow: hidden;
      `;
      
      // 创建多个彩带动画元素
      for (let i = 0; i < 20; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
          position: absolute;
          top: -50px;
          left: ${Math.random() * 100}%;
          width: ${Math.random() * 10 + 5}px;
          height: ${Math.random() * 10 + 5}px;
          background: ${getRandomColor()};
          border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
          animation: celebration-animation ${Math.random() * 2 + 2}s ease-in-out forwards;
          animation-delay: ${i * 0.1}s;
        `;
        celebration.appendChild(confetti);
      }
      
      // 添加动画关键帧
      const styleSheet = document.createElement('style');
      styleSheet.textContent = `
        @keyframes celebration-animation {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `;
      
      // 随机颜色生成函数
      function getRandomColor() {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'];
        return colors[Math.floor(Math.random() * colors.length)];
      }
      
      document.body.appendChild(celebration);
      document.head.appendChild(styleSheet);
      
      // 清理动画
      setTimeout(() => {
        if (celebration) {
          celebration.remove();
        }
        if (styleSheet) {
          styleSheet.remove();
        }
      }, 5000);
    } catch (error) {
      console.error('打卡失败:', error);
    }
  };

  // 处理更改情绪
  const handleChangeMood = () => {
    setAlreadyCheckedIn(false);
    setSelectedMood(null);
    setIsCustomMood(false);
    setCustomEmoji('');
    setCustomLabel('');
  };

  // 处理添加更多情绪
  const handleAddMoreMood = () => {
    // 打开添加更多情绪的模态框
    setShowAddMoreModal(true);
  };

  // 处理添加额外情绪
  const handleAddAdditionalMood = async () => {
    if (!additionalEmoji || !additionalLabel) return;

    try {
      // 获取精确到秒的时间
      const checkInTime = new Date();
      const checkInTimestamp = checkInTime.toISOString();
      const checkInDate = checkInTime.toDateString();

      // 构建额外情绪数据
      const additionalMoodData = {
        moodValue: `additional_${Date.now()}`,
        moodLabel: additionalLabel,
        emoji: additionalEmoji,
        checkInTimestamp: checkInTimestamp,
        checkInDate: checkInDate,
        isCustom: true
      };

      // 保存到本地存储
      const existingAdditionalMoods = JSON.parse(localStorage.getItem('additionalMoods') || '[]');
      existingAdditionalMoods.push(additionalMoodData);
      localStorage.setItem('additionalMoods', JSON.stringify(existingAdditionalMoods));

      // 更新状态
      setAdditionalMoods(existingAdditionalMoods);
      setAdditionalEmoji('');
      setAdditionalLabel('');
      setShowAdditionalEmojiPicker(false);

      // 同步到后端
      if (apiUtils.isLoggedIn()) {
        try {
          const response = await authAPI.updateMood(
            additionalMoodData.moodValue,
            `额外情绪：${additionalMoodData.moodLabel} (${additionalMoodData.emoji})`,
            ['情绪打卡', '额外情绪', '自定义']
          );
          
          if (response.success) {
            console.log('额外情绪同步成功');
          } else {
            console.error('同步额外情绪失败:', response.error);
          }
        } catch (apiError) {
          console.error('同步额外情绪失败:', apiError);
        }
      }

      // 关闭模态框
      setShowAddMoreModal(false);
    } catch (error) {
      console.error('添加额外情绪失败:', error);
    }
  };

  // 获取用户预约列表
  useEffect(() => {
    const fetchMyAppointments = async () => {
      if (apiUtils.isLoggedIn()) {
        setIsLoadingAppointments(true);
        try {
          const response = await consultantAPI.getMyAppointments();
          if (response.success) {
            // 使用API返回的真实数据，包括空数组
            setMyAppointments(response.data);
          }
        } catch (err) {
          console.error('获取预约列表错误:', err);
          // 发生错误时显示空数组，不显示模拟数据
          setMyAppointments([]);
        } finally {
          setIsLoadingAppointments(false);
        }
      } else {
        // 未登录时不显示预约信息
        setMyAppointments([]);
      }
    };
    
    fetchMyAppointments();
  }, []);

  // 关闭添加更多情绪模态框
  const handleCloseAddMoreModal = () => {
    setShowAddMoreModal(false);
    setAdditionalEmoji('');
    setAdditionalLabel('');
    setShowAdditionalEmojiPicker(false);
  };


  return (
    <div className="page-transition fade-in">
      {/* 欢迎区域 */}
      <div className="town-card mb-8">
        <h1 className="text-4xl font-handwriting text-morandi-purple mb-4">
          欢迎来到心栖小镇 🌸
        </h1>
        <p className="text-gray-600 text-lg">
          一个专为学生设计的温暖心理健康支持空间。在这里，你的每一份情绪都被温柔以待。
        </p>
      </div>

      {/* 我的预约信息 */}
      {myAppointments.length > 0 && (
        <div className="town-card mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            我的预约
          </h2>
          <div className="space-y-4">
            {myAppointments.slice(0, 2).map((appointment) => (
              <div key={appointment._id} className="flex items-start justify-between p-4 bg-white/50 rounded-xl border border-gray-200">
                <div>
                  <h3 className="font-bold text-lg text-morandi-purple">{appointment.consultantName}</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center">
                      <span className="text-gray-500 w-20">预约时间：</span>
                      <span>{appointment.date} {appointment.time}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-500 w-20">咨询时长：</span>
                      <span>{appointment.duration}分钟</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-gray-500 w-20">咨询原因：</span>
                      <span>{appointment.reason}</span>
                    </div>
                  </div>
                </div>
                <a
                  href="/resources"
                  className="text-morandi-blue hover:underline text-sm font-medium"
                  onClick={(e) => {
                    e.preventDefault();
                    // 跳转到青鸟驿站并设置为我的预约标签页
                    navigate('/resources', { state: { activeTab: 'my-appointments' } });
                  }}
                >
                  查看详情 →
                </a>
              </div>
            ))}
            {myAppointments.length > 2 && (
              <div className="text-center">
                <a
                  href="/resources"
                  className="text-morandi-purple hover:underline font-medium"
                  onClick={(e) => {
                    e.preventDefault();
                    // 跳转到青鸟驿站并设置为我的预约标签页
                    navigate('/resources', { state: { activeTab: 'my-appointments' } });
                  }}
                >
                  查看全部 {myAppointments.length} 个预约 →
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 功能入口网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {features.map((feature) => (
          <a
            key={feature.title}
            href={feature.path}
            className="town-card cursor-pointer transform hover:scale-105 transition-all duration-300"
          >
            <div className={`text-3xl mb-4 text-${feature.color}`}>
              {feature.title.split(' ')[0]}
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600">{feature.desc}</p>
            <div className="mt-4 text-right">
              <span className="text-morandi-purple font-medium">点击进入 →</span>
            </div>
          </a>
        ))}
      </div>

      {/* 此刻情绪打卡 */}
      <div className="town-card">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          此刻情绪打卡
        </h2>
        
        {alreadyCheckedIn ? (
          <div className="relative py-8">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-pulse-slow">{currentMoodEmoji}</div>
              <h3 className="text-xl font-semibold mb-2 text-morandi-purple">已打卡！</h3>
              <p className="text-gray-600 mb-4">感谢你关注自己的情绪状态</p>
              {currentMood && (
                <p className="text-lg font-medium text-gray-700 mb-2">
                  现在你的心情是：{currentMoodEmoji} {currentMoodLabel}
                </p>
              )}
              {currentMoodTimestamp && (
                <p className="text-sm text-gray-500">
                  打卡时间：{new Date(currentMoodTimestamp).toLocaleString()}
                </p>
              )}
            </div>
            
            {/* 操作按钮区域 */}
            <div className="absolute bottom-4 right-4 flex space-x-2">
              <button
                className="text-sm text-gray-500 hover:text-morandi-purple transition-colors"
                onClick={handleChangeMood}
              >
                ✏️ 更改情绪
              </button>
              <button
                className="text-sm text-gray-500 hover:text-morandi-purple transition-colors"
                onClick={handleAddMoreMood}
              >
                ➕ 添加更多情绪
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-4 mb-6">
              {moodOptions.map((mood) => (
                <button
                  key={mood.value}
                  className={`px-4 py-2 rounded-xl transition-colors ${
                    selectedMood === mood.value && !isCustomMood
                      ? 'bg-morandi-purple/20 border-2 border-morandi-purple text-morandi-purple font-medium' 
                      : 'bg-white/50 border border-gray-200 hover:border-morandi-purple'
                  }`}
                  onClick={() => {
                    setSelectedMood(mood.value);
                    setIsCustomMood(false);
                  }}
                >
                  {mood.emoji} {mood.label}
                </button>
              ))}
              
              {/* 自定义情绪选项 */}
              <button
                className={`px-4 py-2 rounded-xl transition-colors ${
                  isCustomMood 
                    ? 'bg-morandi-purple/20 border-2 border-morandi-purple text-morandi-purple font-medium' 
                    : 'bg-white/50 border border-dashed border-gray-300 hover:border-morandi-purple'
                }`}
                onClick={() => {
                  setIsCustomMood(true);
                  setSelectedMood(null);
                }}
              >
                ✏️ 自定义
              </button>
            </div>
            
            {/* 自定义情绪输入界面 */}
            {isCustomMood && (
              <div className="mb-6 p-4 bg-white/50 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold mb-3">创建自定义情绪</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      选择表情
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-morandi-purple focus:ring focus:ring-morandi-purple/20"
                        placeholder="选择或输入一个表情"
                        value={customEmoji}
                        onChange={(e) => setCustomEmoji(e.target.value)}
                        maxLength={2}
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-white rounded-lg border border-gray-300 hover:border-morandi-purple transition-colors"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      >
                        😊
                      </button>
                    </div>
                    
                    {/* Emoji选择器 */}
                    {showEmojiPicker && (
                      <div className="mt-2 p-3 bg-white rounded-lg border border-gray-300 shadow-lg max-h-48 overflow-y-auto">
                        <div className="grid grid-cols-10 gap-2">
                          {emojiList.map((emoji, index) => (
                            <button
                              key={index}
                              type="button"
                              className="text-2xl p-1 rounded-full hover:bg-gray-100 transition-colors"
                              onClick={() => {
                                setCustomEmoji(emoji);
                                setShowEmojiPicker(false);
                              }}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      情绪名称
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-morandi-purple focus:ring focus:ring-morandi-purple/20"
                      placeholder="输入情绪名称，例如：思考"
                      value={customLabel}
                      onChange={(e) => setCustomLabel(e.target.value)}
                      maxLength={10}
                    />
                  </div>
                  <button
                    className="px-4 py-2 bg-morandi-purple text-white rounded-lg hover:bg-opacity-90 transition-colors"
                    onClick={() => {
                      if (customEmoji && customLabel) {
                        const customValue = `custom_${Date.now()}`;
                        setSelectedMood(customValue);
                      }
                    }}
                    disabled={!customEmoji || !customLabel}
                  >
                    确认自定义情绪
                  </button>
                </div>
              </div>
            )}
            <button 
              className={`btn-primary ${!selectedMood ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleCheckIn}
              disabled={!selectedMood}
            >
              {checkInSuccess ? '打卡成功！' : '记录此刻心情'}
            </button>
          </>
        )}
      </div>
      
      {/* 添加更多情绪模态框 */}
      {showAddMoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">添加更多情绪</h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={handleCloseAddMoreModal}
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  选择表情
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-morandi-purple focus:ring focus:ring-morandi-purple/20"
                    placeholder="选择或输入一个表情"
                    value={additionalEmoji}
                    onChange={(e) => setAdditionalEmoji(e.target.value)}
                    maxLength={2}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-white rounded-lg border border-gray-300 hover:border-morandi-purple transition-colors"
                    onClick={() => setShowAdditionalEmojiPicker(!showAdditionalEmojiPicker)}
                  >
                    😊
                  </button>
                </div>
                
                {/* Emoji选择器 */}
                {showAdditionalEmojiPicker && (
                  <div className="mt-2 p-3 bg-white rounded-lg border border-gray-300 shadow-lg max-h-48 overflow-y-auto">
                    <div className="grid grid-cols-10 gap-2">
                      {emojiList.map((emoji, index) => (
                        <button
                          key={index}
                          type="button"
                          className="text-2xl p-1 rounded-full hover:bg-gray-100 transition-colors"
                          onClick={() => {
                            setAdditionalEmoji(emoji);
                            setShowAdditionalEmojiPicker(false);
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  情绪名称
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-morandi-purple focus:ring focus:ring-morandi-purple/20"
                  placeholder="输入情绪名称，例如：思考"
                  value={additionalLabel}
                  onChange={(e) => setAdditionalLabel(e.target.value)}
                  maxLength={10}
                />
              </div>
              <div className="flex space-x-2">
                <button
                  className="flex-1 px-4 py-2 bg-morandi-purple text-white rounded-lg hover:bg-opacity-90 transition-colors"
                  onClick={handleAddAdditionalMood}
                  disabled={!additionalEmoji || !additionalLabel}
                >
                  添加情绪
                </button>
                <button
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={handleCloseAddMoreModal}
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;