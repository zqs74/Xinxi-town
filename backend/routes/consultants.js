import express from 'express';
const router = express.Router();
import { authMiddleware } from '../middleware/auth.js';

// 模拟咨询师数据（实际项目中应该存储在数据库中）
const consultants = [
  { 
    _id: '1', 
    name: "李老师", 
    expertise: ["学业压力", "时间管理"], 
    rating: 4.9, 
    available: true,
    description: "专注学生学业压力管理，擅长时间规划",
    experience: "8年",
    price: "200元/小时",
    avatar: "👨‍🏫"
  },
  { 
    _id: '2', 
    name: "王老师", 
    expertise: ["人际关系", "社交焦虑"], 
    rating: 4.8, 
    available: true,
    description: "人际关系专家，帮助改善社交能力",
    experience: "6年",
    price: "180元/小时",
    avatar: "👩‍⚕️"
  },
  { 
    _id: '3', 
    name: "张老师", 
    expertise: ["情绪管理", "焦虑缓解"], 
    rating: 4.7, 
    available: false,
    description: "情绪管理教练，提供焦虑缓解方案",
    experience: "5年",
    price: "150元/小时",
    avatar: "🧑‍💼"
  },
  { 
    _id: '4', 
    name: "刘老师", 
    expertise: ["生涯规划", "自我探索"], 
    rating: 4.9, 
    available: true,
    description: "生涯规划导师，帮助学生探索自我",
    experience: "10年",
    price: "250元/小时",
    avatar: "👨‍🎓"
  },
  { 
    _id: '5', 
    name: "陈老师", 
    expertise: ["恋爱关系", "家庭问题"], 
    rating: 4.6, 
    available: true,
    description: "亲密关系咨询师，处理情感问题",
    experience: "7年",
    price: "220元/小时",
    avatar: "👩‍❤️‍👨"
  }
];

// 模拟预约数据
let appointments = [
  {
    _id: '1',
    userId: '1',
    consultantId: '1',
    consultantName: "李老师",
    consultantAvatar: "👨‍🏫",
    date: "2026-02-10",
    time: "10:00",
    duration: 60,
    reason: "学业压力",
    notes: "",
    status: 'confirmed',
    createdAt: new Date(),
    price: "200元/小时"
  },
  {
    _id: '2',
    userId: '1',
    consultantId: '2',
    consultantName: "王老师",
    consultantAvatar: "👩‍⚕️",
    date: "2026-02-15",
    time: "14:00",
    duration: 90,
    reason: "人际关系",
    notes: "",
    status: 'pending',
    createdAt: new Date(),
    price: "180元/小时"
  }
];

// 获取咨询师列表 - 无需认证
router.get('/', async (req, res) => {
  try {
    const { expertise, available, search } = req.query;
    
    let filteredConsultants = [...consultants];
    
    // 按专业领域过滤
    if (expertise) {
      filteredConsultants = filteredConsultants.filter(c => 
        c.expertise.some(exp => exp.includes(expertise))
      );
    }
    
    // 按可用性过滤
    if (available === 'true') {
      filteredConsultants = filteredConsultants.filter(c => c.available);
    }
    
    // 搜索功能
    if (search) {
      const searchLower = search.toLowerCase();
      filteredConsultants = filteredConsultants.filter(c => 
        c.name.toLowerCase().includes(searchLower) ||
        c.description.toLowerCase().includes(searchLower) ||
        c.expertise.some(exp => exp.toLowerCase().includes(searchLower))
      );
    }
    
    // AI匹配推荐（基于用户历史）
    let userId = null;
    // 尝试从认证信息中获取用户ID（如果已登录）
    if (req.user) {
      userId = req.user._id.toString();
    }
    
    // 简单示例：随机推荐3个咨询师
    const recommended = [...filteredConsultants]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(consultant => ({
        ...consultant,
        recommendedReason: "根据您的个人情况推荐"
      }));
    
    res.json({
      success: true,
      data: filteredConsultants,
      recommended,
      total: filteredConsultants.length
    });
  } catch (error) {
    console.error('获取咨询师列表错误:', error);
    res.status(500).json({ success: false, error: '获取咨询师列表失败' });
  }
});

// 获取咨询师详情 - 无需认证
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const consultant = consultants.find(c => c._id === id);
    
    if (!consultant) {
      return res.status(404).json({
        success: false,
        error: '咨询师不存在'
      });
    }
    
    // 获取咨询师的可预约时间（模拟数据）
    const availableSlots = generateAvailableSlots(consultant._id);
    
    // 获取咨询师的评价（模拟数据）
    const reviews = generateReviews(consultant._id);
    
    res.json({
      success: true,
      data: {
        ...consultant,
        availableSlots,
        reviews,
        stats: {
          totalSessions: Math.floor(Math.random() * 100) + 50,
          successRate: Math.floor(Math.random() * 20) + 80 // 80-100%
        }
      }
    });
  } catch (error) {
    console.error('获取咨询师详情错误:', error);
    res.status(500).json({ success: false, error: '获取咨询师详情失败' });
  }
});

