// 作成日: 2026-06-30
'use client';

import { useNovelStore } from '@/store/useNovelStore';

export default function SettingPanel() {
  const settings = useNovelStore((s) => s.data.settings);
  const updateSettings = useNovelStore((s) => s.updateSettings);

  return (
    <div className="rp-panel visible">
      <div className="setting-row">
        <div className="setting-label">作品タイトル</div>
        <input
          className="setting-input"
          type="text"
          placeholder="タイトル未定"
          value={settings.title}
          onChange={(e) => updateSettings({ title: e.target.value })}
        />
      </div>
      <div className="setting-row">
        <div className="setting-label">ジャンル</div>
        <input
          className="setting-input"
          type="text"
          placeholder="例：ファンタジー、恋愛、ミステリ"
          value={settings.genre}
          onChange={(e) => updateSettings({ genre: e.target.value })}
        />
      </div>
      <div className="setting-row">
        <div className="setting-label">舞台・世界観</div>
        <textarea
          className="setting-input"
          placeholder="時代、場所、世界の特徴など"
          value={settings.world}
          onChange={(e) => updateSettings({ world: e.target.value })}
        />
      </div>
      <div className="setting-row">
        <div className="setting-label">あらすじ / テーマ</div>
        <textarea
          className="setting-input"
          placeholder="物語の概要、伝えたいテーマ"
          value={settings.synopsis}
          onChange={(e) => updateSettings({ synopsis: e.target.value })}
        />
      </div>
      <div className="setting-row">
        <div className="setting-label">メモ</div>
        <textarea
          className="setting-input"
          style={{ minHeight: 100 }}
          placeholder="自由メモ（伏線、プロット案など）"
          value={settings.memo}
          onChange={(e) => updateSettings({ memo: e.target.value })}
        />
      </div>
    </div>
  );
}
