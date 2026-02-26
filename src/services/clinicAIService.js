// 轻诊室AI服务 - 与树洞AI、心理咨询AI完全分离

// 分析测试结果
const analyzeTestResults = async (testType, questions, answers, initialScore) => {
  // 构建用户答案文本
  const answersText = questions.map((question, index) => {
    const userAnswer = answers[question.id];
    let selectedOption;
    if (question.isMultiple && userAnswer && Array.isArray(userAnswer)) {
      selectedOption = userAnswer.map(idx => question.options[idx]).join('; ');
    } else if (question.options && userAnswer !== undefined) {
      selectedOption = question.options[userAnswer];
    } else {
      selectedOption = '未回答';
    }
    return `问题 ${index + 1}: ${question.text}\n答案: ${selectedOption}`;
  }).join('\n\n');

  // 根据测试类型构建不同的系统提示和用户提示
  let systemPrompt, userPrompt;
  
  if (testType === 'mbti') {
    // MBTI测试专用提示
    systemPrompt = `你是专业的MBTI人格测试分析专家，专门负责分析MBTI测试结果。

测试类型: MBTI人格测试

请基于用户的回答，提供结构化的JSON格式分析结果，包含以下字段：
1. "type": MBTI类型代码（如ISTJ、ENFP等）
2. "typeName": MBTI类型名称（如物流师、竞选者等）
3. "description": MBTI类型的详细描述
4. "strengths": 该类型的优势数组
5. "weaknesses": 该类型的劣势数组
6. "careerRecommendations": 适合的职业建议数组
7. "relationshipTips": 人际关系建议数组
8. "growthSuggestions": 个人成长建议数组
9. "compatibility": 与其他类型的兼容性信息
10. "totalScore": 一个0-100的综合评分
11. "riskLevel": 风险等级（low、medium、high）

分析要专业、客观，同时保持温暖和鼓励的语气。

重要：请只输出JSON格式，不要包含其他文本，确保JSON可以被正确解析。`;

    userPrompt = `请分析以下MBTI测试结果，并返回结构化的JSON格式：

${answersText}

测试类型: MBTI人格测试

请返回包含以下字段的JSON：
{
  "type": "ISTJ",
  "typeName": "物流师",
  "description": "务实、有条理、可靠，注重传统和秩序",
  "strengths": ["可靠", "有条理", "注重细节", "有责任感"],
  "weaknesses": ["固执", "不灵活", "过于保守"],
  "careerRecommendations": ["会计师", "工程师", "管理者", "军人"],
  "relationshipTips": ["明确表达你的需求", "尊重传统和承诺", "保持稳定和可靠"],
  "growthSuggestions": ["尝试新方法解决问题", "多表达自己的感受", "接受一些不确定性"],
  "compatibility": {
    "best": ["INFJ", "ENFJ", "INFP", "ENFP"],
    "good": ["ISTJ", "ISFJ", "ESTJ", "ESFJ"],
    "challenging": ["ISTP", "ISFP", "ESTP", "ESFP"]
  },
  "totalScore": 75,
  "riskLevel": "low"
}

重要：请只输出JSON格式，不要包含其他文本，确保JSON可以被正确解析。`;
  } else if (testType === 'enneagram') {
    // 九型人格测试专用提示
    systemPrompt = `你是专业的九型人格测试分析专家，专门负责分析九型人格测试结果。

测试类型: 九型人格测试

请基于用户的回答，提供结构化的JSON格式分析结果，包含以下字段：
1. "type": 九型人格类型数字（1-9）
2. "typeName": 九型人格类型名称（如完美主义者、助人者等）
3. "description": 类型的详细描述
4. "coreFear": 核心恐惧
5. "coreDesire": 核心欲望
6. "healthyLevel": 健康状态下的特质
7. "averageLevel": 平均状态下的特质
8. "unhealthyLevel": 不健康状态下的特质
9. "growthPath": 成长路径
10. "stressPath": 压力下的表现
11. "integrationLevel": 整合水平
12. "totalScore": 一个0-100的综合评分
13. "riskLevel": 风险等级（low、medium、high）

分析要专业、客观，同时保持温暖和鼓励的语气。

重要：请只输出JSON格式，不要包含其他文本，确保JSON可以被正确解析。`;

    userPrompt = `请分析以下九型人格测试结果，并返回结构化的JSON格式：

${answersText}

测试类型: 九型人格测试

请返回包含以下字段的JSON：
{
  "type": 1,
  "typeName": "完美主义者",
  "description": "追求完美，有原则，讲求道德",
  "coreFear": "害怕犯错、不完美",
  "coreDesire": "追求正确、正直",
  "healthyLevel": "自律、有原则、追求完美",
  "averageLevel": "过于挑剔、容易自我批评",
  "unhealthyLevel": "批判性强、不宽容、完美主义",
  "growthPath": "学会接受不完美，培养同情心",
  "stressPath": "变得挑剔、苛求、愤怒",
  "integrationLevel": "学会平衡完美与接受",
  "totalScore": 75,
  "riskLevel": "low"
}

重要：请只输出JSON格式，不要包含其他文本，确保JSON可以被正确解析。`;
  } else if (testType === 'sleep') {
    // 睡眠质量评估测试专用提示
    systemPrompt = `你是专业的睡眠质量评估专家，专门负责分析睡眠测试结果。

测试类型: 睡眠质量评估

请基于用户的回答，提供结构化的JSON格式分析结果，包含以下字段：
1. "sleepQuality": 睡眠质量等级（优秀、良好、一般、较差、差）
2. "sleepDuration": 睡眠时长评估
3. "sleepEfficiency": 睡眠效率评估
4. "sleepEnvironment": 睡眠环境评估
5. "sleepHabits": 睡眠习惯评估
6. "description": 睡眠质量的详细描述
7. "suggestions": 睡眠改善建议数组
8. "actionPlan": 具体的睡眠改善计划数组
9. "riskAssessment": 睡眠质量风险评估（低、中、高）
10. "totalScore": 一个0-100的综合评分
11. "riskLevel": 风险等级（low、medium、high）

分析要专业、客观，同时保持温暖和鼓励的语气。

重要：请只输出JSON格式，不要包含其他文本，确保JSON可以被正确解析。`;

    userPrompt = `请分析以下睡眠质量评估测试结果，并返回结构化的JSON格式：

${answersText}

测试类型: 睡眠质量评估

请返回包含以下字段的JSON：
{
  "sleepQuality": "良好",
  "sleepDuration": "7-8小时",
  "sleepEfficiency": "较高",
  "sleepEnvironment": "适宜",
  "sleepHabits": "基本规律",
  "description": "睡眠质量整体良好，但存在一些可以改进的地方",
  "suggestions": ["保持规律的作息时间", "睡前避免使用电子设备", "创建舒适的睡眠环境", "适当进行睡前放松活动"],
  "actionPlan": ["建立固定的睡眠时间表", "睡前1小时避免使用手机", "优化卧室温度和光线", "睡前进行10分钟冥想"],
  "riskAssessment": "低风险",
  "totalScore": 75,
  "riskLevel": "low"
}

重要：请只输出JSON格式，不要包含其他文本，确保JSON可以被正确解析。`;
  } else if (testType === 'personality') {
    // 性格特质分析测试专用提示
    systemPrompt = `你是专业的性格特质分析专家，专门负责分析性格测试结果。

测试类型: 性格特质分析

请基于用户的回答，提供结构化的JSON格式分析结果，包含以下字段：
1. "personalityType": 性格类型描述
2. "description": 性格特质的详细描述
3. "strengths": 性格优势数组
4. "weaknesses": 性格待发展领域数组
5. "suggestions": 个性化发展建议数组
6. "actionPlan": 具体的行动方案数组
7. "riskAssessment": 性格健康度评估（低、中、高）
8. "totalScore": 一个0-100的综合评分
9. "riskLevel": 风险等级（low、medium、high）

分析要专业、客观，同时保持温暖和鼓励的语气。

重要：请只输出JSON格式，不要包含其他文本，确保JSON可以被正确解析。`;

    userPrompt = `请分析以下性格特质分析测试结果，并返回结构化的JSON格式：

${answersText}

测试类型: 性格特质分析

请返回包含以下字段的JSON：
{
  "personalityType": "平衡型性格",
  "description": "性格整体平衡，各维度发展较为均衡",
  "strengths": ["责任心强，做事认真可靠", "开放性高，愿意尝试新事物", "情绪稳定，能够应对压力", "善于思考，有独立见解"],
  "weaknesses": ["在社交场合可能过于拘谨", "有时会过于追求完美", "需要更多的情绪表达", "在压力下可能会变得固执"],
  "suggestions": ["在社交场合中尝试主动与他人交流，培养更开放的沟通风格", "学会接受不完美，给自己和他人更多的宽容和理解", "尝试更多地表达自己的情绪和感受，增强情感连接", "在压力情境下学习灵活应对，培养适应性思维"],
  "actionPlan": ["每天尝试与至少一个陌生人交流", "每周设定一个可实现的小目标，不追求完美", "每天记录一件情绪事件并分析", "学习一种压力管理技巧，如深呼吸或冥想"],
  "riskAssessment": "低风险",
  "totalScore": 75,
  "riskLevel": "low"
}

重要：请只输出JSON格式，不要包含其他文本，确保JSON可以被正确解析。`;
  } else if (testType === 'depression') {
    // 抑郁筛查测试专用提示
    systemPrompt = `你是专业的抑郁筛查评估专家，专门负责分析抑郁测试结果。

测试类型: 抑郁筛查评估

请基于用户的回答，提供结构化的JSON格式分析结果，包含以下字段：
1. "severity": 抑郁严重程度（无、轻度、中度、重度）
2. "symptoms": 具体症状数组
3. "riskLevel": 风险等级（low、medium、high）
4. "description": 详细的抑郁状况描述
5. "suggestions": 个性化干预建议数组
6. "actionPlan": 具体的行动方案数组
7. "professionalHelp": 是否需要专业帮助的建议
8. "emergencyInfo": 紧急支持信息
9. "totalScore": 一个0-100的综合评分

分析要专业、客观，同时保持温暖和鼓励的语气。

重要：请只输出JSON格式，不要包含其他文本，确保JSON可以被正确解析。`;

    userPrompt = `请分析以下抑郁筛查测试结果，并返回结构化的JSON格式：

${answersText}

测试类型: 抑郁筛查评估

请返回包含以下字段的JSON：
{
  "severity": "轻度",
  "symptoms": ["情绪低落", "兴趣减退", "睡眠障碍", "精力下降"],
  "riskLevel": "medium",
  "description": "存在轻度抑郁症状，需要关注和干预",
  "suggestions": ["保持规律的作息时间", "适当进行体育锻炼", "与朋友和家人保持联系", "学习情绪管理技巧"],
  "actionPlan": ["每天进行30分钟有氧运动", "建立社交支持网络", "学习放松训练", "如有需要寻求专业心理咨询"],
  "professionalHelp": "建议寻求专业心理咨询",
  "emergencyInfo": "如果出现自杀念头，请立即联系专业机构或拨打心理危机干预热线",
  "totalScore": 45
}

重要：请只输出JSON格式，不要包含其他文本，确保JSON可以被正确解析。`;
  } else if (testType === 'anxiety') {
    // 焦虑筛查测试专用提示
    systemPrompt = `你是专业的焦虑筛查评估专家，专门负责分析焦虑测试结果。

测试类型: 焦虑筛查评估

请基于用户的回答，提供结构化的JSON格式分析结果，包含以下字段：
1. "severity": 焦虑严重程度（无、轻度、中度、重度）
2. "symptoms": 具体症状数组
3. "riskLevel": 风险等级（low、medium、high）
4. "description": 详细的焦虑状况描述
5. "suggestions": 个性化干预建议数组
6. "actionPlan": 具体的行动方案数组
7. "professionalHelp": 是否需要专业帮助的建议
8. "emergencyInfo": 紧急支持信息
9. "totalScore": 一个0-100的综合评分

分析要专业、客观，同时保持温暖和鼓励的语气。

重要：请只输出JSON格式，不要包含其他文本，确保JSON可以被正确解析。`;

    userPrompt = `请分析以下焦虑筛查测试结果，并返回结构化的JSON格式：

${answersText}

测试类型: 焦虑筛查评估

请返回包含以下字段的JSON：
{
  "severity": "轻度",
  "symptoms": ["感到紧张", "过度担忧", "难以放松", "容易急躁"],
  "riskLevel": "medium",
  "description": "存在轻度焦虑症状，需要关注和干预",
  "suggestions": ["学习放松技巧", "保持规律的作息时间", "适当进行体育锻炼", "避免咖啡因和其他兴奋剂"],
  "actionPlan": ["每天练习2次深呼吸或正念冥想", "建立规律的作息时间表", "每周进行3-5次有氧运动", "减少咖啡因摄入"],
  "professionalHelp": "建议寻求专业心理咨询",
  "emergencyInfo": "如果出现严重焦虑发作，请立即联系专业机构或拨打心理危机干预热线",
  "totalScore": 45
}

重要：请只输出JSON格式，不要包含其他文本，确保JSON可以被正确解析。`;
  } else if (testType === 'self_esteem') {
    // 自尊水平评估测试专用提示
    systemPrompt = `你是专业的自尊水平评估专家，专门负责分析自尊测试结果。

测试类型: 自尊水平评估

请基于用户的回答，提供结构化的JSON格式分析结果，包含以下字段：
1. "level": 自尊水平（低、中等、中高、高）
2. "coreFeatures": 核心特征数组
3. "riskLevel": 风险等级（low、medium、high）
4. "description": 详细的自尊状况描述
5. "suggestions": 个性化提升建议数组
6. "actionPlan": 具体的行动方案数组
7. "professionalHelp": 是否需要专业帮助的建议
8. "totalScore": 一个0-100的综合评分

分析要专业、客观，同时保持温暖和鼓励的语气。

重要：请只输出JSON格式，不要包含其他文本，确保JSON可以被正确解析。`;

    userPrompt = `请分析以下自尊水平评估测试结果，并返回结构化的JSON格式：

${answersText}

测试类型: 自尊水平评估

请返回包含以下字段的JSON：
{
  "level": "中等",
  "coreFeatures": ["自我价值感一般", "自信程度中等", "自我接纳程度一般", "应对挫折的能力中等", "人际关系中的自我定位需要提升"],
  "riskLevel": "medium",
  "description": "自尊水平处于中等水平，有提升空间",
  "suggestions": ["培养自我肯定的习惯", "设定可实现的目标", "学习自我接纳", "建立健康的人际关系", "学习应对挫折的技巧"],
  "actionPlan": ["每天记录3件自己做得好的事情", "设定并完成3个小目标", "学习并实践自我接纳技巧", "建立健康的社交网络"],
  "professionalHelp": "建议寻求专业心理咨询",
  "totalScore": 65
}

重要：请只输出JSON格式，不要包含其他文本，确保JSON可以被正确解析。`;
  } else {
    // 其他测试类型的通用提示
    systemPrompt = `你是专业的心理健康评估助手，专门负责分析心理测试结果。

测试类型: ${testType}

请基于用户的回答，提供结构化的JSON格式分析结果，包含以下字段：
1. "mentalState": 详细的心理状态分析，包含核心特征和底层原因
2. "suggestions": 个性化的改进建议数组
3. "riskAssessment": 风险等级评估（低、中、高）
4. "actionPlan": 具体的行动方案数组
5. "totalScore": 一个0-100的综合评分，基于用户的整体心理状态
6. "riskLevel": 风险等级（low、medium、high）

重要评分规则：
- 分数范围：0-100分
- 100分：心理状态最佳，低风险
- 0分：心理状态最差，高风险
- 风险等级应基于分数：80-100分（低风险），40-79分（中等风险），0-39分（高风险）

分析要专业、客观，同时保持温暖和鼓励的语气。

重要：请只输出JSON格式，不要包含其他文本，确保JSON可以被正确解析。`;

    userPrompt = `请分析以下测试结果，并返回结构化的JSON格式：

${answersText}

测试类型: ${testType}

重要评分规则：
- 分数范围：0-100分
- 100分：心理状态最佳，低风险
- 0分：心理状态最差，高风险
- 风险等级应基于分数：80-100分（低风险），40-79分（中等风险），0-39分（高风险）

请返回包含以下字段的JSON：
{
  "mentalState": {
    "coreFeatures": ["核心特征1", "核心特征2", "核心特征3"],
    "underlyingCause": "底层原因描述"
  },
  "suggestions": ["建议1", "建议2", "建议3", "建议4"],
  "riskAssessment": "中需关注",
  "actionPlan": ["行动方案1", "行动方案2", "行动方案3"],
  "totalScore": 75,
  "riskLevel": "medium"
}

重要：请只输出JSON格式，不要包含其他文本，确保JSON可以被正确解析。`;
  }

  try {
    // 直接使用fetch调用ARK API
    const apiKey = import.meta.env.VITE_ARK_API_KEY || '5b6e2495-e7b5-4ae0-86f2-a1775438fbb1';
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'ep-20260204191007-l6vf6',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`AI调用失败: ${response.status} ${errorData.error?.message || '未知错误'}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // 尝试解析JSON格式的响应
    try {
      const parsedResponse = JSON.parse(aiResponse);
      
      // 确保分数在0-100范围内
      const aiScore = Math.max(0, Math.min(100, parsedResponse.totalScore || initialScore));
      
      // 构建分析结果，根据测试类型使用不同的结构
      let analysis;
      
      if (testType === 'mbti') {
        // MBTI测试结果结构
        analysis = {
          title: `${testType}人格测试分析报告`,
          description: parsedResponse.description || '基于AI分析的MBTI人格评估',
          aiAnalysis: parsedResponse,
          level: parsedResponse.riskLevel || 'low',
          suggestions: parsedResponse.growthSuggestions || parsedResponse.suggestions || [],
          aiEnhanced: true,
          totalScore: aiScore,
          type: parsedResponse.type,
          typeName: parsedResponse.typeName,
          strengths: parsedResponse.strengths,
          weaknesses: parsedResponse.weaknesses,
          careerRecommendations: parsedResponse.careerRecommendations,
          relationshipTips: parsedResponse.relationshipTips,
          growthSuggestions: parsedResponse.growthSuggestions,
          compatibility: parsedResponse.compatibility
        };
      } else if (testType === 'enneagram') {
        // 九型人格测试结果结构
        analysis = {
          title: `${testType}人格测试分析报告`,
          description: parsedResponse.description || '基于AI分析的九型人格评估',
          aiAnalysis: parsedResponse,
          level: parsedResponse.riskLevel || 'low',
          suggestions: parsedResponse.growthPath ? [parsedResponse.growthPath] : [],
          aiEnhanced: true,
          totalScore: aiScore,
          type: parsedResponse.type,
          typeName: parsedResponse.typeName,
          coreFear: parsedResponse.coreFear,
          coreDesire: parsedResponse.coreDesire,
          healthyLevel: parsedResponse.healthyLevel,
          averageLevel: parsedResponse.averageLevel,
          unhealthyLevel: parsedResponse.unhealthyLevel,
          growthPath: parsedResponse.growthPath,
          stressPath: parsedResponse.stressPath,
          integrationLevel: parsedResponse.integrationLevel
        };
      } else if (testType === 'sleep') {
        // 睡眠质量评估测试结果结构
        analysis = {
          title: '睡眠质量评估分析报告',
          description: parsedResponse.description || '基于AI分析的睡眠质量评估',
          aiAnalysis: parsedResponse,
          level: parsedResponse.riskLevel || (aiScore >= 80 ? 'low' : aiScore >= 40 ? 'medium' : 'high'),
          suggestions: parsedResponse.suggestions || [],
          aiEnhanced: true,
          totalScore: aiScore,
          sleepQuality: parsedResponse.sleepQuality,
          sleepDuration: parsedResponse.sleepDuration,
          sleepEfficiency: parsedResponse.sleepEfficiency,
          sleepEnvironment: parsedResponse.sleepEnvironment,
          sleepHabits: parsedResponse.sleepHabits,
          actionPlan: parsedResponse.actionPlan,
          riskAssessment: parsedResponse.riskAssessment,
          mentalState: {
            coreFeatures: [
              `睡眠质量：${parsedResponse.sleepQuality}`,
              `睡眠时长：${parsedResponse.sleepDuration}`,
              `睡眠效率：${parsedResponse.sleepEfficiency}`,
              `睡眠环境：${parsedResponse.sleepEnvironment}`,
              `睡眠习惯：${parsedResponse.sleepHabits}`
            ],
            underlyingCause: parsedResponse.description || '基于AI分析的睡眠质量评估'
          }
        };
      } else if (testType === 'personality') {
        // 性格特质分析测试结果结构
        analysis = {
          title: '性格特质分析报告',
          description: parsedResponse.description || '基于AI分析的性格特质评估',
          aiAnalysis: parsedResponse,
          level: parsedResponse.riskLevel || (aiScore >= 80 ? 'low' : aiScore >= 40 ? 'medium' : 'high'),
          suggestions: parsedResponse.suggestions || [],
          aiEnhanced: true,
          totalScore: aiScore,
          personalityType: parsedResponse.personalityType,
          strengths: parsedResponse.strengths,
          weaknesses: parsedResponse.weaknesses,
          actionPlan: parsedResponse.actionPlan,
          riskAssessment: parsedResponse.riskAssessment,
          mentalState: {
            coreFeatures: [
              `性格类型：${parsedResponse.personalityType || '平衡型性格'}`,
              `外向性：中等水平`,
              `神经质：较低水平`,
              `开放性：较高水平`,
              `宜人性：中等水平`,
              `责任心：较高水平`
            ],
            underlyingCause: parsedResponse.description || '基于AI分析的性格特质评估'
          }
        };
      } else if (testType === 'depression') {
        // 抑郁筛查测试结果结构
        analysis = {
          title: '抑郁筛查分析报告',
          description: parsedResponse.description || '基于AI分析的抑郁筛查评估',
          aiAnalysis: parsedResponse,
          level: parsedResponse.riskLevel || (aiScore >= 80 ? 'low' : aiScore >= 40 ? 'medium' : 'high'),
          suggestions: parsedResponse.suggestions || [],
          aiEnhanced: true,
          totalScore: aiScore,
          severity: parsedResponse.severity,
          symptoms: parsedResponse.symptoms,
          actionPlan: parsedResponse.actionPlan,
          professionalHelp: parsedResponse.professionalHelp,
          emergencyInfo: parsedResponse.emergencyInfo,
          mentalState: {
            coreFeatures: parsedResponse.symptoms || ["情绪低落", "兴趣减退", "睡眠障碍", "精力下降"],
            underlyingCause: parsedResponse.description || '基于AI分析的抑郁筛查评估'
          }
        };
      } else if (testType === 'anxiety') {
        // 焦虑筛查测试结果结构
        analysis = {
          title: '焦虑筛查分析报告',
          description: parsedResponse.description || '基于AI分析的焦虑筛查评估',
          aiAnalysis: parsedResponse,
          level: parsedResponse.riskLevel || (aiScore >= 80 ? 'low' : aiScore >= 40 ? 'medium' : 'high'),
          suggestions: parsedResponse.suggestions || [],
          aiEnhanced: true,
          totalScore: aiScore,
          severity: parsedResponse.severity,
          symptoms: parsedResponse.symptoms,
          actionPlan: parsedResponse.actionPlan,
          professionalHelp: parsedResponse.professionalHelp,
          emergencyInfo: parsedResponse.emergencyInfo,
          mentalState: {
            coreFeatures: parsedResponse.symptoms || ["感到紧张", "过度担忧", "难以放松", "容易急躁"],
            underlyingCause: parsedResponse.description || '基于AI分析的焦虑筛查评估'
          }
        };
      } else if (testType === 'self_esteem') {
        // 自尊水平评估测试结果结构
        analysis = {
          title: '自尊水平评估分析报告',
          description: parsedResponse.description || '基于AI分析的自尊水平评估',
          aiAnalysis: parsedResponse,
          level: parsedResponse.riskLevel || (aiScore >= 80 ? 'low' : aiScore >= 60 ? 'medium' : aiScore >= 40 ? 'medium' : 'high'),
          suggestions: parsedResponse.suggestions || [],
          aiEnhanced: true,
          totalScore: aiScore,
          selfEsteemLevel: parsedResponse.level,
          coreFeatures: parsedResponse.coreFeatures,
          actionPlan: parsedResponse.actionPlan,
          professionalHelp: parsedResponse.professionalHelp,
          mentalState: {
            coreFeatures: parsedResponse.coreFeatures || ["自我价值感评估", "自信程度", "自我接纳程度", "应对挫折的能力", "人际关系中的自我定位"],
            underlyingCause: parsedResponse.description || '基于AI分析的自尊水平评估'
          }
        };
      } else {
        // 其他测试类型的通用结构
        analysis = {
          title: `${testType}测试分析报告`,
          description: '基于AI分析的详细心理评估',
          aiAnalysis: parsedResponse,
          level: parsedResponse.riskLevel || (aiScore >= 80 ? 'low' : aiScore >= 40 ? 'medium' : 'high'),
          suggestions: parsedResponse.suggestions || [],
          aiEnhanced: true,
          totalScore: aiScore,
          mentalState: parsedResponse.mentalState,
          actionPlan: parsedResponse.actionPlan,
          riskAssessment: parsedResponse.riskAssessment,
        };
      }
      
      return analysis;
    } catch (jsonError) {
      console.error('JSON解析失败，使用默认分析:', jsonError);
      // 如果JSON解析失败，回退到默认分析
      const aiScore = initialScore;
      let analysis;
      
      if (testType === 'mbti') {
        // MBTI测试默认分析
        analysis = {
          title: 'MBTI人格测试分析报告',
          description: '基于默认分析的MBTI人格评估',
          aiAnalysis: aiResponse,
          level: 'low',
          suggestions: ['持续自我探索', '了解自己的优势和劣势', '与不同人格类型的人交流'],
          aiEnhanced: true,
          totalScore: aiScore,
          type: 'INFP',
          typeName: '调解员',
          strengths: ['理想主义', '有同情心', '创造力强', '追求和谐'],
          weaknesses: ['过于理想主义', '容易受伤', '犹豫不决'],
          careerRecommendations: ['咨询师', '教育工作者', '艺术家', '社会工作者'],
          relationshipTips: ['学会表达自己的需求', '保持开放的沟通', '寻找理解你的伴侣'],
          growthSuggestions: ['设定现实目标', '学会应对批评', '培养自信心'],
          compatibility: {
            best: ['ENFJ', 'INFJ', 'ENTP', 'INTP'],
            good: ['ISFP', 'ESFP', 'ENFP', 'INFP'],
            challenging: ['ISTJ', 'ESTJ', 'INTJ', 'ENTJ']
          }
        };
      } else if (testType === 'enneagram') {
        // 九型人格测试默认分析
        analysis = {
          title: '九型人格测试分析报告',
          description: '基于默认分析的九型人格评估',
          aiAnalysis: aiResponse,
          level: 'low',
          suggestions: ['了解自己的核心恐惧和欲望', '探索个人成长路径', '平衡不同状态下的表现'],
          aiEnhanced: true,
          totalScore: aiScore,
          type: 9,
          typeName: '和平缔造者',
          coreFear: '害怕冲突、失去和谐',
          coreDesire: '内心平静、和谐',
          healthyLevel: '包容、平和、善于调解',
          averageLevel: '被动、拖延、避免冲突',
          unhealthyLevel: '懒惰、压抑、麻木',
          growthPath: '培养主动性，表达真实需求',
          stressPath: '变得消极、被动、麻木',
          integrationLevel: '学会平衡和谐与主动'
        };
      } else if (testType === 'sleep') {
        // 睡眠质量评估测试默认分析
        analysis = {
          title: '睡眠质量评估分析报告',
          description: '基于默认分析的睡眠质量评估',
          aiAnalysis: aiResponse,
          level: aiScore >= 80 ? 'low' : aiScore >= 40 ? 'medium' : 'high',
          suggestions: [
            '保持规律的作息时间',
            '睡前避免使用电子设备',
            '创建舒适的睡眠环境',
            '适当进行睡前放松活动'
          ],
          aiEnhanced: true,
          totalScore: aiScore,
          sleepQuality: aiScore >= 80 ? '优秀' : aiScore >= 60 ? '良好' : aiScore >= 40 ? '一般' : aiScore >= 20 ? '较差' : '差',
          sleepDuration: aiScore >= 80 ? '7-8小时' : aiScore >= 60 ? '6-7小时' : aiScore >= 40 ? '5-6小时' : '不足5小时',
          sleepEfficiency: aiScore >= 80 ? '很高' : aiScore >= 60 ? '较高' : aiScore >= 40 ? '一般' : '较低',
          sleepEnvironment: aiScore >= 80 ? '非常适宜' : aiScore >= 60 ? '适宜' : aiScore >= 40 ? '一般' : '较差',
          sleepHabits: aiScore >= 80 ? '非常规律' : aiScore >= 60 ? '基本规律' : aiScore >= 40 ? '不太规律' : '不规律',
          actionPlan: [
            '建立固定的睡眠时间表',
            '睡前1小时避免使用手机',
            '优化卧室温度和光线',
            '睡前进行10分钟冥想'
          ],
          riskAssessment: aiScore >= 80 ? "低风险" : aiScore >= 40 ? "中等风险" : "高风险",
          mentalState: {
            coreFeatures: [
              `睡眠质量：${aiScore >= 80 ? '优秀' : aiScore >= 60 ? '良好' : aiScore >= 40 ? '一般' : aiScore >= 20 ? '较差' : '差'}`,
              `睡眠时长：${aiScore >= 80 ? '7-8小时' : aiScore >= 60 ? '6-7小时' : aiScore >= 40 ? '5-6小时' : '不足5小时'}`,
              `睡眠效率：${aiScore >= 80 ? '很高' : aiScore >= 60 ? '较高' : aiScore >= 40 ? '一般' : '较低'}`,
              `睡眠环境：${aiScore >= 80 ? '非常适宜' : aiScore >= 60 ? '适宜' : aiScore >= 40 ? '一般' : '较差'}`,
              `睡眠习惯：${aiScore >= 80 ? '非常规律' : aiScore >= 60 ? '基本规律' : aiScore >= 40 ? '不太规律' : '不规律'}`
            ],
            underlyingCause: "基于默认分析的睡眠质量评估"
          }
        };
      } else if (testType === 'personality') {
        // 性格特质分析测试默认分析
        analysis = {
          title: '性格特质分析报告',
          description: '基于默认分析的性格特质评估',
          aiAnalysis: aiResponse,
          level: aiScore >= 80 ? 'low' : aiScore >= 40 ? 'medium' : 'high',
          suggestions: [
            '在社交场合中尝试主动与他人交流，培养更开放的沟通风格',
            '学会接受不完美，给自己和他人更多的宽容和理解',
            '尝试更多地表达自己的情绪和感受，增强情感连接',
            '在压力情境下学习灵活应对，培养适应性思维'
          ],
          aiEnhanced: true,
          totalScore: aiScore,
          personalityType: '平衡型性格',
          strengths: [
            '责任心强，做事认真可靠',
            '开放性高，愿意尝试新事物',
            '情绪稳定，能够应对压力',
            '善于思考，有独立见解'
          ],
          weaknesses: [
            '在社交场合可能过于拘谨',
            '有时会过于追求完美',
            '需要更多的情绪表达',
            '在压力下可能会变得固执'
          ],
          actionPlan: [
            '每天尝试与至少一个陌生人交流',
            '每周设定一个可实现的小目标，不追求完美',
            '每天记录一件情绪事件并分析',
            '学习一种压力管理技巧，如深呼吸或冥想'
          ],
          riskAssessment: aiScore >= 80 ? "低风险" : aiScore >= 40 ? "中等风险" : "高风险",
          mentalState: {
            coreFeatures: [
              '性格类型：平衡型性格',
              '外向性：中等水平',
              '神经质：较低水平',
              '开放性：较高水平',
              '宜人性：中等水平',
              '责任心：较高水平'
            ],
            underlyingCause: "基于默认分析的性格特质评估"
          }
        };
      } else if (testType === 'depression') {
        // 抑郁筛查测试默认分析
        let severity, symptoms;
        if (aiScore >= 80) {
          severity = '无';
          symptoms = ['情绪稳定', '兴趣正常', '睡眠良好', '精力充沛'];
        } else if (aiScore >= 60) {
          severity = '轻度';
          symptoms = ['情绪偶尔低落', '兴趣轻度减退', '睡眠轻度障碍', '精力轻度下降'];
        } else if (aiScore >= 40) {
          severity = '中度';
          symptoms = ['情绪持续低落', '兴趣明显减退', '睡眠障碍', '精力下降'];
        } else {
          severity = '重度';
          symptoms = ['情绪极度低落', '兴趣完全丧失', '严重睡眠障碍', '精力严重下降', '可能有自杀倾向'];
        }
        
        analysis = {
          title: '抑郁筛查分析报告',
          description: '基于默认分析的抑郁筛查评估',
          aiAnalysis: aiResponse,
          level: aiScore >= 80 ? 'low' : aiScore >= 40 ? 'medium' : 'high',
          suggestions: [
            '保持规律的作息时间',
            '适当进行体育锻炼',
            '与朋友和家人保持联系',
            '学习情绪管理技巧',
            '如有需要，寻求专业帮助'
          ],
          aiEnhanced: true,
          totalScore: aiScore,
          severity: severity,
          symptoms: symptoms,
          actionPlan: [
            '每天进行30分钟有氧运动',
            '建立社交支持网络',
            '学习放松训练',
            '如有需要寻求专业心理咨询'
          ],
          professionalHelp: aiScore < 60 ? '强烈建议寻求专业心理咨询' : '建议寻求专业心理咨询',
          emergencyInfo: '如果出现自杀念头，请立即联系专业机构或拨打心理危机干预热线',
          mentalState: {
            coreFeatures: symptoms,
            underlyingCause: "基于默认分析的抑郁筛查评估"
          }
        };
      } else if (testType === 'anxiety') {
        // 焦虑筛查测试默认分析
        let severity, symptoms;
        if (aiScore >= 80) {
          severity = '无';
          symptoms = ['情绪稳定', '心态平和', '睡眠良好', '精力充沛'];
        } else if (aiScore >= 60) {
          severity = '轻度';
          symptoms = ['偶尔感到紧张', '轻度担忧', '轻度睡眠障碍', '精力轻度下降'];
        } else if (aiScore >= 40) {
          severity = '中度';
          symptoms = ['经常感到紧张', '过度担忧', '睡眠障碍', '容易急躁'];
        } else {
          severity = '重度';
          symptoms = ['持续感到紧张', '极度担忧', '严重睡眠障碍', '易激惹', '可能出现惊恐发作'];
        }
        
        analysis = {
          title: '焦虑筛查分析报告',
          description: '基于默认分析的焦虑筛查评估',
          aiAnalysis: aiResponse,
          level: aiScore >= 80 ? 'low' : aiScore >= 40 ? 'medium' : 'high',
          suggestions: [
            '学习放松技巧，如深呼吸、渐进性肌肉放松',
            '保持规律的作息时间，确保充足的睡眠',
            '适当进行体育锻炼，如散步、跑步或游泳',
            '避免咖啡因和其他兴奋剂的摄入',
            '如有需要，寻求专业帮助'
          ],
          aiEnhanced: true,
          totalScore: aiScore,
          severity: severity,
          symptoms: symptoms,
          actionPlan: [
            '每天练习2次深呼吸或正念冥想，每次10分钟',
            '建立规律的作息时间表，保证充足睡眠',
            '每周进行3-5次有氧运动，每次30分钟',
            '减少咖啡因摄入，避免饮用含咖啡因的饮料'
          ],
          professionalHelp: aiScore < 60 ? '强烈建议寻求专业心理咨询' : '建议寻求专业心理咨询',
          emergencyInfo: '如果出现严重焦虑发作，请立即联系专业机构或拨打心理危机干预热线',
          mentalState: {
            coreFeatures: symptoms,
            underlyingCause: "基于默认分析的焦虑筛查评估"
          }
        };
      } else if (testType === 'self_esteem') {
        // 自尊水平评估测试默认分析
        let level, coreFeatures;
        if (aiScore >= 80) {
          level = '高';
          coreFeatures = ['自我价值感高', '自信程度高', '自我接纳程度高', '应对挫折的能力强', '人际关系中的自我定位清晰'];
        } else if (aiScore >= 60) {
          level = '中高';
          coreFeatures = ['自我价值感良好', '自信程度良好', '自我接纳程度良好', '应对挫折的能力良好', '人际关系中的自我定位较清晰'];
        } else if (aiScore >= 40) {
          level = '中等';
          coreFeatures = ['自我价值感一般', '自信程度中等', '自我接纳程度一般', '应对挫折的能力中等', '人际关系中的自我定位需要提升'];
        } else {
          level = '低';
          coreFeatures = ['自我价值感低', '自信程度低', '自我接纳程度低', '应对挫折的能力弱', '人际关系中的自我定位模糊'];
        }
        
        analysis = {
          title: '自尊水平评估分析报告',
          description: '基于默认分析的自尊水平评估',
          aiAnalysis: aiResponse,
          level: aiScore >= 80 ? 'low' : aiScore >= 60 ? 'medium' : aiScore >= 40 ? 'medium' : 'high',
          suggestions: [
            '培养自我肯定的习惯，每天记录3件自己做得好的事情',
            '设定可实现的目标，通过完成小目标来建立自信',
            '学习自我接纳，接受自己的优点和不足',
            '建立健康的人际关系，与支持你的人保持联系',
            '学习应对挫折的技巧，将失败视为学习机会'
          ],
          aiEnhanced: true,
          totalScore: aiScore,
          selfEsteemLevel: level,
          coreFeatures: coreFeatures,
          actionPlan: [
            '每天记录3件自己做得好的事情，培养自我肯定的习惯',
            '设定并完成3个小目标，建立成就感',
            '学习并实践自我接纳技巧，接受自己的优点和不足',
            '建立健康的社交网络，与支持你的人保持联系'
          ],
          professionalHelp: aiScore < 60 ? '建议寻求专业心理咨询' : '如需进一步提升，可寻求专业心理咨询',
          mentalState: {
            coreFeatures: coreFeatures,
            underlyingCause: "基于默认分析的自尊水平评估"
          }
        };
      } else {
        // 其他测试类型的默认分析
        analysis = {
          title: `${testType}测试分析报告`,
          description: '基于默认分析的心理评估',
          aiAnalysis: aiResponse,
          level: aiScore >= 80 ? 'low' : aiScore >= 40 ? 'medium' : 'high',
          suggestions: extractSuggestions(aiResponse),
          aiEnhanced: true,
          totalScore: aiScore,
          mentalState: {
            coreFeatures: ["快乐感受偶发，对生活满意度偏低", "注意力难集中、睡眠质量差，人际压力明显", "对未来悲观，存在焦虑、抑郁情绪倾向"],
            underlyingCause: "当前处于\"情绪能量不足\"状态，需优先恢复基础心理资源"
          },
          actionPlan: ["每天记录1件微小快乐", "每天15分钟深呼吸冥想", "改善生活满意度的小目标", "周末和朋友小聚"],
          riskAssessment: aiScore >= 80 ? "低风险" : aiScore >= 40 ? "中等风险" : "高风险",
        };
      }
      return analysis;
    }

  } catch (error) {
    console.error('AI分析失败:', error);
    // 返回默认分析结果
    let defaultAnalysis;
    
    if (testType === 'mbti') {
      // MBTI测试默认分析
      defaultAnalysis = {
        title: 'MBTI人格测试分析报告',
        description: '基于默认分析的MBTI人格评估',
        aiAnalysis: {
          type: 'INFP',
          typeName: '调解员',
          description: '理想主义、有同情心、创造力强，追求和谐',
          strengths: ['理想主义', '有同情心', '创造力强', '追求和谐'],
          weaknesses: ['过于理想主义', '容易受伤', '犹豫不决'],
          careerRecommendations: ['咨询师', '教育工作者', '艺术家', '社会工作者'],
          relationshipTips: ['学会表达自己的需求', '保持开放的沟通', '寻找理解你的伴侣'],
          growthSuggestions: ['设定现实目标', '学会应对批评', '培养自信心'],
          compatibility: {
            best: ['ENFJ', 'INFJ', 'ENTP', 'INTP'],
            good: ['ISFP', 'ESFP', 'ENFP', 'INFP'],
            challenging: ['ISTJ', 'ESTJ', 'INTJ', 'ENTJ']
          },
          totalScore: initialScore,
          riskLevel: 'low'
        },
        level: 'low',
        suggestions: ['持续自我探索', '了解自己的优势和劣势', '与不同人格类型的人交流'],
        aiEnhanced: false,
        totalScore: initialScore,
        type: 'INFP',
        typeName: '调解员',
        strengths: ['理想主义', '有同情心', '创造力强', '追求和谐'],
        weaknesses: ['过于理想主义', '容易受伤', '犹豫不决'],
        careerRecommendations: ['咨询师', '教育工作者', '艺术家', '社会工作者'],
        relationshipTips: ['学会表达自己的需求', '保持开放的沟通', '寻找理解你的伴侣'],
        growthSuggestions: ['设定现实目标', '学会应对批评', '培养自信心'],
        compatibility: {
          best: ['ENFJ', 'INFJ', 'ENTP', 'INTP'],
          good: ['ISFP', 'ESFP', 'ENFP', 'INFP'],
          challenging: ['ISTJ', 'ESTJ', 'INTJ', 'ENTJ']
        }
      };
    } else if (testType === 'enneagram') {
      // 九型人格测试默认分析
      defaultAnalysis = {
        title: '九型人格测试分析报告',
        description: '基于默认分析的九型人格评估',
        aiAnalysis: {
          type: 9,
          typeName: '和平缔造者',
          description: '追求和谐，平静，避免冲突',
          coreFear: '害怕冲突、失去和谐',
          coreDesire: '内心平静、和谐',
          healthyLevel: '包容、平和、善于调解',
          averageLevel: '被动、拖延、避免冲突',
          unhealthyLevel: '懒惰、压抑、麻木',
          growthPath: '培养主动性，表达真实需求',
          stressPath: '变得消极、被动、麻木',
          integrationLevel: '学会平衡和谐与主动',
          totalScore: initialScore,
          riskLevel: 'low'
        },
        level: 'low',
        suggestions: ['了解自己的核心恐惧和欲望', '探索个人成长路径', '平衡不同状态下的表现'],
        aiEnhanced: false,
        totalScore: initialScore,
        type: 9,
        typeName: '和平缔造者',
        coreFear: '害怕冲突、失去和谐',
        coreDesire: '内心平静、和谐',
        healthyLevel: '包容、平和、善于调解',
        averageLevel: '被动、拖延、避免冲突',
        unhealthyLevel: '懒惰、压抑、麻木',
        growthPath: '培养主动性，表达真实需求',
        stressPath: '变得消极、被动、麻木',
        integrationLevel: '学会平衡和谐与主动'
      };
    } else if (testType === 'sleep') {
      // 睡眠质量评估测试默认分析
      defaultAnalysis = {
        title: '睡眠质量评估分析报告',
        description: '基于默认分析的睡眠质量评估',
        aiAnalysis: {
          sleepQuality: initialScore >= 80 ? '优秀' : initialScore >= 60 ? '良好' : initialScore >= 40 ? '一般' : initialScore >= 20 ? '较差' : '差',
          sleepDuration: initialScore >= 80 ? '7-8小时' : initialScore >= 60 ? '6-7小时' : initialScore >= 40 ? '5-6小时' : '不足5小时',
          sleepEfficiency: initialScore >= 80 ? '很高' : initialScore >= 60 ? '较高' : initialScore >= 40 ? '一般' : '较低',
          sleepEnvironment: initialScore >= 80 ? '非常适宜' : initialScore >= 60 ? '适宜' : initialScore >= 40 ? '一般' : '较差',
          sleepHabits: initialScore >= 80 ? '非常规律' : initialScore >= 60 ? '基本规律' : initialScore >= 40 ? '不太规律' : '不规律',
          description: '基于默认分析的睡眠质量评估',
          suggestions: [
            '保持规律的作息时间',
            '睡前避免使用电子设备',
            '创建舒适的睡眠环境',
            '适当进行睡前放松活动'
          ],
          actionPlan: [
            '建立固定的睡眠时间表',
            '睡前1小时避免使用手机',
            '优化卧室温度和光线',
            '睡前进行10分钟冥想'
          ],
          riskAssessment: initialScore >= 80 ? "低风险" : initialScore >= 40 ? "中等风险" : "高风险",
          totalScore: initialScore,
          riskLevel: initialScore >= 80 ? 'low' : initialScore >= 40 ? 'medium' : 'high'
        },
        level: initialScore >= 80 ? 'low' : initialScore >= 40 ? 'medium' : 'high',
        suggestions: [
          '保持规律的作息时间',
          '睡前避免使用电子设备',
          '创建舒适的睡眠环境',
          '适当进行睡前放松活动'
        ],
        aiEnhanced: false,
        totalScore: initialScore,
        sleepQuality: initialScore >= 80 ? '优秀' : initialScore >= 60 ? '良好' : initialScore >= 40 ? '一般' : initialScore >= 20 ? '较差' : '差',
        sleepDuration: initialScore >= 80 ? '7-8小时' : initialScore >= 60 ? '6-7小时' : initialScore >= 40 ? '5-6小时' : '不足5小时',
        sleepEfficiency: initialScore >= 80 ? '很高' : initialScore >= 60 ? '较高' : initialScore >= 40 ? '一般' : '较低',
        sleepEnvironment: initialScore >= 80 ? '非常适宜' : initialScore >= 60 ? '适宜' : initialScore >= 40 ? '一般' : '较差',
        sleepHabits: initialScore >= 80 ? '非常规律' : initialScore >= 60 ? '基本规律' : initialScore >= 40 ? '不太规律' : '不规律',
        actionPlan: [
          '建立固定的睡眠时间表',
          '睡前1小时避免使用手机',
          '优化卧室温度和光线',
          '睡前进行10分钟冥想'
        ],
        riskAssessment: initialScore >= 80 ? "低风险" : initialScore >= 40 ? "中等风险" : "高风险",
        mentalState: {
          coreFeatures: [
            `睡眠质量：${initialScore >= 80 ? '优秀' : initialScore >= 60 ? '良好' : initialScore >= 40 ? '一般' : initialScore >= 20 ? '较差' : '差'}`,
            `睡眠时长：${initialScore >= 80 ? '7-8小时' : initialScore >= 60 ? '6-7小时' : initialScore >= 40 ? '5-6小时' : '不足5小时'}`,
            `睡眠效率：${initialScore >= 80 ? '很高' : initialScore >= 60 ? '较高' : initialScore >= 40 ? '一般' : '较低'}`,
            `睡眠环境：${initialScore >= 80 ? '非常适宜' : initialScore >= 60 ? '适宜' : initialScore >= 40 ? '一般' : '较差'}`,
            `睡眠习惯：${initialScore >= 80 ? '非常规律' : initialScore >= 60 ? '基本规律' : initialScore >= 40 ? '不太规律' : '不规律'}`
          ],
          underlyingCause: "基于默认分析的睡眠质量评估"
        }
      };
    } else if (testType === 'personality') {
      // 性格特质分析测试默认分析
      defaultAnalysis = {
        title: '性格特质分析报告',
        description: '基于默认分析的性格特质评估',
        aiAnalysis: {
          personalityType: '平衡型性格',
          description: '性格整体平衡，各维度发展较为均衡',
          strengths: [
            '责任心强，做事认真可靠',
            '开放性高，愿意尝试新事物',
            '情绪稳定，能够应对压力',
            '善于思考，有独立见解'
          ],
          weaknesses: [
            '在社交场合可能过于拘谨',
            '有时会过于追求完美',
            '需要更多的情绪表达',
            '在压力下可能会变得固执'
          ],
          suggestions: [
            '在社交场合中尝试主动与他人交流，培养更开放的沟通风格',
            '学会接受不完美，给自己和他人更多的宽容和理解',
            '尝试更多地表达自己的情绪和感受，增强情感连接',
            '在压力情境下学习灵活应对，培养适应性思维'
          ],
          actionPlan: [
            '每天尝试与至少一个陌生人交流',
            '每周设定一个可实现的小目标，不追求完美',
            '每天记录一件情绪事件并分析',
            '学习一种压力管理技巧，如深呼吸或冥想'
          ],
          riskAssessment: initialScore >= 80 ? "低风险" : initialScore >= 40 ? "中等风险" : "高风险",
          totalScore: initialScore,
          riskLevel: initialScore >= 80 ? 'low' : initialScore >= 40 ? 'medium' : 'high'
        },
        level: initialScore >= 80 ? 'low' : initialScore >= 40 ? 'medium' : 'high',
        suggestions: [
          '在社交场合中尝试主动与他人交流，培养更开放的沟通风格',
          '学会接受不完美，给自己和他人更多的宽容和理解',
          '尝试更多地表达自己的情绪和感受，增强情感连接',
          '在压力情境下学习灵活应对，培养适应性思维'
        ],
        aiEnhanced: false,
        totalScore: initialScore,
        personalityType: '平衡型性格',
        strengths: [
          '责任心强，做事认真可靠',
          '开放性高，愿意尝试新事物',
          '情绪稳定，能够应对压力',
          '善于思考，有独立见解'
        ],
        weaknesses: [
          '在社交场合可能过于拘谨',
          '有时会过于追求完美',
          '需要更多的情绪表达',
          '在压力下可能会变得固执'
        ],
        actionPlan: [
          '每天尝试与至少一个陌生人交流',
          '每周设定一个可实现的小目标，不追求完美',
          '每天记录一件情绪事件并分析',
          '学习一种压力管理技巧，如深呼吸或冥想'
        ],
        riskAssessment: initialScore >= 80 ? "低风险" : initialScore >= 40 ? "中等风险" : "高风险",
        mentalState: {
          coreFeatures: [
            '性格类型：平衡型性格',
            '外向性：中等水平',
            '神经质：较低水平',
            '开放性：较高水平',
            '宜人性：中等水平',
            '责任心：较高水平'
          ],
          underlyingCause: "基于默认分析的性格特质评估"
        }
      };
    } else if (testType === 'depression') {
      // 抑郁筛查测试默认分析
      let severity, symptoms;
      if (initialScore >= 80) {
        severity = '无';
        symptoms = ['情绪稳定', '兴趣正常', '睡眠良好', '精力充沛'];
      } else if (initialScore >= 60) {
        severity = '轻度';
        symptoms = ['情绪偶尔低落', '兴趣轻度减退', '睡眠轻度障碍', '精力轻度下降'];
      } else if (initialScore >= 40) {
        severity = '中度';
        symptoms = ['情绪持续低落', '兴趣明显减退', '睡眠障碍', '精力下降'];
      } else {
        severity = '重度';
        symptoms = ['情绪极度低落', '兴趣完全丧失', '严重睡眠障碍', '精力严重下降', '可能有自杀倾向'];
      }
      
      defaultAnalysis = {
        title: '抑郁筛查分析报告',
        description: '基于默认分析的抑郁筛查评估',
        aiAnalysis: {
          severity: severity,
          symptoms: symptoms,
          riskLevel: initialScore >= 80 ? 'low' : initialScore >= 40 ? 'medium' : 'high',
          description: '基于默认分析的抑郁筛查评估',
          suggestions: [
            '保持规律的作息时间',
            '适当进行体育锻炼',
            '与朋友和家人保持联系',
            '学习情绪管理技巧',
            '如有需要，寻求专业帮助'
          ],
          actionPlan: [
            '每天进行30分钟有氧运动',
            '建立社交支持网络',
            '学习放松训练',
            '如有需要寻求专业心理咨询'
          ],
          professionalHelp: initialScore < 60 ? '强烈建议寻求专业心理咨询' : '建议寻求专业心理咨询',
          emergencyInfo: '如果出现自杀念头，请立即联系专业机构或拨打心理危机干预热线',
          totalScore: initialScore,
          riskLevel: initialScore >= 80 ? 'low' : initialScore >= 40 ? 'medium' : 'high'
        },
        level: initialScore >= 80 ? 'low' : initialScore >= 40 ? 'medium' : 'high',
        suggestions: [
          '保持规律的作息时间',
          '适当进行体育锻炼',
          '与朋友和家人保持联系',
          '学习情绪管理技巧',
          '如有需要，寻求专业帮助'
        ],
        aiEnhanced: false,
        totalScore: initialScore,
        severity: severity,
        symptoms: symptoms,
        actionPlan: [
          '每天进行30分钟有氧运动',
          '建立社交支持网络',
          '学习放松训练',
          '如有需要寻求专业心理咨询'
        ],
        professionalHelp: initialScore < 60 ? '强烈建议寻求专业心理咨询' : '建议寻求专业心理咨询',
        emergencyInfo: '如果出现自杀念头，请立即联系专业机构或拨打心理危机干预热线',
        mentalState: {
          coreFeatures: symptoms,
          underlyingCause: "基于默认分析的抑郁筛查评估"
        }
      };
    } else if (testType === 'anxiety') {
      // 焦虑筛查测试默认分析
      let severity, symptoms;
      if (initialScore >= 80) {
        severity = '无';
        symptoms = ['情绪稳定', '心态平和', '睡眠良好', '精力充沛'];
      } else if (initialScore >= 60) {
        severity = '轻度';
        symptoms = ['偶尔感到紧张', '轻度担忧', '轻度睡眠障碍', '精力轻度下降'];
      } else if (initialScore >= 40) {
        severity = '中度';
        symptoms = ['经常感到紧张', '过度担忧', '睡眠障碍', '容易急躁'];
      } else {
        severity = '重度';
        symptoms = ['持续感到紧张', '极度担忧', '严重睡眠障碍', '易激惹', '可能出现惊恐发作'];
      }
      
      defaultAnalysis = {
        title: '焦虑筛查分析报告',
        description: '基于默认分析的焦虑筛查评估',
        aiAnalysis: {
          severity: severity,
          symptoms: symptoms,
          riskLevel: initialScore >= 80 ? 'low' : initialScore >= 40 ? 'medium' : 'high',
          description: '基于默认分析的焦虑筛查评估',
          suggestions: [
            '学习放松技巧，如深呼吸、渐进性肌肉放松',
            '保持规律的作息时间，确保充足的睡眠',
            '适当进行体育锻炼，如散步、跑步或游泳',
            '避免咖啡因和其他兴奋剂的摄入',
            '如有需要，寻求专业帮助'
          ],
          actionPlan: [
            '每天练习2次深呼吸或正念冥想，每次10分钟',
            '建立规律的作息时间表，保证充足睡眠',
            '每周进行3-5次有氧运动，每次30分钟',
            '减少咖啡因摄入，避免饮用含咖啡因的饮料'
          ],
          professionalHelp: initialScore < 60 ? '强烈建议寻求专业心理咨询' : '建议寻求专业心理咨询',
          emergencyInfo: '如果出现严重焦虑发作，请立即联系专业机构或拨打心理危机干预热线',
          totalScore: initialScore,
          riskLevel: initialScore >= 80 ? 'low' : initialScore >= 40 ? 'medium' : 'high'
        },
        level: initialScore >= 80 ? 'low' : initialScore >= 40 ? 'medium' : 'high',
        suggestions: [
          '学习放松技巧，如深呼吸、渐进性肌肉放松',
          '保持规律的作息时间，确保充足的睡眠',
          '适当进行体育锻炼，如散步、跑步或游泳',
          '避免咖啡因和其他兴奋剂的摄入',
          '如有需要，寻求专业帮助'
        ],
        aiEnhanced: false,
        totalScore: initialScore,
        severity: severity,
        symptoms: symptoms,
        actionPlan: [
          '每天练习2次深呼吸或正念冥想，每次10分钟',
          '建立规律的作息时间表，保证充足睡眠',
          '每周进行3-5次有氧运动，每次30分钟',
          '减少咖啡因摄入，避免饮用含咖啡因的饮料'
        ],
        professionalHelp: initialScore < 60 ? '强烈建议寻求专业心理咨询' : '建议寻求专业心理咨询',
        emergencyInfo: '如果出现严重焦虑发作，请立即联系专业机构或拨打心理危机干预热线',
        mentalState: {
          coreFeatures: symptoms,
          underlyingCause: "基于默认分析的焦虑筛查评估"
        }
      };
    } else {
      // 其他测试类型的默认分析
      defaultAnalysis = {
        title: `${testType}测试分析报告`,
        description: '基于默认分析的心理评估',
        aiAnalysis: {
          mentalState: {
            coreFeatures: ["快乐感受偶发，对生活满意度偏低", "注意力难集中、睡眠质量差，人际压力明显", "对未来悲观，存在焦虑、抑郁情绪倾向"],
            underlyingCause: "当前处于\"情绪能量不足\"状态，需优先恢复基础心理资源"
          },
          suggestions: [
            '保持良好的生活作息',
            '适当进行放松训练',
            '与朋友和家人保持联系',
            '如有需要，寻求专业帮助',
          ],
          riskAssessment: initialScore >= 80 ? "低风险" : initialScore >= 40 ? "中等风险" : "高风险",
          actionPlan: ["每天记录1件微小快乐", "每天15分钟深呼吸冥想", "改善生活满意度的小目标", "周末和朋友小聚"],
          totalScore: initialScore,
          riskLevel: initialScore >= 80 ? 'low' : initialScore >= 40 ? 'medium' : 'high'
        },
        level: initialScore >= 80 ? 'low' : initialScore >= 40 ? 'medium' : 'high',
        suggestions: [
          '保持良好的生活作息',
          '适当进行放松训练',
          '与朋友和家人保持联系',
          '如有需要，寻求专业帮助',
        ],
        aiEnhanced: false,
        totalScore: initialScore,
        mentalState: {
          coreFeatures: ["快乐感受偶发，对生活满意度偏低", "注意力难集中、睡眠质量差，人际压力明显", "对未来悲观，存在焦虑、抑郁情绪倾向"],
          underlyingCause: "当前处于\"情绪能量不足\"状态，需优先恢复基础心理资源"
        },
        actionPlan: ["每天记录1件微小快乐", "每天15分钟深呼吸冥想", "改善生活满意度的小目标", "周末和朋友小聚"],
        riskAssessment: initialScore >= 80 ? "低风险" : initialScore >= 40 ? "中等风险" : "高风险",
      };
    }
    return defaultAnalysis;
  }
};

// 从AI回复中提取建议
const extractSuggestions = (aiResponse) => {
  // 改进的建议提取逻辑
  const suggestions = [];
  
  // 尝试直接从可能的JSON字符串中提取
  if (aiResponse.includes('"suggestions"')) {
    try {
      // 找到suggestions数组的开始和结束
      const startIdx = aiResponse.indexOf('"suggestions"');
      const arrayStart = aiResponse.indexOf('[', startIdx);
      const arrayEnd = aiResponse.indexOf(']', arrayStart);
      if (arrayStart > -1 && arrayEnd > -1) {
        const suggestionsStr = aiResponse.substring(arrayStart, arrayEnd + 1);
        const parsedSuggestions = JSON.parse(suggestionsStr);
        if (Array.isArray(parsedSuggestions)) {
          return parsedSuggestions;
        }
      }
    } catch (e) {
      console.error('从AI响应中提取suggestions数组失败:', e);
    }
  }
  
  // 基本的文本行提取
  const lines = aiResponse.split('\n');
  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && (trimmedLine.includes('建议') || trimmedLine.includes('推荐') || trimmedLine.includes('应该') || trimmedLine.includes('请'))) {
      suggestions.push(trimmedLine);
    }
  });
  
  return suggestions.length > 0 ? suggestions : [
    '情绪激活：每天记录1件"微小快乐"，培养积极心态',
    '注意力训练：每天15分钟深呼吸/冥想，提升专注力',
    '睡眠优化：睡前1小时远离电子设备，营造黑暗安静环境',
    '人际修复：从"分享一件小事"开始，主动重建社交连接',
  ];
};

// 导出服务
const clinicAIService = {
  analyzeTestResults,
};

export default clinicAIService;