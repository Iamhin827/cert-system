import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: {
    idNumber: string;
    name: string;
  } | null;
  login: (idNumber: string, name: string) => Promise<void>;
  loginAdmin: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<{ idNumber: string; name: string } | null>(null);

  const login = async (idNumber: string, name: string) => {
    // 只允許 TEST/TEST 登入
    if (idNumber === 'TEST' && name === 'TEST') {
      setUser({ idNumber, name });
      setIsAuthenticated(true);
      setIsAdmin(false);
    } else {
      alert('帳號或姓名錯誤，請輸入測試帳號 TEST/TEST');
      setIsAuthenticated(false);
      setIsAdmin(false);
    }
  };

  const loginAdmin = async (username: string, password: string) => {
    if (username === 'Admin' && password === 'admin') {
      setIsAdmin(true);
      setIsAuthenticated(false);
      setUser(null);
    } else {
      alert('管理員帳號或密碼錯誤，請輸入 Admin/admin');
      setIsAdmin(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, user, login, loginAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 