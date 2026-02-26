// 完整的心理测试题库
const testQuestions = {
  // 情绪测试
  emotion: [
    {
      id: 1,
      text: "最近一周，你感到快乐的时间有多少？",
      type: "happiness",
      options: ["几乎不快乐", "偶尔快乐", "有时快乐", "经常快乐", "总是很快乐"],
      weight: [1, 2, 3, 4, 5]
    },
    {
      id: 2,
      text: "你对自己目前的生活满意吗？",
      type: "satisfaction",
      options: ["非常不满意", "不太满意", "一般", "比较满意", "非常满意"],
      weight: [1, 2, 3, 4, 5]
    },
    {
      id: 3,
      text: "你能够集中注意力完成任务吗？",
      type: "focus",
      options: ["几乎不能", "很少能", "有时能", "经常能", "总能专注"],
      weight: [1, 2, 3, 4, 5]
    },
    {
      id: 4,
      text: "最近是否经常感到焦虑或紧张？",
      type: "anxiety",
      options: ["几乎没有", "很少", "有时", "经常", "总是焦虑"],
      weight: [5, 4, 3, 2, 1] // 反向计分
    },
    {
      id: 5,
      text: "你的睡眠质量如何？",
      type: "sleep",
      options: ["非常差", "比较差", "一般", "比较好", "非常好"],
      weight: [1, 2, 3, 4, 5]
    },
    {
      id: 6,
      text: "你的人际关系状况如何？",
      type: "relationship",
      options: ["非常差", "比较差", "一般", "比较好", "非常好"],
      weight: [1, 2, 3, 4, 5]
    },
    {
      id: 7,
      text: "你感到有压力吗？",
      type: "stress",
      options: ["几乎没有", "有一点", "中等", "较大", "非常大"],
      weight: [5, 4, 3, 2, 1] // 反向计分
    },
    {
      id: 8,
      text: "你对自己的未来感到乐观吗？",
      type: "optimism",
      options: ["非常悲观", "有点悲观", "中立", "有点乐观", "非常乐观"],
      weight: [1, 2, 3, 4, 5]
    }
  ],

  // 压力测试
  stress: [
    {
      id: 1,
      text: "最近一周，你感觉压力大的频率是？",
      type: "frequency",
      options: ["几乎没有", "1-2天", "3-4天", "5-6天", "几乎每天"],
      weight: [1, 2, 3, 4, 5]
    },
    {
      id: 2,
      text: "压力主要影响你的哪些方面？（多选）",
      type: "impact",
      options: ["睡眠质量", "食欲变化", "情绪波动", "注意力分散", "身体不适", "社交回避"],
      isMultiple: true,
      weight: [2, 2, 3, 3, 4, 4] // 不同选项不同权重
    },
    {
      id: 3,
      text: "压力影响你的睡眠质量吗？",
      type: "sleep_impact",
      options: ["完全不影响", "轻微影响", "中等影响", "较大影响", "严重影响"],
      weight: [1, 2, 3, 4, 5]
    },
    {
      id: 4,
      text: "你有足够的休息和放松时间吗？",
      type: "rest_time",
      options: ["完全不够", "不太够", "一般", "基本够", "非常充足"],
      weight: [5, 4, 3, 2, 1] // 反向计分
    },
    {
      id: 5,
      text: "你通常如何应对压力？",
      type: "coping_strategy",
      options: ["逃避问题", "抱怨发泄", "自我调节", "寻求帮助", "积极解决"],
      weight: [1, 2, 3, 4, 5] // 越积极的策略分数越高
    }
  ],

  // MBTI人格测试（16型人格）
  mbti: [
    // 外向(E) vs 内向(I)
    {
      id: 1,
      text: "在社交聚会中，你通常：",
      type: "EI",
      dimension: "EI",
      options: [
        "认识很多人，主动交流",
        "与熟悉的人交谈，不主动认识新朋友",
        "只与很熟的人交谈",
        "更喜欢独自一人或与一两个好友在一起"
      ],
      weight: [4, 3, 2, 1] // E得分高
    },
    {
      id: 2,
      text: "你更喜欢哪种学习/工作方式？",
      type: "EI",
      dimension: "EI",
      options: [
        "小组讨论，团队合作",
        "与一两个人一起工作",
        "独自工作，但可以随时交流",
        "完全独立工作"
      ],
      weight: [4, 3, 2, 1] // E得分高
    },
    // 实感(S) vs 直觉(N)
    {
      id: 3,
      text: "你更倾向于相信：",
      type: "SN",
      dimension: "SN",
      options: [
        "亲眼所见、具体的事实",
        "经验证明有效的方法",
        "理论分析和逻辑推理",
        "直觉和灵感"
      ],
      weight: [4, 3, 2, 1] // S得分高
    },
    {
      id: 4,
      text: "你更关注：",
      type: "SN",
      dimension: "SN",
      options: [
        "当下的实际情况",
        "具体的细节和步骤",
        "未来的可能性",
        "整体的概念和意义"
      ],
      weight: [4, 3, 2, 1] // S得分高
    },
    // 思考(T) vs 情感(F)
    {
      id: 5,
      text: "做决定时，你更看重：",
      type: "TF",
      dimension: "TF",
      options: [
        "客观的逻辑分析",
        "公平和公正的原则",
        "人际关系和谐",
        "个人价值观和情感"
      ],
      weight: [4, 3, 2, 1] // T得分高
    },
    {
      id: 6,
      text: "他人通常认为你：",
      type: "TF",
      dimension: "TF",
      options: [
        "理性、讲道理",
        "公正、有原则",
        "体贴、善解人意",
        "热情、有同情心"
      ],
      weight: [4, 3, 2, 1] // T得分高
    },
    // 判断(J) vs 感知(P)
    {
      id: 7,
      text: "你通常如何安排时间？",
      type: "JP",
      dimension: "JP",
      options: [
        "严格按照计划执行",
        "有计划但允许调整",
        "大概有个方向",
        "随性而为，看心情"
      ],
      weight: [4, 3, 2, 1] // J得分高
    },
    {
      id: 8,
      text: "你的工作环境通常是：",
      type: "JP",
      dimension: "JP",
      options: [
        "整洁有序，一切井井有条",
        "大体整齐，知道东西在哪",
        "有点乱但自己习惯",
        "自由自在，不受拘束"
      ],
      weight: [4, 3, 2, 1] // J得分高
    },
    // 额外题目提高准确性
    {
      id: 9,
      text: "你更喜欢哪种类型的书籍或电影？",
      type: "SN",
      dimension: "SN",
      options: [
        "写实纪录片、纪实文学",
        "实用技能类、教程",
        "科幻、奇幻类作品",
        "抽象艺术、哲学思考"
      ],
      weight: [4, 3, 2, 1] // S得分高
    },
    {
      id: 10,
      text: "面对冲突，你通常：",
      type: "TF",
      dimension: "TF",
      options: [
        "分析问题，找出最佳解决方案",
        "坚持原则，维护正义",
        "考虑他人感受，寻求妥协",
        "安抚情绪，维护关系"
      ],
      weight: [4, 3, 2, 1] // T得分高
    }
  ],

  // 九型人格测试
  enneagram: [
    {
      id: 1,
      text: "你更倾向于认为自己：",
      type: "core_motivation",
      options: [
        "追求完美，有原则和标准",
        "乐于助人，关注他人需求",
        "渴望成功，追求成就",
        "与众不同，追求独特",
        "追求知识，喜欢思考",
        "寻求安全，预见风险",
        "追求快乐，避免痛苦",
        "掌控局面，保护自己和他人",
        "保持和谐，避免冲突"
      ],
      description: "选择最符合你核心动机的一项"
    },
    {
      id: 2,
      text: "面对压力时，你通常：",
      type: "stress_response",
      options: [
        "变得挑剔、苛求",
        "过度付出，忽视自己",
        "工作狂，忽视休息",
        "自我封闭，情绪化",
        "过度思考，脱离现实",
        "过度担忧，疑心重",
        "逃避现实，寻求刺激",
        "控制欲增强，易怒",
        "消极被动，随波逐流"
      ]
    },
    {
      id: 3,
      text: "在人际关系中，你最看重：",
      type: "relationship_value",
      options: [
        "正确性和原则",
        "被需要和被爱",
        "被认可和钦佩",
        "理解和深度连接",
        "知识和理解",
        "忠诚和安全感",
        "自由和快乐",
        "尊重和掌控",
        "和谐和舒适"
      ]
    },
    {
      id: 4,
      text: "你的缺点可能是：",
      type: "weakness",
      options: [
        "过于批判，不宽容",
        "过度干涉，失去自我",
        "虚荣，工作狂",
        "自我中心，情绪化",
        "孤僻，脱离实际",
        "多疑，焦虑",
        "不负责任，逃避",
        "控制欲强，霸道",
        "懒散，优柔寡断"
      ]
    },
    {
      id: 5,
      text: "你的优势可能是：",
      type: "strength",
      options: [
        "有原则，追求卓越",
        "关怀他人，乐于奉献",
        "高效，目标明确",
        "有创造力，敏感",
        "聪明，知识渊博",
        "忠诚，有预见性",
        "乐观，有活力",
        "有领导力，保护者",
        "平和，善于调解"
      ]
    }
  ],

  // 睡眠质量测试
  sleep: [
    {
      id: 1,
      text: "你通常需要多长时间才能入睡？",
      type: "fall_asleep_time",
      options: ["30分钟以上", "20-30分钟", "10-20分钟", "5-10分钟", "5分钟以内"],
      weight: [5, 4, 3, 2, 1] // 时间越长分数越高（问题越大）
    },
    {
      id: 2,
      text: "你每晚的睡眠时长大约是多少？",
      type: "sleep_duration",
      options: ["少于5小时", "5-6小时", "6-7小时", "7-8小时", "8小时以上"],
      weight: [5, 4, 3, 2, 1] // 睡眠越短分数越高
    },
    {
      id: 3,
      text: "你夜间醒来的频率是？",
      type: "wake_up_frequency",
      options: ["从不醒来", "偶尔1次", "1-2次", "3-4次", "5次以上"],
      weight: [1, 2, 3, 4, 5] // 醒来次数越多分数越高
    },
    {
      id: 4,
      text: "醒来后再次入睡的难度？",
      type: "fall_back_asleep",
      options: ["很容易", "比较容易", "一般", "比较难", "非常困难"],
      weight: [1, 2, 3, 4, 5]
    },
    {
      id: 5,
      text: "早上醒来后的精神状态？",
      type: "morning_energy",
      options: ["非常疲惫", "比较疲惫", "一般", "比较精神", "非常精神"],
      weight: [5, 4, 3, 2, 1] // 反向计分
    },
    {
      id: 6,
      text: "你是否有以下睡眠问题？（多选）",
      type: "sleep_problems",
      options: ["打鼾", "梦游/说梦话", "噩梦频繁", "失眠", "白天嗜睡", "不规律作息"],
      isMultiple: true
    }
  ],

  // 性格特质快速测试
  personality: [
    {
      id: 1,
      text: "在社交场合中，你通常是？",
      type: "social_preference",
      options: ["非常内向", "比较内向", "中性", "比较外向", "非常外向"],
      weight: [1, 2, 3, 4, 5]
    },
    {
      id: 2,
      text: "面对新事物，你的态度是？",
      type: "openness",
      options: ["非常保守", "比较谨慎", "中性", "比较开放", "非常开放"],
      weight: [1, 2, 3, 4, 5]
    },
    {
      id: 3,
      text: "你做决定时更倾向于？",
      type: "decision_making",
      options: ["完全理性", "比较理性", "理性感性平衡", "比较感性", "完全感性"],
      weight: [5, 4, 3, 2, 1] // 理性得分高
    },
    {
      id: 4,
      text: "你的计划性如何？",
      type: "planning",
      options: ["完全随性", "不太计划", "有时计划", "经常计划", "严格执行计划"],
      weight: [1, 2, 3, 4, 5]
    },
    {
      id: 5,
      text: "面对冲突，你的反应是？",
      type: "conflict_response",
      options: ["避免冲突", "妥协退让", "协商解决", "坚持己见", "直接对抗"],
      weight: [1, 2, 3, 4, 5] // 越主动处理分数越高
    }
  ],

  // ✅ 新增：抑郁症筛查量表（PHQ-9）
  depression: [
    {
      id: 1,
      text: "做事时提不起劲或没有兴趣",
      type: "anhedonia",
      options: ["完全不会", "几天", "一半以上天数", "几乎每天"],
      weight: [0, 1, 2, 3],
      scoreMap: { "完全不会": 0, "几天": 1, "一半以上天数": 2, "几乎每天": 3 }
    },
    {
      id: 2,
      text: "感到心情低落、沮丧或绝望",
      type: "depressed_mood",
      options: ["完全不会", "几天", "一半以上天数", "几乎每天"],
      weight: [0, 1, 2, 3]
    },
    {
      id: 3,
      text: "入睡困难、睡不安稳或睡眠过多",
      type: "sleep",
      options: ["完全不会", "几天", "一半以上天数", "几乎每天"],
      weight: [0, 1, 2, 3]
    },
    {
      id: 4,
      text: "感觉疲倦或没有活力",
      type: "fatigue",
      options: ["完全不会", "几天", "一半以上天数", "几乎每天"],
      weight: [0, 1, 2, 3]
    },
    {
      id: 5,
      text: "食欲不振或吃太多",
      type: "appetite",
      options: ["完全不会", "几天", "一半以上天数", "几乎每天"],
      weight: [0, 1, 2, 3]
    },
    {
      id: 6,
      text: "觉得自己很糟、很失败，或让自己或家人失望",
      type: "self_esteem",
      options: ["完全不会", "几天", "一半以上天数", "几乎每天"],
      weight: [0, 1, 2, 3]
    },
    {
      id: 7,
      text: "对事物专注有困难，例如阅读报纸或看电视时",
      type: "concentration",
      options: ["完全不会", "几天", "一半以上天数", "几乎每天"],
      weight: [0, 1, 2, 3]
    },
    {
      id: 8,
      text: "行动或说话速度缓慢到别人已经觉察？或正好相反，烦躁或坐立不安、动来动去的情况更胜于平常",
      type: "psychomotor",
      options: ["完全不会", "几天", "一半以上天数", "几乎每天"],
      weight: [0, 1, 2, 3]
    },
    {
      id: 9,
      text: "有不如死掉或用某种方式伤害自己的念头",
      type: "suicidal_thought",
      options: ["完全不会", "几天", "一半以上天数", "几乎每天"],
      weight: [0, 1, 2, 3],
      isCritical: true // 标记为关键问题
    }
  ],

  // ✅ 新增：焦虑症筛查量表（GAD-7）
  anxiety: [
    {
      id: 1,
      text: "感到紧张、焦虑或急切",
      type: "nervousness",
      options: ["完全不会", "几天", "一半以上天数", "几乎每天"],
      weight: [0, 1, 2, 3]
    },
    {
      id: 2,
      text: "不能够停止或控制担忧",
      type: "worry_control",
      options: ["完全不会", "几天", "一半以上天数", "几乎每天"],
      weight: [0, 1, 2, 3]
    },
    {
      id: 3,
      text: "对各种各样的事情担忧过多",
      type: "excessive_worry",
      options: ["完全不会", "几天", "一半以上天数", "几乎每天"],
      weight: [0, 1, 2, 3]
    },
    {
      id: 4,
      text: "很难放松下来",
      type: "relaxation",
      options: ["完全不会", "几天", "一半以上天数", "几乎每天"],
      weight: [0, 1, 2, 3]
    },
    {
      id: 5,
      text: "由于不安而无法静坐",
      type: "restlessness",
      options: ["完全不会", "几天", "一半以上天数", "几乎每天"],
      weight: [0, 1, 2, 3]
    },
    {
      id: 6,
      text: "变得容易烦恼或急躁",
      type: "irritability",
      options: ["完全不会", "几天", "一半以上天数", "几乎每天"],
      weight: [0, 1, 2, 3]
    },
    {
      id: 7,
      text: "感到似乎将有可怕的事情发生而害怕",
      type: "fear",
      options: ["完全不会", "几天", "一半以上天数", "几乎每天"],
      weight: [0, 1, 2, 3]
    }
  ],
  
  // ✅ 新增：自尊量表（RSES）
  self_esteem: [
    {
      id: 1,
      text: "我感到我是一个有价值的人，至少与其他人在同一水平上",
      type: "worth",
      options: ["非常同意", "同意", "不同意", "非常不同意"],
      weight: [3, 2, 1, 0]
    },
    {
      id: 2,
      text: "我感到我有许多好的品质",
      type: "qualities",
      options: ["非常同意", "同意", "不同意", "非常不同意"],
      weight: [3, 2, 1, 0]
    },
    {
      id: 3,
      text: "我倾向于认为自己是一个失败者",
      type: "failure",
      options: ["非常同意", "同意", "不同意", "非常不同意"],
      weight: [0, 1, 2, 3] // 反向计分
    },
    {
      id: 4,
      text: "我能像大多数人一样把事情做好",
      type: "competence",
      options: ["非常同意", "同意", "不同意", "非常不同意"],
      weight: [3, 2, 1, 0]
    },
    {
      id: 5,
      text: "我感到自己没有什么值得自豪的地方",
      type: "pride",
      options: ["非常同意", "同意", "不同意", "非常不同意"],
      weight: [0, 1, 2, 3] // 反向计分
    },
    {
      id: 6,
      text: "我对自己持肯定态度",
      type: "self_acceptance",
      options: ["非常同意", "同意", "不同意", "非常不同意"],
      weight: [3, 2, 1, 0]
    },
    {
      id: 7,
      text: "总的来说，我对自己是满意的",
      type: "satisfaction",
      options: ["非常同意", "同意", "不同意", "非常不同意"],
      weight: [3, 2, 1, 0]
    },
    {
      id: 8,
      text: "我希望我能为自己赢得更多尊重",
      type: "respect",
      options: ["非常同意", "同意", "不同意", "非常不同意"],
      weight: [0, 1, 2, 3] // 反向计分
    },
    {
      id: 9,
      text: "我确实时常感到自己毫无用处",
      type: "usefulness",
      options: ["非常同意", "同意", "不同意", "非常不同意"],
      weight: [0, 1, 2, 3] // 反向计分
    },
    {
      id: 10,
      text: "我时常认为自己一无是处",
      type: "worthlessness",
      options: ["非常同意", "同意", "不同意", "非常不同意"],
      weight: [0, 1, 2, 3] // 反向计分
    }
  ]
};

