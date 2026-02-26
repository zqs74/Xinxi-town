/**
 * 百度AI情感分析服务
 * 文档：https://ai.baidu.com/ai-doc/NLP/zk6z52hds
 */
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class BaiduAIService {
  constructor() {
    this.apiKey = process.env.BAIDU_API_KEY;
    this.secretKey = process.env.BAIDU_SECRET_KEY;
    this.accessToken = null;
    this.tokenExpiresAt = null;
    
    // 百度情感分类映射
    this.emotionMap = {
      '0': '愤怒',
      '1': '厌恶',
      '2': '恐惧',
      '3': '高兴',
      '4': '悲伤',
      '5': '惊讶',
      '6': '中性'
    };
    
    // 情感极性映射
    this.sentimentMap = {
      '0': 'negative', // 消极
      '1': 'neutral',  // 中性
      '2': 'positive'  // 积极
    };
  }

  /**
   * 获取百度API访问令牌
   */
  async getAccessToken() {
    // 如果token未过期，直接返回
    if (this.accessToken && this.tokenExpiresAt && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    try {
      const url = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${this.apiKey}&client_secret=${this.secretKey}`;
      
      const response = await axios.post(url);
      
      if (response.data.access_token) {
        this.accessToken = response.data.access_token;
        // 百度token有效期通常是30天，我们设置29天过期以确保安全
        this.tokenExpiresAt = Date.now() + (29 * 24 * 60 * 60 * 1000);
        
        console.log('✅ 百度AI Token获取成功');
        return this.accessToken;
      } else {
        throw new Error('获取access_token失败');
      }
    } catch (error) {
      console.error('❌ 获取百度AI Token失败:', error.message);
      throw error;
    }
  }

  /**
   * 百度情感分析API
   */
  async analyzeSentiment(text) {
    try {
      // 获取访问令牌
      const accessToken = await this.getAccessToken();
      
      // 准备请求数据
      const url = `https://aip.baidubce.com/rpc/2.0/nlp/v1/sentiment_classify?access_token=${accessToken}`;
      
      // 截断过长的文本（百度API限制1024字节）
      const truncatedText = this.truncateText(text, 500);
      
      const requestData = {
        text: truncatedText
      };

      const response = await axios.post(url, requestData, {
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('百度AI响应:', JSON.stringify(response.data, null, 2));

      if (response.data.items && response.data.items.length > 0) {
        const item = response.data.items[0];
        
        // 解析百度API响应
        return {
          sentiment: this.emotionMap[item.sentiment] || '中性',
          confidence: item.confidence || 0.5,
          positiveProb: item.positive_prob || 0,
          negativeProb: item.negative_prob || 0,
          riskLevel: this.determineRiskLevel(item.confidence, item.negative_prob, item.sentiment),
          // 百度API的详细信息
          baiduData: {
            sentiment: item.sentiment, // 0-6的情感分类
            confidence: item.confidence,
            positive_prob: item.positive_prob,
            negative_prob: item.negative_prob
          }
        };
      } else {
        // API返回格式异常，使用降级分析
        console.warn('百度API返回格式异常，使用降级分析');
        return this.fallbackAnalysis(text);
      }

    } catch (error) {
      console.error('❌ 百度情感分析失败:', error.message);
      
      // 降级方案：使用模拟分析
      console.log('⚠️ 切换到降级分析模式');
      return this.fallbackAnalysis(text);
    }
  }

  /**
   * 文本截断（防止超过API限制）
   */
  truncateText(text, maxLength = 500) {
    if (text.length <= maxLength) return text;
    
    // 尝试在句子边界截断
    const truncated = text.substring(0, maxLength);
    const lastPeriod = truncated.lastIndexOf('。');
    const lastComma = truncated.lastIndexOf('，');
    const lastStop = Math.max(lastPeriod, lastComma);
    
    if (lastStop > maxLength * 0.5) {
      return truncated.substring(0, lastStop + 1);
    }
    
    return truncated + '...';
  }

  /**
   * 根据分析结果确定风险等级
   */
  determineRiskLevel(confidence, negativeProb, sentiment) {
    // 高风险判断条件：
    // 1. 置信度高且负向概率高
    // 2. 情感分类为极度负面（如愤怒、恐惧、悲伤）
    
    const isHighNegative = negativeProb > 0.8 && confidence > 0.7;
    const isExtremeNegative = ['0', '2', '4'].includes(sentiment.toString()) && confidence > 0.6;
    
    if (isHighNegative || isExtremeNegative) {
      return 'high';
    } else if (negativeProb > 0.6) {
      return 'medium';
    } else if (negativeProb > 0.3) {
      return 'low';
    } else {
      return 'none';
    }
  }

  /**
   * 降级分析（当百度API不可用时使用）
   */
  fallbackAnalysis(text) {
    console.log('🔧 使用降级情感分析');
    
    // 简单关键词匹配（保持原有的模拟逻辑）
    const sentimentKeywords = {
      '高兴': ['开心', '快乐', '幸福', '高兴', '愉快', '满意', '喜欢', '爱'],
      '悲伤': ['难过', '伤心', '哭泣', '痛苦', '失落', '失望', '孤独', '寂寞'],
      '焦虑': ['焦虑', '紧张', '担心', '害怕', '恐惧', '不安', '压力', '失眠'],
      '愤怒': ['生气', '愤怒', '恼火', '烦躁', '讨厌', '恨', '可恶', '烦人'],
      '中性': ['平静', '正常', '一般', '还好', '普通', '日常', '还行']
    };
    
    const highRiskKeywords = ['自杀', '不想活了', '死了算了', '绝望', '崩溃', '想死'];
    
    const textLower = text.toLowerCase();
    let detectedSentiment = '中性';
    let riskLevel = 'none';
    
    // 检测情感
    Object.entries(sentimentKeywords).forEach(([sentiment, keywords]) => {
      if (keywords.some(keyword => textLower.includes(keyword))) {
        detectedSentiment = sentiment;
      }
    });
    
    // 检测风险
    if (highRiskKeywords.some(keyword => textLower.includes(keyword))) {
      riskLevel = 'high';
    } else if (detectedSentiment === '悲伤' || detectedSentiment === '焦虑') {
      riskLevel = 'low';
    }
    
    return {
      sentiment: detectedSentiment,
      confidence: 0.5,
      positiveProb: detectedSentiment === '高兴' ? 0.8 : 0.2,
      negativeProb: ['悲伤', '焦虑', '愤怒'].includes(detectedSentiment) ? 0.7 : 0.2,
      riskLevel,
      isFallback: true
    };
  }

  /**
   * 提取关键词（可以使用百度API或其他服务，这里先用简单的实现）
   */
  extractKeywords(text, limit = 5) {
    // 简单的关键词提取逻辑
    const stopWords = ['的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都'];
    const words = text.split(/[\s\p{P}]/u)
      .filter(word => word && word.length > 1 && !stopWords.includes(word));
    
    const frequency = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
    
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([word]) => word);
  }

  /**
   * 生成个性化建议
   */
  generateSuggestions(analysis, originalText = '') {
    const suggestions = [];
    
    if (analysis.riskLevel === 'high') {
      suggestions.push(
        '我们检测到你可能处于高风险情绪状态，请立即联系专业帮助：',
        '☎️ 24小时心理援助热线：400-161-9995（希望24热线）',
        '☎️ 北京心理危机研究与干预中心：010-82951332',
        '请不要独自承担痛苦，专业的帮助就在身边'
      );
    } else if (analysis.riskLevel === 'medium') {
      suggestions.push(
        '你的情绪需要被关注，建议：',
        '1. 预约"青鸟心理咨询驿站"的专业咨询师',
        '2. 尝试"黑熊正念练习庭院"的放松练习',
        '3. 与信任的朋友或家人聊聊你的感受'
      );
    } else if (analysis.sentiment === '悲伤') {
      suggestions.push(
        '感受到你的悲伤，建议试试：',
        '💡 在"树洞街巷"写下更多感受',
        '🧘‍♂️ 体验"黑熊正念庭院"的情绪舒缓练习',
        '📞 需要时随时可以寻求专业帮助'
      );
    } else if (analysis.sentiment === '焦虑') {
      suggestions.push(
        '焦虑是常见的情绪，试试这些方法：',
        '🌿 在"鼹鼠压力自测轻诊室"进行压力评估',
        '🧘 5分钟正念呼吸练习',
        '📝 把担忧写下来，然后逐一拆解'
      );
    } else if (analysis.sentiment === '愤怒') {
      suggestions.push(
        '愤怒需要被表达，但可以健康地表达：',
        '🏃‍♂️ 尝试运动释放情绪',
        '🎨 用绘画或写作表达感受',
        '🧘 进行"黑熊正念庭院"的情绪管理练习'
      );
    } else if (analysis.sentiment === '高兴') {
      suggestions.push(
        '很高兴感受到你的积极情绪！',
        '🌟 分享你的快乐可以传递正能量',
        '📖 在"树洞街巷"记录这份美好',
        '💝 将积极情绪转化为帮助他人的力量'
      );
    } else {
      suggestions.push(
        '感谢分享你的感受',
        '💭 随时可以回来倾诉',
        '🧘 定期进行正念练习有助于情绪平衡',
        '👥 在社区中寻找共鸣和支持'
      );
    }
    
    // 如果是降级分析，添加提示
    if (analysis.isFallback) {
      suggestions.push('（当前使用基础情感分析，完整功能恢复中）');
    }
    
    return suggestions;
  }
}

export default new BaiduAIService();