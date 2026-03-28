import React, { useEffect, useState } from 'react';
import { Cloud, CloudOff } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const Header: React.FC = () => {
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getPageTitle = () => {
    if (location.pathname === '/') return 'Dashboard';
    if (location.pathname.startsWith('/books/')) return 'Book Details';
    if (location.pathname === '/books') return 'My Books';
    if (location.pathname === '/settings') return 'Settings';
    return '';
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 lg:px-8 glass border-x-0 border-t-0 border-b border-white/10 z-10 sticky top-0 shrink-0">
      <h2 className="text-xl font-semibold text-white">
        {getPageTitle()}
      </h2>
      
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass bg-white/5 text-sm">
        {isOnline ? (
          <>
            <Cloud size={16} className="text-emerald-400" />
            <span className="text-emerald-400 font-medium hidden sm:inline">Synced</span>
          </>
        ) : (
          <>
            <CloudOff size={16} className="text-white/40" />
            <span className="text-white/40 font-medium hidden sm:inline">Offline</span>
          </>
        )}
      </div>
    </header>
  );
};
