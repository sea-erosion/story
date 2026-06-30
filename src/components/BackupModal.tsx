// 作成日: 2026-06-30
'use client';

import { useEffect, useState } from 'react';
import { useNovelStore } from '@/store/useNovelStore';
import {
  getBackups,
  createBackup as createBackupEntry,
  deleteBackup as deleteBackupEntry,
} from '@/lib/backup';
import { migrateData } from '@/lib/storage';
import { downloadBlob } from '@/lib/format';
import type { BackupEntry } from '@/types/novel';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function BackupModal({ open, onClose }: Props) {
  const data = useNovelStore((s) => s.data);
  const replaceData = useNovelStore((s) => s.replaceData);
  const notify = useNovelStore((s) => s.notify);
  const [backups, setBackups] = useState<BackupEntry[]>([]);

  useEffect(() => {
    if (open) setBackups(getBackups());
  }, [open]);

  if (!open) return null;

  const handleCreate = () => {
    setBackups(createBackupEntry(data));
    notify('バックアップを作成しました');
  };

  const handleRestore = (entry: BackupEntry) => {
    if (!confirm(`「${entry.date}」のバックアップに復元しますか？\n現在の内容は上書きされます。`)) return;
    try {
      const restored = migrateData(JSON.parse(entry.snapshot));
      replaceData(restored);
      onClose();
      notify('復元しました');
    } catch {
      notify('復元に失敗しました');
    }
  };

  const handleDelete = (id: number) => {
    if (!confirm('このバックアップを削除しますか？')) return;
    setBackups(deleteBackupEntry(id));
  };

  const handleExportAll = () => {
    const payload = { exportedAt: new Date().toISOString(), current: data, backups: getBackups() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `${data.settings.title || 'novel'}_backup_${Date.now()}.json`);
    notify('エクスポートしました');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const payload = JSON.parse(text);
        const imported = payload.current || payload;
        if (!imported.chapters && !imported.scenes) throw new Error('invalid');
        if (!confirm('インポートしますか？現在の内容は上書きされます。')) return;
        replaceData(migrateData(imported));
        onClose();
        notify('インポートしました');
      } catch {
        notify('ファイルの読み込みに失敗しました');
      }
    };
    input.click();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">バックアップ管理</span>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-actions">
          <button className="top-btn save" style={{ fontSize: 11 }} onClick={handleCreate}>
            ✦ 今すぐバックアップ
          </button>
          <button className="top-btn primary" style={{ fontSize: 11 }} onClick={handleExportAll}>
            全件エクスポート(.json)
          </button>
          <button className="top-btn" style={{ fontSize: 11 }} onClick={handleImport}>
            ファイルから復元
          </button>
        </div>
        <div className="modal-hint">最大20件保存（古いものから自動削除）</div>
        <div className="backup-list">
          {backups.length === 0 ? (
            <div className="backup-empty">バックアップがありません</div>
          ) : (
            backups.map((b) => (
              <div className="backup-row" key={b.id}>
                <div className="backup-row-info">
                  <div className="backup-row-title">{b.title}</div>
                  <div className="backup-row-meta">
                    {b.date}　{b.chapterCount}章 / {b.episodeCount}話 / {b.charCount.toLocaleString()}字
                  </div>
                </div>
                <button className="backup-restore-btn" onClick={() => handleRestore(b)}>
                  復元
                </button>
                <button className="backup-delete-btn" onClick={() => handleDelete(b.id)}>
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
