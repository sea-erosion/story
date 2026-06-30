// 作成日: 2026-06-30
// 小説執筆ツールのデータ構造に関する型定義

export interface Episode {
  id: number;
  title: string;
  content: string;
}

export interface Chapter {
  id: number;
  title: string;
  episodes: Episode[];
}

export interface CharacterInfo {
  name: string;
  role: string;
  age: string;
  look: string;
  desc: string;
}

export interface NovelSettings {
  title: string;
  genre: string;
  world: string;
  synopsis: string;
  memo: string;
}

export interface Goal {
  target: number;
  daily: number;
}

export interface DailyLogEntry {
  date: string;
  cnt: number;
}

export interface NovelData {
  chapters: Chapter[];
  chars: CharacterInfo[];
  settings: NovelSettings;
  goal: Goal;
  dailyLog: DailyLogEntry[];
}

export interface BackupEntry {
  id: number;
  date: string;
  title: string;
  chapterCount: number;
  episodeCount: number;
  charCount: number;
  /** JSON.stringify(NovelData) のスナップショット */
  snapshot: string;
}

/** 右パネルのタブ種別 */
export type RightPanelTab = 'char' | 'setting' | 'goal';

/** 上部タブの種別（現状はエディタのみ実装、構成タブは将来拡張用） */
export type TopViewTab = 'editor' | 'outline';
