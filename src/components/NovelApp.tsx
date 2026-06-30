// 作成日: 2026-06-30
'use client';

import { useEffect, useState } from 'react';
import { useNovelStore } from '@/store/useNovelStore';
import { createBackup } from '@/lib/backup';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import EditorPanel from './EditorPanel';
import RightPanel from './RightPanel';
import BackupModal from './BackupModal';
import Notification from './Notification';

const AUTO_BACKUP_INTERVAL = 30 * 60 * 1000; // 30分

export default function NovelApp() {
  const hydrated = useNovelStore((s) => s.hydrated);
  const hydrate = useNovelStore((s) => s.hydrate);
  const [backupOpen, setBackupOpen] = useState(false);

  // 初回マウント時に localStorage からデータを読み込む
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // 自動バックアップ（30分ごと・離脱直前）
  useEffect(() => {
    const tick = () => {
      const { data } = useNovelStore.getState();
      createBackup(data);
    };
    const id = setInterval(tick, AUTO_BACKUP_INTERVAL);
    window.addEventListener('beforeunload', tick);
    return () => {
      clearInterval(id);
      window.removeEventListener('beforeunload', tick);
    };
  }, []);

  if (!hydrated) {
    return <div className="app-root" style={{ background: 'var(--bg)' }} />;
  }

  return (
    <div className="app-root">
      <TopBar onOpenBackup={() => setBackupOpen(true)} />
      <div className="workspace">
        <Sidebar />
        <div className="panel-area">
          <EditorPanel />
          <RightPanel />
        </div>
      </div>
      <Notification />
      <BackupModal open={backupOpen} onClose={() => setBackupOpen(false)} />
    </div>
  );
}