// 测试描述和元数据
const testMetadata = {
  emotion: {
    name: "情绪地图测试",
    description: "评估当前情绪状态，了解情绪健康水平",
    icon: "🗺️",
    questionCount: 8,
    estimatedTime: "3-5分钟",
    difficulty: "简单"
  },
  stress: {
    name: "压力水平评估",
    description: "分析压力来源、程度和应对能力",
    icon: "⚖️",
    questionCount: 5,
    estimatedTime: "2-4分钟",
    difficulty: "简单"
  },
  mbti: {
    name: "MBTI人格测试",
    description: "经典的16型人格测试，深入了解自我性格特质",
    icon: "🧩",
    questionCount: 10,
    estimatedTime: "5-8分钟",
    difficulty: "中等"
  },
  enneagram: {
    name: "九型人格测试",
    description: "探索人格类型、动机和成长方向",
    icon: "🌟",
    questionCount: 5,
    estimatedTime: "3-5分钟",
    difficulty: "中等"
  },
  sleep: {
    name: "睡眠质量评估",
    description: "分析睡眠问题，提供改善建议",
    icon: "😴",
    questionCount: 6,
    estimatedTime: "2-3分钟",
    difficulty: "简单"
  },
  personality: {
    name: "性格特质分析",
    description: "快速了解个人性格特点和发展方向",
    icon: "🔍",
    questionCount: 5,
    estimatedTime: "2-3分钟",
    difficulty: "简单"
  },

  // ✅ 新增：抑郁症测试元数据
  depression: {
    name: "抑郁症筛查量表(PHQ-9)",
    description: "专业抑郁症筛查工具，识别抑郁风险，国际通用",
    icon: "🩺",
    questionCount: 9,
    estimatedTime: "3-4分钟",
    difficulty: "专业",
    isClinical: true, // 标记为临床量表
    warningThreshold: 10, // 总分≥10分提示可能有抑郁症状
    criticalThreshold: 15 // 总分≥15分提示中度以上抑郁
  },

  // ✅ 新增：焦虑症测试元数据
  anxiety: {
    name: "焦虑症筛查量表(GAD-7)",
    description: "专业焦虑症筛查工具，识别焦虑风险",
    icon: "😰",
    questionCount: 7,
    estimatedTime: "2-3分钟",
    difficulty: "专业",
    isClinical: true,
    warningThreshold: 5,
    criticalThreshold: 10
  },
  
  // ✅ 新增：自尊测试元数据
  self_esteem: {
    name: "自尊水平评估",
    description: "评估自我价值和自尊水平",
    icon: "👑",
    questionCount: 10,
    estimatedTime: "3-4分钟",
    difficulty: "中等"
  }
};

