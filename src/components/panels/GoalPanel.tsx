// 作成日: 2026-06-30
'use client';

import { useNovelStore } from '@/store/useNovelStore';
import { totalCharCount } from '@/lib/backup';

const CIRCUMFERENCE = 314;

export default function GoalPanel() {
  const data = useNovelStore((s) => s.data);
  const updateGoal = useNovelStore((s) => s.updateGoal);
  const recordDaily = useNovelStore((s) => s.recordDaily);

  const total = totalCharCount(data);
  const target = data.goal.target || 0;
  const pct = target > 0 ? Math.min(100, Math.round((total / target) * 100)) : 0;
  const offset = CIRCUMFERENCE - (CIRCUMFERENCE * pct) / 100;

  const recentLog = [...data.dailyLog].reverse().slice(0, 7);

  return (
    <div className="rp-panel visible">
      <div className="goal-display">
        <div className="goal-num">{total.toLocaleString()}</div>
        <div className="goal-sub">総文字数</div>
      </div>

      <div className="goal-ring-wrap">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" fill="none" stroke="var(--surface2)" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="10"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
          <text x="60" y="55" textAnchor="middle" fill="var(--fg2)" fontSize="11">
            達成率
          </text>
          <text x="60" y="72" textAnchor="middle" fill="var(--gold)" fontSize="18" fontWeight="bold">
            {pct}%
          </text>
        </svg>
      </div>

      <div className="setting-row">
        <div className="setting-label">執筆目標 (文字数)</div>
        <input
          className="setting-input"
          type="number"
          placeholder="例：80000"
          value={data.goal.target || ''}
          onChange={(e) => updateGoal({ target: parseInt(e.target.value, 10) || 0 })}
        />
      </div>
      <div className="setting-row">
        <div className="setting-label">今日の目標 (文字数)</div>
        <input
          className="setting-input"
          type="number"
          placeholder="例：2000"
          value={data.goal.daily || ''}
          onChange={(e) => updateGoal({ daily: parseInt(e.target.value, 10) || 0 })}
        />
      </div>

      <div>
        <div className="setting-label" style={{ marginBottom: 6 }}>
          今日の進捗
        </div>
        <div className="daily-log">
          {recentLog.length === 0 ? (
            <div style={{ color: 'var(--fg3)', fontSize: 11, textAlign: 'center', padding: '8px 0' }}>
              記録なし
            </div>
          ) : (
            recentLog.map((r, i) => (
              <div className="daily-log-row" key={i}>
                <span>{r.date}</span>
                <span style={{ color: 'var(--gold)' }}>{r.cnt.toLocaleString()}字</span>
              </div>
            ))
          )}
        </div>
      </div>

      <button className="top-btn save goal-record-btn" onClick={recordDaily}>
        今日の文字数を記録
      </button>
    </div>
  );
}
