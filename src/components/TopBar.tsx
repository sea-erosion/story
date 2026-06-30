// 作成日: 2026-06-30
'use client';

import { useRef, useState } from 'react';
import { useNovelStore } from '@/store/useNovelStore';
import { downloadBlob } from '@/lib/format';
import { exportZip, importZip } from '@/lib/zip';
import { migrateData } from '@/lib/storage';
import type { TopViewTab } from '@/types/novel';

/** 章・話を結合した全文（保存・上書き保存用） */
function buildFullManuscript(data: ReturnType<typeof useNovelStore.getState>['data']): string {
  let text = '';
  data.chapters.forEach((ch) => {
    text += `【${ch.title || '無題の章'}】\n\n`;
    ch.episodes.forEach((ep) => {
      text += `《${ep.title || '無題の話'}》\n\n${ep.content || ''}\n\n`;
    });
  });
  return text;
}

interface Props {
  onOpenBackup: () => void;
}

export default function TopBar({ onOpenBackup }: Props) {
  const data = useNovelStore((s) => s.data);
  const fontSize = useNovelStore((s) => s.fontSize);
  const setFontSize = useNovelStore((s) => s.setFontSize);
  const topTab = useNovelStore((s) => s.topTab);
  const setTopTab = useNovelStore((s) => s.setTopTab);
  const commitEpisodeContent = useNovelStore((s) => s.commitEpisodeContent);
  const replaceData = useNovelStore((s) => s.replaceData);
  const notify = useNovelStore((s) => s.notify);

  const [fileHandle, setFileHandle] = useState<any>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  const handleTab = (tab: TopViewTab) => setTopTab(tab);

  const handleLoad = async () => {
    const picker = (window as any).showOpenFilePicker;
    if (!picker) {
      notify('このブラウザはファイル選択APIに対応していません');
      return;
    }
    try {
      const [handle] = await picker();
      const file = await handle.getFile();
      const buffer = await file.arrayBuffer();
      let text = new TextDecoder('utf-8').decode(buffer);
      if (text.includes('\uFFFD')) text = new TextDecoder('shift-jis').decode(buffer);
      commitEpisodeContent(text);
      setFileHandle(handle);
    } catch {
      // ユーザーによるキャンセル等は無視
    }
  };

  const handleOverwrite = async () => {
    if (!fileHandle) return;
    try {
      const writable = await fileHandle.createWritable();
      await writable.write(buildFullManuscript(data));
      await writable.close();
      notify('上書き保存しました');
    } catch {
      notify('上書き保存に失敗しました');
    }
  };

  const handleNewSave = () => {
    const text = buildFullManuscript(data);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, `${data.settings.title || 'novel'}_${Date.now()}.txt`);
  };

  const handleCopyAll = () => {
    const text = data.chapters.flatMap((ch) => ch.episodes.map((ep) => ep.content || '')).join('');
    navigator.clipboard.writeText(text).then(() => notify('コピーしました'));
  };

  const handleExportZip = async () => {
    try {
      await exportZip(data);
      notify('ZIPを出力しました');
    } catch {
      notify('ZIPの出力に失敗しました');
    }
  };

  const handleImportZipClick = () => zipInputRef.current?.click();

  const handleImportZipChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const imported = await importZip(file);
      if (!confirm('ZIPから読み込みますか？現在の内容は上書きされます。')) return;
      replaceData(migrateData(imported));
      notify('ZIPを読み込みました');
    } catch (err) {
      notify('読み込みに失敗しました');
    }
  };

  return (
    <div className="topbar">
      <span className="logo">✦ NOVEL</span>
      <div className="tab-group">
        <button className={`tab${topTab === 'editor' ? ' active' : ''}`} onClick={() => handleTab('editor')}>
          エディタ
        </button>
        <button className={`tab${topTab === 'outline' ? ' active' : ''}`} onClick={() => handleTab('outline')}>
          構成
        </button>
      </div>
      <input
        type="number"
        className="fontsize-input"
        value={fontSize}
        onChange={(e) => setFontSize(Number(e.target.value) || 18)}
      />
      <button className="top-btn" onClick={handleLoad}>
        LOAD
      </button>
      {fileHandle && (
        <button className="top-btn save" onClick={handleOverwrite}>
          OVERWRITE
        </button>
      )}
      <button className="top-btn primary" onClick={handleNewSave}>
        NEW SAVE
      </button>
      <button className="top-btn gold" onClick={handleCopyAll}>
        COPY ALL
      </button>
      <button className="top-btn teal" onClick={onOpenBackup}>
        BACKUP
      </button>
      <button className="top-btn gold" onClick={handleExportZip}>
        ZIP出力
      </button>
      <button className="top-btn gold" onClick={handleImportZipClick}>
        ZIP読込
      </button>
      <input
        ref={zipInputRef}
        type="file"
        accept=".zip"
        style={{ display: 'none' }}
        onChange={handleImportZipChange}
      />
    </div>
  );
}
