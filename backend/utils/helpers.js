// Helper Functions 
// 模拟情感分析函数（后期可替换为真实AI）
const analyzeEmotion = (text) => {
  const positiveWords = ['开心', '快乐', '高兴', '幸福', '满意', '轻松', '加油', '希望', '成功'];
  const negativeWords = ['抑郁', '自杀', '死亡', '绝望', '痛苦', '焦虑', '压力', '崩溃', '孤独'];
  const riskWords = ['死', '自杀', '不想活了', '绝望', '崩溃'];
  
  let score = 0;
  const foundKeywords = [];
  let riskLevel = 'low';
  
  const textLower = text.toLowerCase();
  
  // 检查正面词汇
  positiveWords.forEach(word => {
    if (textLower.includes(word)) {
      score += 0.2;
      foundKeywords.push(word);
    }
  });
  
  // 检查负面词汇
  negativeWords.forEach(word => {
    if (textLower.includes(word)) {
      score -= 0.3;
      foundKeywords.push(word);
    }
  });
  
  // 检查高风险词汇
  let riskCount = 0;
  riskWords.forEach(word => {
    if (textLower.includes(word)) {
      riskCount++;
      score -= 0.5;
      foundKeywords.push(`[高危]${word}`);
    }
  });
  
  // 确定风险等级
  if (riskCount >= 2) {
    riskLevel = 'critical';
  } else if (riskCount >= 1) {
    riskLevel = 'high';
  } else if (score < -0.5) {
    riskLevel = 'medium';
  }
  
  // 确定情感类型
  let emotion = 'neutral';
  let sentiment = '平静';
  
  if (score > 0.3) {
    emotion = 'positive';
    sentiment = '高兴';
  } else if (score < -0.3) {
    emotion = 'negative';
    sentiment = score < -0.6 ? '悲伤' : '焦虑';
  }
  
  // 生成建议
  const suggestions = [];
  if (emotion === 'negative') {
    suggestions.push('可以试试正念练习缓解情绪');
    suggestions.push('在树洞里倾诉会感觉好些');
  }
  if (riskLevel === 'high' || riskLevel === 'critical') {
    suggestions.push('建议联系专业心理咨询师');
    suggestions.push('你不是一个人，我们在这里支持你');
  }
  
  return {
    emotion,
    score: Math.max(-1, Math.min(1, score)), // 限制在-1到1之间
    keywords: [...new Set(foundKeywords)], // 去重
    riskLevel,
    sentiment,
    suggestions: suggestions.length > 0 ? suggestions : ['继续保持好心情哦～']
  };
};

