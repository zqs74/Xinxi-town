/**
 * AI服务 - 集成火山引擎ARK API进行真实的情感分析
 */
import arkAIService from './arkAIService.js';

class AIService {
  /**
   * 分析文本情感
   * @param {string} text - 要分析的文本
   * @returns {Promise<object>} 情感分析结果
   */
  async analyzeSentiment(text) {
    try {
      // 使用火山引擎ARK API进行真实的情感分析
      const analysis = await arkAIService.analyzeSentiment(text);
      
      // 生成建议
      const suggestions = analysis.suggestions || this.generateSuggestions(analysis);
      
      return {
        ...analysis,
        suggestions
      };
    } catch (error) {
      console.error('情感分析错误:', error);
      // 出错时返回默认结果
      return this.getDefaultAnalysis();
    }
  }

  /**
   * 生成建议
   */
  generateSuggestions(analysis) {
    const suggestions = [];
    
    if (analysis.riskLevel === 'high') {
      suggestions.push(
        '检测到高风险内容，建议立即联系专业心理咨询师',
        '24小时心理援助热线：400-123-4567',
        '请不要独自承担，及时寻求帮助'
      );
    } else if (analysis.riskLevel === 'medium') {
      suggestions.push(
        '你的情绪需要关注，建议尝试正念练习',
        '可以预约专业心理咨询师进行交流',
        '试着和朋友或家人聊聊你的感受'
      );
    } else if (analysis.sentiment === '悲伤') {
      suggestions.push(
        '试着和朋友或家人聊聊天',
        '推荐尝试"黑熊正念庭院"的放松练习',
        '写日记可以帮助整理情绪'
      );
    } else if (analysis.sentiment === '焦虑') {
      suggestions.push(
        '深呼吸，慢慢来，一切都会好起来的',
        '可以试试"鼹鼠轻诊室"的压力测试',
        '分解任务，一次只做一件事'
      );
    } else if (analysis.sentiment === '愤怒') {
      suggestions.push(
        '尝试深呼吸10次，冷静一下',
        '运动可以帮助释放情绪',
        '写下你的感受，然后撕掉它'
      );
    } else if (analysis.sentiment === '高兴') {
      suggestions.push(
        '继续保持积极的心态',
        '分享你的快乐给身边的人',
        '记录下这个美好时刻'
      );
    } else {
      suggestions.push(
        '感谢分享你的感受',
        '记得照顾好自己',
        '有任何需要都可以在这里倾诉'
      );
    }
    
    return suggestions;
  }

  /**
   * 获取默认分析结果
   */
  getDefaultAnalysis() {
    return {
      sentiment: '中性',
      confidence: 0.5,
      positiveProb: 0.5,
      negativeProb: 0.5,
      riskLevel: 'none',
      keywords: [],
      suggestions: [
        '感谢分享你的感受',
        '记得照顾好自己',
        '有任何需要都可以在这里倾诉'
      ]
    };
  }
}

export default new AIService();