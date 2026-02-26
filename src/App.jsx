import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useTheme } from './contexts/ThemeContext';
import Navbar from './components/Layout/Navbar';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import TreeHole from './pages/TreeHole/TreeHole';
import Clinic from './pages/Clinic/Clinic';
import Mindfulness from './pages/Mindfulness/Mindfulness';
import Resources from './pages/Resources/Resources';
import Profile from './pages/Users/Profile';
import Badges from './pages/Users/Badges';
import MoodHistory from './pages/Users/MoodHistory';
import Dashboard from './pages/Users/Dashboard';
import DataExport from './pages/Users/DataExport';

function AppContent() {
  const { theme } = useTheme();

  return (
    <Router>
      <div
        className="min-h-screen"
        style={{
          background: theme.colors.background,
          backgroundImage: theme.colors.gradient,
          backgroundSize: 'cover',
          backgroundAttachment: 'fixed',
        }}
      >
        <Navbar />
        <div className="p-4 max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/treehole" element={<TreeHole />} />
            <Route path="/clinic" element={<Clinic />} />
            <Route path="/mindfulness" element={<Mindfulness />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/users/profile" element={<Profile />} />
            <Route path="/users/badges" element={<Badges />} />
            <Route path="/users/mood-history" element={<MoodHistory />} />
            <Route path="/users/dashboard" element={<Dashboard />} />
            <Route path="/users/data-export" element={<DataExport />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;