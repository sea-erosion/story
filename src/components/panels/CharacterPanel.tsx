// 作成日: 2026-06-30
'use client';

import { useNovelStore } from '@/store/useNovelStore';
import type { CharacterInfo } from '@/types/novel';

const COLORS = ['#7C6AF0', '#4AAFAA', '#C8A84B', '#C05A5A', '#4A9A6A', '#8888CC'];

export default function CharacterPanel() {
  const chars = useNovelStore((s) => s.data.chars);
  const addChar = useNovelStore((s) => s.addChar);
  const removeChar = useNovelStore((s) => s.removeChar);
  const updateChar = useNovelStore((s) => s.updateChar);

  const handleChange = (i: number, key: keyof CharacterInfo) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => updateChar(i, key, e.target.value);

  return (
    <div className="rp-panel visible">
      <div>
        {chars.map((c, i) => {
          const color = COLORS[i % COLORS.length];
          const initials = (c.name || '?').slice(0, 2);
          return (
            <div className="char-card" key={i}>
              <div className="char-card-header">
                <div className="char-avatar" style={{ background: `${color}22`, color }}>
                  {initials}
                </div>
                <input
                  className="char-name-input"
                  value={c.name}
                  placeholder="名前"
                  onChange={handleChange(i, 'name')}
                />
                <button onClick={() => removeChar(i)} style={{ background: 'none', border: 'none', color: 'var(--fg3)', cursor: 'pointer', fontSize: 14, padding: 2 }}>
                  ×
                </button>
              </div>
              <div className="char-field">
                <span className="char-field-label">役割</span>
                <input
                  className="char-field-input"
                  value={c.role}
                  placeholder="主人公、ヒロイン..."
                  onChange={handleChange(i, 'role')}
                />
              </div>
              <div className="char-field">
                <span className="char-field-label">年齢</span>
                <input
                  className="char-field-input"
                  value={c.age}
                  placeholder="18歳"
                  onChange={handleChange(i, 'age')}
                />
              </div>
              <div className="char-field">
                <span className="char-field-label">外見</span>
                <textarea
                  className="char-field-input"
                  rows={2}
                  placeholder="外見の特徴..."
                  value={c.look}
                  onChange={handleChange(i, 'look')}
                />
              </div>
              <div className="char-field">
                <span className="char-field-label">性格</span>
                <textarea
                  className="char-field-input"
                  rows={2}
                  placeholder="性格・特徴..."
                  value={c.desc}
                  onChange={handleChange(i, 'desc')}
                />
              </div>
            </div>
          );
        })}
      </div>
      <button className="add-char-btn" onClick={addChar}>
        ＋ 登場人物を追加
      </button>
    </div>
  );
}