// MBTI类型描述
const mbtiTypes = {
  "ISTJ": {
    name: "物流师",
    description: "务实、有条理、可靠，注重传统和秩序",
    strengths: ["可靠", "有条理", "注重细节", "有责任感"],
    weaknesses: ["固执", "不灵活", "过于保守"],
    careers: ["会计师", "工程师", "管理者", "军人"],
    famous: ["乔治·华盛顿", "安格拉·默克尔"]
  },
  "ISFJ": {
    name: "守护者",
    description: "温暖、有同情心、尽责，关注他人需求",
    strengths: ["支持性", "可靠", "体贴", "实际"],
    weaknesses: ["过于谦逊", "回避冲突", "过度付出"],
    careers: ["护士", "教师", "社工", "行政人员"],
    famous: ["特蕾莎修女", "乔治·H·W·布什"]
  },
  "INFJ": {
    name: "倡导者",
    description: "理想主义、有洞察力、创造力强，追求意义",
    strengths: ["有远见", "有原则", "善解人意", "有创造力"],
    weaknesses: ["过于理想化", "敏感", "完美主义"],
    careers: ["心理咨询师", "作家", "艺术家", "人权工作者"],
    famous: ["马丁·路德·金", "纳尔逊·曼德拉"]
  },
  "INTJ": {
    name: "建筑师",
    description: "战略家、独立、有远见，善于解决复杂问题",
    strengths: ["有远见", "理性", "独立", "果断"],
    weaknesses: ["傲慢", "过度批判", "情感疏离"],
    careers: ["科学家", "工程师", "战略家", "企业家"],
    famous: ["艾萨克·牛顿", "埃隆·马斯克"]
  },
  "ISTP": {
    name: "鉴赏家",
    description: "实际、冷静、灵活，善于解决实际问题",
    strengths: ["灵活", "冷静", "动手能力强", "务实"],
    weaknesses: ["冲动", "冒险", "不喜承诺"],
    careers: ["机械师", "运动员", "工程师", "侦探"],
    famous: ["迈克尔·乔丹", "克林特·伊斯特伍德"]
  },
  "ISFP": {
    name: "探险家",
    description: "艺术、敏感、自由，活在当下",
    strengths: ["有艺术感", "灵活", "体贴", "活在当下"],
    weaknesses: ["过于敏感", "逃避冲突", "不喜计划"],
    careers: ["艺术家", "音乐家", "设计师", "兽医"],
    famous: ["迈克尔·杰克逊", "弗雷迪·默丘里"]
  },
  "INFP": {
    name: "调解员",
    description: "理想主义、有同情心、创造力强，追求和谐",
    strengths: ["理想主义", "有同情心", "有创造力", "灵活"],
    weaknesses: ["不切实际", "过度敏感", "逃避现实"],
    careers: ["作家", "心理咨询师", "艺术家", "社会工作者"],
    famous: ["威廉·莎士比亚", "J·R·R·托尔金"]
  },
  "INTP": {
    name: "逻辑学家",
    description: "创新、分析力强、好奇心重，追求知识",
    strengths: ["有创造力", "理性", "好奇心强", "独立"],
    weaknesses: ["不切实际", "社交困难", "优柔寡断"],
    careers: ["科学家", "哲学家", "程序员", "数学家"],
    famous: ["阿尔伯特·爱因斯坦", "查尔斯·达尔文"]
  },
  "ESTP": {
    name: "企业家",
    description: "精力充沛、实用、有魅力，善于即兴发挥",
    strengths: ["精力充沛", "实用", "有魅力", "灵活"],
    weaknesses: ["冲动", "不喜理论", "缺乏耐心"],
    careers: ["销售", "企业家", "运动员", "急救员"],
    famous: ["唐纳德·特朗普", "麦当娜"]
  },
  "ESFP": {
    name: "表演者",
    description: "热情、友好、有趣，喜欢成为焦点",
    strengths: ["热情", "友好", "有趣", "实践性强"],
    weaknesses: ["不喜理论", "容易分心", "缺乏长期规划"],
    careers: ["演员", "主持人", "销售", "幼师"],
    famous: ["埃尔维斯·普雷斯利", "比尔·克林顿"]
  },
  "ENFP": {
    name: "竞选者",
    description: "热情、有创造力、社交能力强，充满可能性",
    strengths: ["热情", "有创造力", "社交能力强", "乐观"],
    weaknesses: ["不切实际", "容易分心", "过于情绪化"],
    careers: ["咨询师", "记者", "演员", "创业者"],
    famous: ["罗宾·威廉姆斯", "奥普拉·温弗瑞"]
  },
  "ENTP": {
    name: "辩论家",
    description: "聪明、好奇心强、有创造力，喜欢辩论",
    strengths: ["聪明", "好奇心强", "有创造力", "精力充沛"],
    weaknesses: ["争强好胜", "不敏感", "不喜常规"],
    careers: ["律师", "发明家", "创业者", "顾问"],
    famous: ["托马斯·爱迪生", "马克·吐温"]
  },
  "ESTJ": {
    name: "总经理",
    description: "实际、有条理、果断，善于管理",
    strengths: ["有条理", "果断", "实际", "有领导力"],
    weaknesses: ["不灵活", "不敏感", "控制欲强"],
    careers: ["管理者", "警察", "法官", "教师"],
    famous: ["乔治·W·布什", "露丝·金斯伯格"]
  },
  "ESFJ": {
    name: "执政官",
    description: "友好、有同情心、尽责，喜欢帮助他人",
    strengths: ["友好", "有同情心", "尽责", "实际"],
    weaknesses: ["过度敏感", "依赖认可", "回避冲突"],
    careers: ["教师", "护士", "社工", "行政人员"],
    famous: ["泰勒·斯威夫特", "比尔·盖茨"]
  },
  "ENFJ": {
    name: "主人公",
    description: "有魅力、有说服力、利他，善于激励他人",
    strengths: ["有魅力", "有说服力", "利他", "有组织能力"],
    weaknesses: ["过于理想化", "过度敏感", "过度付出"],
    careers: ["教师", "心理咨询师", "政治家", "教练"],
    famous: ["巴拉克·奥巴马", "奥普拉·温弗瑞"]
  },
  "ENTJ": {
    name: "指挥官",
    description: "果断、有魅力、有远见，天生的领导者",
    strengths: ["果断", "有魅力", "有远见", "有领导力"],
    weaknesses: ["固执", "不耐心", "过于强势"],
    careers: ["CEO", "律师", "政治家", "军事领袖"],
    famous: ["史蒂夫·乔布斯", "玛格丽特·撒切尔"]
  }
};

