// 作成日: 2026-06-30
// ZIP形式での出力・読込
// 元のシングルHTML版ではJSZipをCDNから動的ロードしていたが、
// Next.js移行に伴い npm パッケージとして同梱する形に変更している。

import JSZip from 'jszip';
import type { NovelData } from '@/types/novel';
import { defaultData } from './storage';
import { sanitizeFilename, formatDateForFile, downloadBlob } from './format';

interface ZipIndexEpisode {
  id: number;
  title: string;
  file: string;
  charCount: number;
}

interface ZipIndexChapter {
  id: number;
  title: string;
  folder: string;
  episodes: ZipIndexEpisode[];
}

interface ZipIndex {
  exportedAt: string;
  title: string;
  genre: string;
  settings: NovelData['settings'];
  chars: NovelData['chars'];
  goal: NovelData['goal'];
  structure: ZipIndexChapter[];
}

/**
 * 作品名_YYYYMMDD_HHMM.zip という構造でデータをZIP化してダウンロードする。
 * 構造:
 *   index.json                 # 全体メタ（設定・登場人物・構成一覧）
 *   ch01_第一章/
 *     chapter.json
 *     ep01_第一話.txt
 *     ep01_第一話.json
 */
export async function exportZip(data: NovelData): Promise<void> {
  const zip = new JSZip();
  const title = data.settings.title || 'novel';

  const index: ZipIndex = {
    exportedAt: new Date().toISOString(),
    title: data.settings.title,
    genre: data.settings.genre,
    settings: data.settings,
    chars: data.chars,
    goal: data.goal,
    structure: data.chapters.map((ch, ci) => ({
      id: ch.id,
      title: ch.title,
      folder: `ch${String(ci + 1).padStart(2, '0')}_${sanitizeFilename(ch.title)}`,
      episodes: ch.episodes.map((ep, ei) => ({
        id: ep.id,
        title: ep.title,
        file: `ep${String(ei + 1).padStart(2, '0')}_${sanitizeFilename(ep.title)}.txt`,
        charCount: (ep.content || '').length,
      })),
    })),
  };
  zip.file('index.json', JSON.stringify(index, null, 2));

  data.chapters.forEach((ch, ci) => {
    const chFolder = `ch${String(ci + 1).padStart(2, '0')}_${sanitizeFilename(ch.title)}`;
    const folder = zip.folder(chFolder)!;

    folder.file(
      'chapter.json',
      JSON.stringify(
        {
          id: ch.id,
          title: ch.title,
          episodeCount: ch.episodes.length,
          charCount: ch.episodes.reduce((s, ep) => s + (ep.content || '').length, 0),
        },
        null,
        2
      )
    );

    ch.episodes.forEach((ep, ei) => {
      const epFile = `ep${String(ei + 1).padStart(2, '0')}_${sanitizeFilename(ep.title)}`;
      folder.file(epFile + '.txt', ep.content || '');
      folder.file(
        epFile + '.json',
        JSON.stringify({ id: ep.id, title: ep.title, charCount: (ep.content || '').length }, null, 2)
      );
    });
  });

  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
  downloadBlob(blob, `${title}_${formatDateForFile()}.zip`);
}

/** ZIPファイルを読み込み、NovelData を復元する */
export async function importZip(file: File): Promise<NovelData> {
  const zip = await JSZip.loadAsync(file);

  const indexFile = zip.file('index.json');
  if (!indexFile) throw new Error('index.jsonが見つかりません');
  const index = JSON.parse(await indexFile.async('string')) as ZipIndex;

  const chapters = [];
  for (const chMeta of index.structure) {
    const episodes = [];
    for (const epMeta of chMeta.episodes) {
      const txtPath = `${chMeta.folder}/${epMeta.file}`;
      const txtFile = zip.file(txtPath);
      const content = txtFile ? await txtFile.async('string') : '';
      episodes.push({ id: epMeta.id, title: epMeta.title, content });
    }
    chapters.push({ id: chMeta.id, title: chMeta.title, episodes });
  }

  const fallback = defaultData();
  return {
    chapters: chapters.length > 0 ? chapters : fallback.chapters,
    chars: index.chars || [],
    settings: index.settings || fallback.settings,
    goal: index.goal || fallback.goal,
    dailyLog: fallback.dailyLog,
  };
}
