// 作成日: 2026-06-30
'use client';

import { useEffect } from 'react';
import { useNovelStore } from '@/store/useNovelStore';

export default function Notification() {
  const notification = useNovelStore((s) => s.notification);
  const clearNotification = useNovelStore((s) => s.clearNotification);

  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => clearNotification(), 2000);
    return () => clearTimeout(t);
  }, [notification, clearNotification]);

  if (!notification) return null;

  return <div className="notif">{notification.message}</div>;
}
