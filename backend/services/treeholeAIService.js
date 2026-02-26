/**
 * 树洞AI服务 - 集成火山引擎ARK API进行情感分析
 */
class TreeholeAIService {
  constructor() {
    this.apiKey = process.env.ARK_API_KEY || '0f67c8ec-3c8d-4c34-8df3-89d079c26afd';
    this.apiUrl = 'https://ark.cn-beijing.volces.com/api/v3/responses';
    this.model = 'ep-20260115085838-vwcbk';
  }

  /**
   * 分析文本情感
   * @param {string} text - 要分析的文本
   * @returns {Promise<object>} 情感分析结果
   */
  async analyzeSentiment(text) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          stream: false,
          input: [
            {
              role: 'user',
              content: [
                {
                  type: 'input_text',
                  text: `😊 请分析以下文本的情感，输出JSON格式，包含：
                  1. sentiment: 情感类型（高兴、悲伤、焦虑、愤怒、平静、中性）
                  2. confidence: 置信度（0-1）
                  3. positiveProb: 正向情感概率（0-1）
                  4. negativeProb: 负向情感概率（0-1）
                  5. riskLevel: 风险等级（high、medium、low、none）
                  6. keywords: 关键词数组
                  7. suggestions: 针对性建议数组（至少3条）
                  重要要求：
                  - 即使文本没有明确的情感倾向或心情描述，也不要请求更多信息
                  - 相反，应给出情感方面的建议，帮助用户关注心理健康和情绪管理
                  - 建议应具体、实用，与情感支持相关
                  - 避免使用技术性语言，保持温暖和同理心
                  文本内容："${text}" 💬`
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }

      const data = await response.json();
      return this.processArkResponse(data);
    } catch (error) {
      console.error('ARK API分析错误:', error);
      // 出错时返回默认结果
      return this.getDefaultAnalysis();
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

export default new TreeholeAIService();