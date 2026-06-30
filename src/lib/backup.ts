// 作成日: 2026-06-30
// バックアップ（手動・自動）の保存と読込を行うユーティリティ

import type { BackupEntry, NovelData } from '@/types/novel';

export const BACKUP_KEY = 'novel_backups';
export const MAX_BACKUPS = 20;

export function getBackups(): BackupEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(BACKUP_KEY);
    return raw ? (JSON.parse(raw) as BackupEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveBackups(list: BackupEntry[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(BACKUP_KEY, JSON.stringify(list));
}

export function totalCharCount(data: NovelData): number {
  return data.chapters.reduce(
    (t, ch) => t + ch.episodes.reduce((s, ep) => s + (ep.content || '').length, 0),
    0
  );
}

export function buildBackupEntry(data: NovelData): BackupEntry {
  return {
    id: Date.now(),
    date: new Date().toLocaleString('ja-JP'),
    title: data.settings.title || '無題',
    chapterCount: data.chapters.length,
    episodeCount: data.chapters.reduce((t, ch) => t + ch.episodes.length, 0),
    charCount: totalCharCount(data),
    snapshot: JSON.stringify(data),
  };
}

/** 新しいバックアップを履歴に追加し、最大件数を超えた分を古い順に削除する */
export function createBackup(data: NovelData): BackupEntry[] {
  const list = getBackups();
  list.unshift(buildBackupEntry(data));
  if (list.length > MAX_BACKUPS) list.splice(MAX_BACKUPS);
  saveBackups(list);
  return list;
}

export function deleteBackup(id: number): BackupEntry[] {
  const list = getBackups().filter((b) => b.id !== id);
  saveBackups(list);
  return list;
}
