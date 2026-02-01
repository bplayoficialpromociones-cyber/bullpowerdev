import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminUser } from '../types/auth';

interface AuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  login: (userData: AdminUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INACTIVITY_TIMEOUT = 15 * 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);

  const markOffline = async (userId: string) => {
    try {
      await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/user-heartbeat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ userId, disconnect: true }),
          keepalive: true,
        }
      );
    } catch (error) {
      console.error('Mark offline error:', error);
    }
  };

  const handleLogout = async () => {
    if (user?.id) {
      await markOffline(user.id);
    }

    localStorage.removeItem('bull-power-auth');
    setUser(null);
    navigate('/login');
  };

  const resetInactivityTimer = () => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }

    inactivityTimer.current = setTimeout(() => {
      handleLogout();
    }, INACTIVITY_TIMEOUT);
  };

  const login = (userData: AdminUser) => {
    localStorage.setItem('bull-power-auth', JSON.stringify(userData));
    setUser(userData);
    resetInactivityTimer();
  };

  const logout = () => {
    handleLogout();
  };

  useEffect(() => {
    const authData = localStorage.getItem('bull-power-auth');
    if (authData) {
      try {
        const userData = JSON.parse(authData);
        setUser(userData);
        resetInactivityTimer();
      } catch (error) {
        console.error('Error parsing auth data:', error);
        localStorage.removeItem('bull-power-auth');
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!user) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      resetInactivityTimer();
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    resetInactivityTimer();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
