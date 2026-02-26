import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useTheme } from '../../contexts/ThemeContext';
import DesignTokens from '../../constants/DesignTokens';

const StatsExport = ({ statsData, timeRange: propTimeRange }) => {
  const { theme } = useTheme();
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('png');
  const [timeRange, setTimeRange] = useState(propTimeRange || '7d');
  const [exportProgress, setExportProgress] = useState(0);

  // 当 propTimeRange 变化时更新本地状态
  useEffect(() => {
    if (propTimeRange) {
      setTimeRange(propTimeRange);
    }
  }, [propTimeRange]);

  // 测试数据（用于调试）
  const testData = {
    dailyStats: [
      { date: '2026-01-29', count: 6, totalMinutes: 1.1, totalSeconds: 69 }
    ],
    totalSessions: 6,
    totalSeconds: 69,
    totalMinutes: 1.1,
    avgDuration: 11.5
  };

  // 调试日志
  useEffect(() => {
    console.log('StatsExport 接收到的数据:', statsData);
    console.log('使用的实际数据:', statsData || testData);
    console.log('dailyStats:', (statsData || testData).dailyStats);
    console.log('dailyStats 长度:', (statsData || testData).dailyStats.length);
  }, [statsData]);

  // 生成CSV数据
  const generateCSV = () => {
    const data = statsData || testData;
    if (!data || !data.dailyStats || data.dailyStats.length === 0) {
      console.log('没有数据可导出:', data);
      return '';
    }

    const headers = ['日期', '练习次数', '总时长（分钟）'];
    const rows = data.dailyStats.map(day => [
      day.date,
      day.count,
      day.totalMinutes
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    console.log('生成的CSV数据:', csvContent);
    return csvContent;
  };

  // 导出为PNG
  const exportAsPNG = async () => {
    try {
      setExporting(true);
      setExportProgress(20);

      console.log('开始PNG导出...');
      console.log('当前数据:', statsData || testData);

      setExportProgress(40);

      // 创建一个临时的HTML内容，包含所有需要的统计信息
      const tempContainer = document.createElement('div');
      tempContainer.style.cssText = `
        width: 800px;
        padding: 40px;
        background: white;
        font-family: 'Microsoft YaHei', 'SimHei', Arial, sans-serif;
        color: #333;
        position: absolute;
        left: -9999px;
        top: 0;
      `;

      const data = statsData || testData;

      console.log('准备生成HTML内容...');

      tempContainer.innerHTML = `
        <div style="padding: 20px; background: #f9fafb; border-radius: 12px; margin-bottom: 20px;">
          <h1 style="text-align: center; color: #7c3aed; font-size: 24px; margin-bottom: 20px;">正念练习统计报告</h1>
          <p style="text-align: center; color: #6b7280; margin-bottom: 20px;">生成日期: ${new Date().toLocaleString('zh-CN')}</p>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="color: #4b5563; font-size: 20px; margin-bottom: 15px;">📊 统计概览</h2>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 15px;">
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="font-size: 32px; margin-bottom: 10px;">🎯</div>
              <div style="color: #6b7280; font-size: 14px; margin-bottom: 5px;">总练习次数</div>
              <div style="color: #1f2937; font-size: 28px; font-weight: bold;">${data?.totalSessions || 0}</div>
            </div>
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="font-size: 32px; margin-bottom: 10px;">⏱️</div>
              <div style="color: #6b7280; font-size: 14px; margin-bottom: 5px;">累计练习时间</div>
              <div style="color: #1f2937; font-size: 28px; font-weight: bold;">${data?.totalMinutes || 0} 分钟</div>
            </div>
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="font-size: 32px; margin-bottom: 10px;">📈</div>
              <div style="color: #6b7280; font-size: 14px; margin-bottom: 5px;">平均练习时长</div>
              <div style="color: #1f2937; font-size: 28px; font-weight: bold;">${Math.round((data?.avgDuration || 0) / 60)} 分钟</div>
            </div>
          </div>
        </div>

        <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #4b5563; font-size: 20px; margin-bottom: 20px;">📅 每日练习明细</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="border: 1px solid #e5e7eb; padding: 12px; text-align: left; color: #374151; font-weight: bold;">日期</th>
                <th style="border: 1px solid #e5e7eb; padding: 12px; text-align: left; color: #374151; font-weight: bold;">练习次数</th>
                <th style="border: 1px solid #e5e7eb; padding: 12px; text-align: left; color: #374151; font-weight: bold;">总时长（分钟）</th>
              </tr>
            </thead>
            <tbody>
              ${data?.dailyStats?.map(day => `
                <tr style="${day.date === data?.dailyStats[0]?.date ? 'background: #f9fafb;' : ''}">
                  <td style="border: 1px solid #e5e7eb; padding: 12px;">${day.date}</td>
                  <td style="border: 1px solid #e5e7eb; padding: 12px;">${day.count}</td>
                  <td style="border: 1px solid #e5e7eb; padding: 12px;">${day.totalMinutes}</td>
                </tr>
              `).join('') || `
                <tr>
                  <td colspan="3" style="border: 1px solid #e5e7eb; padding: 20px; text-align: center; color: #9ca3af;">暂无数据</td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      `;

      console.log('HTML内容生成完成');
      console.log('HTML长度:', tempContainer.innerHTML.length);

      document.body.appendChild(tempContainer);

      setExportProgress(60);

      console.log('开始使用html2canvas捕获...');

      // 使用html2canvas捕获内容
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true
      });

      console.log('html2canvas捕获成功');
      console.log('Canvas尺寸:', canvas.width, canvas.height);

      document.body.removeChild(tempContainer);

      setExportProgress(80);

      // 转换为图片并下载
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `正念练习统计_${new Date().toISOString().split('T')[0]}.png`;
      link.href = image;
      link.click();

      console.log('PNG导出完成');

      setExportProgress(100);
      setTimeout(() => {
        setExporting(false);
        setExportProgress(0);
      }, 500);
    } catch (error) {
      console.error('导出PNG失败:', error);
      console.error('错误详情:', error.message, error.stack);
      setExporting(false);
      setExportProgress(0);
      alert('导出失败，请重试');
    }
  };

  // 导出为CSV
  const exportAsCSV = () => {
    try {
      setExporting(true);
      setExportProgress(50);

      const csvContent = generateCSV();
      
      if (!csvContent || csvContent.trim() === '') {
        console.error('CSV内容为空');
        alert('没有数据可导出');
        setExporting(false);
        setExportProgress(0);
        return;
      }
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `正念练习统计_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportProgress(100);
      setTimeout(() => {
        setExporting(false);
        setExportProgress(0);
      }, 500);
    } catch (error) {
      console.error('导出CSV失败:', error);
      setExporting(false);
      setExportProgress(0);
      alert('导出失败，请重试');
    }
  };

  // 处理导出
  const handleExport = () => {
    switch (exportFormat) {
      case 'png':
        exportAsPNG();
        break;
      case 'csv':
        exportAsCSV();
        break;
      default:
        break;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="town-card p-6"
    >
      <h3 className="text-xl font-handwriting text-morandi-purple mb-4">
        💾 数据导出
      </h3>
      
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* 导出格式选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              导出格式
            </label>
            <div className="flex gap-2">
              {[
                { value: 'png', label: 'PNG图片', icon: '🖼️' },
                { value: 'csv', label: 'CSV数据', icon: '📊' }
              ].map(format => (
                <button
                  key={format.value}
                  onClick={() => setExportFormat(format.value)}
                  className={`px-3 py-2 rounded-lg text-sm flex items-center gap-1 transition-all ${exportFormat === format.value
                    ? 'bg-purple-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  <span>{format.icon}</span>
                  <span>{format.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 时间范围选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              时间范围
            </label>
            <div className="flex gap-2">
              {[
                { value: '7d', label: '7天' },
                { value: '30d', label: '30天' },
                { value: '90d', label: '90天' }
              ].map(range => (
                <button
                  key={range.value}
                  onClick={() => setTimeRange(range.value)}
                  className={`px-3 py-2 rounded-lg text-sm transition-all ${timeRange === range.value
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* 导出按钮 */}
          <div className="flex items-end">
            <button
              onClick={handleExport}
              disabled={exporting}
              className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${exporting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-purple-500 text-white hover:bg-purple-600 shadow-lg hover:shadow-xl'
                }`}
            >
              {exporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>导出中...</span>
                </>
              ) : (
                <>
                  <span>📤</span>
                  <span>导出数据</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 导出进度 */}
        <AnimatePresence>
          {exporting && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>导出进度</span>
                <span>{exportProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${exportProgress}%` }}
                  transition={{ duration: 0.3 }}
                  className="bg-purple-500 h-2 rounded-full"
                ></motion.div>
              </div>
              <p className="mt-2 text-sm text-gray-500 text-center">
                {exportProgress < 100 ? '正在处理，请稍候...' : '导出完成！'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 导出说明 */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">📋 导出说明</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• PNG格式：导出当前页面的图表和统计数据为图片</li>
            <li>• CSV格式：导出原始数据，可用于Excel等工具分析</li>
            <li>• 导出过程可能需要几秒钟，请耐心等待</li>
            <li>• 建议使用Chrome或Firefox浏览器以获得最佳效果</li>
          </ul>
        </div>

        {/* 数据预览 */}
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">👀 数据预览</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs text-gray-600">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-3 py-2 rounded-l-lg">日期</th>
                  <th className="px-3 py-2">练习次数</th>
                  <th className="px-3 py-2 rounded-r-lg">总时长（分钟）</th>
                </tr>
              </thead>
              <tbody>
                {((statsData || testData).dailyStats && (statsData || testData).dailyStats.length > 0) ? (
                  (statsData || testData).dailyStats.slice(0, 5).map((day, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-2">{day.date}</td>
                      <td className="px-3 py-2">{day.count}</td>
                      <td className="px-3 py-2">{day.totalMinutes}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-3 py-4 text-center text-gray-400">
                      暂无数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {((statsData || testData).dailyStats && (statsData || testData).dailyStats.length > 5) && (
            <p className="mt-2 text-xs text-gray-500 text-center">
              显示前5条记录，共 {(statsData || testData).dailyStats.length} 条
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default StatsExport;