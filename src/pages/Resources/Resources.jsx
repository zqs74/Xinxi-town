import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { consultantAPI, userAPI, aiAPI } from '../../services/api';
import { apiUtils } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaComments, FaCalendarAlt, FaVideo, FaStar, FaClock } from 'react-icons/fa';

const Resources = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('ai-chat');
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({});
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [chatHistories, setChatHistories] = useState([]);
  const [currentHistoryId, setCurrentHistoryId] = useState(null);
  const [myAppointments, setMyAppointments] = useState([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const chatContainerRef = useRef(null);
  
  // 模拟AI咨询师
  const aiConsultants = [
    {
      _id: 'ai-1',
      name: "小智助手",
      expertise: ["学业压力", "情绪管理", "人际关系"],
      rating: 4.9,
      available: true,
      description: "24小时在线的AI心理助手，基于认知行为疗法",
      experience: "AI模型训练数据包含10万+咨询案例",
      price: "免费",
      avatar: "🤖",
      isAI: true,
      responseTime: "实时响应",
      color: "blue",
      intro: "你好！我是小智助手，你的AI心理支持伙伴。我在这里倾听你的感受，并提供专业的心理支持。今天有什么想聊的吗？",
      capabilities: "我可以帮助你：\n• 分析情绪状态\n• 提供应对压力的方法\n• 推荐合适的练习\n• 解答心理相关问题"
    },
    {
      _id: 'ai-2',
      name: "小慧助手",
      expertise: ["情感分析", "压力评估", "正念指导"],
      rating: 4.8,
      available: true,
      description: "专业情绪分析AI，提供个性化情绪管理方案",
      experience: "情感计算专业模型",
      price: "免费",
      avatar: "🌸",
      isAI: true,
      responseTime: "<2秒",
      color: "pink",
      intro: "你好！我是小慧助手，专业的情绪分析AI。我可以帮你深入分析情绪状态，提供个性化的情绪管理方案。今天想了解什么情绪相关的问题呢？",
      capabilities: "我可以帮助你：\n• 深度分析情绪状态\n• 评估压力水平\n• 提供个性化情绪管理方案\n• 推荐正念练习\n• 解读情绪背后的原因"
    }
  ];
  
  // 当前选择的AI助手
  const [currentAI, setCurrentAI] = useState(aiConsultants[0]);

  // 真实资源数据
  const articles = [
    { id: 1, title: "家门口心理丨向“考前焦虑” SAY NO！", category: "学业压力", readTime: "10分钟", likes: 12580, url: "https://mp.weixin.qq.com/s/Oci7yH_C_RCjQaYPdnZsMg" },
    { id: 2, title: "3条实用社交法则，让你少走弯路", category: "人际关系", readTime: "8分钟", likes: 9350, url: "https://mp.weixin.qq.com/s/TshRENWvXPDjjJ9g4vJdcg" },
    { id: 3, title: "收藏！这些心理调节方法，不知道真的亏大了", category: "情绪管理", readTime: "12分钟", likes: 15620, url: "https://mp.weixin.qq.com/s/5PKfUob4oa_OkPj06udxiw" },
    { id: 4, title: "在任何时候，都请义无反顾地相信自己的价值", category: "自我探索", readTime: "15分钟", likes: 8760, url: "https://mp.weixin.qq.com/s/6jlf8VEbC0R23xSYHwbr8g" },
  ];
  
  const videos = [
    { id: 1, title: "【从奥斯卡遗珠《机器人之梦》看到拍「遗憾」也能拍到如此治愈！】", duration: "15:30", views: "274.4万", url: "https://www.bilibili.com/video/BV114yuYHE3t/?share_source=copy_web&vd_source=bd58e4828cbe0590f7228a237dc08955" },
    { id: 2, title: "【【Netflix】冥想正念指南 Headspace Guide To Meditation】", duration: "20:15", views: "119.2万", url: "https://www.bilibili.com/video/BV1vA411W7fY/?share_source=copy_web&vd_source=bd58e4828cbe0590f7228a237dc08955" },
    { id: 3, title: "【【TED科普】内心敏感的人，如何调整自己？】", duration: "12:45", views: "14.8万", url: "https://www.bilibili.com/video/BV1Gn4seDExt/?share_source=copy_web&vd_source=bd58e4828cbe0590f7228a237dc08955" },
    { id: 4, title: "【【情绪科学】越焦虑越拖延？念头止不住&行为动不了？这篇攻略能帮你】", duration: "18:20", views: "238.5万", url: "https://www.bilibili.com/video/BV1xC4y1f7yL/?share_source=copy_web&vd_source=bd58e4828cbe0590f7228a237dc08955" },
  ];

  // 获取咨询师列表
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 获取真人咨询师
        const response = await consultantAPI.getConsultants();
        if (response.success) {
          // 合并AI咨询师和真人咨询师
          setConsultants([...aiConsultants, ...response.data]);
        }
      } catch (err) {
        console.error('获取咨询师列表错误:', err);
        // 使用模拟数据
        setConsultants([
          ...aiConsultants,
          { _id: 1, name: "李老师", expertise: ["学业压力"], rating: 4.9, available: true },
          { _id: 2, name: "王老师", expertise: ["人际关系"], rating: 4.8, available: true },
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // 获取我的预约列表
  useEffect(() => {
    fetchMyAppointments();
  }, []);

  // 加载聊天历史
  useEffect(() => {
    if (activeTab === 'ai-chat') {
      loadChatHistories();
      // 初始化新对话
      startNewChat();
    }
  }, [activeTab]);

  // 检查location.state，自动切换到我的预约标签页
  useEffect(() => {
    if (location.state && location.state.activeTab === 'my-appointments') {
      setActiveTab('my-appointments');
    }
  }, [location.state]);

  // 加载聊天历史记录
  const loadChatHistories = () => {
    try {
      const user = apiUtils.getUser();
      const userId = user?._id || 'anonymous';
      
      const storedHistories = localStorage.getItem(`chatHistories_${userId}`);
      if (storedHistories) {
        const parsedHistories = JSON.parse(storedHistories);
        // 确保timestamp是有效的Date对象
        const processedHistories = parsedHistories.map(history => ({
          ...history,
          messages: history.messages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setChatHistories(processedHistories);
      }
    } catch (error) {
      console.error('加载聊天历史失败:', error);
    }
  };

  // 保存聊天历史记录
  const saveChatHistory = () => {
    try {
      const user = apiUtils.getUser();
      const userId = user?._id || 'anonymous';
      
      // 检查是否有实际对话（至少有一条用户消息）
      const hasUserMessage = chatMessages.some(msg => msg.sender === 'user');
      if (hasUserMessage) {
        if (currentHistoryId) {
          // 更新现有历史记录
          const updatedHistories = chatHistories.map(history => {
            if (history.id === currentHistoryId) {
              return {
                ...history,
                timestamp: new Date().toISOString(),
                messages: [...chatMessages]
              };
            }
            return history;
          });
          setChatHistories(updatedHistories);
          localStorage.setItem(`chatHistories_${userId}`, JSON.stringify(updatedHistories));
        } else {
          // 创建新的历史记录
          const newHistory = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            aiName: currentAI.name,
            aiColor: currentAI.color,
            messages: [...chatMessages]
          };
          
          const updatedHistories = [newHistory, ...chatHistories].slice(0, 10); // 只保留最近10条
          setChatHistories(updatedHistories);
          localStorage.setItem(`chatHistories_${userId}`, JSON.stringify(updatedHistories));
        }
      }
    } catch (error) {
      console.error('保存聊天历史失败:', error);
    }
  };

  // 删除单个历史对话
  const deleteChatHistory = (historyId) => {
    try {
      const user = apiUtils.getUser();
      const userId = user?._id || 'anonymous';
      
      const updatedHistories = chatHistories.filter(history => history.id !== historyId);
      setChatHistories(updatedHistories);
      localStorage.setItem(`chatHistories_${userId}`, JSON.stringify(updatedHistories));
      
      // 如果删除的是当前正在查看的历史对话，开启新对话
      if (currentHistoryId === historyId) {
        startNewChat();
      }
    } catch (error) {
      console.error('删除聊天历史失败:', error);
    }
  };

  // 一键清空所有历史对话
  const clearAllChatHistories = () => {
    try {
      const user = apiUtils.getUser();
      const userId = user?._id || 'anonymous';
      
      setChatHistories([]);
      localStorage.removeItem(`chatHistories_${userId}`);
      
      // 如果当前正在查看历史对话，开启新对话
      if (currentHistoryId) {
        startNewChat();
      }
    } catch (error) {
      console.error('清空聊天历史失败:', error);
    }
  };

  // 开启新对话
  const startNewChat = (ai = null) => {
    // 保存当前对话
    saveChatHistory();
    
    // 重置当前历史ID
    setCurrentHistoryId(null);
    
    // 使用传入的AI助手或当前AI助手
    const targetAI = ai || currentAI;
    
    // 初始化新对话，使用目标AI助手的介绍语
    setChatMessages([
      {
        id: 1,
        sender: 'ai',
        content: targetAI.intro,
        timestamp: new Date(),
        aiName: targetAI.name,
        aiColor: targetAI.color
      },
      {
        id: 2,
        sender: 'ai',
        content: targetAI.capabilities,
        timestamp: new Date(),
        aiName: targetAI.name,
        aiColor: targetAI.color
      }
    ]);
  };

  // 查看历史对话
  const viewChatHistory = (history) => {
    setChatMessages(history.messages);
    setCurrentHistoryId(history.id);
    // 更新当前AI助手为历史对话对应的AI助手
    if (history.aiName) {
      const ai = aiConsultants.find(a => a.name === history.aiName);
      if (ai) {
        setCurrentAI(ai);
      }
    }
    setShowChatHistory(false);
  };

  // 关闭历史对话视图
  const closeChatHistory = () => {
    setShowChatHistory(false);
  };

  // 滚动到最新消息
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // AI聊天功能
  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    
    // 添加用户消息
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      content: userInput,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsChatLoading(true);
    
    try {
      // 构建对话历史
      const messagesHistory = chatMessages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));
      
      // 添加当前用户消息
      messagesHistory.push({
        role: 'user',
        content: userInput
      });
      
      // 调用真实的AI对话API
      const response = await aiAPI.chat(messagesHistory);
      
      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        content: response.data.response,
        timestamp: new Date(),
        aiName: currentAI.name,
        aiColor: currentAI.color
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI聊天错误:', error);
      
      // 出错时使用默认响应
      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        content: '很抱歉，暂时无法连接到AI服务。请稍后再试。',
        timestamp: new Date(),
        aiName: currentAI.name,
        aiColor: currentAI.color
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // 生成AI响应
  const generateAIResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    // 关键词匹配
    if (input.includes('压力') || input.includes('紧张') || input.includes('焦虑')) {
      return "听起来你最近压力比较大。可以试试深呼吸练习：吸气4秒，屏息4秒，呼气6秒。每天练习几次能有效缓解焦虑。需要我为你推荐一些压力管理的具体方法吗？";
    }
    
    if (input.includes('难过') || input.includes('伤心') || input.includes('悲伤')) {
      return "感受到你的难过情绪。情绪就像天气，有晴天也有雨天。试着写情绪日记，记录下此刻的感受和想法。如果需要，我可以为你推荐树洞倾诉或正念练习。";
    }
    
    if (input.includes('睡眠') || input.includes('失眠') || input.includes('睡不着')) {
      return "睡眠问题确实令人困扰。建议：\n1. 固定作息时间\n2. 睡前1小时避免屏幕\n3. 尝试渐进式肌肉放松\n4. 睡前可以听一些白噪音\n需要睡眠指导音频吗？";
    }
    
    if (input.includes('关系') || input.includes('朋友') || input.includes('人际')) {
      return "人际关系需要时间和技巧来经营。可以尝试：\n1. 主动表达感受\n2. 学习倾听技巧\n3. 设立健康的界限\n4. 参加社交活动\n想要更具体的人际关系建议吗？";
    }
    
    if (input.includes('谢谢') || input.includes('感谢')) {
      return "不客气！看到你积极面对问题，这本身就是很棒的一步。继续加油，我随时在这里支持你！";
    }
    
    if (input.includes('帮助') || input.includes('怎么办')) {
      return "根据你提到的情况，我可以：\n1. 推荐相关心理测试\n2. 提供具体应对策略\n3. 建议合适的练习方法\n4. 推荐真人咨询师\n请告诉我更多细节，以便提供更精准的帮助。";
    }
    
    // 默认响应
    const defaultResponses = [
      "我理解你的感受。能多分享一些具体情况吗？这样我可以提供更有针对性的建议。",
      "感谢你的分享。每个人的心理成长都需要时间和耐心，你已经迈出了重要的一步。",
      "听起来这对你很重要。让我们一起探索适合你的应对方式吧。",
      "我在这里支持你。如果需要更专业的帮助，我可以为你推荐合适的咨询师。",
      "你的感受是正常的，很多人在类似情况下都会有这样的反应。关键是如何应对这些感受。"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  // 预约咨询师
  const handleBookAppointment = async (consultant) => {
    setSelectedConsultant(consultant);
    setBookingData({
      consultantId: consultant._id,
      consultantName: consultant.name,
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      duration: 60,
      reason: '',
      notes: ''
    });
    
    // 获取咨询师详情，包含可用时间段
    try {
      const response = await consultantAPI.getConsultant(consultant._id);
      if (response.success && response.data.availableSlots) {
        setAvailableSlots(response.data.availableSlots);
      }
    } catch (error) {
      console.error('获取咨询师详情错误:', error);
      // 使用默认可用时间段
      setAvailableSlots([]);
    }
    
    setShowBookingModal(true);
  };

  // 提交预约
  const handleSubmitBooking = async () => {
    if (!bookingData.reason.trim()) {
      // 使用alert显示错误
      alert('请填写咨询原因');
      return;
    }
    
    setLoading(true);
    try {
      const response = await consultantAPI.bookAppointment(bookingData);
      if (response.success) {
        alert(`✅ 预约成功！\n\n咨询师：${bookingData.consultantName}\n预约时间：${bookingData.date} ${bookingData.time}\n\n预约编号：${response.data._id}\n\n请准时参加咨询，如有变更请提前24小时取消。`);
        setShowBookingModal(false);
        setSelectedConsultant(null);
        // 重新获取预约列表
        fetchMyAppointments();
      } else {
        // 使用alert显示错误
        alert('预约失败：' + response.error);
      }
    } catch (err) {
      console.error('预约错误:', err);
      // 使用alert显示错误
      alert('预约失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 取消预约
  const handleCancelAppointment = async (appointmentId) => {
    if (window.confirm('确定要取消这个预约吗？')) {
      try {
        // 调用后端API取消预约
        const response = await consultantAPI.cancelAppointment(appointmentId);
        if (response.success) {
          // 从前端列表中删除预约
          setMyAppointments(prevAppointments => 
            prevAppointments.filter(appointment => appointment._id !== appointmentId)
          );
          alert('✅ 预约已成功取消');
        } else {
          alert('取消预约失败：' + response.error);
        }
      } catch (err) {
        console.error('取消预约错误:', err);
        // 显示错误弹窗
        alert('取消预约失败，请稍后重试');
      }
    }
  };

  // 修改预约
  const handleEditAppointment = (appointment) => {
    // 找到对应的咨询师
    const consultant = consultants.find(c => c.name === appointment.consultantName);
    if (consultant) {
      setSelectedConsultant(consultant);
      setBookingData({
        _id: appointment._id,
        consultantId: consultant._id,
        consultantName: consultant.name,
        date: appointment.date,
        time: appointment.time,
        duration: appointment.duration,
        reason: appointment.reason,
        notes: ''
      });
      setShowBookingModal(true);
    }
  };

  // 获取我的预约列表
  const fetchMyAppointments = async () => {
    setIsLoadingAppointments(true);
    try {
      const response = await consultantAPI.getMyAppointments();
      if (response.success) {
        // 直接使用后端返回的真实数据
        setMyAppointments(response.data);
      } else {
        console.error('获取预约列表失败:', response.error);
        setMyAppointments([]);
      }
    } catch (err) {
      console.error('获取预约列表错误:', err);
      setMyAppointments([]);
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  // AI聊天界面
  const renderAIChat = () => (
    <div className="space-y-6">
      {/* AI助手介绍 */}
      <div className="bg-gradient-to-r from-morandi-blue/20 to-morandi-green/20 rounded-2xl p-6">
        <div className="flex items-center mb-4">
          <div className="text-4xl mr-4">🤖</div>
          <div>
            <h3 className="text-xl font-bold">AI心理助手</h3>
            <p className="text-gray-600">基于认知行为疗法的智能支持系统</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/50 p-3 rounded-xl">
            <div className="font-medium">💬 实时对话</div>
            <div className="text-sm text-gray-600">24小时在线倾听</div>
          </div>
          <div className="bg-white/50 p-3 rounded-xl">
            <div className="font-medium">🔒 隐私保护</div>
            <div className="text-sm text-gray-600">对话内容完全保密</div>
          </div>
          <div className="bg-white/50 p-3 rounded-xl">
            <div className="font-medium">🧠 专业建议</div>
            <div className="text-sm text-gray-600">基于心理学理论</div>
          </div>
          <div className="bg-white/50 p-3 rounded-xl">
            <div className="font-medium">🎯 个性化</div>
            <div className="text-sm text-gray-600">根据你的情况定制</div>
          </div>
        </div>
      </div>

      {/* 聊天界面 */}
      <div className="bg-white/80 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-2xl mr-3">{currentAI.avatar}</div>
              <div>
                <h4 className={`font-bold ${currentAI.color === 'blue' ? 'text-blue-600' : 'text-pink-600'}`}>与 {currentAI.name} 对话</h4>
                <p className="text-sm text-gray-500">正在倾听你的感受...</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <div className="flex space-x-2">
                {aiConsultants.map((ai) => (
                  <button
                    key={ai._id}
                    onClick={() => {
                      setCurrentAI(ai);
                      // 立即使用新的AI助手开启新对话
                      startNewChat(ai);
                    }}
                    className={`px-3 py-1 text-xs rounded-full ${currentAI._id === ai._id 
                      ? ai.color === 'blue' 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-pink-100 text-pink-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {ai.name}
                  </button>
                ))}
              </div>
              <button
              onClick={() => startNewChat(currentAI)}
              className="text-sm text-morandi-purple hover:underline"
            >
              开启新对话
            </button>
            </div>
          </div>
        </div>

        {/* 查看历史对话提示 */}
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <button
            onClick={() => setShowChatHistory(true)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            查看以前对话
          </button>
        </div>

        {/* 聊天消息区域或历史对话列表 */}
        {showChatHistory ? (
          <div className="h-96 overflow-y-auto p-4">
            <div className="flex justify-between items-center mb-4">
              <h5 className="font-bold">历史对话</h5>
              <div className="flex space-x-2">
                {chatHistories.length > 0 && (
                  <button
                    onClick={clearAllChatHistories}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    清空所有
                  </button>
                )}
                <button
                  onClick={closeChatHistory}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  关闭
                </button>
              </div>
            </div>
            
            {chatHistories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                暂无历史对话
              </div>
            ) : (
              <div className="space-y-3">
                {chatHistories.map((history) => {
                  // 获取对话的第一条用户消息作为标题
                  const firstUserMessage = history.messages.find(msg => msg.sender === 'user');
                  const title = firstUserMessage ? firstUserMessage.content.substring(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '') : '新对话';
                  
                  return (
                    <motion.div
                      key={history.id}
                      whileHover={{ scale: 1.01 }}
                      className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 cursor-pointer" onClick={() => viewChatHistory(history)}>
                          <div className="flex items-center mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full mr-2 ${history.aiColor === 'blue' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                              {history.aiName || 'AI助手'}
                            </span>
                            <span className="font-medium">{title}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(history.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // 阻止事件冒泡
                            deleteChatHistory(history.id);
                          }}
                          className="text-xs text-red-500 hover:text-red-700 ml-2"
                        >
                          删除
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div 
            ref={chatContainerRef}
            className="h-96 overflow-y-auto p-4 space-y-4"
          >
            <AnimatePresence>
              {chatMessages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] p-3 rounded-2xl ${message.sender === 'user' 
                      ? 'bg-gradient-to-r from-morandi-purple to-morandi-blue text-white rounded-br-none' 
                      : message.aiColor === 'blue' 
                        ? 'bg-blue-50 text-blue-800 border border-blue-100 rounded-bl-none' 
                        : 'bg-pink-50 text-pink-800 border border-pink-100 rounded-bl-none'
                    }`}
                  >
                    {message.sender === 'ai' && message.aiName && (
                      <div className={`text-xs font-semibold mb-1 ${message.aiColor === 'blue' ? 'text-blue-600' : 'text-pink-600'}`}>
                        {message.aiName}
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className={`text-xs mt-1 ${message.sender === 'user' ? 'text-white/70' : message.aiColor === 'blue' ? 'text-blue-500' : 'text-pink-500'}`}>
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isChatLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 p-3 rounded-2xl rounded-bl-none">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* 输入区域 */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="输入你的感受或问题..."
              className="input-field flex-1"
              disabled={isChatLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isChatLoading || !userInput.trim()}
              className="btn-primary px-6"
            >
              发送
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            提示：可以咨询压力、情绪、人际关系、睡眠等问题
          </div>
        </div>
      </div>

      {/* 快捷问题 */}
      <div>
        <h4 className="font-medium mb-3">快捷提问</h4>
        <div className="flex flex-wrap gap-2">
          {[
            "最近压力大怎么办？",
            "如何改善睡眠？",
            "感觉孤独怎么应对？",
            "学习焦虑如何缓解？"
          ].map((question, index) => (
            <button
              key={index}
              onClick={() => setUserInput(question)}
              className="px-3 py-2 bg-white/50 rounded-xl hover:bg-white transition-colors text-sm"
            >
              {question}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // 我的预约界面
  const renderMyAppointments = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">我的预约</h3>
        <div className="text-sm text-gray-500">
          共{myAppointments.length}个预约
        </div>
      </div>
      
      {isLoadingAppointments ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-morandi-purple mb-2"></div>
          <p>加载预约列表...</p>
        </div>
      ) : myAppointments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          暂无预约
          <div className="mt-4">
            <button
              onClick={() => setActiveTab('consultants')}
              className="btn-primary px-6"
            >
              去预约咨询师
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {myAppointments.map((appointment) => (
            <motion.div
              key={appointment._id}
              whileHover={{ scale: 1.01 }}
              className="bg-white/80 rounded-2xl p-5 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h5 className="font-bold text-lg">{appointment.consultantName}</h5>
                  <div className="space-y-2 text-sm">
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
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => handleEditAppointment(appointment)}
                    className="btn-secondary px-4 py-2 text-sm"
                  >
                    修改
                  </button>
                  <button
                    onClick={() => handleCancelAppointment(appointment._id)}
                    className="btn-danger px-4 py-2 text-sm"
                  >
                    取消
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  // 咨询师列表界面
  const renderConsultants = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">选择你的咨询师</h3>
        <div className="text-sm text-gray-500">
          共{consultants.filter(c => c.available).length}位可预约
        </div>
      </div>

      {/* AI咨询师专区 */}
      <div>
        <div className="flex items-center mb-3">
          <div className="text-2xl mr-2">⚡</div>
          <h4 className="font-bold">AI智能助手</h4>
          <span className="ml-2 text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
            免费·实时
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {aiConsultants.map((consultant) => (
            <motion.div
              key={consultant._id}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-5 border-2 border-purple-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <div className="text-3xl mr-4">{consultant.avatar}</div>
                  <div>
                    <h5 className="font-bold text-lg">{consultant.name}</h5>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <FaRobot className="mr-1" />
                      <span>AI助手</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {consultant.expertise.map((exp, idx) => (
                        <span key={idx} className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                          {exp}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{consultant.description}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center">
                  <FaStar className="text-yellow-500 mr-1" />
                  <span className="font-bold">{consultant.rating}</span>
                  <span className="text-sm text-gray-500 ml-2">({consultant.responseTime})</span>
                </div>
                <button
                  onClick={() => {
                    setCurrentAI(consultant);
                    setActiveTab('ai-chat');
                    // 延迟一下确保tab切换完成后再开启新对话
                    setTimeout(() => startNewChat(consultant), 100);
                  }}
                  className="btn-primary px-6"
                >
                  立即聊天
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 真人咨询师专区 */}
      <div>
        <div className="flex items-center mb-3">
          <div className="text-2xl mr-2">👨‍⚕️</div>
          <h4 className="font-bold">专业心理咨询师</h4>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-morandi-purple mb-2"></div>
            <p>加载咨询师列表...</p>
          </div>
        ) : consultants.filter(c => !c.isAI).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            暂无咨询师可预约
          </div>
        ) : (
          <div className="space-y-4">
            {consultants
              .filter(c => !c.isAI)
              .map((consultant) => (
                <motion.div
                  key={consultant._id}
                  whileHover={{ scale: 1.01 }}
                  className="bg-white/80 rounded-2xl p-5 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <div className="text-3xl mr-4">{consultant.avatar || '👨‍🏫'}</div>
                      <div>
                        <h5 className="font-bold text-lg">{consultant.name}</h5>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <FaStar className="text-yellow-500 mr-1" />
                          <span className="font-bold mr-2">{consultant.rating}</span>
                          <span className="text-gray-500">| {consultant.experience || '5年经验'}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {consultant.expertise.map((exp, idx) => (
                            <span key={idx} className="text-xs bg-morandi-blue/20 text-morandi-blue px-2 py-1 rounded-full">
                              {exp}
                            </span>
                          ))}
                        </div>
                        <p className="text-sm text-gray-600">{consultant.description || '专业心理咨询师'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-morandi-purple mb-2">
                        {consultant.price || '200元/小时'}
                      </div>
                      <div className={`text-sm ${consultant.available ? 'text-green-600' : 'text-gray-400'}`}>
                        {consultant.available ? '可预约' : '已约满'}
                      </div>
                    </div>
                  </div>
                  {consultant.available && (
                    <div className="flex justify-end mt-4">
                      <button 
                        className="btn-secondary px-6"
                        onClick={() => handleBookAppointment(consultant)}
                      >
                        <FaCalendarAlt className="mr-2" />
                        预约咨询
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
          </div>
        )}
      </div>
    </div>
  );

  // 资源内容界面
  const renderResources = () => (
    <div className="space-y-6">
      {/* 文章资源 */}
      <div>
        <h3 className="text-xl font-bold mb-4">精选心理文章</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {articles.map(article => (
            <motion.div
              key={article.id}
              whileHover={{ y: -5 }}
              className="bg-white/70 rounded-2xl p-5 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs text-morandi-purple bg-morandi-purple/10 px-3 py-1 rounded-full">
                  {article.category}
                </span>
                <div className="flex items-center text-sm text-gray-500">
                  <FaClock className="mr-1" />
                  {article.readTime}
                </div>
              </div>
              <a 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-bold mb-2 block hover:text-morandi-purple"
              >
                {article.title}
              </a>
              <div className="flex items-center justify-end mt-4">
                <a 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-morandi-blue hover:underline"
                >
                  阅读全文 →
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 视频资源 */}
      <div>
        <h3 className="text-xl font-bold mb-4">心理指导视频</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videos.map(video => (
            <motion.div
              key={video.id}
              whileHover={{ y: -5 }}
              className="bg-white/70 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
            >
              <a 
                href={video.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <div className="h-40 bg-gradient-to-r from-morandi-blue/30 to-morandi-green/30 flex items-center justify-center cursor-pointer">
                  <div className="text-4xl">🎬</div>
                </div>
              </a>
              <div className="p-4">
                <a 
                  href={video.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-bold mb-2 block hover:text-morandi-purple"
                >
                  {video.title}
                </a>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <div className="flex items-center">
                    <FaVideo className="mr-1" />
                    {video.duration}
                  </div>
                  <span>{video.views}观看</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-transition fade-in">
      <div className="town-card mb-8">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <motion.div 
              className="text-4xl mr-4"
              animate={{ 
                y: [0, -5, 0],
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
              }}
            >
              🕊️
            </motion.div>
            <div>
              <h1 className="text-3xl font-handwriting text-morandi-purple">
                青鸟驿站
              </h1>
              <p className="text-gray-600">专业心理咨询与AI智能支持</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            24小时在线支持
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* 标签页 */}
        <div className="mb-6">
          <div className="flex border-b border-gray-200 mb-4 overflow-x-auto">
            <button 
              className={`flex items-center px-4 py-3 font-medium ${activeTab === 'ai-chat' ? 'text-morandi-purple border-b-2 border-morandi-purple' : 'text-gray-500 hover:text-morandi-purple'}`}
              onClick={() => setActiveTab('ai-chat')}
            >
              <FaRobot className="mr-2" />
              AI心理助手
            </button>
            <button 
              className={`flex items-center px-4 py-3 font-medium ${activeTab === 'consultants' ? 'text-morandi-purple border-b-2 border-morandi-purple' : 'text-gray-500 hover:text-morandi-purple'}`}
              onClick={() => setActiveTab('consultants')}
            >
              <FaComments className="mr-2" />
              咨询师预约
            </button>
            <button 
              className={`flex items-center px-4 py-3 font-medium ${activeTab === 'my-appointments' ? 'text-morandi-purple border-b-2 border-morandi-purple' : 'text-gray-500 hover:text-morandi-purple'}`}
              onClick={() => setActiveTab('my-appointments')}
            >
              <FaCalendarAlt className="mr-2" />
              我的预约
            </button>
            <button 
              className={`flex items-center px-4 py-3 font-medium ${activeTab === 'resources' ? 'text-morandi-purple border-b-2 border-morandi-purple' : 'text-gray-500 hover:text-morandi-purple'}`}
              onClick={() => setActiveTab('resources')}
            >
              📚 心理资源
            </button>
          </div>
          
          {/* 标签页内容 */}
          <div className="mt-6">
            {activeTab === 'ai-chat' && renderAIChat()}
            {activeTab === 'consultants' && renderConsultants()}
            {activeTab === 'my-appointments' && renderMyAppointments()}
            {activeTab === 'resources' && renderResources()}
          </div>
        </div>

        {/* 底部紧急联系方式 */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-4 mt-8">
          <div className="flex items-center">
            <div className="text-2xl text-red-500 mr-3">🚨</div>
            <div>
              <h4 className="font-bold text-red-700">紧急心理援助</h4>
              <p className="text-sm text-red-600">
                全国希望24热线：<span className="font-bold">4001619995</span>（1619995是谐音：要留、要救、救救我）
                <br />
                广东青年之声：<span className="font-bold">12355</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 预约模态框 */}
      <AnimatePresence>
        {showBookingModal && selectedConsultant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowBookingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center mb-4">
                <div className="text-3xl mr-3">{selectedConsultant.avatar}</div>
                <div>
                  <h3 className="font-bold text-lg">预约 {selectedConsultant.name}</h3>
                  <p className="text-sm text-gray-600">{selectedConsultant.description}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">咨询原因</label>
                  <textarea
                    value={bookingData.reason}
                    onChange={(e) => setBookingData({...bookingData, reason: e.target.value})}
                    className="input-field h-24"
                    placeholder="请简要描述你想要咨询的问题..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">预约日期</label>
                    <input
                      type="date"
                      value={bookingData.date}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        // 获取新日期的可用时间段
                        const dateSlots = availableSlots.filter(slot => 
                          slot.date === newDate && slot.available
                        );
                        // 如果有可用时间段，选择第一个
                        const newTime = dateSlots.length > 0 ? dateSlots[0].time : bookingData.time;
                        setBookingData({...bookingData, date: newDate, time: newTime});
                      }}
                      className="input-field"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">预约时间</label>
                    <select
                      value={bookingData.time}
                      onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
                      className="input-field"
                    >
                      {(() => {
                        // 获取当前选中日期的可用时间段
                        const dateSlots = availableSlots.filter(slot => 
                          slot.date === bookingData.date && slot.available
                        );
                        
                        if (dateSlots.length > 0) {
                          // 使用API返回的可用时间段
                          return dateSlots.map(slot => (
                            <option key={slot.time} value={slot.time}>
                              {slot.time}
                            </option>
                          ));
                        } else {
                          // 默认时间段（当API未返回数据时）
                          return [
                            { value: "09:00", label: "09:00" },
                            { value: "10:00", label: "10:00" },
                            { value: "11:00", label: "11:00" },
                            { value: "14:00", label: "14:00" },
                            { value: "15:00", label: "15:00" },
                            { value: "16:00", label: "16:00" }
                          ].map(time => (
                            <option key={time.value} value={time.value}>
                              {time.label}
                            </option>
                          ));
                        }
                      })()}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">咨询时长</label>
                  <select
                    value={bookingData.duration}
                    onChange={(e) => setBookingData({...bookingData, duration: parseInt(e.target.value)})}
                    className="input-field"
                  >
                    <option value={30}>30分钟</option>
                    <option value={60}>60分钟</option>
                    <option value={90}>90分钟</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">备注（可选）</label>
                  <input
                    type="text"
                    value={bookingData.notes}
                    onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                    className="input-field"
                    placeholder="其他需要说明的情况..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  onClick={() => setShowBookingModal(false)}
                >
                  取消
                </button>
                <button
                  className="btn-primary px-6"
                  onClick={handleSubmitBooking}
                  disabled={loading}
                >
                  {loading ? '预约中...' : '确认预约'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Resources;