import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ThemeDropdown from '../Theme/ThemeDropdown';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowDropdown(false);
  };

  const navItems = [
    { name: '🏡 首页', path: '/' },
    { name: '🌳 树洞街巷', path: '/treehole' },
    { name: '🦡 鼹鼠轻诊室', path: '/clinic' },
    { name: '🐻 正念庭院', path: '/mindfulness' },
    { name: '🕊️ 青鸟驿站', path: '/resources' }
  ];

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-3xl">🌸</div>
              <div>
                <h1 className="text-xl font-handwriting text-morandi-purple font-bold">心栖小镇</h1>
                <p className="text-xs text-gray-500">心理健康支持平台</p>
              </div>
            </Link>
          </div>

          {/* 导航链接 */}
          <div className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="nav-item font-medium text-gray-700 hover:text-morandi-purple"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* 用户信息或登录按钮 */}
          <div className="flex items-center space-x-4">
            <div className="relative z-50">
              <ThemeDropdown />
            </div>
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-morandi-purple to-morandi-blue flex items-center justify-center text-white">
                    {user.username?.[0] || 'U'}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-700">欢迎，{user.username}</p>
                    <p className="text-xs text-gray-500">{user.school}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* 下拉菜单 */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.username}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <Link
                      to="/users/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowDropdown(false)}
                    >
                      👤 个人中心
                    </Link>
                    <Link
                      to="/users/mood-history"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowDropdown(false)}
                    >
                      📊 心情记录
                    </Link>
                    <Link
                      to="/users/badges"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowDropdown(false)}
                    >
                      🏆 我的徽章
                    </Link>
                    <Link
                      to="/users/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowDropdown(false)}
                    >
                      📈 个人仪表盘
                    </Link>
                    <Link
                      to="/users/data-export"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowDropdown(false)}
                    >
                      💾 数据导出
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      🚪 退出登录
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="btn-primary px-4 py-2 text-sm"
              >
                登录 / 注册
              </Link>
            )}
          </div>
        </div>

        {/* 移动端导航 */}
        <div className="md:hidden py-2 border-t border-gray-100">
          <div className="flex justify-around">
            {navItems.slice(0, 5).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center text-xs text-gray-600 hover:text-morandi-purple"
              >
                <span className="text-lg">{item.name.split(' ')[0]}</span>
                <span>{item.name.split(' ')[1]}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 点击其他地方关闭下拉菜单 */}
      {showDropdown && (
        <div className="fixed inset-0 z-0" onClick={() => setShowDropdown(false)}></div>
      )}
    </nav>
  );
};

export default Navbar;