import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import DesignTokens from '../../constants/DesignTokens';
import PageTransition from '../../components/Transition/PageTransition';

const DataExport = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('export');
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [selectedDataTypes, setSelectedDataTypes] = useState(new Set(['mindfulness', 'mood', 'treehole']));
  const [timeRange, setTimeRange] = useState('30d');
  const [privacySettings, setPrivacySettings] = useState({
    includePersonalInfo: false,
    anonymizeData: true,
    includeMetadata: true
  });
  const [exportHistory, setExportHistory] = useState([]);

  // 模拟导出历史记录
  const generateExportHistory = () => {
    return [
      {
        id: 1,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        type: 'PDF',
        dataTypes: ['正念练习', '心情记录'],
        status: 'completed',
        fileSize: '2.4 MB'
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        type: 'CSV',
        dataTypes: ['正念练习'],
        status: 'completed',
        fileSize: '0.8 MB'
      },
      {
        id: 3,
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        type: 'PDF',
        dataTypes: ['正念练习', '心情记录', '树洞帖子'],
        status: 'completed',
        fileSize: '4.2 MB'
      }
    ];
  };

  // 初始化数据
  useEffect(() => {
    setExportHistory(generateExportHistory());
  }, []);

  // 处理数据类型选择
  const toggleDataType = (dataType) => {
    setSelectedDataTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dataType)) {
        newSet.delete(dataType);
      } else {
        newSet.add(dataType);
      }
      return newSet;
    });
  };

  // 处理隐私设置变更
  const handlePrivacyChange = (key, value) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // 模拟导出过程
  const handleExport = async () => {
    if (selectedDataTypes.size === 0) {
      alert('请至少选择一种数据类型');
      return;
    }

    setExporting(true);
    setExportProgress(0);

    // 模拟导出进度
    const progressSteps = [10, 25, 40, 60, 75, 90, 100];
    for (const progress of progressSteps) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setExportProgress(progress);
    }

    // 模拟导出完成
    await new Promise(resolve => setTimeout(resolve, 500));
    setExporting(false);
    setExportProgress(0);

    // 添加到导出历史
    const newExport = {
      id: Date.now(),
      timestamp: new Date(),
      type: exportFormat.toUpperCase(),
      dataTypes: Array.from(selectedDataTypes).map(type => ({
        mindfulness: '正念练习',
        mood: '心情记录',
        treehole: '树洞帖子'
      }[type])),
      status: 'completed',
      fileSize: `${(Math.random() * 3 + 1).toFixed(1)} MB`
    };

    setExportHistory(prev => [newExport, ...prev]);

    alert('导出完成！文件已准备就绪');
  };

  // 数据类型选项
  const dataTypeOptions = [
    { value: 'mindfulness', label: '正念练习', icon: '🧘', description: '包括练习记录、时长统计等' },
    { value: 'mood', label: '心情记录', icon: '😊', description: '包括情绪状态、变化趋势等' },
    { value: 'treehole', label: '树洞帖子', icon: '🌳', description: '包括发布的帖子、评论等' },
    { value: 'stats', label: '统计数据', icon: '📊', description: '包括个人统计、成就等' }
  ];

  // 导出格式选项
  const exportFormatOptions = [
    { value: 'pdf', label: 'PDF文档', icon: '📄', description: '适合打印和存档' },
    { value: 'csv', label: 'CSV数据', icon: '📊', description: '适合Excel等工具分析' },
    { value: 'json', label: 'JSON数据', icon: '💾', description: '适合开发人员使用' }
  ];

  // 时间范围选项
  const timeRangeOptions = [
    { value: '7d', label: '最近7天' },
    { value: '30d', label: '最近30天' },
    { value: '90d', label: '最近90天' },
    { value: 'all', label: '全部数据' }
  ];

  return (
    <PageTransition variant="fadeSlideUp" className="min-h-screen">
      <div className="max-w-4xl mx-auto p-4">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-handwriting text-morandi-purple">
            💾 数据导出中心
          </h1>
          <p className="text-gray-600 mt-2">管理和导出你的心理健康数据</p>
        </div>

        {/* 标签页导航 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-8">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'export', label: '导出数据', icon: '📤' },
              { id: 'privacy', label: '隐私设置', icon: '🔒' },
              { id: 'history', label: '导出历史', icon: '📋' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all ${activeTab === tab.id
                  ? 'border-b-2 border-purple-500 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 标签页内容 */}
        <AnimatePresence mode="wait">
          {activeTab === 'export' && (
            <motion.div
              key="export"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-6">导出数据</h3>

              {/* 数据类型选择 */}
              <div className="mb-8">
                <h4 className="font-medium text-gray-700 mb-3">选择数据类型</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dataTypeOptions.map(option => (
                    <div
                      key={option.value}
                      onClick={() => toggleDataType(option.value)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedDataTypes.has(option.value)
                        ? 'bg-purple-50 border-purple-200'
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{option.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium text-gray-800">{option.label}</h5>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedDataTypes.has(option.value)
                              ? 'bg-purple-500 border-purple-500'
                              : 'border-gray-300'
                              }`}>
                              {selectedDataTypes.has(option.value) && (
                                <span className="text-white text-xs">✓</span>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 导出设置 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* 导出格式 */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">导出格式</h4>
                  <div className="space-y-2">
                    {exportFormatOptions.map(format => (
                      <label key={format.value} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="exportFormat"
                          value={format.value}
                          checked={exportFormat === format.value}
                          onChange={() => setExportFormat(format.value)}
                          className="text-purple-500"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span>{format.icon}</span>
                            <span className="font-medium text-gray-800">{format.label}</span>
                          </div>
                          <p className="text-sm text-gray-500">{format.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 时间范围 */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">时间范围</h4>
                  <div className="space-y-2">
                    {timeRangeOptions.map(range => (
                      <label key={range.value} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="timeRange"
                          value={range.value}
                          checked={timeRange === range.value}
                          onChange={() => setTimeRange(range.value)}
                          className="text-purple-500"
                        />
                        <span className="font-medium text-gray-800">{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* 导出进度 */}
              <AnimatePresence>
                {exporting && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-blue-800">导出进度</span>
                      <span className="text-blue-800">{exportProgress}%</span>
                    </div>
                    <div className="w-full bg-blue-100 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${exportProgress}%` }}
                        transition={{ duration: 0.3 }}
                        className="bg-blue-500 h-2 rounded-full"
                      ></motion.div>
                    </div>
                    <p className="mt-2 text-sm text-blue-700">
                      {exportProgress < 100 ? '正在处理数据，请稍候...' : '导出完成！'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 导出按钮 */}
              <div className="flex justify-center">
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className={`px-8 py-3 rounded-lg font-medium transition-all ${exporting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-purple-500 text-white hover:bg-purple-600 shadow-lg hover:shadow-xl'
                    }`}
                >
                  {exporting ? '导出中...' : '开始导出'}
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'privacy' && (
            <motion.div
              key="privacy"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-6">隐私设置</h3>

              <div className="space-y-6">
                {/* 隐私选项 */}
                {[
                  {
                    key: 'includePersonalInfo',
                    label: '包含个人信息',
                    description: '包括用户名、邮箱等个人标识信息',
                    default: false
                  },
                  {
                    key: 'anonymizeData',
                    label: '匿名化数据',
                    description: '移除个人标识，仅保留数据内容',
                    default: true
                  },
                  {
                    key: 'includeMetadata',
                    label: '包含元数据',
                    description: '包括时间戳、设备信息等',
                    default: true
                  }
                ].map(option => (
                  <div key={option.key} className="p-4 rounded-lg border border-gray-200">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={privacySettings[option.key]}
                        onChange={(e) => handlePrivacyChange(option.key, e.target.checked)}
                        className="mt-1 text-purple-500"
                      />
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-800">{option.label}</h5>
                        <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 隐私说明 */}
              <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">隐私说明</h4>
                <p className="text-sm text-yellow-700">
                  导出的数据包含你的个人心理健康记录，请妥善保管。建议在公共场合分享前使用匿名化选项，保护你的隐私安全。
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-6">导出历史</h3>

              {exportHistory.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">📋</div>
                  <p className="text-gray-500">暂无导出记录</p>
                  <p className="text-gray-400 text-sm mt-2">开始导出数据以查看历史记录</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {exportHistory.map(exportItem => (
                    <div
                      key={exportItem.id}
                      className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">
                            {exportItem.type === 'PDF' ? '📄' : exportItem.type === 'CSV' ? '📊' : '💾'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-medium text-gray-800">
                                {exportItem.type} 导出
                              </h5>
                              <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                                {exportItem.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {exportItem.timestamp.toLocaleString('zh-CN')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">{exportItem.fileSize}</p>
                          <button className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded hover:bg-blue-200 transition-colors">
                            下载
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex flex-wrap gap-2">
                          {exportItem.dataTypes.map((type, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

export default DataExport;