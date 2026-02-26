import React from 'react';
import './AIAnalysisCard.css';

const AIAnalysisCard = ({ analysis, isLoading = false, onClose }) => {
  if (isLoading) {
    return (
      <div className="ai-analysis-card loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <div className="spinner-text">🧠 AI正在深度分析你的情感...</div>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  // 风险等级配置
  const riskConfig = {
    high: {
      label: '高风险',
      color: '#ff6b6b',
      icon: '⚠️',
      bgColor: 'rgba(255, 107, 107, 0.1)'
    },
    medium: {
      label: '中风险',
      color: '#ffa94d',
      icon: '📊',
      bgColor: 'rgba(255, 169, 77, 0.1)'
    },
    low: {
      label: '低风险',
      color: '#ffd43b',
      icon: '📈',
      bgColor: 'rgba(255, 212, 59, 0.1)'
    },
    none: {
      label: '安全',
      color: '#51cf66',
      icon: '✅',
      bgColor: 'rgba(81, 207, 102, 0.1)'
    }
  };

  // 情感配置
  const sentimentConfig = {
    '高兴': { icon: '😊', color: '#ffd700', emoji: '🌈' },
    '悲伤': { icon: '😢', color: '#4dabf7', emoji: '💧' },
    '焦虑': { icon: '😰', color: '#ff922b', emoji: '⚡' },
    '愤怒': { icon: '😠', color: '#ff6b6b', emoji: '🔥' },
    '平静': { icon: '😌', color: '#51cf66', emoji: '🍃' },
    '恐惧': { icon: '😨', color: '#9775fa', emoji: '🌫️' },
    '厌恶': { icon: '🤢', color: '#20c997', emoji: '💔' },
    '惊讶': { icon: '😲', color: '#f783ac', emoji: '✨' },
    '中性': { icon: '😐', color: '#868e96', emoji: '⚪' }
  };

  const riskInfo = riskConfig[analysis.riskLevel] || riskConfig.none;
  const sentimentInfo = sentimentConfig[analysis.sentiment] || sentimentConfig.中性;

  // 计算情感得分（基于正负向概率）
  const emotionalScore = Math.round(analysis.positiveProb * 100 - analysis.negativeProb * 100);
  
  return (
    <div className="ai-analysis-card active">
      {onClose && (
        <button className="close-btn" onClick={onClose}>×</button>
      )}
      
      <div className="card-header">
        <div className="header-left">
          <div className="ai-icon">🧠</div>
          <div>
            <h3>
              <span className="ai-text">AI</span>
              <span className="analysis-text">情感分析报告</span>
            </h3>
            <p className="subtitle">基于深度分析</p>
          </div>
        </div>
        <div 
          className="risk-tag"
          style={{ 
            backgroundColor: riskInfo.bgColor,
            color: riskInfo.color,
            borderColor: riskInfo.color
          }}
        >
          {riskInfo.icon} {riskInfo.label}
        </div>
      </div>

      <div className="card-content">
        {/* 情感核心指标 */}
        <div className="sentiment-core">
          <div className="sentiment-display">
            <div 
              className="sentiment-emoji"
              style={{ backgroundColor: sentimentInfo.color + '20' }}
            >
              <span className="emoji-large">{sentimentInfo.icon}</span>
            </div>
            <div className="sentiment-info">
              <h4>{sentimentInfo.emoji} {analysis.sentiment}</h4>
              <p className="sentiment-desc">
                {analysis.sentiment === '高兴' && '你的情绪积极向上，继续保持！'}
                {analysis.sentiment === '悲伤' && '检测到低落情绪，需要关爱支持'}
                {analysis.sentiment === '焦虑' && '感到压力和不安，建议放松调节'}
                {analysis.sentiment === '愤怒' && '情绪较为激动，需要适当宣泄'}
                {analysis.sentiment === '平静' && '情绪稳定，状态良好'}
                {analysis.sentiment === '恐惧' && '感受到恐惧情绪，需要安全感'}
                {analysis.sentiment === '中性' && '情绪状态平稳'}
              </p>
            </div>
          </div>
        </div>

        {/* 情感能量条 */}
        <div className="emotion-energy">
          <div className="energy-bar">
            <div 
              className="energy-fill positive"
              style={{ width: `${analysis.positiveProb * 100}%` }}
            >
              <span>正向 {Math.round(analysis.positiveProb * 100)}%</span>
            </div>
            <div 
              className="energy-fill negative"
              style={{ width: `${analysis.negativeProb * 100}%` }}
            >
              <span>负向 {Math.round(analysis.negativeProb * 100)}%</span>
            </div>
          </div>
          <div className="energy-labels">
            <span>😔 负向情绪</span>
            <span>😊 正向情绪</span>
          </div>
        </div>

        {/* 情感得分 */}
        <div className="emotion-score">
          <div className="score-circle">
            <svg className="score-ring" viewBox="0 0 36 36">
              <path
                className="ring-bg"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="ring-fill"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                strokeDasharray={`${emotionalScore + 100}, 100`}
                style={{
                  stroke: emotionalScore > 60 ? '#51cf66' :
                         emotionalScore > 20 ? '#ffd43b' :
                         emotionalScore > -20 ? '#ff922b' :
                         emotionalScore > -60 ? '#ff6b6b' : '#c92a2a'
                }}
              />
            </svg>
            <div className="score-number" style={{
              color: emotionalScore > 60 ? '#51cf66' :
                     emotionalScore > 20 ? '#ffd43b' :
                     emotionalScore > -20 ? '#ff922b' :
                     emotionalScore > -60 ? '#ff6b6b' : '#c92a2a'
            }}>{emotionalScore}</div>
          </div>
          <div className="score-info">
            <div className="score-label">情感综合得分</div>
            <div className="score-description" style={{
              color: emotionalScore > 60 ? '#51cf66' :
                     emotionalScore > 20 ? '#ffd43b' :
                     emotionalScore > -20 ? '#ff922b' :
                     emotionalScore > -60 ? '#ff6b6b' : '#c92a2a'
            }}>
              {emotionalScore > 60 && "🎉 情绪非常积极，状态良好！建议继续保持这种积极的心态，与他人分享你的快乐。"}
              {emotionalScore > 20 && emotionalScore <= 60 && "😊 情绪积极，保持良好状态！你的情绪状态不错，适合进行创造性的活动。"}
              {emotionalScore > -20 && emotionalScore <= 20 && "😐 情绪平稳，状态一般。建议适当放松，寻找一些让自己开心的事情。"}
              {emotionalScore > -60 && emotionalScore <= -20 && "😔 情绪略显低落，需要关注。建议与朋友交流，或者进行一些轻松的运动来改善心情。"}
              {emotionalScore <= -60 && "😢 情绪较为低落，建议寻求支持。请不要独自承受，及时与亲友或专业人士沟通。"}
            </div>
          </div>
        </div>

        {/* 关键词分析 */}
        {analysis.keywords && analysis.keywords.length > 0 && (
          <div className="keywords-section">
            <h4>🔍 分析关键词</h4>
            <div className="keywords-grid">
              {analysis.keywords.map((keyword, index) => (
                <div 
                  key={index}
                  className="keyword-tag"
                  style={{
                    backgroundColor: sentimentInfo.color + '20',
                    color: sentimentInfo.color
                  }}
                >
                  #{keyword}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI个性化建议 */}
        {analysis.suggestions && analysis.suggestions.length > 0 && (
          <div className="suggestions-section">
            <div className="suggestions-header">
              <h4>💡 个性化建议</h4>
              <span className="suggestions-count">
                {analysis.suggestions.length} 条建议
              </span>
            </div>
            <div className="suggestions-grid">
              {analysis.suggestions.map((suggestion, index) => (
                <div key={index} className="suggestion-card">
                  <div className="suggestion-number">{index + 1}</div>
                  <p>{suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 应急信息（高风险时显示） */}
        {analysis.riskLevel === 'high' && (
          <div className="emergency-section">
            <div className="emergency-header">
              <span className="emergency-icon">🚨</span>
              <h4>紧急援助</h4>
            </div>
            <div className="emergency-content">
              <p>检测到高风险内容，请立即寻求专业帮助：</p>
              <div className="emergency-hotlines">
                <div className="hotline">
                  <span>☎️ 希望24热线</span>
                  <strong>400-161-9995</strong>
                </div>
                <div className="hotline">
                  <span>☎️ 北京危机干预中心</span>
                  <strong>010-82951332</strong>
                </div>
                <div className="hotline">
                  <span>☎️ 全国心理援助热线</span>
                  <strong>12320-5</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 分析来源 */}
        <div className="analysis-source">
          <div className="source-info">
            <span className="source-icon">🤖</span>
            <span className="source-text">
              深度智能情感分析 • 置信度 {Math.round(analysis.confidence * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisCard;