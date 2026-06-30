// 作成日: 2026-06-30
'use client';

import { useNovelStore } from '@/store/useNovelStore';
import CharacterPanel from './panels/CharacterPanel';
import SettingPanel from './panels/SettingPanel';
import GoalPanel from './panels/GoalPanel';
import type { RightPanelTab } from '@/types/novel';

const TABS: { id: RightPanelTab; label: string }[] = [
  { id: 'char', label: '人物' },
  { id: 'setting', label: '設定' },
  { id: 'goal', label: '目標' },
];

export default function RightPanel() {
  const rightTab = useNovelStore((s) => s.rightTab);
  const setRightTab = useNovelStore((s) => s.setRightTab);

  return (
    <div className="right-panel">
      <div className="rp-tab-bar">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`rp-tab${rightTab === t.id ? ' active' : ''}`}
            onClick={() => setRightTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {rightTab === 'char' && <CharacterPanel />}
      {rightTab === 'setting' && <SettingPanel />}
      {rightTab === 'goal' && <GoalPanel />}
    </div>
  );
}