// 预约咨询师 - 需要认证
router.post('/appointments', authMiddleware, async (req, res) => {
  try {
    const { consultantId, date, time, duration = 60, reason, notes } = req.body;
    const userId = req.user._id.toString(); // 使用真实的用户ID
    
    // 验证必填字段
    if (!consultantId || !date || !time || !reason) {
      return res.status(400).json({
        success: false,
        error: '请填写完整的预约信息'
      });
    }
    
    // 查找咨询师
    const consultant = consultants.find(c => c._id === consultantId);
    
    if (!consultant) {
      return res.status(404).json({
        success: false,
        error: '咨询师不存在'
      });
    }
    
    // 检查咨询师是否可用
    if (!consultant.available) {
      return res.status(400).json({
        success: false,
        error: '该咨询师目前不可预约'
      });
    }
    
    // 检查时间冲突（在实际项目中应该查询数据库）
    const appointmentTime = new Date(`${date}T${time}`);
    const existingAppointment = appointments.find(app => 
      app.consultantId === consultantId &&
      new Date(app.date + 'T' + app.time).getTime() === appointmentTime.getTime()
    );
    
    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        error: '该时间段已被预约，请选择其他时间'
      });
    }
    
    // 创建预约
    const appointment = {
      _id: Date.now().toString(),
      userId,
      consultantId,
      consultantName: consultant.name,
      consultantAvatar: consultant.avatar,
      date,
      time,
      duration,
      reason,
      notes: notes || '',
      status: 'pending', // pending, confirmed, completed, cancelled
      createdAt: new Date(),
      price: consultant.price
    };
    
    // 保存预约（模拟）
    appointments.push(appointment);
    
    // 生成预约确认信息
    const confirmation = {
      appointmentId: appointment._id,
      consultant: consultant.name,
      date,
      time,
      duration: `${duration}分钟`,
      price: consultant.price,
      nextSteps: [
        '请在预约时间前10分钟准备好',
        '确保网络连接稳定',
        '准备一个安静私密的环境',
        '提前思考你想要讨论的问题'
      ],
      contact: '如有问题请联系：400-xxx-xxxx'
    };
    
    res.status(201).json({
      success: true,
      message: '预约成功',
      data: appointment,
      confirmation
    });
  } catch (error) {
    console.error('预约咨询师错误:', error);
    res.status(500).json({ success: false, error: '预约咨询师失败' });
  }
});

// 获取用户的预约记录 - 需要认证
router.get('/appointments/my', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id.toString(); // 使用真实的用户ID
    const { status } = req.query;
    
    let userAppointments = appointments.filter(app => app.userId === userId && app.status !== 'cancelled');
    
    // 按状态过滤
    if (status) {
      userAppointments = userAppointments.filter(app => app.status === status);
    }
    
    // 按时间排序（最近的在前）
    userAppointments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      success: true,
      data: userAppointments,
      stats: {
        total: userAppointments.length,
        pending: userAppointments.filter(app => app.status === 'pending').length,
        confirmed: userAppointments.filter(app => app.status === 'confirmed').length,
        completed: userAppointments.filter(app => app.status === 'completed').length
      }
    });
  } catch (error) {
    console.error('获取预约记录错误:', error);
    res.status(500).json({ success: false, error: '获取预约记录失败' });
  }
});

// 取消预约 - 需要认证
router.put('/appointments/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString(); // 使用真实的用户ID
    
    const appointmentIndex = appointments.findIndex(app => 
      app._id === id && app.userId === userId
    );
    
    if (appointmentIndex === -1) {
      return res.status(404).json({
        success: false,
        error: '预约不存在或无权取消'
      });
    }
    
    // 暂时移除24小时限制检查，因为使用的是模拟数据
    // const appointment = appointments[appointmentIndex];
    // const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
    // const now = new Date();
    // const hoursDiff = (appointmentDateTime - now) / (1000 * 60 * 60);
    // 
    // if (hoursDiff < 24) {
    //   return res.status(400).json({
    //     success: false,
    //     error: '距离预约时间不足24小时，无法取消'
    //   });
    // }
    
    // 更新状态
    appointments[appointmentIndex].status = 'cancelled';
    appointments[appointmentIndex].cancelledAt = new Date();
    
    res.json({
      success: true,
      message: '预约已取消',
      data: appointments[appointmentIndex],
      refundInfo: '如需退款，请联系客服'
    });
  } catch (error) {
    console.error('取消预约错误:', error);
    res.status(500).json({ success: false, error: '取消预约失败' });
  }
});

// 辅助函数：生成可用时间段
function generateAvailableSlots(consultantId) {
  const slots = [];
  const now = new Date();
  
  // 生成未来7天的可预约时间
  for (let i = 1; i <= 7; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    const dateString = date.toISOString().split('T')[0];
    
    // 每天的可用时间段
    const times = ['09:00', '10:30', '14:00', '15:30', '17:00'];
    
    times.forEach(time => {
      // 检查该时间段是否已被预约
      const isAlreadyBooked = appointments.some(app => 
        app.consultantId === consultantId &&
        app.date === dateString &&
        app.time === time &&
        app.status !== 'cancelled'
      );
      
      // 如果已被预约，则不可用
      const isAvailable = !isAlreadyBooked && Math.random() > 0.3;
      
      slots.push({
        date: dateString,
        time,
        available: isAvailable,
        consultantId
      });
    });
  }
  
  return slots;
}

// 辅助函数：生成评价
function generateReviews(consultantId) {
  const reviewTemplates = [
    { name: "匿名用户", rating: 5, comment: "非常有帮助，老师很有耐心", date: "2024-01-15" },
    { name: "学生A", rating: 4, comment: "给了我很多实用的建议", date: "2024-01-10" },
    { name: "学生B", rating: 5, comment: "咨询后感觉轻松多了，强烈推荐", date: "2024-01-05" },
    { name: "匿名用户", rating: 4, comment: "专业且亲切，体验很好", date: "2023-12-28" },
    { name: "学生C", rating: 5, comment: "帮我解决了困扰很久的问题", date: "2023-12-20" }
  ];
  
  return reviewTemplates.map(review => ({
    ...review,
    consultantId
  }));
}

export default router;