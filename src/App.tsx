import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ContestantProvider, useContestant } from './context/ContestantContext';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';
import './pages/Dashboard.css';
import './pages/AdminLogin.css';
import './pages/RegistrationInfo.css';

// ===== 測試模式開關，正式上線請設為 false =====
// TODO: 上線時請設為 false，或移除此段
const TEST_MODE = true;

// 懶加載頁面組件
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const RegistrationInfo = lazy(() => import('./pages/RegistrationInfo'));

// ===== 用戶登入頁面（可擴充第三方登入、驗證碼等） =====
const LoginPage: React.FC = () => {
  const [idNumber, setIdNumber] = useState('');
  const [name, setName] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { contests, currentContestId, setCurrentContestId } = useContestant();
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/registration');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Macau',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      const formatter = new Intl.DateTimeFormat('zh-TW', options);
      setCurrentTime(formatter.format(now));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleIdNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '');
    setIdNumber(value);
  };

  // ===== 登入驗證邏輯，支援多比賽與測試模式 =====
  // TODO: 可在此加入第三方登入、驗證碼、忘記密碼等功能
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    // ===== 測試模式：允許 TEST/TEST 登入（正式上線請移除） =====
    if (TEST_MODE && idNumber === 'TEST' && name === 'TEST') {
      await login(idNumber, name);
      return;
    }
    // 多比賽登入驗證
    const contest = contests.find(c => c.id === currentContestId);
    if (!contest) {
      setLoginError('請選擇比賽');
      return;
    }
    const found = contest.contestants.find(c => c.idNumber === idNumber && c.name === name);
    if (found) {
      await login(idNumber, name); // 仍用原 login，後期可優化
    } else {
      setLoginError('證件號碼或姓名錯誤，請確認您的報名資料與所選比賽');
    }
  };

  return (
    <div className="App">
      <nav className="navbar">
        <div className="nav-brand">澳門學聯電子參賽證管理系統</div>
        <div className="nav-time">{currentTime}</div>
      </nav>
      <main className="main-content">
        <div className="login-container">
          <h1>登入系統</h1>
          <form onSubmit={handleLogin} className="login-form">
            {/* TODO: 可擴充比賽搜尋、排序、分組等功能 */}
            <div className="form-group">
              <label htmlFor="contest">選擇比賽</label>
              <select
                id="contest"
                value={currentContestId}
                onChange={e => setCurrentContestId(e.target.value)}
                required
              >
                {contests.map(contest => (
                  <option key={contest.id} value={contest.id}>{contest.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="idNumber">報名使用之證件號碼(不須輸入符號)</label>
              <input
                type="text"
                id="idNumber"
                value={idNumber}
                onChange={handleIdNumberChange}
                placeholder="如1234567(8)，則輸入12345678"
                maxLength={32}
                required
              />
              {idNumber && idNumber.length < 8 && (
                <span className="hint">請輸入完整的證件號碼</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="name">姓名</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="請輸入姓名"
                required
              />
            </div>
            {loginError && <div style={{ color: 'red', marginBottom: 8 }}>{loginError}</div>}
            <button type="submit" className="login-button">
              登入
            </button>
          </form>
          <div className="admin-link">
            <Link to="/admin">管理員登入</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

// ===== 路由保護元件（可擴充權限分級） =====
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // TODO: 可擴充更多權限驗證邏輯
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/" />;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // TODO: 可擴充超級管理員、審核員等權限
  const { isAdmin } = useAuth();
  return isAdmin ? <>{children}</> : <Navigate to="/admin" />;
};

// 載入中組件
const LoadingFallback = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p>載入中...</p>
  </div>
);

// ===== App 主體（可擴充多語系、全局訊息、全局設定等） =====
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ContestantProvider>
          <Router>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* TODO: 未來可加入更多頁面，如：用戶中心、比賽公告、FAQ 等 */}
                <Route path="/" element={<LoginPage />} />
                <Route path="/admin" element={<AdminLogin />} />
                <Route
                  path="/dashboard"
                  element={
                    <AdminRoute>
                      <Dashboard />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/registration"
                  element={
                    <PrivateRoute>
                      <RegistrationInfo />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </Suspense>
          </Router>
        </ContestantProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
