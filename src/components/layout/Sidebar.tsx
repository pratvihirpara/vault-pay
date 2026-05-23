import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, ArrowLeftRight, ChartPie as PieChart, Wallet, Settings, ChevronLeft, Menu, LogOut, Users, Activity, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout?: () => void;
  userRole?: 'user' | 'admin';
}

export function Sidebar({ activeSection, onSectionChange, onLogout, userRole }: SidebarProps) {
  const navItems = userRole === 'admin'
    ? [
        { icon: LayoutDashboard, label: 'Admin Overview', id: 'dashboard' },
        { icon: ArrowLeftRight, label: 'System Audit', id: 'transactions' },
        { icon: Activity, label: 'System Health', id: 'analytics' },
        { icon: Users, label: 'User Manager', id: 'users' },
        { icon: Settings, label: 'Settings', id: 'settings' },
      ]
    : [
        { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
        { icon: ArrowLeftRight, label: 'Transactions', id: 'transactions' },
        { icon: PieChart, label: 'Analytics', id: 'analytics' },
        { icon: Wallet, label: 'Wallet', id: 'wallet' },
        { icon: Sparkles, label: 'AI Insights', id: 'ai-insights' },
        { icon: Settings, label: 'Settings', id: 'settings' },
      ];

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-slate-800 p-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300',
          collapsed ? 'w-[68px]' : 'w-[220px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <Wallet className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-semibold text-slate-800 dark:text-white text-sm tracking-tight"
            >
              VaultPay
            </motion.span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onSectionChange(item.id);
                setMobileOpen(false);
              }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                activeSection === item.id
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Logout button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className={cn(
              "w-full flex items-center gap-3 px-3.5 py-3 border-t border-slate-800 text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all duration-200",
              collapsed ? "justify-center" : ""
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        )}

        {/* Collapse button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center gap-2 px-4 py-3 border-t border-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <ChevronLeft
            className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')}
          />
          {!collapsed && <span className="text-xs">Collapse</span>}
        </button>
      </motion.aside>
    </>
  );
}

