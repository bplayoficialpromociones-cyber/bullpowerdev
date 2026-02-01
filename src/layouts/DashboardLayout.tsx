import { ReactNode, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const { user, isLoading, logout } = useAuth();
  const heartbeatIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (!user) return;

    const sendHeartbeat = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/user-heartbeat`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ userId: user.id }),
          }
        );

        const data = await response.json();

        if (data.blocked) {
          console.log('Usuario bloqueado detectado, cerrando sesión...');
          logout();
        }
      } catch (error) {
        console.error('Heartbeat error:', error);
      }
    };

    sendHeartbeat();

    heartbeatIntervalRef.current = window.setInterval(sendHeartbeat, 30000);

    const handleBeforeUnload = async () => {
      try {
        await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/user-heartbeat`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ userId: user.id, disconnect: true }),
            keepalive: true,
          }
        );
      } catch (error) {
        console.error('Disconnect notification error:', error);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }
      } else {
        sendHeartbeat();
        heartbeatIntervalRef.current = window.setInterval(sendHeartbeat, 30000);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-primary)]">
      <Sidebar user={user} onLogout={logout} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