// 生成测试报告
const generateTestReport = (answers, testType) => {
  // 计算总分
  const totalScore = answers.reduce((sum, answer) => sum + answer.answer.value, 0);
  const maxScore = answers.length * 5; // 假设每题5分
  const normalizedScore = (totalScore / maxScore) * 100;
  
  // 按类别分组
  const categories = {};
  answers.forEach(answer => {
    const category = answer.category || 'general';
    if (!categories[category]) {
      categories[category] = {
        sum: 0,
        count: 0,
        weightedSum: 0
      };
    }
    categories[category].sum += answer.answer.value;
    categories[category].count++;
    categories[category].weightedSum += answer.answer.value * (answer.weight || 1);
  });
  
  // 计算每个类别的平均分
  const categoryScores = {};
  Object.keys(categories).forEach(category => {
    const avg = categories[category].sum / categories[category].count;
    categoryScores[category] = {
      value: (avg / 5) * 100, // 转换为百分比
      level: getLevel(avg),
      description: getDescription(category, avg)
    };
  });
  
  // 确定整体等级
  const overallLevel = getLevel(totalScore / answers.length);
  
  // 生成建议
  const recommendations = [];
  if (normalizedScore > 70) {
    recommendations.push({
      type: '正念练习',
      priority: 1,
      description: '每日5分钟正念练习，帮助保持良好状态',
      resources: ['/mindfulness/quick']
    });
  } else if (normalizedScore > 40) {
    recommendations.push({
      type: '树洞倾诉',
      priority: 1,
      description: '在树洞分享你的感受，获得同伴支持',
      resources: ['/treehole']
    });
    recommendations.push({
      type: '正念练习',
      priority: 2,
      description: '尝试深度冥想缓解压力',
      resources: ['/mindfulness/deep']
    });
  } else {
    recommendations.push({
      type: '专业咨询',
      priority: 1,
      description: '建议预约专业心理咨询师',
      resources: ['/resources']
    });
    recommendations.push({
      type: '社交活动',
      priority: 2,
      description: '参与校园活动，增加社交支持',
      resources: []
    });
  }
  
  // 检查是否需要紧急关注
  let urgent = false;
  let urgentMessage = '';
  if (answers.some(a => a.answer.value <= 1 && a.questionText.includes('自杀'))) {
    urgent = true;
    urgentMessage = '检测到高风险信号，请立即联系专业帮助';
  }
  
  return {
    total: {
      value: normalizedScore,
      min: 0,
      max: 100
    },
    stress: categoryScores.stress || { value: 0, level: '健康', description: '压力水平正常' },
    anxiety: categoryScores.anxiety || { value: 0, level: '健康', description: '焦虑水平正常' },
    depression: categoryScores.depression || { value: 0, level: '健康', description: '情绪状态良好' },
    sleep: categoryScores.sleep || { value: 0, level: '健康', description: '睡眠质量良好' },
    social: categoryScores.social || { value: 0, level: '健康', description: '社交状态良好' },
    summary: getSummary(testType, normalizedScore, overallLevel),
    level: overallLevel,
    color: getColor(normalizedScore),
    detailedAnalysis: Object.keys(categoryScores).map(cat => ({
      category: cat,
      score: categoryScores[cat].value,
      description: categoryScores[cat].description,
      suggestions: getCategorySuggestions(cat, categoryScores[cat].value)
    })),
    recommendations: recommendations.sort((a, b) => a.priority - b.priority),
    urgent,
    urgentMessage
  };
};

// 辅助函数
function getLevel(score) {
  if (score >= 4) return '重度';
  if (score >= 3) return '中度';
  if (score >= 2) return '轻微';
  return '健康';
}

function getDescription(category, score) {
  const descriptions = {
    stress: {
      健康: '压力管理良好',
      轻微: '轻度压力，注意调节',
      中度: '中度压力，建议放松',
      重度: '高压状态，需要关注'
    },
    anxiety: {
      健康: '心态平和',
      轻微: '偶尔焦虑',
      中度: '中度焦虑，建议调节',
      重度: '高度焦虑，需要关注'
    },
    depression: {
      健康: '情绪稳定',
      轻微: '情绪略有低落',
      中度: '中度情绪问题',
      重度: '重度情绪困扰'
    },
    sleep: {
      健康: '睡眠质量良好',
      轻微: '睡眠偶尔不足',
      中度: '睡眠问题明显',
      重度: '严重睡眠障碍'
    },
    social: {
      健康: '社交状态良好',
      轻微: '轻度社交困扰',
      中度: '社交存在困难',
      重度: '社交严重困扰'
    }
  };
  
  const level = getLevel(score);
  return descriptions[category]?.[level] || '状态正常';
}

function getSummary(testType, score, level) {
  if (score >= 70) {
    return `你的${testType}结果显示状态良好，继续保持！`;
  } else if (score >= 40) {
    return `你的${testType}显示${level}水平，建议适当调节。`;
  } else {
    return `你的${testType}显示${level}水平，建议寻求支持。`;
  }
}

function getColor(score) {
  if (score >= 70) return '#4CAF50'; // 绿色
  if (score >= 40) return '#FFC107'; // 黄色
  return '#F44336'; // 红色
}

function getCategorySuggestions(category, score) {
  const suggestions = {
    stress: [
      '尝试深呼吸放松',
      '定期进行体育锻炼',
      '学习时间管理技巧'
    ],
    anxiety: [
      '练习正念冥想',
      '记录焦虑日记',
      '渐进式肌肉放松'
    ],
    depression: [
      '保持规律作息',
      '增加户外活动',
      '与朋友保持联系'
    ],
    sleep: [
      '建立固定作息',
      '睡前避免使用电子设备',
      '创造舒适的睡眠环境'
    ],
    social: [
      '参加兴趣小组',
      '练习社交技巧',
      '逐步扩大社交圈'
    ]
  };
  
  return suggestions[category] || ['保持积极心态'];
}

module.exports = {
  analyzeEmotion,
  generateTestReport
};