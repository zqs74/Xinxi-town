import { useState, useEffect } from 'react';
import { testAPI, userAPI } from '../../services/api';
import { apiUtils } from '../../services/api';
import clinicAIService from '../../services/clinicAIService';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Clinic = () => {
  // 测试类型定义
  const testTypes = [
    { id: 'emotion', name: '情绪地图测试', icon: '🗺️', desc: '快速捕捉当下情绪状态' },
    { id: 'stress', name: '压力水平评估', icon: '⚖️', desc: '评估压力来源与程度' },
    { id: 'mbti', name: 'MBTI人格测试', icon: '🧩', desc: '16型人格理论分析' },
    { id: 'enneagram', name: '九型人格测试', icon: '🌟', desc: '探索深层人格动机' },
    { id: 'sleep', name: '睡眠质量评估', icon: '😴', desc: '分析睡眠问题与建议' },
    { id: 'personality', name: '性格特质分析', icon: '🔍', desc: '快速评估性格维度' },
    { id: 'depression', name: '抑郁筛查量表', icon: '🩺', desc: 'PHQ-9专业抑郁筛查' },
    { id: 'anxiety', name: '焦虑筛查量表', icon: '😰', desc: 'GAD-7专业焦虑筛查' },
    { id: 'self_esteem', name: '自尊水平评估', icon: '👑', desc: '评估自我价值感' }
  ];

  // 状态管理
  const [activeTest, setActiveTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [testHistory, setTestHistory] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [currentStep, setCurrentStep] = useState('select'); // select, answering, result, record
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [testStartTime, setTestStartTime] = useState(null);

  // 加载测试历史
  useEffect(() => {
    // 检查是否已登录，只有登录后才加载测试历史
    if (apiUtils.isLoggedIn()) {
      loadTestHistory();
    }
    // 从本地存储加载草稿
    const savedAnswers = localStorage.getItem('clinic_draft');
    if (savedAnswers) {
      try {
        const draft = JSON.parse(savedAnswers);
        if (draft.testType && draft.answers) {
          setActiveTest(draft.testType);
          setCurrentStep('answering');
          setAnswers(draft.answers);
          loadQuestions(draft.testType);
        }
      } catch (e) {
        console.error('加载草稿失败:', e);
      }
    }
  }, []);

  // 加载测试问题
  const loadQuestions = async (testType) => {
    setLoadingQuestions(true);
    setError(null);
    try {
      const response = await testAPI.getQuestions(testType);
      if (response.success) {
        setQuestions(response.data);
      } else {
        setError('加载问题失败，请重试');
      }
    } catch (err) {
      console.error('加载问题错误:', err);
      setError('网络错误，请检查连接');
    } finally {
      setLoadingQuestions(false);
    }
  };

  // 加载测试历史
  const loadTestHistory = async () => {
    try {
      // 再次检查登录状态
      if (!apiUtils.isLoggedIn()) {
        console.log('用户未登录，无法加载测试历史');
        return;
      }
      
      const response = await testAPI.getHistory({ limit: 20 });
      if (response.success) {
        setTestHistory(response.data);
        console.log('✅ 加载测试历史成功:', response.data.length, '条记录');
        console.log('历史记录详情:', response.data);
      } else {
        console.error('加载历史失败:', response.error);
      }
    } catch (err) {
      console.error('加载历史错误:', err);
    }
  };

  // 选择测试类型
  const handleTestSelect = (testType) => {
    setActiveTest(testType);
    setCurrentStep('answering');
    setAnswers({});
    setShowResult(false);
    setResult(null);
    setTestStartTime(new Date()); // 记录测试开始时间
    loadQuestions(testType);
  };

  // 处理答案选择
  const handleAnswerChange = (questionId, value, isMultiple = false) => {
    let newAnswers;
    if (isMultiple) {
      // 处理多选题
      const currentAnswers = answers[questionId] || [];
      if (currentAnswers.includes(value)) {
        // 如果已经选中，则移除
        newAnswers = {
          ...answers,
          [questionId]: currentAnswers.filter(item => item !== value)
        };
      } else {
        // 如果未选中，则添加
        newAnswers = {
          ...answers,
          [questionId]: [...currentAnswers, value]
        };
      }
    } else {
      // 处理单选题
      newAnswers = {
        ...answers,
        [questionId]: value
      };
    }
    setAnswers(newAnswers);
    
    // 保存草稿到本地存储
    if (activeTest) {
      localStorage.setItem('clinic_draft', JSON.stringify({
        testType: activeTest,
        answers: newAnswers
      }));
    }
  };

  // 提交测试
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 检查是否已登录
    if (!apiUtils.isLoggedIn()) {
      setError('请先登录后再进行测试');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      return;
    }
    
    // 检查是否所有问题都已回答
    const unansweredQuestions = questions.filter(q => {
      const hasAnswer = q.isMultiple 
        ? (answers[q.id] && answers[q.id].length > 0)
        : (answers[q.id] !== undefined && answers[q.id] !== '');
      return !hasAnswer;
    });
    
    if (unansweredQuestions.length > 0) {
      setError(`请先回答所有问题，还有${unansweredQuestions.length}题未完成`);
      // 滚动到第一个未回答的问题
      setTimeout(() => {
        const firstUnanswered = document.querySelector(`#question-${unansweredQuestions[0].id}`);
        if (firstUnanswered) {
          firstUnanswered.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }
    
    setLoadingSubmit(true);
    setError(null);
    
    try {
        // 计算测试用时（毫秒）
        const testEndTime = new Date();
        const testDuration = testStartTime ? testEndTime - testStartTime : 0;
        
        // 对于多选题，计算总分时需要特殊处理
        const totalScore = questions.reduce((sum, question) => {
          const answer = answers[question.id];
          if (question.isMultiple && answer && Array.isArray(answer)) {
            // 多选题可以根据选择的选项数量或其他逻辑计算分数
            return sum + answer.length;
          } else if (answer !== undefined) {
            return sum + answer;
          } else {
            return sum;
          }
        }, 0);
        
        // 直接调用AI分析服务，将真实的问卷答案数据发送给AI
        const resultData = await clinicAIService.analyzeTestResults(activeTest, questions, answers, totalScore);
        
        setResult(resultData);
        setShowResult(true);
        setCurrentStep('result');
        // 滚动到页面顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // 清除本地草稿
        localStorage.removeItem('clinic_draft');
        // 保存测试记录到数据库，包含完整的分析结果
        try {
          console.log('开始保存测试记录...');
          const submitResponse = await testAPI.submitTest(activeTest, answers, questions, resultData, testStartTime, testEndTime, testDuration);
          console.log('✅ 测试记录保存成功:', submitResponse);
        } catch (submitErr) {
          console.error('保存测试记录失败:', submitErr);
          // 继续执行，不影响AI分析结果显示
        }
        // 重新加载历史记录
        console.log('重新加载历史记录...');
        await loadTestHistory();
    } catch (err) {
      console.error('提交测试错误:', err);
      setError('AI调用失败: ' + (err.message || '未知错误'));
    } finally {
      setLoadingSubmit(false);
    }
  };

  // 返回测试选择
  const handleBackToSelect = () => {
    setCurrentStep('select');
    setActiveTest(null);
    setQuestions([]);
    setAnswers({});
    setShowResult(false);
    setResult(null);
    setError(null);
  };

  // 重新测试
  const handleRetakeTest = () => {
    setCurrentStep('answering');
    setAnswers({});
    setShowResult(false);
    setResult(null);
    setError(null);
    loadQuestions(activeTest);
  };

  // 查看测试记录详情
  const handleViewRecord = async (record) => {
    setLoadingSubmit(true);
    setError(null);
    try {
      const response = await testAPI.getResult(record._id);
      if (response.success) {
        setSelectedRecord(response.data);
        setCurrentStep('record');
      } else {
        setError('加载测试记录失败，请重试');
      }
    } catch (err) {
      console.error('加载记录错误:', err);
      setError('网络错误，请检查连接');
    } finally {
      setLoadingSubmit(false);
    }
  };

  // 返回测试选择
  const handleBackFromRecord = () => {
    setCurrentStep('select');
    setSelectedRecord(null);
  };

  // 获取测试图标
  const getTestIcon = (testId) => {
    const test = testTypes.find(t => t.id === testId);
    return test ? test.icon : '🦡';
  };

  // 导出为图片
  const exportAsImage = async () => {
    try {
      setExporting(true);
      setExportProgress(20);

      // 找到结果页面的主要内容
      const resultContent = document.querySelector('.town-card');
      if (!resultContent) {
        throw new Error('未找到导出内容');
      }

      setExportProgress(40);

      // 使用html2canvas捕获内容
      const canvas = await html2canvas(resultContent, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true
      });

      setExportProgress(70);

      // 转换为图片并下载
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const date = new Date();
      const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const formattedTime = `${String(date.getHours()).padStart(2, '0')}-${String(date.getMinutes()).padStart(2, '0')}-${String(date.getSeconds()).padStart(2, '0')}`;
      link.download = `情绪测试报告_${formattedDate} ${formattedTime}.png`;
      link.href = image;
      link.click();

      setExportProgress(100);
      setTimeout(() => {
        setExporting(false);
        setExportProgress(0);
      }, 500);
    } catch (error) {
      console.error('导出图片失败:', error);
      setExporting(false);
      setExportProgress(0);
      alert('导出失败，请重试');
    }
  };

  // 导出为PDF
  const exportAsPDF = async () => {
    try {
      setExporting(true);
      setExportProgress(20);

      // 找到结果页面的主要内容
      const resultContent = document.querySelector('.town-card');
      if (!resultContent) {
        throw new Error('未找到导出内容');
      }

      setExportProgress(40);

      // 使用html2canvas捕获内容
      const canvas = await html2canvas(resultContent, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true
      });

      setExportProgress(60);

      // 创建PDF文档
      const imgWidth = 210; // A4宽度
      const imgHeight = canvas.height * imgWidth / canvas.width;
      const doc = new jsPDF({
        orientation: imgHeight > 297 ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      setExportProgress(70);

      // 添加图片到PDF
      const imgData = canvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      // 如果有问卷答案，添加到新页面
      if (questions.length > 0) {
        doc.addPage();
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('问卷答案', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        let yPos = 40;
        questions.forEach((question, index) => {
            const userAnswer = answers[question.id];
            let selectedOption;
            if (question.isMultiple && userAnswer && Array.isArray(userAnswer)) {
              selectedOption = userAnswer.map(idx => question.options[idx]).join('; ');
            } else if (question.options && userAnswer !== undefined) {
              selectedOption = question.options[userAnswer];
            } else {
              selectedOption = '未回答';
            }
            doc.text(`${index + 1}. ${question.text}`, 20, yPos);
            doc.text(`答案: ${selectedOption}`, 25, yPos + 7);
            yPos += 15;
            if (yPos > 270) {
              doc.addPage();
              yPos = 30;
            }
          });
      }

      setExportProgress(90);

      // 保存PDF
      const date = new Date();
      const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const formattedTime = `${String(date.getHours()).padStart(2, '0')}-${String(date.getMinutes()).padStart(2, '0')}-${String(date.getSeconds()).padStart(2, '0')}`;
      doc.save(`情绪测试报告_${formattedDate} ${formattedTime}.pdf`);

      setExportProgress(100);
      setTimeout(() => {
        setExporting(false);
        setExportProgress(0);
      }, 500);
    } catch (error) {
      console.error('导出PDF失败:', error);
      setExporting(false);
      setExportProgress(0);
      alert('导出失败，请重试');
    }
  };

  // 渲染测试选择页面
  const renderTestSelect = () => (
    <div className="space-y-8">
      {/* 头部 */}
      <div className="flex items-center mb-6">
        <motion.div 
          className="text-4xl mr-4"
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3
          }}
        >
          🦡
        </motion.div>
        <div>
          <h1 className="text-3xl font-bold text-morandi-purple">
            鼹鼠轻诊室
          </h1>
          <p className="text-gray-600">AI智能心理评估与建议</p>
        </div>
      </div>

      {/* 测试类型选择 */}
      <div>
        <h2 className="text-xl font-semibold mb-4">选择测试类型</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testTypes.map((test) => (
            <motion.div
              key={test.id}
              whileHover={{ scale: 1.03, y: -5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <button
                className="w-full p-5 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-all text-left"
                onClick={() => handleTestSelect(test.id)}
              >
                <motion.div 
                  className="flex items-start"
                  whileHover={{ x: 5 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <motion.div 
                    className="text-3xl mr-3"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    {test.icon}
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{test.name}</h3>
                    <p className="text-sm text-gray-600">{test.desc}</p>
                  </div>
                </motion.div>
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 测试历史 */}
      {apiUtils.isLoggedIn() ? (
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">最近测试记录</h2>
          {testHistory.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {testHistory.map((item) => (
                <motion.div
                  key={item._id}
                  whileHover={{ scale: 1.03, y: -5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <button
                    className="w-full bg-white/60 rounded-xl p-4 text-left hover:bg-white hover:shadow-md transition-all"
                    onClick={() => handleViewRecord(item)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">{getTestIcon(item.testType)}</span>
                        <span className="font-medium">{item.testName}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {item.testStartTime ? new Date(item.testStartTime).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="font-bold text-xl text-morandi-purple mb-2">
                      {item.totalScore}/100
noFast                    </div>
                    <div className={`text-sm font-semibold ${item.level === 'high' ? 'text-red-600' : item.level === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                    {item.level === 'high' ? '高风险' : item.level === 'medium' ? '中等风险' : '低风险'}
                  </div>
                    <div className="mt-3 text-xs text-morandi-purple">
                      点击查看详情 →
                    </div>
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-lg font-semibold mb-2">暂无测试记录</h3>
              <p className="text-gray-600 mb-4">完成测试后，你的测试记录将显示在这里</p>
              <button
                className="bg-morandi-purple text-white px-6 py-2 rounded-lg hover:bg-morandi-purple/90 transition-colors"
                onClick={() => setCurrentStep('select')}
              >
                开始新测试
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-12 bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="text-lg font-semibold mb-2">请登录查看测试记录</h3>
          <p className="text-gray-600 mb-4">测试记录与账号绑定，登录后即可查看和管理你的测试历史</p>
          <button
            className="bg-morandi-purple text-white px-6 py-2 rounded-lg hover:bg-morandi-purple/90 transition-colors"
            onClick={() => window.location.href = '/login'}
          >
            立即登录
          </button>
        </div>
      )}
    </div>
  );

  // 渲染答题页面
  const renderAnswering = () => (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            className="text-gray-600 hover:text-morandi-purple mr-4"
            onClick={handleBackToSelect}
          >
            ← 返回选择
          </button>
          <div>
            <h1 className="text-2xl font-bold text-morandi-purple">
              {testTypes.find(t => t.id === activeTest)?.name}
            </h1>
            <p className="text-gray-600">请根据实际情况回答以下问题</p>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          进度: {Object.keys(answers).length}/{questions.length}
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
          <div className="flex items-center">
            <span className="text-lg mr-2">⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* 问题列表 */}
      {loadingQuestions ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-morandi-purple mb-4"></div>
          <p className="text-gray-600">正在加载问题...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          暂无测试问题
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((question, index) => (
            <motion.div
              id={`question-${question.id}`}
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-sm hover:shadow-md transition-all"
            >
              <p className="font-medium text-lg mb-4">
                {index + 1}. {question.text}
                {answers[question.id] !== undefined && (
                  <motion.span 
                    className="ml-2 text-sm text-green-600"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    ✓
                  </motion.span>
                )}
              </p>
              <div className="space-y-2">
                {question.options && question.options.map((option, idx) => (
                  <motion.label
                    key={idx}
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                      question.isMultiple 
                        ? (answers[question.id] && Array.isArray(answers[question.id]) && answers[question.id].includes(idx)) 
                          ? 'bg-morandi-purple/20 border-2 border-morandi-purple' 
                          : 'bg-white/50 hover:bg-white'
                        : (answers[question.id] === idx) 
                          ? 'bg-morandi-purple/20 border-2 border-morandi-purple' 
                          : 'bg-white/50 hover:bg-white'
                    }`}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <input
                      type={question.isMultiple ? "checkbox" : "radio"}
                      name={`question-${question.id}`}
                      value={idx}
                      checked={question.isMultiple 
                        ? (answers[question.id] && Array.isArray(answers[question.id]) && answers[question.id].includes(idx)) 
                        : (answers[question.id] === idx)}
                      onChange={() => !loadingSubmit && handleAnswerChange(question.id, idx, question.isMultiple)}
                      disabled={loadingSubmit}
                      className="mr-3"
                    />
                    <span>{option}</span>
                  </motion.label>
                ))}
              </div>
            </motion.div>
          ))}

          {/* 提交按钮 */}
          <div className="mt-8">
            <button
              type="submit"
              className="w-full bg-morandi-purple text-white py-3 rounded-lg font-semibold hover:bg-morandi-purple/90 transition-colors"
              disabled={loadingSubmit}
            >
              {loadingSubmit ? (
                <>
                  <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                  AI分析中...
                </>
              ) : (
                '提交测试，获取分析报告'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );

  // 渲染结果页面
  const renderResult = () => {
    if (!result) return null;

    // MBTI测试结果渲染
    if (activeTest === 'mbti') {
      return (
        <div className="space-y-8">
          {/* 头部 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <button
                className="text-gray-600 hover:bg-[#F8C8DC] hover:text-white px-3 py-1 rounded-full transition-all mr-4"
                onClick={handleBackToSelect}
              >
                ← 返回选择
              </button>
              <div>
                <h1 className="text-xl font-bold text-[#F8C8DC] flex items-center">
                  🧩 MBTI人格测试分析报告
                </h1>
                <p className="text-gray-400 text-sm">AI智能人格分析报告</p>
              </div>
            </div>
          </div>

          {/* 情感化引导 */}
          <div className="text-center mb-6">
            <p className="text-gray-600">✨ 你的人格分析报告已生成，让我们一起探索更好的自己</p>
          </div>

          {/* MBTI类型概览 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-5 shadow-md hover:-translate-y-2 transition-all border-2 border-purple-300"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-purple-800 mb-2">{result.type} - {result.typeName}</h2>
                <p className="text-gray-700">{result.description || '基于AI分析的MBTI人格评估'}</p>
              </div>
              <div className="text-right mt-4 md:mt-0">
                <div className="text-3xl font-bold text-purple-600">
                  {result.totalScore}/100
                </div>
                <div className="text-sm font-semibold text-purple-600">
                  人格健康度评估
                </div>
              </div>
            </div>
          </motion.div>

          {/* AI深度分析区 */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">人格深度分析</h3>
            
            {/* 子卡片1：核心优势 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#E3F2FD] rounded-xl p-4 shadow-sm"
            >
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <span className="text-2xl mr-2">🌟</span>
                你的核心优势
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                {result.strengths?.map((strength, index) => (
                  <li key={index}>{strength}</li>
                )) || (
                  <>
                    <li>理想主义</li>
                    <li>有同情心</li>
                    <li>创造力强</li>
                    <li>追求和谐</li>
                  </>
                )}
              </ul>
            </motion.div>

            {/* 子卡片2：待发展领域 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#FFF9C4] rounded-xl p-4 shadow-sm"
            >
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <span className="text-2xl mr-2">📈</span>
                待发展领域
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                {result.weaknesses?.map((weakness, index) => (
                  <li key={index}>{weakness}</li>
                )) || (
                  <>
                    <li>过于理想主义</li>
                    <li>容易受伤</li>
                    <li>犹豫不决</li>
                  </>
                )}
              </ul>
            </motion.div>

            {/* 子卡片3：职业建议 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#E8F5E8] rounded-xl p-4 shadow-sm"
            >
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <span className="text-2xl mr-2">💼</span>
                适合的职业方向
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                {result.careerRecommendations?.map((career, index) => (
                  <li key={index}>{career}</li>
                )) || (
                  <>
                    <li>咨询师</li>
                    <li>教育工作者</li>
                    <li>艺术家</li>
                    <li>社会工作者</li>
                  </>
                )}
              </ul>
            </motion.div>

            {/* 子卡片4：人际关系建议 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-[#FFF3E0] rounded-xl p-4 shadow-sm"
            >
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <span className="text-2xl mr-2">🤝</span>
                人际关系建议
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                {result.relationshipTips?.map((tip, index) => (
                  <li key={index}>{tip}</li>
                )) || (
                  <>
                    <li>学会表达自己的需求</li>
                    <li>保持开放的沟通</li>
                    <li>寻找理解你的伴侣</li>
                  </>
                )}
              </ul>
            </motion.div>

            {/* 子卡片5：个人成长建议 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-[#F3E5F5] rounded-xl p-4 shadow-sm"
            >
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <span className="text-2xl mr-2">🌱</span>
                个人成长建议
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                {result.growthSuggestions?.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                )) || (
                  <>
                    <li>设定现实目标</li>
                    <li>学会应对批评</li>
                    <li>培养自信心</li>
                  </>
                )}
              </ul>
            </motion.div>

            {/* 子卡片6：人格兼容性 */}
            {result.compatibility && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-[#E1F5FE] rounded-xl p-4 shadow-sm"
              >
                <h4 className="text-lg font-semibold mb-3 flex items-center">
                  <span className="text-2xl mr-2">❤️</span>
                  人格兼容性
                </h4>
                {result.compatibility.best && (
                  <div className="mb-3">
                    <h5 className="font-medium mb-2">最佳匹配：</h5>
                    <div className="flex flex-wrap gap-2">
                      {result.compatibility.best.map((type, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">{type}</span>
                      ))}
                    </div>
                  </div>
                )}
                {result.compatibility.good && (
                  <div className="mb-3">
                    <h5 className="font-medium mb-2">良好匹配：</h5>
                    <div className="flex flex-wrap gap-2">
                      {result.compatibility.good.map((type, index) => (
                        <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">{type}</span>
                      ))}
                    </div>
                  </div>
                )}
                {result.compatibility.challenging && (
                  <div>
                    <h5 className="font-medium mb-2">需要努力：</h5>
                    <div className="flex flex-wrap gap-2">
                      {result.compatibility.challenging.map((type, index) => (
                        <span key={index} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">{type}</span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* 底部导出与操作区 */}
          <div className="bg-white rounded-xl p-4 shadow-sm mt-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                className="p-3 bg-gray-100 hover:bg-gray-200 hover:text-white transition-colors rounded-lg flex flex-col items-center"
                onClick={exportAsImage}
                disabled={exporting}
              >
                <div className="text-2xl mb-2">🖼️</div>
                <span className="text-sm font-medium">导出图片</span>
              </button>
              <button
                className="p-3 bg-gray-100 hover:bg-gray-200 hover:text-white transition-colors rounded-lg flex flex-col items-center"
                onClick={exportAsPDF}
                disabled={exporting}
              >
                <div className="text-2xl mb-2">📄</div>
                <span className="text-sm font-medium">导出PDF</span>
              </button>
              <button
                className="p-3 bg-[#F3E5F5] hover:bg-[#E1BEE7] hover:text-white transition-colors rounded-lg flex flex-col items-center"
                onClick={handleRetakeTest}
              >
                <div className="text-2xl mb-2">🔄</div>
                <span className="text-sm font-medium">重新测试</span>
              </button>
              <button
                className="p-3 bg-gray-100 hover:bg-gray-200 hover:text-white transition-colors rounded-lg flex flex-col items-center"
                onClick={handleBackToSelect}
              >
                <div className="text-2xl mb-2">🔍</div>
                <span className="text-sm font-medium">选择其他测试</span>
              </button>
            </div>
          </div>

          {/* 情感化结尾 */}
          <div className="text-center mt-6 mb-8">
            <p className="text-gray-600">💖 了解自己是成长的开始，每一种人格都有独特的价值</p>
          </div>

          {/* 数据隐私提示 */}
          <div className="text-center text-xs text-gray-400 mb-4">
            🔒 你的测试数据仅用于本次分析，已加密存储
          </div>
        </div>
      );
    }

    // 九型人格测试结果渲染
    if (activeTest === 'enneagram') {
      return (
        <div className="space-y-8">
          {/* 头部 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <button
                className="text-gray-600 hover:bg-[#F8C8DC] hover:text-white px-3 py-1 rounded-full transition-all mr-4"
                onClick={handleBackToSelect}
              >
                ← 返回选择
              </button>
              <div>
                <h1 className="text-xl font-bold text-[#F8C8DC] flex items-center">
                  🌟 九型人格测试分析报告
                </h1>
                <p className="text-gray-400 text-sm">AI智能人格分析报告</p>
              </div>
            </div>
          </div>

          {/* 情感化引导 */}
          <div className="text-center mb-6">
            <p className="text-gray-600">✨ 你的九型人格分析报告已生成，让我们一起探索更好的自己</p>
          </div>

          {/* 九型人格类型概览 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-5 shadow-md hover:-translate-y-2 transition-all border-2 border-orange-300"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-orange-800 mb-2">类型 {result.type} - {result.typeName}</h2>
                <p className="text-gray-700">{result.description || '基于AI分析的九型人格评估'}</p>
              </div>
              <div className="text-right mt-4 md:mt-0">
                <div className="text-3xl font-bold text-orange-600">
                  {result.totalScore}/100
                </div>
                <div className="text-sm font-semibold text-orange-600">
                  人格健康度评估
                </div>
              </div>
            </div>
          </motion.div>

          {/* AI深度分析区 */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">人格深度分析</h3>
            
            {/* 子卡片1：核心恐惧与欲望 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#E3F2FD] rounded-xl p-4 shadow-sm"
            >
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <span className="text-2xl mr-2">💭</span>
                核心恐惧与欲望
              </h4>
              <div className="space-y-3">
                <div>
                  <h5 className="font-medium mb-2">😨 核心恐惧：</h5>
                  <p className="text-gray-700">{result.coreFear || '未找到核心恐惧信息'}</p>
                </div>
                <div>
                  <h5 className="font-medium mb-2">🌟 核心欲望：</h5>
                  <p className="text-gray-700">{result.coreDesire || '未找到核心欲望信息'}</p>
                </div>
              </div>
            </motion.div>

            {/* 子卡片2：不同状态下的特质 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#FFF9C4] rounded-xl p-4 shadow-sm"
            >
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <span className="text-2xl mr-2">📊</span>
                不同状态下的特质
              </h4>
              <div className="space-y-3">
                <div>
                  <h5 className="font-medium mb-2">✅ 健康状态：</h5>
                  <p className="text-gray-700">{result.healthyLevel || '未找到健康状态信息'}</p>
                </div>
                <div>
                  <h5 className="font-medium mb-2">⚖️ 平均状态：</h5>
                  <p className="text-gray-700">{result.averageLevel || '未找到平均状态信息'}</p>
                </div>
                <div>
                  <h5 className="font-medium mb-2">⚠️ 不健康状态：</h5>
                  <p className="text-gray-700">{result.unhealthyLevel || '未找到不健康状态信息'}</p>
                </div>
              </div>
            </motion.div>

            {/* 子卡片3：成长与压力路径 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#E8F5E8] rounded-xl p-4 shadow-sm"
            >
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <span className="text-2xl mr-2">🌱</span>
                成长与压力路径
              </h4>
              <div className="space-y-3">
                <div>
                  <h5 className="font-medium mb-2">📈 成长路径：</h5>
                  <p className="text-gray-700">{result.growthPath || '未找到成长路径信息'}</p>
                </div>
                <div>
                  <h5 className="font-medium mb-2">📉 压力路径：</h5>
                  <p className="text-gray-700">{result.stressPath || '未找到压力路径信息'}</p>
                </div>
                <div>
                  <h5 className="font-medium mb-2">🔄 整合水平：</h5>
                  <p className="text-gray-700">{result.integrationLevel || '未找到整合水平信息'}</p>
                </div>
              </div>
            </motion.div>

            {/* 子卡片4：个人成长建议 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-[#F3E5F5] rounded-xl p-4 shadow-sm"
            >
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <span className="text-2xl mr-2">💡</span>
                个人成长建议
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                {result.suggestions?.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                )) || (
                  <>
                    <li>了解自己的核心恐惧和欲望</li>
                    <li>探索个人成长路径</li>
                    <li>平衡不同状态下的表现</li>
                    <li>培养自我觉察能力</li>
                  </>
                )}
              </ul>
            </motion.div>
          </div>

          {/* 底部导出与操作区 */}
          <div className="bg-white rounded-xl p-4 shadow-sm mt-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                className="p-3 bg-gray-100 hover:bg-gray-200 hover:text-white transition-colors rounded-lg flex flex-col items-center"
                onClick={exportAsImage}
                disabled={exporting}
              >
                <div className="text-2xl mb-2">🖼️</div>
                <span className="text-sm font-medium">导出图片</span>
              </button>
              <button
                className="p-3 bg-gray-100 hover:bg-gray-200 hover:text-white transition-colors rounded-lg flex flex-col items-center"
                onClick={exportAsPDF}
                disabled={exporting}
              >
                <div className="text-2xl mb-2">📄</div>
                <span className="text-sm font-medium">导出PDF</span>
              </button>
              <button
                className="p-3 bg-[#F3E5F5] hover:bg-[#E1BEE7] hover:text-white transition-colors rounded-lg flex flex-col items-center"
                onClick={handleRetakeTest}
              >
                <div className="text-2xl mb-2">🔄</div>
                <span className="text-sm font-medium">重新测试</span>
              </button>
              <button
                className="p-3 bg-gray-100 hover:bg-gray-200 hover:text-white transition-colors rounded-lg flex flex-col items-center"
                onClick={handleBackToSelect}
              >
                <div className="text-2xl mb-2">🔍</div>
                <span className="text-sm font-medium">选择其他测试</span>
              </button>
            </div>
          </div>

          {/* 情感化结尾 */}
          <div className="text-center mt-6 mb-8">
            <p className="text-gray-600">💖 了解自己是成长的开始，每一种人格都有独特的价值</p>
          </div>

          {/* 数据隐私提示 */}
          <div className="text-center text-xs text-gray-400 mb-4">
            🔒 你的测试数据仅用于本次分析，已加密存储
          </div>
        </div>
      );
    }

    // 睡眠质量评估测试结果渲染
    if (activeTest === 'sleep') {
      return (
        <div className="space-y-8">
          {/* 头部 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <button
                className="text-gray-600 hover:bg-[#F8C8DC] hover:text-white px-3 py-1 rounded-full transition-all mr-4"
                onClick={handleBackToSelect}
              >
                ← 返回选择
              </button>
              <div>
                <h1 className="text-xl font-bold text-[#F8C8DC] flex items-center">
                  😴 睡眠质量评估报告
                </h1>
                <p className="text-gray-400 text-sm">AI智能睡眠分析报告</p>
              </div>
            </div>
          </div>

          {/* 情感化引导 */}
          <div className="text-center mb-6">
            <p className="text-gray-600">✨ 你的睡眠质量评估报告已生成，让我们一起改善睡眠质量</p>
          </div>

          {/* 睡眠质量概览 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl p-5 shadow-md hover:-translate-y-2 transition-all border-2 border-blue-300"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-blue-800 mb-2">睡眠质量评估</h2>
                <p className="text-gray-700">{result.description || '基于AI分析的睡眠质量评估'}</p>
              </div>
              <div className="text-right mt-4 md:mt-0">
                <div className="text-3xl font-bold text-blue-600">
                  {result.totalScore}/100
                </div>
                <div className="text-sm font-semibold text-blue-600">
                  睡眠质量评分
                </div>
              </div>
            </div>
          </motion.div>

          {/* AI深度分析区 */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">睡眠深度分析</h3>
            
            {/* 子卡片1：睡眠现状 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#E3F2FD] rounded-xl p-4 shadow-sm"
            >
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <span className="text-2xl mr-2">📊</span>
                睡眠现状分析
              </h4>
              <div className="space-y-3">
                <div>
                  <h5 className="font-medium mb-2">✅ 核心特征：</h5>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    {result.mentalState?.coreFeatures?.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    )) || (
                      <>
                        <li>睡眠时长不足</li>
                        <li>睡眠质量差</li>
                        <li>入睡困难</li>
                        <li>夜间易醒</li>
                      </>
                    )}
                  </ul>
                </div>
                <div className="mt-4">
                  <h5 className="font-medium mb-2">💡 底层原因：</h5>
                  <p className="text-gray-700">
                    {result.mentalState?.underlyingCause || "当前睡眠质量不佳，可能与生活习惯、心理压力等因素有关"}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* 子卡片2：睡眠改善建议 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#FFF9C4] rounded-xl p-4 shadow-sm"
            >
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <span className="text-2xl mr-2">💡</span>
                睡眠改善建议
              </h4>
              <div className="space-y-3">
                {result.suggestions?.map((suggestion, index) => (
                  <div key={index} className="flex items-start">
                    <span className="text-blue-500 font-bold mr-2">🔹</span>
                    <span className="text-gray-700">{suggestion}</span>
                  </div>
                )) || (
                  <>
                    <div className="flex items-start">
                      <span className="text-blue-500 font-bold mr-2">🔹</span>
                      <span className="text-gray-700">保持规律的作息时间，每天固定时间上床和起床</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-blue-500 font-bold mr-2">🔹</span>
                      <span className="text-gray-700">睡前1小时避免使用电子设备，减少蓝光暴露</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-blue-500 font-bold mr-2">🔹</span>
                      <span className="text-gray-700">创建舒适的睡眠环境，保持房间安静、黑暗和适宜的温度</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-blue-500 font-bold mr-2">🔹</span>
                      <span className="text-gray-700">睡前避免摄入咖啡因和大量食物</span>
                    </div>
                  </>
                )}
              </div>
            </motion.div>

            {/* 子卡片3：睡眠质量风险 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#FFF3E0] rounded-xl p-4 shadow-sm"
            >
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <span className="text-2xl mr-2">⚠️</span>
                睡眠质量风险
              </h4>
              <p className="text-gray-700 mb-4">
                {result.mentalState?.riskDescription || '睡眠质量不佳可能会影响身体健康、情绪状态和日常工作效率，建议及时调整。'}
              </p>
              <div className="flex space-x-3">
                <button
                  className="bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center"
                  onClick={() => window.location.href = '/mindfulness'}
                >
                  🧘 进入正念庭院
                </button>
                <button
                  className="bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center"
                  onClick={() => window.location.href = '/resources'}
                >
                  📚 睡眠资源
                </button>
              </div>
            </motion.div>

            {/* 子卡片4：睡眠改善计划 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-[#E8F5E8] rounded-xl p-4 shadow-sm"
            >
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <span className="text-2xl mr-2">📅</span>
                睡眠改善计划
              </h4>
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium mb-3">🔹 短期调整（1-7天）：</h5>
                  <div className="space-y-2">
                    {result.actionPlan?.slice(0, 2).map((action, index) => (
                      <div key={index} className="w-full bg-white p-3 rounded-lg">
                        <span className="text-gray-700">{action}</span>
                      </div>
                    )) || (
                      <>
                        <div className="w-full bg-white p-3 rounded-lg">
                          <span className="text-gray-700">建立规律的睡眠时间表</span>
                        </div>
                        <div className="w-full bg-white p-3 rounded-lg">
                          <span className="text-gray-700">睡前放松活动，如阅读或冥想</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <h5 className="font-medium mb-3">🔹 长期养成（8-30天）：</h5>
                  <div className="space-y-2">
                    {result.actionPlan?.slice(2, 4).map((action, index) => (
                      <div key={index} className="w-full bg-white p-3 rounded-lg">
                        <span className="text-gray-700">{action}</span>
                      </div>
                    )) || (
                      <>
                        <div className="w-full bg-white p-3 rounded-lg">
                          <span className="text-gray-700">优化睡眠环境，保持房间舒适</span>
                        </div>
                        <div className="w-full bg-white p-3 rounded-lg">
                          <span className="text-gray-700">培养健康的生活习惯，包括适量运动</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* 底部导出与操作区 */}
          <div className="bg-white rounded-xl p-4 shadow-sm mt-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                className="p-3 bg-gray-100 hover:bg-gray-200 hover:text-white transition-colors rounded-lg flex flex-col items-center"
                onClick={exportAsImage}
                disabled={exporting}
              >
                <div className="text-2xl mb-2">🖼️</div>
                <span className="text-sm font-medium">导出图片</span>
              </button>
              <button
                className="p-3 bg-gray-100 hover:bg-gray-200 hover:text-white transition-colors rounded-lg flex flex-col items-center"
                onClick={exportAsPDF}
                disabled={exporting}
              >
                <div className="text-2xl mb-2">📄</div>
                <span className="text-sm font-medium">导出PDF</span>
              </button>
              <button
                className="p-3 bg-[#F3E5F5] hover:bg-[#E1BEE7] hover:text-white transition-colors rounded-lg flex flex-col items-center"
                onClick={handleRetakeTest}
              >
                <div className="text-2xl mb-2">🔄</div>
                <span className="text-sm font-medium">重新测试</span>
              </button>
              <button
                className="p-3 bg-gray-100 hover:bg-gray-200 hover:text-white transition-colors rounded-lg flex flex-col items-center"
                onClick={handleBackToSelect}
              >
                <div className="text-2xl mb-2">🔍</div>
                <span className="text-sm font-medium">选择其他测试</span>
              </button>
            </div>
          </div>

          {/* 情感化结尾 */}
          <div className="text-center mt-6 mb-8">
            <p className="text-gray-600">💖 良好的睡眠是健康的基础，让我们一起改善睡眠质量</p>
          </div>

          {/* 数据隐私提示 */}
          <div className="text-center text-xs text-gray-400 mb-4">
            🔒 你的测试数据仅用于本次分析，已加密存储
          </div>
        </div>
      );
    }

    // 性格特质分析测试结果渲染
    if (activeTest === 'personality') {
      return (
        <div className="space-y-8">
          {/* 头部 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <button
                className="text-gray-600 hover:bg-[#F8C8DC] hover:text-white px-3 py-1 rounded-full transition-all mr-4"
                onClick={handleBackToSelect}
              >
                ← 返回选择
              </button>
              <div>
                <h1 className="text-xl font-bold text-[#F8C8DC] flex items-center">
                  🔍 性格特质分析报告
                </h1>
                <p className="text-gray-400 text-sm">AI智能性格分析报告</p>
              </div>
            </div>
          </div>

          {/* 情感化引导 */}
          <div className="text-center mb-6">
            <p className="text-gray-600">✨ 你的性格特质分析报告已生成，让我们一起了解更好的自己</p>
          </div>

          {/* 性格特质概览 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 shadow-md hover:-translate-y-2 transition-all border-2 border-indigo-300"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-indigo-800 mb-2">性格特质分析</h2>
                <p className="text-gray-700">{result.description || '基于AI分析的性格特质评估'}</p>
              </div>
              <div className="text-right mt-4 md:mt-0">
                <div className="text-3xl font-bold text-indigo-600">
                  {result.totalScore}/100
                </div>
                <div className="text-sm font-semibold text-indigo-600">
                  性格健康度评估
                </div>
              </div>
            </div>
          </motion.div>

          {/* AI深度分析区 */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">性格深度分析</h3>
            
            {/* 子卡片1：核心特质 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#E3F2FD] rounded-xl p-4 shadow-sm"
            >
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <span className="text-2xl mr-2">🌟</span>
                你的核心特质
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                {result.mentalState?.coreFeatures?.map((feature, index) => (
                  <li key={index}>{feature}</li>
                )) || (
                  <>
                    <li>外向性：中等水平</li>
                    <li>神经质：较低水平</li>
                    <li>开放性：较高水平</li>
                    <li>宜人性：中等水平</li>
                    <li>责任心：较高水平</li>
                  </>
                )}
              </ul>
            </motion.div>

            {/* 子卡片2：性格优势 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#E8F5E8] rounded-xl p-4 shadow-sm"
            >
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <span className="text-2xl mr-2">💪</span>
                性格优势
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                {result.strengths?.map((strength, index) => (
                  <li key={index}>{strength}</li>
                )) || (
                  <>
                    <li>责任心强，做事认真可靠</li>
                    <li>开放性高，愿意尝试新事物</li>
                    <li>情绪稳定，能够应对压力</li>
                    <li>善于思考，有独立见解</li>
                  </>
                )}
              </ul>
            </motion.div>

            {/* 子卡片3：待发展领域 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#FFF9C4] rounded-xl p-4 shadow-sm"
            >
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <span className="text-2xl mr-2">📈</span>
                待发展领域
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                {result.weaknesses?.map((weakness, index) => (
                  <li key={index}>{weakness}</li>
                )) || (
                  <>
                    <li>在社交场合可能过于拘谨</li>
                    <li>有时会过于追求完美</li>
                    <li>需要更多的情绪表达</li>
                    <li>在压力下可能会变得固执</li>
                  </>
                )}
              </ul>
            </motion.div>

            {/* 子卡片4：个性化建议 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-[#F3E5F5] rounded-xl p-4 shadow-sm"
            >
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <span className="text-2xl mr-2">💡</span>
                个性化发展建议
              </h4>
              <div className="space-y-3">
                {result.suggestions?.map((suggestion, index) => (
                  <div key={index} className="flex items-start">
                    <span className="text-indigo-500 font-bold mr-2">🔹</span>
                    <span className="text-gray-700">{suggestion}</span>
                  </div>
                )) || (
                  <>
                    <div className="flex items-start">
                      <span className="text-indigo-500 font-bold mr-2">🔹</span>
                      <span className="text-gray-700">在社交场合中尝试主动与他人交流，培养更开放的沟通风格</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-indigo-500 font-bold mr-2">🔹</span>
                      <span className="text-gray-700">学会接受不完美，给自己和他人更多的宽容和理解</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-indigo-500 font-bold mr-2">🔹</span>
                      <span className="text-gray-700">尝试更多地表达自己的情绪和感受，增强情感连接</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-indigo-500 font-bold mr-2">🔹</span>
                      <span className="text-gray-700">在压力情境下学习灵活应对，培养适应性思维</span>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>

          {/* 底部导出与操作区 */}
          <div className="bg-white rounded-xl p-4 shadow-sm mt-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                className="p-3 bg-gray-100 hover:bg-gray-200 hover:text-white transition-colors rounded-lg flex flex-col items-center"
                onClick={exportAsImage}
                disabled={exporting}
              >
                <div className="text-2xl mb-2">🖼️</div>
                <span className="text-sm font-medium">导出图片</span>
              </button>
              <button
                className="p-3 bg-gray-100 hover:bg-gray-200 hover:text-white transition-colors rounded-lg flex flex-col items-center"
                onClick={exportAsPDF}
                disabled={exporting}
              >
                <div className="text-2xl mb-2">📄</div>
                <span className="text-sm font-medium">导出PDF</span>
              </button>
              <button
                className="p-3 bg-[#F3E5F5] hover:bg-[#E1BEE7] hover:text-white transition-colors rounded-lg flex flex-col items-center"
                onClick={handleRetakeTest}
              >
                <div className="text-2xl mb-2">🔄</div>
                <span className="text-sm font-medium">重新测试</span>
              </button>
              <button
                className="p-3 bg-gray-100 hover:bg-gray-200 hover:text-white transition-colors rounded-lg flex flex-col items-center"
                onClick={handleBackToSelect}
              >
                <div className="text-2xl mb-2">🔍</div>
                <span className="text-sm font-medium">选择其他测试</span>
              </button>
            </div>
          </div>

          {/* 情感化结尾 */}
          <div className="text-center mt-6 mb-8">
            <p className="text-gray-600">💖 了解自己的性格特质，是个人成长的重要一步</p>
          </div>

          {/* 数据隐私提示 */}
          <div className="text-center text-xs text-gray-400 mb-4">
            🔒 你的测试数据仅用于本次分析，已加密存储
          </div>
        </div>
      );
    }

    // 抑郁筛查量表测试结果渲染
    if (activeTest === 'depression') {
      return (
        <div className="space-y-8">
          {/* 头部 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <button
                className="text-gray-600 hover:bg-[#F8C8DC] hover:text-white px-3 py-1 rounded-full transition-all mr-4"
                onClick={handleBackToSelect}
              >
                ← 返回选择
              </button>
              <div>
                <h1 className="text-xl font-bold text-[#F8C8DC] flex items-center">
                  🩺 抑郁筛查量表分析报告
                </h1>
                <p className="text-gray-400 text-sm">PHQ-9专业抑郁筛查分析</p>
              </div>
            </div>
          </div>

          {/* 情感化引导 */}
          <div className="text-center mb-6">
            <p className="text-gray-600">✨ 你的抑郁筛查分析报告已生成，让我们一起关注心理健康</p>
          </div>

          {/* 抑郁筛查概览 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl p-5 shadow-md hover:-translate-y-2 transition-all ${result.totalScore >= 15 ? 'bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300' : result.totalScore >= 10 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-300' : 'bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300'}`}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">抑郁筛查评估</h2>
                <p className="text-gray-700">{result.description || '基于PHQ-9量表的专业抑郁筛查评估'}</p>
              </div>
              <div className="text-right mt-4 md:mt-0">
                <div className="text-3xl font-bold">
                  {result.totalScore}/27
                </div>
                <div className="text-sm font-semibold">
                  PHQ-9总分
                </div>
              </div>
            </div>
            <div className={`text-lg font-semibold mt-2 ${result.totalScore >= 15 ? 'text-red-800' : result.totalScore >= 10 ? 'text-yellow-800' : 'text-green-800'}`}>
              {result.totalScore >= 15 ? '抑郁症状：重度' : result.totalScore >= 10 ? '抑郁症状：中度' : result.totalScore >= 5 ? '抑郁症状：轻度' : '抑郁症状：无'}
            </div>
          </motion.div>

          {/* 风险预警 - 高风险时放在最上面 */}
          {result.totalScore >= 15 && (
            <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl p-5">
              <div className="flex items-center mb-4">
                <div className="text-3xl mr-3">🚨</div>
                <div>
                  <h4 className="text-xl font-bold">紧急心理健康支持</h4>
                  <p className="text-red-100">检测到重度抑郁症状，请立即寻求专业帮助</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-white/20 p-3 rounded-lg">
                  <div className="font-bold mb-1">📞 24小时心理援助热线</div>
                  <div className="text-2xl font-mono">4001619995</div>
                </div>
                <button
                  className="w-full bg-white text-red-600 py-2 rounded-lg font-bold hover:bg-red-50 transition-colors"
                  onClick={() => window.location.href = '/resources'}
                >
                  立即预约专业心理咨询
                </button>
              </div>
            </div>
          )}

          {/* AI深度分析区 */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">抑郁症状深度分析</h3>
            
            {/* 子卡片1：症状表现 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#E3F2FD] rounded-xl p-4 shadow-sm"
            >
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <span className="text-2xl mr-2">📋</span>
                症状表现
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                {result.mentalState?.coreFeatures?.map((feature, index) => (
                  <li key={index}>{feature}</li>
                )) || (
                  <>
                    <li>情绪低落、沮丧或绝望</li>
                    <li>对日常活动失去兴趣或乐趣</li>
                    <li>食欲或体重变化</li>
                    <li>睡眠障碍（失眠或过度睡眠）</li>
                    <li>精力下降或疲劳感</li>
                    <li>自我评价降低或内疚感</li>
                    <li>注意力集中困难</li>
                    <li>活动减少或迟缓</li>
                    <li>自杀观念或行为</li>
                  </>
                )}
              </ul>
            </motion.div>

            {/* 子卡片2：风险评估 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#FFF3E0] rounded-xl p-4 shadow-sm"
            >
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <span className="text-2xl mr-2">⚠️</span>
                风险评估
              </h4>
              <p className="text-gray-700 mb-4">
                {result.mentalState?.underlyingCause || '基于PHQ-9量表的抑郁症状评估，建议根据症状严重程度采取相应的干预措施。'}
              </p>
              <div className="flex space-x-3">
                <button
                  className="bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center"
                  onClick={() => window.location.href = '/resources'}
                >
                  🧑‍⚕️ 预约专业咨询
                </button>
                <button
                  className="bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center"
                  onClick={() => window.location.href = '/mindfulness'}
                >
                  🧘 正念减压
                </button>
              </div>
            </motion.div>

            {/* 子卡片3：干预建议 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#FFF9C4] rounded-xl p-4 shadow-sm"
            >
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <span className="text-2xl mr-2">💡</span>
                干预建议
              </h4>
              <div className="space-y-3">
                {result.suggestions?.map((suggestion, index) => (
                  <div key={index} className="flex items-start">
                    <span className="text-blue-500 font-bold mr-2">🔹</span>
                    <span className="text-gray-700">{suggestion}</span>
                  </div>
                )) || (
                  <>
                    <div className="flex items-start">
                      <span className="text-blue-500 font-bold mr-2">🔹</span>
                      <span className="text-gray-700">寻求专业心理健康服务，如心理咨询或治疗</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-blue-500 font-bold mr-2">🔹</span>
                      <span className="text-gray-700">保持规律的作息时间，确保充足的睡眠</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-blue-500 font-bold mr-2">🔹</span>
                      <span className="text-gray-700">适当进行有氧运动，如散步、跑步或游泳</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-blue-500 font-bold mr-2">🔹</span>
                      <span className="text-gray-700">与亲友保持联系，分享自己的感受</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-blue-500 font-bold mr-2">🔹</span>
                      <span className="text-gray-700">避免酒精和药物的滥用</span>
                    </div>
                  </>
                )}
              </div>
            </motion.div>

            {/* 子卡片4：康复计划 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-[#E8F5E8] rounded-xl p-4 shadow-sm"
            >
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <span className="text-2xl mr-2">📅</span>
                康复计划
              </h4>
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium mb-3">🔹 短期干预（1-2周）：</h5>
                  <div className="space-y-2">
                    {result.actionPlan?.slice(0, 2).map((action, index) => (
                      <div key={index} className="w-full bg-white p-3 rounded-lg">
                        <span className="text-gray-700">{action}</span>
                      </div>
                    )) || (
                      <>
                        <div className="w-full bg-white p-3 rounded-lg">
                          <span className="text-gray-700">建立规律的作息时间表，保证充足睡眠</span>
                        </div>
                        <div className="w-full bg-white p-3 rounded-lg">
                          <span className="text-gray-700">每天进行30分钟有氧运动，如散步或瑜伽</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <h5 className="font-medium mb-3">🔹 长期康复（1-3个月）：</h5>
                  <div className="space-y-2">
                    {result.actionPlan?.slice(2, 4).map((action, index) => (
                      <div key={index} className="w-full bg-white p-3 rounded-lg">
                        <span className="text-gray-700">{action}</span>
                      </div>
                    )) || (
                      <>
                        <div className="w-full bg-white p-3 rounded-lg">
                          <span className="text-gray-700">定期进行心理咨询，建立支持系统</span>
                        </div>
                        <div className="w-full bg-white p-3 rounded-lg">
                          <span className="text-gray-700">学习情绪管理技巧，如正念冥想</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* 底部导出与操作区 */}
          <div className="bg-white rounded-xl p-4 shadow-sm mt-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                className="p-3 bg-gray-100 hover:bg-gray-200 hover:text-white transition-colors rounded-lg flex flex-col items-center"
                onClick={exportAsImage}
                disabled={exporting}
              >
                <div className="text-2xl mb-2">🖼️</div>
                <span className="text-sm font-medium">导出图片</span>
              </button>
              <button
                className="p-3 bg-gray-100 hover:bg-gray-200 hover:text-white transition-colors rounded-lg flex flex-col items-center"
                onClick={exportAsPDF}
                disabled={exporting}
              >
                <div className="text-2xl mb-2">📄</div>
                <span className="text-sm font-medium">导出PDF</span>
              </button>
              <button
                className="p-3 bg-[#F3E5F5] hover:bg-[#E1BEE7] hover:text-white transition-colors rounded-lg flex flex-col items-center"
                onClick={handleRetakeTest}
              >
                <div className="text-2xl mb-2">🔄</div>
                <span className="text-sm font-medium">重新测试</span>
              </button>
              <button
                className="p-3 bg-gray-100 hover:bg-gray-200 hover:text-white transition-colors rounded-lg flex flex-col items-center"
                onClick={handleBackToSelect}
              >
                <div className="text-2xl mb-2">🔍</div>
                <span className="text-sm font-medium">选择其他测试</span>
              </button>
            </div>
          </div>

          {/* 情感化结尾 */}
          <div className="text-center mt-6 mb-8">
            <p className="text-gray-600">💖 面对抑郁并不可怕，寻求帮助是勇敢的表现</p>
          </div>

          {/* 数据隐私提示 */}
          <div className="text-center text-xs text-gray-400 mb-4">
            🔒 你的测试数据仅用于本次分析，已加密存储
          </div>
        </div>
      );
    }

    // 焦虑筛查量表测试结果渲染
    if (activeTest === 'anxiety') {
      return (
        <div className="space-y-8">
          {/* 头部 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <button
                className="text-gray-600 hover:bg-[#F8C8DC] hover:text-white px-3 py-1 rounded-full transition-all mr-4"
                onClick={handleBackToSelect}
              >
                ← 返回选择
              </button>
              <div>
                <h1 className="text-xl font-bold text-[#F8C8DC] flex items-center">
                  😰 焦虑筛查量表分析报告
                </h1>
                <p className="text-gray-400 text-sm">GAD-7专业焦虑筛查分析</p>
              </div>
            </div>
          </div>

          {/* 情感化引导 */}
          <div className="text-center mb-6">
            <p className="text-gray-600">✨ 你的焦虑筛查分析报告已生成，让我们一起关注心理健康</p>
          </div>

          {/* 焦虑筛查概览 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl p-5 shadow-md hover:-translate-y-2 transition-all ${result.totalScore >= 15 ? 'bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300' : result.totalScore >= 10 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-300' : 'bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300'}`}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">焦虑筛查评估</h2>
                <p className="text-gray-700">{result.description || '基于GAD-7量表的专业焦虑筛查评估'}</p>
              </div>
              <div className="text-right mt-4 md:mt-0">
                <div className="text-3xl font-bold">
                  {result.totalScore}/21
                </div>
                <div className="text-sm font-semibold">
                  GAD-7总分
                </div>
              </div>
            </div>
            <div className={`text-lg font-semibold mt-2 ${result.totalScore >= 15 ? 'text-red-800' : result.totalScore >= 10 ? 'text-yellow-800' : 'text-green-800'}`}>
              {result.totalScore >= 15 ? '焦虑症状：重度' : result.totalScore >= 10 ? '焦虑症状：中度' : result.totalScore >= 5 ? '焦虑症状：轻度' : '焦虑症状：无'}
            </div>
          </motion.div>

          {/* 风险预警 - 高风险时放在最上面 */}
          {result.totalScore >= 15 && (
            <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl p-5">
              <div className="flex items-center mb-4">
                <div className="text-3xl mr-3">🚨</div>
                <div>
                  <h4 className="text-xl font-bold">紧急心理健康支持</h4>
                  <p className="text-red-100">检测到重度焦虑症状，请立即寻求专业帮助</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-white/20 p-3 rounded-lg">
                  <div className="font-bold mb-1">📞 24小时心理援助热线</div>
                  <div className="text-2xl font-mono">4001619995</div>
                </div>
                <button
                  className="w-full bg-white text-red-600 py-2 rounded-lg font-bold hover:bg-red-50 transition-colors"
                  onClick={() => window.location.href = '/resources'}
                >
                  立即预约专业心理咨询
                </button>
              </div>
            </div>
          )}

          {/* AI深度分析区 */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">焦虑症状深度分析</h3>
            
            {/* 子卡片1：症状表现 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#E3F2FD] rounded-xl p-4 shadow-sm"
            >
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <span className="text-2xl mr-2">📋</span>
                症状表现
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                {result.mentalState?.coreFeatures?.map((feature, index) => (
                  <li key={index}>{feature}</li>
                )) || (
                  <>
                    <li>感到紧张、焦虑或急切</li>
                    <li>不能停止或控制担忧</li>
                    <li>过度担心不同的事情</li>
                    <li>难以放松</li>
                    <li>由于不安而难以静坐</li>
                    <li>变得容易烦恼或急躁</li>
                    <li>感到害怕，好像有可怕的事情可能发生</li>
                  </>
                )}
              </ul>
            </motion.div>

            {/* 子卡片2：风险评估 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#FFF3E0] rounded-xl p-4 shadow-sm"
            >
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <span className="text-2xl mr-2">⚠️</span>
                风险评估
              </h4>
              <p className="text-gray-700 mb-4">
                {result.mentalState?.underlyingCause || '基于GAD-7量表的焦虑症状评估，建议根据症状严重程度采取相应的干预措施。'}
              </p>
              <div className="flex space-x-3">
                <button
                  className="bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center"
                  onClick={() => window.location.href = '/resources'}
                >
                  🧑‍⚕️ 预约专业咨询
                </button>
                <button
                  className="bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center"
                  onClick={() => window.location.href = '/mindfulness'}
                >
                  🧘 正念减压
                </button>
              </div>
            </motion.div>

            {/* 子卡片3：干预建议 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#FFF9C4] rounded-xl p-4 shadow-sm"
            >
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <span className="text-2xl mr-2">💡</span>
                干预建议
              </h4>
              <div className="space-y-3">
                {result.suggestions?.map((suggestion, index) => (
                  <div key={index} className="flex items-start">
                    <span className="text-blue-500 font-bold mr-2">🔹</span>
                    <span className="text-gray-700">{suggestion}</span>
                  </div>
                )) || (
                  <>
                    <div className="flex items-start">
                      <span className="text-blue-500 font-bold mr-2">🔹</span>
                      <span className="text-gray-700">寻求专业心理健康服务，如心理咨询或治疗</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-blue-500 font-bold mr-2">🔹</span>
                      <span className="text-gray-700">学习并练习放松技巧，如深呼吸、渐进性肌肉放松</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-blue-500 font-bold mr-2">🔹</span>
                      <span className="text-gray-700">保持规律的作息时间，确保充足的睡眠</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-blue-500 font-bold mr-2">🔹</span>
                      <span className="text-gray-700">适当进行有氧运动，如散步、跑步或游泳</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-blue-500 font-bold mr-2">🔹</span>
                      <span className="text-gray-700">避免咖啡因和其他兴奋剂的摄入</span>
                    </div>
                  </>
                )}
              </div>
            </motion.div>

            {/* 子卡片4：康复计划 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-[#E8F5E8] rounded-xl p-4 shadow-sm"
            >
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <span className="text-2xl mr-2">📅</span>
                康复计划
              </h4>
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium mb-3">🔹 短期干预（1-2周）：</h5>
                  <div className="space-y-2">
                    {result.actionPlan?.slice(0, 2).map((action, index) => (
                      <div key={index} className="w-full bg-white p-3 rounded-lg">
                        <span className="text-gray-700">{action}</span>
                      </div>
                    )) || (
                      <>
                        <div className="w-full bg-white p-3 rounded-lg">
                          <span className="text-gray-700">每天练习2次深呼吸或正念冥想，每次10分钟</span>
                        </div>
                        <div className="w-full bg-white p-3 rounded-lg">
                          <span className="text-gray-700">建立规律的作息时间表，保证充足睡眠</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <h5 className="font-medium mb-3">🔹 长期康复（1-3个月）：</h5>
                  <div className="space-y-2">
                    {result.actionPlan?.slice(2, 4).map((action, index) => (
                      <div key={index} className="w-full bg-white p-3 rounded-lg">
                        <span className="text-gray-700">{action}</span>
                      </div>
                    )) || (
                      <>
                        <div className="w-full bg-white p-3 rounded-lg">
                          <span className="text-gray-700">定期进行心理咨询，学习焦虑管理技巧</span>
                        </div>
                        <div className="w-full bg-white p-3 rounded-lg">
                          <span className="text-gray-700">培养健康的生活习惯，包括规律运动和健康饮食</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* 底部导出与操作区 */}
          <div className="bg-white rounded-xl p-4 shadow-sm mt-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                className="p-3 bg-gray-100 hover:bg-gray-200 hover:text-white transition-colors rounded-lg flex flex-col items-center"
                onClick={exportAsImage}
                disabled={exporting}
              >
                <div className="text-2xl mb-2">🖼️</div>
                <span className="text-sm font-medium">导出图片</span>
              </button>
              <button
                className="p-3 bg-gray-100 hover:bg-gray-200 hover:text-white transition-colors rounded-lg flex flex-col items-center"
                onClick={exportAsPDF}
                disabled={exporting}
              >
                <div className="text-2xl mb-2">📄</div>
                <span className="text-sm font-medium">导出PDF</span>
              </button>
              <button
                className="p-3 bg-[#F3E5F5] hover:bg-[#E1BEE7] hover:text-white transition-colors rounded-lg flex flex-col items-center"
                onClick={handleRetakeTest}
              >
                <div className="text-2xl mb-2">🔄</div>
                <span className="text-sm font-medium">重新测试</span>
              </button>
              <button
                className="p-3 bg-gray-100 hover:bg-gray-200 hover:text-white transition-colors rounded-lg flex flex-col items-center"
                onClick={handleBackToSelect}
              >
                <div className="text-2xl mb-2">🔍</div>
                <span className="text-sm font-medium">选择其他测试</span>
              </button>
            </div>
          </div>

          {/* 情感化结尾 */}
          <div className="text-center mt-6 mb-8">
            <p className="text-gray-600">💖 面对焦虑并不可怕，寻求帮助是勇敢的表现</p>
          </div>

          {/* 数据隐私提示 */}
          <div className="text-center text-xs text-gray-400 mb-4">
            🔒 你的测试数据仅用于本次分析，已加密存储
          </div>
        </div>
      );
    }

    // 自尊水平评估测试结果渲染
    if (activeTest === 'self_esteem') {
      return (
        <div className="space-y-8">
          {/* 头部 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <button
                className="text-gray-600 hover:bg-[#F8C8DC] hover:text-white px-3 py-1 rounded-full transition-all mr-4"
                onClick={handleBackToSelect}
              >
                ← 返回选择
              </button>
              <div>
                <h1 className="text-xl font-bold text-[#F8C8DC] flex items-center">
                  👑 自尊水平评估分析报告
                </h1>
                <p className="text-gray-400 text-sm">专业自尊水平评估分析</p>
              </div>
            </div>
          </div>

          {/* 情感化引导 */}
          <div className="text-center mb-6">
            <p className="text-gray-600">✨ 你的自尊水平评估报告已生成，让我们一起提升自我价值感</p>
          </div>

          {/* 自尊水平概览 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl p-5 shadow-md hover:-translate-y-2 transition-all ${result.totalScore >= 80 ? 'bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300' : result.totalScore >= 60 ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300' : result.totalScore >= 40 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-300' : 'bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300'}`}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">自尊水平评估</h2>
                <p className="text-gray-700">{result.description || '基于专业量表的自尊水平评估'}</p>
              </div>
              <div className="text-right mt-4 md:mt-0">
                <div className="text-3xl font-bold">
                  {result.totalScore}/100
                </div>
                <div className="text-sm font-semibold">
                  自尊水平得分
                </div>
              </div>
            </div>
            <div className={`text-lg font-semibold mt-2 ${result.totalScore >= 80 ? 'text-green-800' : result.totalScore >= 60 ? 'text-blue-800' : result.totalScore >= 40 ? 'text-yellow-800' : 'text-red-800'}`}>
              {result.totalScore >= 80 ? '自尊水平：高' : result.totalScore >= 60 ? '自尊水平：中高' : result.totalScore >= 40 ? '自尊水平：中等' : '自尊水平：低'}
            </div>
          </motion.div>

          {/* AI深度分析区 */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">自尊水平深度分析</h3>
            
            {/* 子卡片1：核心特征 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#E3F2FD] rounded-xl p-4 shadow-sm"
            >
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <span className="text-2xl mr-2">📋</span>
                核心特征
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                {result.mentalState?.coreFeatures?.map((feature, index) => (
                  <li key={index}>{feature}</li>
                )) || (
                  <>
                    <li>自我价值感评估</li>
                    <li>自信程度</li>
                    <li>自我接纳程度</li>
                    <li>应对挫折的能力</li>
                    <li>人际关系中的自我定位</li>
                  </>
                )}
              </ul>
            </motion.div>

            {/* 子卡片2：风险评估 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#FFF3E0] rounded-xl p-4 shadow-sm"
            >
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <span className="text-2xl mr-2">⚠️</span>
                风险评估
              </h4>
              <p className="text-gray-700 mb-4">
                {result.mentalState?.underlyingCause || '基于专业量表的自尊水平评估，建议根据评估结果采取相应的提升措施。'}
              </p>
              <div className="flex space-x-3">
                <button
                  className="bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center"
                  onClick={() => window.location.href = '/resources'}
                >
                  🧑‍⚕️ 预约专业咨询
                </button>
                <button
                  className="bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center"
                  onClick={() => window.location.href = '/mindfulness'}
                >
                  🧘 正念练习
                </button>
              </div>
            </motion.div>

            {/* 子卡片3：提升建议 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#FFF9C4] rounded-xl p-4 shadow-sm"
            >
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <span className="text-2xl mr-2">💡</span>
                提升建议
              </h4>
              <div className="space-y-3">
                {result.suggestions?.map((suggestion, index) => (
                  <div key={index} className="flex items-start">
                    <span className="text-blue-500 font-bold mr-2">🔹</span>
                    <span className="text-gray-700">{suggestion}</span>
                  </div>
                )) || (
                  <>
                    <div className="flex items-start">
                      <span className="text-blue-500 font-bold mr-2">🔹</span>
                      <span className="text-gray-700">培养自我肯定的习惯，每天记录3件自己做得好的事情</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-blue-500 font-bold mr-2">🔹</span>
                      <span className="text-gray-700">设定可实现的目标，通过完成小目标来建立自信</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-blue-500 font-bold mr-2">🔹</span>
                      <span className="text-gray-700">学习自我接纳，接受自己的优点和不足</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-blue-500 font-bold mr-2">🔹</span>
                      <span className="text-gray-700">建立健康的人际关系，与支持你的人保持联系</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-blue-500 font-bold mr-2">🔹</span>
                      <span className="text-gray-700">学习应对挫折的技巧，将失败视为学习机会</span>
                    </div>
                  </>
                )}
              </div>
            </motion.div>

            {/* 子卡片4：成长计划 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-[#E8F5E8] rounded-xl p-4 shadow-sm"
            >
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <span className="text-2xl mr-2">📅</span>
                成长计划
              </h4>
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium mb-3">🔹 短期提升（1-2周）：</h5>
                  <div className="space-y-2">
                    {result.actionPlan?.slice(0, 2).map((action, index) => (
                      <div key={index} className="w-full bg-white p-3 rounded-lg">
                        <span className="text-gray-700">{action}</span>
                      </div>
                    )) || (
                      <>
                        <div className="w-full bg-white p-3 rounded-lg">
                          <span className="text-gray-700">每天记录3件自己做得好的事情，培养自我肯定的习惯</span>
                        </div>
                        <div className="w-full bg-white p-3 rounded-lg">
                          <span className="text-gray-700">设定并完成3个小目标，建立成就感</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <h5 className="font-medium mb-3">🔹 长期成长（1-3个月）：</h5>
                  <div className="space-y-2">
                    {result.actionPlan?.slice(2, 4).map((action, index) => (
                      <div key={index} className="w-full bg-white p-3 rounded-lg">
                        <span className="text-gray-700">{action}</span>
                      </div>
                    )) || (
                      <>
                        <div className="w-full bg-white p-3 rounded-lg">
                          <span className="text-gray-700">学习并实践自我接纳技巧，接受自己的优点和不足</span>
                        </div>
                        <div className="w-full bg-white p-3 rounded-lg">
                          <span className="text-gray-700">建立健康的社交网络，与支持你的人保持联系</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* 底部导出与操作区 */}
          <div className="bg-white rounded-xl p-4 shadow-sm mt-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                className="p-3 bg-gray-100 hover:bg-gray-200 hover:text-white transition-colors rounded-lg flex flex-col items-center"
                onClick={exportAsImage}
                disabled={exporting}
              >
                <div className="text-2xl mb-2">🖼️</div>
                <span className="text-sm font-medium">导出图片</span>
              </button>
              <button
                className="p-3 bg-gray-100 hover:bg-gray-200 hover:text-white transition-colors rounded-lg flex flex-col items-center"
                onClick={exportAsPDF}
                disabled={exporting}
              >
                <div className="text-2xl mb-2">📄</div>
                <span className="text-sm font-medium">导出PDF</span>
              </button>
              <button
                className="p-3 bg-[#F3E5F5] hover:bg-[#E1BEE7] hover:text-white transition-colors rounded-lg flex flex-col items-center"
                onClick={handleRetakeTest}
              >
                <div className="text-2xl mb-2">🔄</div>
                <span className="text-sm font-medium">重新测试</span>
              </button>
              <button
                className="p-3 bg-gray-100 hover:bg-gray-200 hover:text-white transition-colors rounded-lg flex flex-col items-center"
                onClick={handleBackToSelect}
              >
                <div className="text-2xl mb-2">🔍</div>
                <span className="text-sm font-medium">选择其他测试</span>
              </button>
            </div>
          </div>

          {/* 情感化结尾 */}
          <div className="text-center mt-6 mb-8">
            <p className="text-gray-600">💖 提升自尊是一个过程，每一步都值得肯定</p>
          </div>

          {/* 数据隐私提示 */}
          <div className="text-center text-xs text-gray-400 mb-4">
            🔒 你的测试数据仅用于本次分析，已加密存储
          </div>
        </div>
      );
    }

    // 其他测试类型的情绪测试报告渲染
    // 根据AI返回的分数和风险等级获取情绪状态
    const getEmotionStatus = (score, riskLevel) => {
      if (score >= 80 || riskLevel === 'low') {
        return { emoji: '😊', status: '情绪状态：积极稳定 · 心态良好', color: 'text-green-800' };
      } else if (score >= 40 || riskLevel === 'medium') {
        return { emoji: '😐', status: '情绪状态：轻度波动 · 需关注调整', color: 'text-yellow-800' };
      } else {
        return { emoji: '😔', status: '情绪状态：轻度低落 · 压力待缓解', color: 'text-red-800' };
      }
    };

    const emotionStatus = getEmotionStatus(result.totalScore, result.level || result.riskLevel);

    return (
      <div className="space-y-8">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              className="text-gray-600 hover:bg-[#F8C8DC] hover:text-white px-3 py-1 rounded-full transition-all mr-4"
              onClick={handleBackToSelect}
            >
              ← 返回选择
            </button>
            <div>
              <h1 className="text-xl font-bold text-[#F8C8DC] flex items-center">
                📊 情绪测试分析报告
              </h1>
              <p className="text-gray-400 text-sm">AI智能分析报告</p>
            </div>
          </div>
        </div>

        {/* 情感化引导 */}
        <div className="text-center mb-6">
          <p className="text-gray-600">✨ 你的情绪体检报告已生成，让我们一起调整状态吧</p>
        </div>

        {/* 风险预警 - 高风险时放在最上面 */}
        {(result.level === 'high' || (activeTest === 'depression' && result.totalScore >= 15) || (activeTest === 'anxiety' && result.totalScore >= 15)) && (
          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl p-5">
            <div className="flex items-center mb-4">
              <div className="text-3xl mr-3">🚨</div>
              <div>
                <h4 className="text-xl font-bold">紧急心理健康支持</h4>
                <p className="text-red-100">检测到高风险信号，请立即寻求帮助</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="bg-white/20 p-3 rounded-lg">
                <div className="font-bold mb-1">📞 24小时心理援助热线</div>
                <div className="text-2xl font-mono">4001619995</div>
              </div>
              <button
                className="w-full bg-white text-red-600 py-2 rounded-lg font-bold hover:bg-red-50 transition-colors"
                onClick={() => window.location.href = '/resources'}
              >
                立即预约专业心理咨询
              </button>
            </div>
          </div>
        )}

        {/* 报告概览 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl p-5 shadow-md hover:-translate-y-2 transition-all ${
            result.level === 'high' 
              ? 'bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300'
              : result.level === 'medium'
                ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-300'
                : 'bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300'
          }`}
        >
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-2">{emotionStatus.emoji}</span>
            <span className={`font-medium ${emotionStatus.color}`}>{emotionStatus.status}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div className={`text-3xl font-bold mb-2 md:mb-0 ${result.level === 'high' ? 'text-red-800' : result.level === 'medium' ? 'text-yellow-800' : 'text-green-800'}`}>
              {result.totalScore}/100
              <span className={`text-sm ml-2 ${result.level === 'high' ? 'text-red-600' : result.level === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>🌿 {result.riskAssessment || (result.level === 'high' ? '高风险' : result.level === 'medium' ? '中等风险' : '低风险')}</span>
            </div>
            <div className="text-sm text-gray-400">基于AI分析的情绪健康评估</div>
          </div>

          {/* 进度条 */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>当前状态：{result.totalScore}分</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${result.totalScore}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className={`h-4 rounded-full ${result.level === 'high' ? 'bg-gradient-to-r from-red-400 to-red-600' : result.level === 'medium' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 'bg-gradient-to-r from-green-400 to-green-600'}`}
              ></motion.div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>0-40（预警区）</span>
              <span>40-70（稳定区）</span>
              <span>70-100（积极区）</span>
            </div>
          </div>
        </motion.div>

        {/* AI深度分析区 */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold mb-4">AI深度分析</h3>
          
          {/* 子卡片1：核心心理状态解读 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#E3F2FD] rounded-xl p-4 shadow-sm"
          >
            <h4 className="text-lg font-semibold mb-3 flex items-center">
              <span className="text-2xl mr-2">🧠</span>
              你的情绪现状拆解
            </h4>
            <div className="space-y-3">
              <div>
                <h5 className="font-medium mb-2">✅ 核心特征：</h5>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  {result.mentalState?.coreFeatures?.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  )) || (
                    <>
                      <li>快乐感受偶发，对生活满意度偏低</li>
                      <li>注意力难集中、睡眠质量差，人际压力明显</li>
                      <li>对未来悲观，存在焦虑、抑郁情绪倾向</li>
                    </>
                  )}
                </ul>
              </div>
              <div className="mt-4">
                <h5 className="font-medium mb-2">💡 底层原因：</h5>
                <p className="text-gray-700">
                  {result.mentalState?.underlyingCause || "当前处于\"情绪能量不足\"状态，需优先恢复基础心理资源"}
                </p>
              </div>
            </div>
          </motion.div>

          {/* 子卡片2：个性化调整指南 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#FFF9C4] rounded-xl p-4 shadow-sm"
          >
            <h4 className="text-lg font-semibold mb-3 flex items-center">
              <span className="text-2xl mr-2">💡</span>
              专属情绪养护建议
            </h4>
            <div className="space-y-3">
              {result.suggestions?.length > 0 ? result.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start">
                  <span className="text-blue-500 font-bold mr-2">🔹</span>
                  <span className="text-gray-700">{suggestion}</span>
                </div>
              )) : (
                <>
                  <div className="flex items-start">
                    <span className="text-blue-500 font-bold mr-2">🔹</span>
                    <span className="text-gray-700">情绪激活：每天记录1件"微小快乐"，培养积极心态</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-500 font-bold mr-2">🔹</span>
                    <span className="text-gray-700">注意力训练：每天15分钟深呼吸/冥想，提升专注力</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-500 font-bold mr-2">🔹</span>
                    <span className="text-gray-700">睡眠优化：睡前1小时远离电子设备，营造黑暗安静环境</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-500 font-bold mr-2">🔹</span>
                    <span className="text-gray-700">人际修复：从"分享一件小事"开始，主动重建社交连接</span>
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* 子卡片3：风险预警与支持 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#FFF3E0] rounded-xl p-4 shadow-sm"
          >
            <h4 className="text-lg font-semibold mb-3 flex items-center">
              <span className="text-2xl mr-2">⚠️</span>
              风险等级：{result.riskAssessment || (result.level === 'high' ? '高风险' : result.level === 'medium' ? '中等风险' : '低风险')}
            </h4>
            <p className="text-gray-700 mb-4">
              {result.mentalState?.riskDescription || '情绪状态需要持续关注，通过积极行动可以有效改善身心健康，建议按照行动计划逐步调整。'}
            </p>
            <div className="flex space-x-3">
              <button
                className="bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center"
                onClick={() => window.location.href = '/resources'}
              >
                🧑‍⚕️ 一键预约咨询师
              </button>
              <button
                className="bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center"
                onClick={() => window.location.href = '/mindfulness'}
              >
                🧘 进入正念庭院
              </button>
            </div>
          </motion.div>
        </div>

        {/* 7天情绪急救行动手册 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#F3E5F5] rounded-xl p-4 shadow-sm"
        >
          <h4 className="text-lg font-semibold mb-4 flex items-center">
            <span className="text-2xl mr-2">📅</span>
            7天情绪急救行动手册
          </h4>
          <div className="space-y-4">
            <div>
              <h5 className="font-medium mb-3">🔹 Day1-3 紧急调整：</h5>
              <div className="space-y-2">
                {result.actionPlan?.slice(0, 2).map((action, index) => (
                  <div key={index} className="w-full bg-white p-3 rounded-lg">
                    <span className="text-gray-700">{action}</span>
                  </div>
                )) || (
                  <>
                    <div className="w-full bg-white p-3 rounded-lg">
                      <span className="text-gray-700">每天记录1件微小快乐</span>
                    </div>
                    <div className="w-full bg-white p-3 rounded-lg">
                      <span className="text-gray-700">每天15分钟深呼吸冥想</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div>
              <h5 className="font-medium mb-3">🔹 Day4-7 长期养护：</h5>
              <div className="space-y-2">
                {result.actionPlan?.slice(2, 4).map((action, index) => (
                  <div key={index} className="w-full bg-white p-3 rounded-lg">
                    <span className="text-gray-700">{action}</span>
                  </div>
                )) || (
                  <>
                    <div className="w-full bg-white p-3 rounded-lg">
                      <span className="text-gray-700">改善生活满意度的小目标</span>
                    </div>
                    <div className="w-full bg-white p-3 rounded-lg">
                      <span className="text-gray-700">周末和朋友小聚</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <p className="text-gray-600 text-sm mt-3">💡 完成全部行动后，可重新测试查看情绪变化</p>
          </div>
        </motion.div>

        {/* 底部导出与操作区 */}
        <div className="bg-white rounded-xl p-4 shadow-sm mt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              className="p-3 bg-gray-100 hover:bg-gray-200 hover:text-white transition-colors rounded-lg flex flex-col items-center"
              onClick={exportAsImage}
              disabled={exporting}
            >
              <div className="text-2xl mb-2">🖼️</div>
              <span className="text-sm font-medium">导出图片</span>
            </button>
            <button
              className="p-3 bg-gray-100 hover:bg-gray-200 hover:text-white transition-colors rounded-lg flex flex-col items-center"
              onClick={exportAsPDF}
              disabled={exporting}
            >
              <div className="text-2xl mb-2">📄</div>
              <span className="text-sm font-medium">导出PDF</span>
            </button>
            <button
              className="p-3 bg-[#F3E5F5] hover:bg-[#E1BEE7] hover:text-white transition-colors rounded-lg flex flex-col items-center"
              onClick={handleRetakeTest}
            >
              <div className="text-2xl mb-2">🔄</div>
              <span className="text-sm font-medium">重新测试</span>
            </button>
            <button
              className="p-3 bg-gray-100 hover:bg-gray-200 hover:text-white transition-colors rounded-lg flex flex-col items-center"
              onClick={handleBackToSelect}
            >
              <div className="text-2xl mb-2">🔍</div>
              <span className="text-sm font-medium">选择其他测试</span>
            </button>
          </div>
        </div>

        {/* 情感化结尾 */}
        <div className="text-center mt-6 mb-8">
          <p className="text-gray-600">💖 每一步小行动，都在靠近更好的自己</p>
        </div>

        {/* 数据隐私提示 */}
        <div className="text-center text-xs text-gray-400 mb-4">
          🔒 你的测试数据仅用于本次分析，已加密存储
        </div>
      </div>
    );
  };

  // 渲染测试记录详情页面
  const renderRecordDetail = () => {
    if (!selectedRecord) return null;

    return (
      <div className="space-y-8">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              className="text-gray-600 hover:text-morandi-purple mr-4"
              onClick={handleBackFromRecord}
            >
              ← 返回选择
            </button>
            <div>
              <h1 className="text-2xl font-bold text-morandi-purple">
                测试记录详情
              </h1>
              <p className="text-gray-600">完整测试信息与分析结果</p>
            </div>
          </div>
        </div>

        {/* 记录概览 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl p-5 ${(selectedRecord.level === 'high' || selectedRecord.totalScore < 40) ? 'bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300' : (selectedRecord.level === 'medium' || (selectedRecord.totalScore >= 40 && selectedRecord.totalScore < 70)) ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-300' : 'bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300'}`}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h2 className={`text-2xl font-bold ${(selectedRecord.level === 'high' || selectedRecord.totalScore < 40) ? 'text-red-800' : (selectedRecord.level === 'medium' || (selectedRecord.totalScore >= 40 && selectedRecord.totalScore < 70)) ? 'text-yellow-800' : 'text-green-800'}`}>
                {selectedRecord.testName}
              </h2>
              <p className="text-gray-600">开始测试: {selectedRecord.testStartTime ? new Date(selectedRecord.testStartTime).toLocaleString() : new Date(selectedRecord.createdAt).toLocaleString()}</p>
              <p className="text-gray-600">提交测试: {selectedRecord.testEndTime ? new Date(selectedRecord.testEndTime).toLocaleString() : new Date(selectedRecord.createdAt).toLocaleString()}</p>
              <p className="text-gray-600">测试用时: {selectedRecord.testDuration ? `${Math.round(selectedRecord.testDuration / 1000 / 60)}分${Math.round((selectedRecord.testDuration / 1000) % 60)}秒` : '未知'}</p>
            </div>
            <div className="text-right mt-4 md:mt-0">
              <div className={`text-4xl font-bold ${(selectedRecord.level === 'high' || selectedRecord.totalScore < 40) ? 'text-red-600' : (selectedRecord.level === 'medium' || (selectedRecord.totalScore >= 40 && selectedRecord.totalScore < 70)) ? 'text-yellow-600' : 'text-green-600'}`}>
                {selectedRecord.totalScore}/100
              </div>
              <div className={`text-sm font-semibold ${(selectedRecord.level === 'high' || selectedRecord.totalScore < 40) ? 'text-red-600' : (selectedRecord.level === 'medium' || (selectedRecord.totalScore >= 40 && selectedRecord.totalScore < 70)) ? 'text-yellow-600' : 'text-green-600'}`}>
                {(selectedRecord.level === 'high' || selectedRecord.totalScore < 40) ? '⚠️ 高风险' : (selectedRecord.level === 'medium' || (selectedRecord.totalScore >= 40 && selectedRecord.totalScore < 70)) ? '⚠️ 中等风险' : '✅ 低风险'}
              </div>
            </div>
          </div>
        </motion.div>

        {/* 问题与答案 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-sm">
          <h3 className="text-xl font-semibold mb-4">问卷题目与答案</h3>
          <div className="space-y-6">
            {selectedRecord.answers && Object.entries(selectedRecord.answers).map(([questionId, answer], index) => {
              // 更可靠地查找问题
              const question = selectedRecord.questions?.find(q => q.id === questionId) || 
                             selectedRecord.questions?.find(q => q.id === parseInt(questionId)) || 
                             { text: `问题 ${index + 1}`, options: [] };
              
              let selectedOption;
              if (question.options && Array.isArray(answer)) {
                // 处理多选题
                selectedOption = answer.map(idx => {
                  const opt = question.options[idx];
                  return opt !== undefined ? opt : idx;
                }).join('; ');
              } else if (question.options && answer !== undefined) {
                // 处理单选题
                const opt = question.options[answer];
                selectedOption = opt !== undefined ? opt : answer;
              } else {
                selectedOption = answer !== undefined ? answer : '未回答';
              }
              
              return (
                <div key={questionId} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="font-medium mb-2">{index + 1}. {question.text}</div>
                  <div className="bg-morandi-purple/10 p-3 rounded-lg">
                    <span className="text-morandi-purple font-medium">答案: </span>
                    {selectedOption}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI分析结果 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-sm">
          <h3 className="text-xl font-semibold mb-4">AI分析结果</h3>
          <div className="space-y-6">
            {/* 分析描述 */}
            <div className="bg-gray-50 p-4 rounded-lg text-gray-700">
              {selectedRecord.analysis?.description || selectedRecord.description || 'AI分析结果未找到'}
            </div>
            
            {/* 核心特征 */}
            {selectedRecord.analysis?.mentalState?.coreFeatures && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">核心特征</h4>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  {selectedRecord.analysis.mentalState.coreFeatures.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* 底层原因 */}
            {selectedRecord.analysis?.mentalState?.underlyingCause && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">底层原因</h4>
                <p className="text-gray-700">{selectedRecord.analysis.mentalState.underlyingCause}</p>
              </div>
            )}
            
            {/* 养护建议 */}
            {selectedRecord.analysis?.suggestions && selectedRecord.analysis.suggestions.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">养护建议</h4>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  {selectedRecord.analysis.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* 风险等级 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">风险等级</h4>
              <div className={`text-lg font-semibold ${(selectedRecord.level === 'high' || selectedRecord.totalScore < 40) ? 'text-red-600' : (selectedRecord.level === 'medium' || (selectedRecord.totalScore >= 40 && selectedRecord.totalScore < 70)) ? 'text-yellow-600' : 'text-green-600'}`}>
                {(selectedRecord.level === 'high' || selectedRecord.totalScore < 40) ? '⚠️ 高风险' : (selectedRecord.level === 'medium' || (selectedRecord.totalScore >= 40 && selectedRecord.totalScore < 70)) ? '⚠️ 中等风险' : '✅ 低风险'}
              </div>
              <p className="text-gray-600 mt-2">{selectedRecord.analysis?.mentalState?.riskDescription || '情绪状态需要持续关注，通过积极行动可以有效改善身心健康。'}</p>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex space-x-4">
          <button
            className="flex-1 bg-morandi-purple text-white py-3 rounded-lg font-semibold hover:bg-morandi-purple/90 transition-colors"
            onClick={handleBackFromRecord}
          >
            返回记录列表
          </button>
        </div>
      </div>
    );
  };

  // 主渲染
  return (
    <div className="page-transition fade-in">
      <div className="town-card mb-8">
        {currentStep === 'select' && renderTestSelect()}
        {currentStep === 'answering' && renderAnswering()}
        {currentStep === 'result' && renderResult()}
        {currentStep === 'record' && renderRecordDetail()}
      </div>
    </div>
  );
};

export default Clinic;