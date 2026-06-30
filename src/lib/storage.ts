// 作成日: 2026-06-30
// localStorage への保存・読込、および旧バージョンのデータ構造からの移行処理

import type { NovelData } from '@/types/novel';

export const DATA_KEY = 'novel_data';

export function defaultData(): NovelData {
  return {
    chapters: [
      {
        id: 1,
        title: '第一章',
        episodes: [{ id: 1, title: '第一話', content: '' }],
      },
    ],
    chars: [],
    settings: { title: '', genre: '', world: '', synopsis: '', memo: '' },
    goal: { target: 0, daily: 0 },
    dailyLog: [],
  };
}

/**
 * 旧バージョン（章を持たず scenes 配列のみだった頃）のデータを
 * 現行の chapters/episodes 構造へ移行する。
 */
export function migrateData(raw: unknown): NovelData {
  const d = (raw && typeof raw === 'object' ? raw : {}) as Record<string, any>;

  if (Array.isArray(d.scenes) && !Array.isArray(d.chapters)) {
    d.chapters = [
      {
        id: Date.now(),
        title: '第一章',
        episodes: d.scenes.map((s: any, i: number) => ({
          id: s?.id ?? i,
          title: s?.title || `第${i + 1}話`,
          content: s?.content || '',
        })),
      },
    ];
    delete d.scenes;
  }

  const fallback = defaultData();

  return {
    chapters: Array.isArray(d.chapters) && d.chapters.length > 0 ? d.chapters : fallback.chapters,
    chars: Array.isArray(d.chars) ? d.chars : fallback.chars,
    settings: { ...fallback.settings, ...(d.settings || {}) },
    goal: { ...fallback.goal, ...(d.goal || {}) },
    dailyLog: Array.isArray(d.dailyLog) ? d.dailyLog : fallback.dailyLog,
  };
}

export function loadData(): NovelData {
  if (typeof window === 'undefined') return defaultData();
  try {
    const saved = window.localStorage.getItem(DATA_KEY);
    if (!saved) return defaultData();
    return migrateData(JSON.parse(saved));
  } catch {
    return defaultData();
  }
}

export function saveData(data: NovelData): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(DATA_KEY, JSON.stringify(data));
  } catch {
    // localStorage が使用できない環境（容量超過等）は無視する
  }
}
