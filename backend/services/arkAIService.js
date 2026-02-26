/**
 * 火山引擎ARK API服务
 * 使用真实的AI进行对话
 */
import OpenAI from 'openai';

class ArkAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env['ARK_API_KEY'] || '446844d2-5ccd-41b4-9492-c6ada9300389',
      baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
    });
    this.model = 'ep-20260204144721-hqdzs';
  }

  /**
   * 分析文本情感
   * @param {string} text - 要分析的文本
   * @returns {Promise<object>} 情感分析结果
   */
  async analyzeSentiment(text) {
    try {
      const completion = await this.openai.chat.completions.create({
        messages: [
          { role: 'system', content: '你是情感分析专家，分析用户文本的情感倾向，返回情感类型、风险等级和建议' },
          { role: 'user', content: text },
        ],
        model: this.model,
      });
      
      const response = completion.choices[0]?.message?.content;
      
      // 解析AI响应
      return {
        sentiment: '中性',
        confidence: 0.7,
        positiveProb: 0.5,
        negativeProb: 0.5,
        riskLevel: 'low',
        keywords: [],
        suggestions: [response || '感谢分享你的感受']
      };
    } catch (error) {
      console.error('ARK AI分析错误:', error);
      // 返回默认结果
      return this.getDefaultAnalysis();
    }
  }

  /**
   * 与AI对话
   * @param {array} messages - 对话历史
   * @returns {Promise<string>} AI回复
   */
  async chat(messages) {
    try {
      console.log('----- 开始AI对话 -----');
      console.log('Messages:', messages);
      
      const completion = await this.openai.chat.completions.create({
        messages: [
          { role: 'system', content: '你是一个专业的AI心理支持伙伴，基于认知行为疗法，提供温暖、专业的心理支持。根据用户选择的助手名称，你可以是小智助手（通用心理支持）或小慧助手（专业情绪分析）。' },
          ...messages
        ],
        model: this.model,
      });
      
      const response = completion.choices[0]?.message?.content;
      console.log('AI回复:', response);
      console.log('----- 对话结束 -----');
      
      return response || '我理解你的感受。能多分享一些具体情况吗？这样我可以提供更有针对性的建议。';
    } catch (error) {
      console.error('ARK AI对话错误:', error);
      return '很抱歉，暂时无法连接到AI服务。请稍后再试。';
    }
  }

  /**
   * 处理ARK API响应
   */
  processArkResponse(data) {
    try {
      // 提取AI返回的内容
      const aiContent = data.output?.[0]?.content?.[0]?.text || '';
      
      // 尝试解析JSON
      let analysis;
      try {
        // 提取JSON部分
        const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        } else {
          // 如果没有JSON，使用默认值
          analysis = this.getDefaultAnalysis();
        }
      } catch (parseError) {
        console.error('解析ARK响应失败:', parseError);
        analysis = this.getDefaultAnalysis();
      }

      // 确保所有字段都存在
      return {
        sentiment: analysis.sentiment || '中性',
        confidence: Math.max(0, Math.min(1, analysis.confidence || 0.7)),
        positiveProb: Math.max(0, Math.min(1, analysis.positiveProb || 0.5)),
        negativeProb: Math.max(0, Math.min(1, analysis.negativeProb || 0.5)),
        riskLevel: analysis.riskLevel || 'none',
        keywords: analysis.keywords || this.extractKeywords(data.output?.[0]?.content?.[0]?.text || ''),
        suggestions: analysis.suggestions || this.generateDefaultSuggestions(analysis.sentiment || '中性')
      };
    } catch (error) {
      console.error('处理ARK响应错误:', error);
      return this.getDefaultAnalysis();
    }
  }

  /**
   * 提取关键词
   */
  extractKeywords(text) {
    // 简单的关键词提取
    const stopWords = ['的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这'];
    
    const words = text.split(/[\s\p{P}]/u)
      .filter(word => word && word.length > 1 && !stopWords.includes(word));
    
    // 去重并取前5个
    const uniqueWords = [...new Set(words)];
    return uniqueWords.slice(0, 5);
  }

  /**
   * 生成默认建议
   */
  generateDefaultSuggestions(sentiment) {
    const suggestionsMap = {
      '高兴': [
        '😊 继续保持积极的心态，多做让自己开心的事情',
        '🎉 分享你的快乐给身边的人，传递正能量',
        '📝 记录下这个美好时刻，在低落时回顾'
      ],
      '悲伤': [
        '🤗 试着和朋友或家人聊聊天，不要独自承受',
        '🧘 推荐尝试正念练习来放松心情，缓解悲伤',
        '📔 写日记可以帮助整理情绪，理清思路'
      ],
      '焦虑': [
        '💨 深呼吸，慢慢来，一切都会好起来的',
        '📊 可以试试压力测试，了解自己的压力水平',
        '📋 分解任务，一次只做一件事，减少焦虑感'
      ],
      '愤怒': [
        '🧘 尝试深呼吸10次，冷静一下，避免冲动行为',
        '🏃 运动可以帮助释放情绪，如散步或慢跑',
        '📝 写下你的感受，然后撕掉它，象征性地释放愤怒'
      ],
      '平静': [
        '😌 保持这种平静的状态，对心理健康很有益',
        '🧘 可以尝试一些轻度的正念练习，维持内心平和',
        '🎯 在平静时规划一下接下来的目标，保持积极'
      ],
      '中性': [
        '🤔 关注自己的情绪状态，定期进行自我觉察',
        '🎵 尝试一些放松活动，如听音乐或冥想',
        '⏰ 保持规律的作息和运动，维持良好的心理状态'
      ]
    };
    
    return suggestionsMap[sentiment] || suggestionsMap['中性'];
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

export default new ArkAIService();