// 作成日: 2026-06-30
'use client';

import { useNovelStore } from '@/store/useNovelStore';
import { totalCharCount } from '@/lib/backup';

export default function Sidebar() {
  const data = useNovelStore((s) => s.data);
  const curChapter = useNovelStore((s) => s.curChapter);
  const curEpisode = useNovelStore((s) => s.curEpisode);
  const setCurrent = useNovelStore((s) => s.setCurrent);
  const addChapter = useNovelStore((s) => s.addChapter);
  const addEpisode = useNovelStore((s) => s.addEpisode);
  const removeChapter = useNovelStore((s) => s.removeChapter);
  const removeEpisode = useNovelStore((s) => s.removeEpisode);
  const renameChapter = useNovelStore((s) => s.renameChapter);
  const renameEpisode = useNovelStore((s) => s.renameEpisode);
  const notify = useNovelStore((s) => s.notify);

  const total = totalCharCount(data);
  const target = data.goal.target || 0;
  const pct = target > 0 ? Math.min(100, Math.round((total / target) * 100)) : 0;
  const goalNote =
    target > 0
      ? `目標：${target.toLocaleString()}字 （残り ${Math.max(0, target - total).toLocaleString()}字）`
      : '目標未設定';

  const handleRemoveChapter = (ci: number) => {
    if (data.chapters.length <= 1) {
      notify('最後の章は削除できません');
      return;
    }
    if (!confirm(`「${data.chapters[ci].title || 'この章'}」を削除しますか？（話もすべて削除されます）`)) return;
    removeChapter(ci);
  };

  const handleRemoveEpisode = (e: React.MouseEvent, ci: number, ei: number) => {
    e.stopPropagation();
    if (data.chapters[ci].episodes.length <= 1) {
      notify('最後の話は削除できません');
      return;
    }
    if (!confirm(`「${data.chapters[ci].episodes[ei].title || 'この話'}」を削除しますか？`)) return;
    removeEpisode(ci, ei);
  };

  const handleEditChapterTitle = (ci: number) => {
    const name = prompt('章名を入力してください', data.chapters[ci].title || '');
    if (name === null) return;
    renameChapter(ci, name);
  };

  const handleEditEpisodeTitle = (e: React.MouseEvent, ci: number, ei: number) => {
    e.stopPropagation();
    const name = prompt('話名を入力してください', data.chapters[ci].episodes[ei].title || '');
    if (name === null) return;
    renameEpisode(ci, ei, name);
  };

  return (
    <div className="sidebar">
      <div className="progress-wrap">
        <div className="progress-label">
          <span>総文字数</span>
          <span style={{ color: 'var(--gold)' }}>{total.toLocaleString()}</span>
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="progress-note">{goalNote}</div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-label">
          章 / 話
          <button onClick={addChapter}>＋章追加</button>
        </div>
      </div>

      <div className="sidebar-scroll">
        {data.chapters.map((ch, ci) => (
          <div key={ch.id}>
            <div className="chapter-row">
              <span className="chapter-title" title={ch.title}>
                {ch.title || '無題の章'}
              </span>
              <button className="icon-btn" title="章名を編集" onClick={() => handleEditChapterTitle(ci)}>
                ✎
              </button>
              <button className="icon-btn-outline" title="話を追加" onClick={() => addEpisode(ci)}>
                ＋話
              </button>
              <button className="icon-btn danger" title="章を削除" onClick={() => handleRemoveChapter(ci)}>
                ×
              </button>
            </div>

            {ch.episodes.map((ep, ei) => {
              const isActive = ci === curChapter && ei === curEpisode;
              return (
                <div
                  key={ep.id}
                  className={`scene-item${isActive ? ' active' : ''}`}
                  onClick={() => setCurrent(ci, ei)}
                >
                  <span className="dot" />
                  <span className="scene-name" title={ep.title}>
                    {ep.title || '無題の話'}
                  </span>
                  <span className="scene-actions">
                    <button title="話名を編集" onClick={(e) => handleEditEpisodeTitle(e, ci, ei)}>
                      ✎
                    </button>
                    <button className="danger" title="削除" onClick={(e) => handleRemoveEpisode(e, ci, ei)}>
                      ×
                    </button>
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
