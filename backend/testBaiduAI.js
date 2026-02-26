import baiduAIService from './services/baiduAIService.js';

async function test() {
  const testTexts = [
    '我今天很开心，考试得了满分！',
    '感觉压力很大，睡不着觉，怎么办？',
    '一切都那么美好，阳光明媚，心情舒畅',
    '有时候觉得自己一无是处，生活没有意义'
  ];

  for (const text of testTexts) {
    console.log(`\n📝 测试文本: "${text}"`);
    console.log('⏳ 正在调用百度AI分析...');
    
    try {
      const result = await baiduAIService.analyzeSentiment(text);
      console.log('✅ 分析结果:', {
        情感: result.sentiment,
        风险等级: result.riskLevel,
        正向概率: result.positiveProb,
        负向概率: result.negativeProb,
        置信度: result.confidence
      });
      
      const suggestions = baiduAIService.generateSuggestions(result);
      console.log('💡 建议:', suggestions);
    } catch (error) {
      console.error('❌ 测试失败:', error.message);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000)); // 防止请求过快
  }
}

test();