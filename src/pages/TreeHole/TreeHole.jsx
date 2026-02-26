import { useState, useEffect, useRef } from 'react';
import { treeholeAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import AIAnalysisCard from '../../components/AIAnalysisCard'; // 添加这行
import './TreeHole.css'; // 确保有CSS文件

const TreeHole = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [emotion, setEmotion] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  // 从本地存储获取AI开关状态，默认为true
  const [aiEnabled, setAiEnabled] = useState(() => {
    const saved = localStorage.getItem('treehole_ai_enabled');
    return saved ? JSON.parse(saved) : true;
  });
  // 文字过渡状态
  const [displayText, setDisplayText] = useState({
    title: aiEnabled ? 'DeepSeek-V3.2智能情感分析 · 已启用' : 'DeepSeek-V3.2智能情感分析 · 已关闭',
    desc: aiEnabled 
      ? '基于DeepSeek-V3.2技术，系统会深度分析情感并提供个性化建议'
      : '已关闭AI分析，仅保存内容，不进行情感分析'
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  // 从本地存储获取匿名状态，默认为false（不匿名）
  const [isAnonymous, setIsAnonymous] = useState(() => {
    const saved = localStorage.getItem('treehole_is_anonymous');
    return saved ? JSON.parse(saved) : false;
  });
  const [visibility, setVisibility] = useState('public');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPosts, setTotalPosts] = useState(0);
  const [todayCount, setTodayCount] = useState(0); // 今日更新数量
  // 帖子列表ref，用于后续可能的功能
  const postsRef = useRef(null);
  
  // 获取帖子列表
  const fetchPosts = async (newPage = page, newLimit = limit) => {
    setLoading(true);
    setError(null);
    try {
      const response = await treeholeAPI.getPosts({ 
        page: newPage, 
        limit: newLimit 
      });
      if (response.success) {
        setPosts(response.data);
        setTotalPosts(response.total || 0);
        setTodayCount(response.todayCount || 0); // 获取今日更新数量
        setPage(newPage);
        setLimit(newLimit);
      } else {
        setError('获取帖子失败');
      }
    } catch (err) {
      console.error('获取帖子错误:', err);
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPosts();
  }, []);

  // 保存AI开关状态到本地存储
  useEffect(() => {
    localStorage.setItem('treehole_ai_enabled', JSON.stringify(aiEnabled));
  }, [aiEnabled]);

  // 保存匿名状态到本地存储
  useEffect(() => {
    localStorage.setItem('treehole_is_anonymous', JSON.stringify(isAnonymous));
  }, [isAnonymous]);

  // 处理AI开关状态变化时的文字过渡
  useEffect(() => {
    // 触发过渡动画
    setIsTransitioning(true);
    
    // 延迟与CSS动画时长匹配，实现平滑过渡
    const timer = setTimeout(() => {
      setDisplayText({
        title: aiEnabled ? 'DeepSeek-V3.2智能情感分析 · 已启用' : 'DeepSeek-V3.2智能情感分析 · 已关闭',
        desc: aiEnabled 
          ? '基于DeepSeek-V3.2技术，系统会深度分析情感并提供个性化建议'
          : '已关闭AI分析，仅保存内容，不进行情感分析'
      });
    }, 200);
    
    // 动画结束后关闭过渡状态
    const endTimer = setTimeout(() => {
      setIsTransitioning(false);
    }, 400);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(endTimer);
    };
  }, [aiEnabled]);
  
  // 发布新帖子
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('请输入内容');
      return;
    }
    
    if (!user) {
      setError('请先登录');
      return;
    }
    
    setSubmitLoading(true);
    setIsAnalyzing(aiEnabled);
    setError(null);
    setAiResult(null);
    
    try {
      const postData = {
        content: content.trim(),
        tags: emotion ? [emotion] : [],
        isAnonymous: isAnonymous,
        visibility: visibility,
        aiEnabled: aiEnabled
      };
      
      // 显示AI分析中的状态
      if (aiEnabled) {
        setTimeout(() => {
          if (isAnalyzing) {
            console.log('AI分析中...');
          }
        }, 500);
      }
      
      const response = await treeholeAPI.createPost(postData);
      if (response.success) {
        setContent('');
        setEmotion(null);
        
        // 显示AI分析结果
        if (aiEnabled && response.aiAnalysis) {
          // 合并后端返回的完整AI分析数据
          const fullAnalysis = {
            ...response.aiAnalysis,
            keywords: response.aiAnalysis.keywords || [],
            suggestions: response.aiAnalysis.suggestions || []
          };
          
          setAiResult(fullAnalysis);
          setIsAnalyzing(false);
          
          // 自动滚动到AI分析卡片
          setTimeout(() => {
            const aiCard = document.getElementById('ai-analysis-section');
            if (aiCard) {
              aiCard.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
              });
            }
          }, 300);
        } else {
          setIsAnalyzing(false);
        }
        
        fetchPosts(); // 重新获取帖子列表
      } else {
        setError('发布失败');
        setIsAnalyzing(false);
      }
    } catch (err) {
      console.error('发布帖子错误:', err);
      setError('网络错误，请稍后重试');
      setIsAnalyzing(false);
    } finally {
      setSubmitLoading(false);
    }
  };
  
  // 点赞
  const handleLike = async (postId) => {
    if (!user) {
      setError('请先登录');
      return;
    }
    
    try {
      const result = await treeholeAPI.likePost(postId);
      if (result.success) {
        // 立即更新帖子列表，确保点赞状态实时更新
        fetchPosts();
      } else {
        console.error('点赞失败:', result.error);
        setError('点赞操作失败，请重试');
      }
    } catch (err) {
      console.error('点赞错误:', err);
      setError('网络错误，请检查后端服务是否启动');
    }
  };

  // 删除帖子
  const handleDeletePost = async (postId) => {
    if (!user) {
      setError('请先登录');
      return;
    }
    
    try {
      // 显示确认对话框
      if (window.confirm('确定要删除这个帖子吗？删除后无法恢复。')) {
        const result = await treeholeAPI.deletePost(postId);
        if (result.success) {
          // 立即更新帖子列表，移除删除的帖子
          fetchPosts();
        } else {
          console.error('删除失败:', result.error);
          setError('删除操作失败，请重试');
        }
      }
    } catch (err) {
      console.error('删除错误:', err);
      setError('网络错误，请检查后端服务是否启动');
    }
  };

  // 关闭AI分析卡片
  const closeAIAnalysis = () => {
    setAiResult(null);
  };

  // 模拟情感分析的函数（如果没有后端AI）
  const simulateEmotionAnalysis = (text) => {
    const emotions = {
      '高兴': ['开心', '快乐', '幸福', '高兴', '愉快', '满意', '喜欢', '爱'],
      '悲伤': ['难过', '伤心', '哭泣', '痛苦', '失落', '失望', '孤独', '寂寞'],
      '焦虑': ['焦虑', '紧张', '担心', '害怕', '恐惧', '不安', '压力', '失眠'],
      '愤怒': ['生气', '愤怒', '恼火', '烦躁', '讨厌', '恨', '可恶', '烦人']
    };
    
    const textLower = text.toLowerCase();
    let detectedEmotion = '平静';
    
    Object.entries(emotions).forEach(([emotion, keywords]) => {
      if (keywords.some(keyword => textLower.includes(keyword))) {
        detectedEmotion = emotion;
      }
    });
    
    return detectedEmotion;
  };

  // 处理情绪按钮点击
  const handleEmotionClick = (selectedEmotion) => {
    if (emotion === selectedEmotion) {
      setEmotion(null);
    } else {
      setEmotion(selectedEmotion);
    }
    
    // 如果用户已经有内容，模拟AI分析
    if (content.trim()) {
      const simulatedEmotion = simulateEmotionAnalysis(content);
      console.log('模拟情感分析:', simulatedEmotion);
    }
  };

  return (
    <div className="treehole-page page-transition fade-in">
      {/* 欢迎区域 */}
      <div className="welcome-section">
        <div className="town-card mb-6">
          <h1 className="text-3xl font-handwriting text-morandi-purple mb-2">
            🌳 树洞街巷 · 心灵栖息地
          </h1>
          <p className="text-gray-600 mb-4">
            匿名倾诉心事，AI智能情感分析，24小时温暖陪伴。每一句倾诉都会被温柔对待。
          </p>
          
          <div className={`ai-status-banner ${aiEnabled ? 'ai-enabled' : ''}`}>
            <div className="ai-status-bg"></div>
            <div className="ai-status-icon">🤖</div>
            <div className="ai-status-content">
              <p className={`ai-status-title ${isTransitioning ? 'text-fade' : ''}`}>
                {displayText.title}
              </p>
              <p className={`ai-status-desc ${isTransitioning ? 'text-fade' : ''}`}>
                {displayText.desc}
              </p>
            </div>
            <div className="ai-status-actions">
              <button
                className={`ai-toggle-button ${aiEnabled ? 'enabled' : 'disabled'}`}
                onClick={() => setAiEnabled(!aiEnabled)}
              >
                {aiEnabled ? '关闭AI分析' : '开启AI分析'}
              </button>
              <div className={`ai-status-indicator ${aiEnabled ? 'active' : ''}`}></div>
            </div>
          </div>
        </div>
      </div>

      {/* 发布区域 */}
      <div className="post-section">
        <div className="town-card mb-6">
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="post-form">
            <div className="form-header">
              <h3 className="form-title">写下你的心事</h3>
              <div className="character-count">
                {content.length}/1000
              </div>
            </div>
            
            <textarea 
              className="post-textarea"
              placeholder="此刻，你想倾诉什么？写下你的感受，让AI为你分析情绪并提供建议..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={1000}
              disabled={!user || loading}
            ></textarea>
            
            <div className="form-footer">
              <div className="emotion-selector">
                <div className="emotion-selector-label">快速标记情绪：</div>
                <div className="emotion-buttons">
                  {[
                    { label: '高兴', emoji: '😊' },
                    { label: '兴奋', emoji: '🎉' },
                    { label: '满足', emoji: '😌' },
                    { label: '喜悦', emoji: '😊' },
                    { label: '感激', emoji: '😊' }
                  ].map((item) => (
                    <button 
                      type="button"
                      key={item.label}
                      className={`emotion-button ${emotion === item.label ? 'active' : ''}`}
                      onClick={() => handleEmotionClick(item.label)}
                      disabled={!user || loading}
                    >
                      <span className="emotion-emoji">{item.emoji}</span>
                      <span className="emotion-label">{item.label}</span>
                    </button>
                  ))}
                </div>
                <div className="emotion-buttons">
                  {[
                    { label: '平静', emoji: '😐' },
                    { label: '思考', emoji: '🤔' },
                    { label: '悲伤', emoji: '😢' },
                    { label: '焦虑', emoji: '😰' },
                    { label: '愤怒', emoji: '😠' }
                  ].map((item) => (
                    <button 
                      type="button"
                      key={item.label}
                      className={`emotion-button ${emotion === item.label ? 'active' : ''}`}
                      onClick={() => handleEmotionClick(item.label)}
                      disabled={!user || loading}
                    >
                      <span className="emotion-emoji">{item.emoji}</span>
                      <span className="emotion-label">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="post-options">
                <div className="option-group">
                  <label className="option-label">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      disabled={!user || loading}
                    />
                    <span className="option-text">匿名发表</span>
                  </label>
                </div>
                
                <div className="option-group">
                  <label className="option-label">访问权限：</label>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                    disabled={!user || loading}
                    className="visibility-select"
                  >
                    <option value="public">所有人可见</option>
                    <option value="private">仅自己可见</option>
                  </select>
                </div>
              </div>
              
              <div className="form-footer-actions">
                <button 
                  type="submit" 
                  className={`submit-button ${submitLoading ? 'loading' : ''}`}
                  disabled={submitLoading || !user || !content.trim()}
                >
                  {submitLoading ? (
                    <>
                      <span className="button-spinner"></span>
                      发布中...
                    </>
                  ) : (
                    '发布到树洞'
                  )}
                </button>
              </div>
            </div>
            
            {/* AI分析结果区域 */}
            <div id="ai-analysis-section" className="mt-6">
              <AIAnalysisCard 
                analysis={aiResult}
                isLoading={isAnalyzing}
                onClose={closeAIAnalysis}
              />
            </div>
            
            {!user && (
              <div className="login-prompt">
                <p>请先登录以使用树洞功能</p>
                <button className="login-button">前往登录</button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* 帖子列表 */}
      <div className="posts-section">
        <div className="town-card">
          <div className="posts-header">
            <h2 className="posts-title">大家的树洞</h2>
            <div className="posts-stats">
              <span className="stat-item">📊 今日更新: {todayCount}</span>
              <button 
                onClick={fetchPosts}
                className="refresh-button"
                disabled={loading}
              >
                <span className="refresh-icon">🔄</span>
                刷新
              </button>
            </div>
          </div>
          
          {loading && posts.length === 0 ? (
            <div className="loading-posts">
              <div className="loading-spinner-large"></div>
              <p>加载树洞内容中...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="empty-posts">
              <div className="empty-icon">🌱</div>
              <h3>这里还是一片宁静的森林</h3>
              <p>成为第一个分享心事的人吧</p>
            </div>
          ) : (
            <div className="posts-grid" ref={postsRef}>
              {posts.map((post) => (
                <div key={post._id} className={`post-card ${post.emotionAnalysis?.riskLevel === 'high' ? 'risk-high' :
                  post.emotionAnalysis?.riskLevel === 'medium' ? 'risk-medium' :
                  post.emotionAnalysis?.riskLevel === 'low' ? 'risk-low' :
                  post.emotionAnalysis?.riskLevel === 'safe' ? 'risk-safe' :
                  post.emotionAnalysis?.sentiment === '高兴' ? 'sentiment-happy' :
                  post.emotionAnalysis?.sentiment === '悲伤' ? 'sentiment-sad' :
                  post.emotionAnalysis?.sentiment === '焦虑' ? 'sentiment-anxious' : 'sentiment-neutral'
                }`}>
                  {/* 帖子内容 */}
                  <div className="post-content">
                    <p className="post-text">{post.content}</p>
                    
                    {/* AI分析标签 */}
                    {post.emotionAnalysis && (
                      <div className="post-analysis">
                        <div className="analysis-badges">
                          <div className="sentiment-badge">
                            <span className="badge-emoji">
                              {post.emotionAnalysis.sentiment === '高兴' ? '😊' :
                               post.emotionAnalysis.sentiment === '悲伤' ? '😢' :
                               post.emotionAnalysis.sentiment === '焦虑' ? '😰' :
                               post.emotionAnalysis.sentiment === '愤怒' ? '😠' : '😌'}
                            </span>
                            <span className="badge-text">{post.emotionAnalysis.sentiment}</span>
                          </div>
                          
                          <div className={`risk-badge risk-${post.emotionAnalysis.riskLevel}`}>
                            {post.emotionAnalysis.riskLevel === 'high' ? '⚠️ 高风险' : 
                             post.emotionAnalysis.riskLevel === 'medium' ? '⚠️ 中等风险' :
                             post.emotionAnalysis.riskLevel === 'low' ? '📊 低风险' : '✅ 安全'}
                          </div>
                        </div>
                        
                        {/* AI关键词 */}
                        {post.emotionAnalysis.keywords && post.emotionAnalysis.keywords.length > 0 && (
                          <div className="keywords-section">
                            <div className="keywords-label">AI分析关键词</div>
                            <div className="keywords-list">
                              {post.emotionAnalysis.keywords.map((keyword, idx) => (
                                <span key={idx} className="keyword-tag-small">
                                  #{keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* 帖子和用户信息 */}
                  <div className="post-footer">
                    <div className="post-meta">
                      <div className="post-meta-top">
                        <span className="user-info">
                          {post.isAnonymous ? (
                            <>
                              <span className="anonymous-icon">🌫️</span>
                              <span>匿名用户</span>
                            </>
                          ) : (
                            <>
                              <span className="user-icon">👤</span>
                              <span>{post.userId?.username || '用户'}</span>
                            </>
                          )}
                        </span>
                        <span className={`visibility-badge ${post.visibility || 'public'}`}>
                          {post.visibility === 'private' ? '🔒 仅自己可见' : '🌍 所有人可见'}
                        </span>
                      </div>
                      <span className="post-time">
                        {new Date(post.createdAt).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="post-actions">
                      <button 
                        className={`like-button ${post.likes?.some(l => l.userId === user?._id) ? 'liked' : ''}`}
                        onClick={() => handleLike(post._id)}
                        disabled={!user}
                        title={post.likes?.some(l => l.userId === user?._id) ? '取消点赞' : '点赞'}
                      >
                        <span className="like-icon">❤️</span>
                        <span className="like-count">{post.likes?.length || 0}</span>
                      </button>
                      
                      {/* 删除按钮 - 只对自己的帖子显示 */}
                      {user && post.userId && post.userId._id && post.userId._id.toString() === user._id.toString() && (
                        <button 
                          className="delete-button"
                          onClick={() => handleDeletePost(post._id)}
                          title="删除帖子"
                        >
                          <span className="delete-icon">🗑️</span>
                          <span className="delete-text">删除</span>
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* AI建议（仅在显示建议时） */}
                  {post.emotionAnalysis?.suggestions && post.emotionAnalysis.suggestions.length > 0 && (
                    <div className="post-suggestion">
                      <div className="suggestion-header">
                        <span className="suggestion-icon">💡</span>
                        <span className="suggestion-title">AI建议</span>
                      </div>
                      <p className="suggestion-text">{post.emotionAnalysis.suggestions[0]}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* 分页控制 */}
          <div className="pagination-section">
            <div className="pagination-controls">
              <div className="pagination-controls-wrapper">
                <div className="limit-selector">
                  <label>每页显示：</label>
                  <select 
                    value={limit} 
                    onChange={(e) => {
                      const newLimit = parseInt(e.target.value);
                      setLimit(newLimit);
                      fetchPosts(1, newLimit);
                    }}
                  >
                    <option value="10">10条</option>
                    <option value="20">20条</option>
                    <option value="50">50条</option>
                  </select>
                </div>
                
                <div className="page-navigation">
                  <button 
                    onClick={() => fetchPosts(page - 1, limit)} 
                    disabled={page === 1 || loading}
                    className="page-button"
                  >
                    上一页
                  </button>
                  
                  <div className="page-info">
                    <span>第</span>
                    <input
                      type="number"
                      className="page-input"
                      value={page}
                      min="1"
                      max={Math.ceil(totalPosts / limit)}
                      onChange={(e) => {
                        const newPage = parseInt(e.target.value);
                        if (newPage >= 1 && newPage <= Math.ceil(totalPosts / limit)) {
                          fetchPosts(newPage, limit);
                        }
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const newPage = parseInt(e.target.value);
                          if (newPage >= 1 && newPage <= Math.ceil(totalPosts / limit)) {
                            fetchPosts(newPage, limit);
                          }
                        }
                      }}
                    />
                    <span>页，共 {Math.ceil(totalPosts / limit)} 页</span>
                  </div>
                  
                  <button 
                    onClick={() => fetchPosts(page + 1, limit)} 
                    disabled={page >= Math.ceil(totalPosts / limit) || loading}
                    className="page-button"
                  >
                    下一页
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreeHole;