import React from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sparkles,
  ShieldAlert,
  CheckCheck,
  X
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

export default function NotificationDropdown({ onClose }) {
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
      case 'milestone':
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'alert':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      default:
        return <Info className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-950/50">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 hover:underline"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/50">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400">All caught up!</p>
            <p className="text-xs text-slate-500 mt-0.5">No new notifications at this time.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.is_read && markAsRead(n.id)}
              className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                n.is_read ? 'opacity-70 hover:opacity-100 hover:bg-slate-800/30' : 'bg-indigo-950/20 hover:bg-indigo-950/30'
              }`}
            >
              <div className="mt-0.5 p-1.5 rounded-lg bg-slate-800 border border-slate-700/60 shrink-0">
                {getNotificationIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs font-semibold text-slate-200 truncate">{n.title}</p>
                  <span className="text-[10px] text-slate-500 whitespace-nowrap">{n.time_ago || 'recent'}</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
              </div>
              {!n.is_read && (
                <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
