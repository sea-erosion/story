// 作成日: 2026-06-30
// アプリ全体の状態管理（Zustand）
// 原本（シングルHTML版）の data オブジェクト + グローバル関数群を
// React の作法に合わせてストアのstate/actionsとして再構成したもの。
// 本文のUNDO/REDO履歴もここで一元管理し、「現在選択中の話」が切り替わるたびにリセットする。

import { create } from 'zustand';
import type {
  NovelData,
  CharacterInfo,
  NovelSettings,
  Goal,
  RightPanelTab,
  TopViewTab,
} from '@/types/novel';
import { defaultData, loadData, saveData } from '@/lib/storage';
import { totalCharCount } from '@/lib/backup';

const MAX_HISTORY = 80;

interface NotificationState {
  id: number;
  message: string;
}

interface NovelStore {
  data: NovelData;
  hydrated: boolean;
  curChapter: number;
  curEpisode: number;
  topTab: TopViewTab;
  rightTab: RightPanelTab;
  fontSize: number;
  notification: NotificationState | null;

  /** 現在の話本文のUNDO履歴（末尾が現在値） */
  history: string[];
  /** REDOスタック */
  future: string[];

  hydrate: () => void;
  replaceData: (data: NovelData) => void;

  setCurrent: (ci: number, ei: number) => void;
  setTopTab: (tab: TopViewTab) => void;
  setRightTab: (tab: RightPanelTab) => void;
  setFontSize: (size: number) => void;

  /** 本文を更新し、変更があればUNDO履歴に積む（通常の入力・読込・置換で使用） */
  commitEpisodeContent: (content: string) => void;
  undo: () => void;
  redo: () => void;

  updateEpisodeTitle: (title: string) => void;

  addChapter: () => void;
  addEpisode: (ci: number) => void;
  removeChapter: (ci: number) => boolean;
  removeEpisode: (ci: number, ei: number) => boolean;
  renameChapter: (ci: number, title: string) => void;
  renameEpisode: (ci: number, ei: number, title: string) => void;

  addChar: () => void;
  removeChar: (index: number) => void;
  updateChar: (index: number, key: keyof CharacterInfo, value: string) => void;

  updateSettings: (patch: Partial<NovelSettings>) => void;
  updateGoal: (patch: Partial<Goal>) => void;
  recordDaily: () => void;

  notify: (message: string) => void;
  clearNotification: () => void;
}

function persist(data: NovelData) {
  saveData(data);
}

/** chapters配列の中の指定話だけを差し替えた新しいdataを作る内部ヘルパー */
function withEpisodeContent(data: NovelData, ci: number, ei: number, content: string): NovelData {
  const chapters = [...data.chapters];
  const episodes = [...chapters[ci].episodes];
  episodes[ei] = { ...episodes[ei], content };
  chapters[ci] = { ...chapters[ci], episodes };
  return { ...data, chapters };
}