// 获取测试问题
export function getQuestions(testType) {
  const questions = testQuestions[testType] || testQuestions.emotion;
  const actualTestType = testQuestions[testType] ? testType : 'emotion';
  // 为每个问题添加元数据
  return questions.map(q => ({
    ...q,
    testType: actualTestType,
    metadata: testMetadata[actualTestType]
  }));
}

// 获取测试描述
export function getTestDescription(testType) {
  return testMetadata[testType]?.description || "心理评估测试";
}

// 获取测试元数据
export function getTestMetadata(testType) {
  return testMetadata[testType] || testMetadata.emotion;
}

// 获取所有测试类型
export function getAllTestTypes() {
  return Object.keys(testMetadata).map(key => ({
    id: key,
    ...testMetadata[key]
  }));
}

// MBTI分析函数
export function analyzeMBTI(answers) {
  // 计算每个维度的分数
  const dimensions = {
    E: 0, I: 0, // 外向-内向
    S: 0, N: 0, // 实感-直觉
    T: 0, F: 0, // 思考-情感
    J: 0, P: 0  // 判断-感知
  };
  
  // 遍历答案，计算维度分数
  Object.entries(answers).forEach(([questionId, answerIndex]) => {
    const question = testQuestions.mbti.find(q => q.id === parseInt(questionId));
    if (question && question.dimension) {
      const weight = question.weight[answerIndex] || 0;
      const maxWeight = Math.max(...question.weight);
      
      // 根据问题和答案确定维度贡献
      if (question.dimension === "EI") {
        // 假设权重越高越偏向E
        const eScore = (weight / maxWeight) * 100;
        const iScore = 100 - eScore;
        dimensions.E += eScore;
        dimensions.I += iScore;
      } else if (question.dimension === "SN") {
        const sScore = (weight / maxWeight) * 100;
        const nScore = 100 - sScore;
        dimensions.S += sScore;
        dimensions.N += nScore;
      } else if (question.dimension === "TF") {
        const tScore = (weight / maxWeight) * 100;
        const fScore = 100 - tScore;
        dimensions.T += tScore;
        dimensions.F += fScore;
      } else if (question.dimension === "JP") {
        const jScore = (weight / maxWeight) * 100;
        const pScore = 100 - jScore;
        dimensions.J += jScore;
        dimensions.P += pScore;
      }
    }
  });
  
  // 确定MBTI类型
  const mbtiType = [
    dimensions.E >= dimensions.I ? "E" : "I",
    dimensions.S >= dimensions.N ? "S" : "N",
    dimensions.T >= dimensions.F ? "T" : "F",
    dimensions.J >= dimensions.P ? "J" : "P"
  ].join("");
  
  return {
    type: mbtiType,
    dimensions,
    details: mbtiTypes[mbtiType] || mbtiTypes["ISTJ"],
    scores: {
      EI: { E: Math.round(dimensions.E), I: Math.round(dimensions.I) },
      SN: { S: Math.round(dimensions.S), N: Math.round(dimensions.N) },
      TF: { T: Math.round(dimensions.T), F: Math.round(dimensions.F) },
      JP: { J: Math.round(dimensions.J), P: Math.round(dimensions.P) }
    }
  };
}

