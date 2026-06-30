// 作成日: 2026-06-30
// ファイル名のサニタイズと日付フォーマットのユーティリティ

/** ファイル名に使用できない文字を置換し、長さを制限する */
export function sanitizeFilename(str?: string): string {
  return (str || 'untitled').replace(/[\\/:*?"<>|\s]/g, '_').substring(0, 30);
}

/** YYYYMMDD_HHMM 形式の文字列を返す */
export function formatDateForFile(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    d.getFullYear() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    '_' +
    pad(d.getHours()) +
    pad(d.getMinutes())
  );
}

/** Blob をファイルとしてダウンロードさせる */
export function downloadBlob(blob: Blob, filename: string): void {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
