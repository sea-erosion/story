// 作成日: 2026-06-30
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '✦ 小説執筆ツール',
  description: 'ブラウザで完結する小説執筆ツール（Next.js版）',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
