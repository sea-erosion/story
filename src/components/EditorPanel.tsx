// 作成日: 2026-06-30
'use client';

import { useRef, useState } from 'react';
import { useNovelStore } from '@/store/useNovelStore';

export default function EditorPanel() {
  const data = useNovelStore((s) => s.data);
  const curChapter = useNovelStore((s) => s.curChapter);
  const curEpisode = useNovelStore((s) => s.curEpisode);
  const fontSize = useNovelStore((s) => s.fontSize);
  const history = useNovelStore((s) => s.history);
  const future = useNovelStore((s) => s.future);
  const commitEpisodeContent = useNovelStore((s) => s.commitEpisodeContent);
  const undo = useNovelStore((s) => s.undo);
  const redo = useNovelStore((s) => s.redo);
  const updateEpisodeTitle = useNovelStore((s) => s.updateEpisodeTitle);

  const episode = data.chapters[curChapter]?.episodes[curEpisode];
  const content = episode?.content || '';

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastFindIndexRef = useRef(0);

  const [vertical, setVertical] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');

  const handleFindNext = () => {
    if (!findText) return;
    let i = content.indexOf(findText, lastFindIndexRef.current);
    if (i === -1) i = content.indexOf(findText, 0);
    if (i !== -1) {
      textareaRef.current?.setSelectionRange(i, i + findText.length);
      textareaRef.current?.focus();
      lastFindIndexRef.current = i + findText.length;
    }
  };

  const handleReplaceAll = () => {
    if (!findText) return;
    commitEpisodeContent(content.split(findText).join(replaceText));
  };

  const handleTweet = () => {
    window.open('https://x.com/intent/post?text=' + encodeURIComponent(content.substring(0, 100)));
  };

  if (!episode) return null;

  return (
    <div className="editor-panel">
      <div className="editor-toolbar">
        <button
          className={`tb-btn${vertical ? ' active-toggle' : ''}`}
          onClick={() => setVertical((v) => !v)}
        >
          {vertical ? '横書き' : '縦書き'}
        </button>
        <div className="tb-sep" />
        <button className="tb-btn" onClick={undo} disabled={history.length <= 1}>
          ↩ 元に戻す
        </button>
        <button className="tb-btn" onClick={redo} disabled={future.length === 0}>
          ↪ やり直す
        </button>
        <div className="tb-sep" />
        <input
          type="text"
          className="tb-input"
          placeholder="検索..."
          value={findText}
          onChange={(e) => setFindText(e.target.value)}
          style={{ width: 80 }}
        />
        <button className="tb-btn" onClick={handleFindNext}>
          次へ
        </button>
        <input
          type="text"
          className="tb-input"
          placeholder="置換..."
          value={replaceText}
          onChange={(e) => setReplaceText(e.target.value)}
          style={{ width: 80 }}
        />
        <button className="tb-btn" onClick={handleReplaceAll}>
          全置換
        </button>
        <div className="tb-sep" />
        <button className="tb-btn twitter" onClick={handleTweet}>
          X投稿
        </button>
      </div>

      <div className="scene-title-bar">
        <input
          type="text"
          className="scene-title-input"
          placeholder="シーン名..."
          value={episode.title}
          onChange={(e) => updateEpisodeTitle(e.target.value)}
        />
      </div>

      <div className="editor-wrap">
        <textarea
          ref={textareaRef}
          className={`editor-textarea${vertical ? ' v-mode' : ''}`}
          style={{ fontSize: `${fontSize}px` }}
          placeholder="ここに執筆..."
          value={content}
          onChange={(e) => commitEpisodeContent(e.target.value)}
        />
        <div className="char-count">{content.length.toLocaleString()}文字</div>
      </div>
    </div>
  );
}
