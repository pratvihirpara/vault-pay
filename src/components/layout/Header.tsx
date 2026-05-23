import { useState, useEffect, useRef } from 'react';
import { Bell, Search, Sun, Moon, Trash2, Sparkles, Lightbulb, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { NotificationItem } from '@/types';
import { formatDate } from '@/utils/format';
import { cn } from '@/lib/utils';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  onNavigateSection: (section: string) => void;
  activeSection: string;
}

export function Header({
  searchQuery,
  onSearchChange,
  notifications,
  onMarkAsRead,
  onClearAll,
  onNavigateSection,
  activeSection,
}: HeaderProps) {
  const showSearch = activeSection === 'dashboard' || activeSection === 'transactions';
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'security':
        return <ShieldAlert className="h-4 w-4 text-rose-400" />;
      case 'insight':
        return <Sparkles className="h-4 w-4 text-purple-400" />;
      case 'tip':
        return <Lightbulb className="h-4 w-4 text-amber-400" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-blue-400" />;
    }
  };

  const getNotificationStyle = (item: NotificationItem) => {
    if (!item.read) {
      switch (item.type) {
        case 'security':
          return 'bg-rose-950/10 border-l-4 border-l-rose-500';
        case 'insight':
          return 'bg-purple-950/10 border-l-4 border-l-purple-500';
        case 'tip':
          return 'bg-amber-950/10 border-l-4 border-l-amber-500';
        default:
          return 'bg-blue-950/10 border-l-4 border-l-blue-500';
      }
    }
    return 'border-l-4 border-l-transparent opacity-75';
  };

  return (
    <header className="relative h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm flex items-center justify-between px-6 lg:px-8 z-40">
      {/* Search Input — only on Dashboard & Transactions */}
      {showSearch ? (
        <div className="relative w-full max-w-md ml-12 lg:ml-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search by description..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500 focus-visible:ring-blue-500 text-xs sm:text-sm font-medium"
          />
        </div>
      ) : (
        <div className="ml-12 lg:ml-0" />
      )}

      {/* Header controls & dropdown */}
      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Notifications dropdown trigger */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={cn(
              'relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors',
              dropdownOpen && 'bg-slate-800 text-white'
            )}
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-4.5 h-4.5 px-1 bg-[#7C3AED] text-white font-mono text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-850 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Alert Center</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded-full">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                {notifications.length > 0 && (
                  <button
                    onClick={onClearAll}
                    className="flex items-center gap-1 text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                    Clear All
                  </button>
                )}
              </div>

              {/* Notification list */}
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-850">
                {notifications.length === 0 ? (
                  <div className="py-8 px-4 flex flex-col items-center justify-center text-center text-slate-500">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400/50 mb-2" />
                    <span className="text-xs font-bold">You are all caught up!</span>
                    <span className="text-[10px] text-slate-600 mt-0.5">No new system alerts or spending anomalies.</span>
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        onMarkAsRead(item.id);
                        if (item.actionSection) {
                          onNavigateSection(item.actionSection);
                          setDropdownOpen(false);
                        }
                      }}
                      className={cn(
                        'p-4 text-left transition-colors cursor-pointer hover:bg-slate-800/40',
                        getNotificationStyle(item)
                      )}
                    >
                      <div className="flex gap-2.5 items-start">
                        <div className="mt-0.5 shrink-0">{getNotificationIcon(item.type)}</div>
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{item.title}</p>
                          <p className="text-[11px] text-slate-400 leading-normal">{item.message}</p>
                          <p className="text-[9px] text-slate-500 font-mono pt-1">
                            {formatDate(item.created_at)}
                          </p>
                        </div>
                        {!item.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* View all button */}
              <div className="px-4 py-2.5 bg-slate-850 border-t border-slate-800 text-center">
                <button
                  onClick={() => {
                    onNavigateSection('ai-insights');
                    setDropdownOpen(false);
                  }}
                  className="text-[11px] font-bold text-purple-400 hover:text-purple-300 transition-colors inline-flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3" />
                  View All AI Insights & Analytics
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User avatar badge */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
          VP
        </div>
      </div>
    </header>
  );
}