export const useNovelStore = create<NovelStore>((set, get) => ({
  data: defaultData(),
  hydrated: false,
  curChapter: 0,
  curEpisode: 0,
  topTab: 'editor',
  rightTab: 'char',
  fontSize: 18,
  notification: null,
  history: [''],
  future: [],

  hydrate: () => {
    if (get().hydrated) return;
    const data = loadData();
    const firstContent = data.chapters[0]?.episodes[0]?.content || '';
    set({ data, hydrated: true, history: [firstContent], future: [] });
  },

  replaceData: (data) => {
    persist(data);
    const firstContent = data.chapters[0]?.episodes[0]?.content || '';
    set({ data, curChapter: 0, curEpisode: 0, history: [firstContent], future: [] });
  },

  setCurrent: (ci, ei) => {
    const { data } = get();
    const content = data.chapters[ci]?.episodes[ei]?.content || '';
    set({ curChapter: ci, curEpisode: ei, history: [content], future: [] });
  },

  setTopTab: (tab) => set({ topTab: tab }),
  setRightTab: (tab) => set({ rightTab: tab }),
  setFontSize: (size) => set({ fontSize: size }),

  commitEpisodeContent: (content) => {
    const { data, curChapter, curEpisode, history } = get();
    const next = withEpisodeContent(data, curChapter, curEpisode, content);
    persist(next);

    if (content !== history[history.length - 1]) {
      const nextHistory = [...history, content];
      if (nextHistory.length > MAX_HISTORY) nextHistory.shift();
      set({ data: next, history: nextHistory, future: [] });
    } else {
      set({ data: next });
    }
  },

  undo: () => {
    const { history, future, data, curChapter, curEpisode } = get();
    if (history.length <= 1) return;
    const popped = history[history.length - 1];
    const newHistory = history.slice(0, -1);
    const prevContent = newHistory[newHistory.length - 1];
    const next = withEpisodeContent(data, curChapter, curEpisode, prevContent);
    persist(next);
    set({ data: next, history: newHistory, future: [...future, popped] });
  },

  redo: () => {
    const { history, future, data, curChapter, curEpisode } = get();
    if (future.length === 0) return;
    const restored = future[future.length - 1];
    const newFuture = future.slice(0, -1);
    const next = withEpisodeContent(data, curChapter, curEpisode, restored);
    persist(next);
    set({ data: next, history: [...history, restored], future: newFuture });
  },

  updateEpisodeTitle: (title) => {
    const { data, curChapter, curEpisode } = get();
    const chapters = [...data.chapters];
    const episodes = [...chapters[curChapter].episodes];
    episodes[curEpisode] = { ...episodes[curEpisode], title };
    chapters[curChapter] = { ...chapters[curChapter], episodes };
    const next = { ...data, chapters };
    persist(next);
    set({ data: next });
  },

  addChapter: () => {
    const { data } = get();
    const ci = data.chapters.length;
    const chapters = [
      ...data.chapters,
      {
        id: Date.now(),
        title: `第${ci + 1}章`,
        episodes: [{ id: Date.now() + 1, title: '第一話', content: '' }],
      },
    ];
    const next = { ...data, chapters };
    persist(next);
    set({ data: next, curChapter: ci, curEpisode: 0, history: [''], future: [] });
  },

  addEpisode: (ci) => {
    const { data } = get();
    const chapters = [...data.chapters];
    const ei = chapters[ci].episodes.length;
    chapters[ci] = {
      ...chapters[ci],
      episodes: [...chapters[ci].episodes, { id: Date.now(), title: `第${ei + 1}話`, content: '' }],
    };
    const next = { ...data, chapters };
    persist(next);
    set({ data: next, curChapter: ci, curEpisode: ei, history: [''], future: [] });
  },

  removeChapter: (ci) => {
    const { data } = get();
    if (data.chapters.length <= 1) return false;
    const chapters = data.chapters.filter((_, i) => i !== ci);
    const nc = Math.min(get().curChapter, chapters.length - 1);
    const next = { ...data, chapters };
    persist(next);
    const content = chapters[nc]?.episodes[0]?.content || '';
    set({ data: next, curChapter: nc, curEpisode: 0, history: [content], future: [] });
    return true;
  },

  removeEpisode: (ci, ei) => {
    const { data } = get();
    if (data.chapters[ci].episodes.length <= 1) return false;
    const chapters = [...data.chapters];
    chapters[ci] = { ...chapters[ci], episodes: chapters[ci].episodes.filter((_, i) => i !== ei) };
    const ne = Math.min(get().curEpisode, chapters[ci].episodes.length - 1);
    const next = { ...data, chapters };
    persist(next);
    const content = chapters[ci]?.episodes[ne]?.content || '';
    set({ data: next, curChapter: ci, curEpisode: ne, history: [content], future: [] });
    return true;
  },

  renameChapter: (ci, title) => {
    const { data } = get();
    const chapters = [...data.chapters];
    chapters[ci] = { ...chapters[ci], title };
    const next = { ...data, chapters };
    persist(next);
    set({ data: next });
  },

  renameEpisode: (ci, ei, title) => {
    const { data } = get();
    const chapters = [...data.chapters];
    const episodes = [...chapters[ci].episodes];
    episodes[ei] = { ...episodes[ei], title };
    chapters[ci] = { ...chapters[ci], episodes };
    const next = { ...data, chapters };
    persist(next);
    set({ data: next });
  },

  addChar: () => {
    const { data } = get();
    const next = { ...data, chars: [...data.chars, { name: '', role: '', age: '', look: '', desc: '' }] };
    persist(next);
    set({ data: next });
  },

  removeChar: (index) => {
    const { data } = get();
    const next = { ...data, chars: data.chars.filter((_, i) => i !== index) };
    persist(next);
    set({ data: next });
  },

  updateChar: (index, key, value) => {
    const { data } = get();
    const chars = [...data.chars];
    chars[index] = { ...chars[index], [key]: value };
    const next = { ...data, chars };
    persist(next);
    set({ data: next });
  },

  updateSettings: (patch) => {
    const { data } = get();
    const next = { ...data, settings: { ...data.settings, ...patch } };
    persist(next);
    set({ data: next });
  },

  updateGoal: (patch) => {
    const { data } = get();
    const next = { ...data, goal: { ...data.goal, ...patch } };
    persist(next);
    set({ data: next });
  },

  recordDaily: () => {
    const { data } = get();
    const total = totalCharCount(data);
    const today = new Date().toLocaleDateString('ja-JP');
    const dailyLog = [...data.dailyLog];
    const idx = dailyLog.findIndex((r) => r.date === today);
    if (idx >= 0) dailyLog[idx] = { ...dailyLog[idx], cnt: total };
    else dailyLog.push({ date: today, cnt: total });
    const trimmed = dailyLog.length > 30 ? dailyLog.slice(-30) : dailyLog;
    const next = { ...data, dailyLog: trimmed };
    persist(next);
    set({ data: next });
    get().notify('記録しました');
  },

  notify: (message) => set({ notification: { id: Date.now(), message } }),
  clearNotification: () => set({ notification: null }),
}));
