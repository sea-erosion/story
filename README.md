<!-- 作成日: 2026-06-30 -->
# ✦ 小説執筆ツール（Next.js + React + TypeScript版）

元々シングルHTMLファイルで作られていた小説執筆ツールを、
Next.js（App Router）+ React + TypeScript の構成に移植したものです。
機能・デザイン・データ構造は元のツールにできるだけ忠実に再現しています。

---

## セットアップ

```bash
npm install
npm run dev
```

`http://localhost:3000` を開くと利用できます。

本番ビルドする場合：

```bash
npm run build
npm run start
```

---

## ディレクトリ構成

```
src/
  app/
    layout.tsx        # ルートレイアウト
    page.tsx           # トップページ（NovelAppを描画するだけ）
    globals.css         # 元のデザインを移植したグローバルCSS
  components/
    NovelApp.tsx         # 画面全体の組み立て・初期化・自動バックアップ
    TopBar.tsx            # 上部バー（LOAD/SAVE/ZIP/BACKUP等）
    Sidebar.tsx            # 章・話一覧、進捗バー
    EditorPanel.tsx         # 本文エディタ（検索置換・UNDO/REDO・縦書き切替）
    RightPanel.tsx           # 右パネルのタブ切り替え
    BackupModal.tsx           # バックアップ管理モーダル
    Notification.tsx          # 画面下部のトースト通知
    panels/
      CharacterPanel.tsx       # 登場人物管理
      SettingPanel.tsx          # 作品設定
      GoalPanel.tsx              # 執筆目標・進捗
  store/
    useNovelStore.ts             # Zustandによる状態管理（本文のUNDO/REDO履歴含む）
  lib/
    storage.ts                    # localStorage 保存/読込・旧データ移行
    backup.ts                      # バックアップ履歴の管理
    zip.ts                          # ZIP出力/読込（npm版JSZipを使用）
    format.ts                        # ファイル名サニタイズ・日付フォーマット
  types/
    novel.ts                          # データ型定義
```

---

## 元のツールからの主な変更点

- **状態管理**: グローバル変数＋DOM操作 → Zustandストア（`src/store/useNovelStore.ts`）に一元化。
- **UNDO/REDO**: 本文編集の履歴をストア側で管理し、話を切り替えるたびに自動リセットされます（元の挙動を踏襲）。
- **JSZip**: CDNからの動的読み込みをやめ、npmパッケージとして同梱（オフラインでもZIP機能が動作します）。
- **XSS対策**: Reactの自動エスケープにより、元コードにあった手動エスケープ処理（`esc()`関数）は不要になり削除しています。
- **AI執筆支援パネル**: アップロードされた`index.html`には実装が含まれていなかったため、本移植版でも未実装です（README.mdには記載がありましたが、ソースには存在しませんでした）。必要であれば追加実装します。

---

## 引き継いでいる仕様・既知の制約

- `LOAD`ボタンはFile System Access API（`showOpenFilePicker`）を使用しているため、対応ブラウザ（Chrome/Edge等）でのみ動作します。Safari/Firefoxでは非対応の旨を通知します。
- `LOAD`は読み込んだテキストを「現在開いている話」の本文として上書きします。一方`OVERWRITE`・`NEW SAVE`は全章・全話を結合した全文を書き出します（元のツールと同じ仕様です）。
- データはブラウザの`localStorage`にのみ保存されます。複数端末・複数ブラウザ間では共有されません。
- 上部タブの「構成」は元のツール同様、現状はクリックでアクティブ表示が切り替わるのみで、専用の構成編集画面は未実装です。