// 九型人格分析函数
export function analyzeEnneagram(answers) {
  // 简化的九型人格分析
  const enneagramScores = [0, 0, 0, 0, 0, 0, 0, 0, 0]; // 1-9型
  
  Object.entries(answers).forEach(([questionId, answerIndex]) => {
    // 根据问题和答案增加对应类型的分数
    const question = testQuestions.enneagram.find(q => q.id === parseInt(questionId));
    if (question) {
      // 每个答案对应一个类型（简化处理）
      enneagramScores[answerIndex] += 10;
    }
  });
  
  // 找到得分最高的类型
  const maxScore = Math.max(...enneagramScores);
  const primaryType = enneagramScores.indexOf(maxScore) + 1;
  
  // 九型人格描述
  const enneagramTypes = {
    1: { name: "完美主义者", description: "追求完美，有原则，讲求道德" },
    2: { name: "助人者", description: "乐于助人，关注他人需求，渴望被爱" },
    3: { name: "成就者", description: "追求成功，注重形象，效率高" },
    4: { name: "个人主义者", description: "追求独特，情感丰富，有艺术气质" },
    5: { name: "探索者", description: "追求知识，喜欢思考，独立" },
    6: { name: "忠诚者", description: "寻求安全，忠诚，有责任感" },
    7: { name: "热情者", description: "追求快乐，乐观，喜欢新鲜事物" },
    8: { name: "挑战者", description: "追求掌控，有力量，保护他人" },
    9: { name: "和平缔造者", description: "追求和谐，平静，避免冲突" }
  };
  
  return {
    type: primaryType,
    typeName: enneagramTypes[primaryType].name,
    description: enneagramTypes[primaryType].description,
    scores: enneagramScores,
    wing: primaryType > 1 ? primaryType - 1 : 9, // 简化翼型计算
    healthLevel: maxScore > 30 ? "健康" : maxScore > 20 ? "一般" : "不健康"
  };
}

export default testQuestions;