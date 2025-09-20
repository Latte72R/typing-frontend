# typing-frontend

e-typing と同等の体験を目指したタイピングゲームのフロントエンド（Pure React / Vite）。バックエンドは別リポジトリ（Node.js + PostgreSQL）で管理します。

本READMEは「セットアップ」と「起動方法」を中心にまとめています。


## 必要要件

- Node.js 20 LTS（推奨）
  - Vite は Node 18+ で動作しますが、バックエンドと揃えて 20 を推奨します。
- パッケージマネージャ: pnpm（推奨）/ npm / Yarn
  - pnpm を使う場合は Corepack を有効化してください。

```bash
# Node 20 を利用している前提
node -v

# pnpm を使う場合（推奨）
corepack enable
corepack prepare pnpm@latest --activate
pnpm -v
```


## クイックスタート（1分）

```bash
# 1) 依存関係のインストール
pnpm install         # npm の場合: npm ci / Yarn の場合: yarn

# 2) 環境変数の設定（.env.local を作成）
cat > .env.local << 'EOF'
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_SOCKET_URL=http://localhost:3000
# 任意: アプリ名や機能フラグ
# VITE_APP_NAME=Typing App
EOF

# 3) 開発サーバ起動（デフォルト: http://localhost:5173）
pnpm dev             # npm run dev / yarn dev でも可
```

ブラウザで `http://localhost:5173` を開きます。バックエンド（API/Socket.IO）は別リポで起動しておくか、`.env.local` を公開環境に向けてください。


## スクリプト（想定）

プロジェクトの `package.json` に準じます。一般的には以下が用意されています。

- `dev`: Vite の開発サーバを起動
- `build`: 本番ビルドを生成（`dist/`）
- `preview`: ローカルでビルド成果物を確認

```bash
pnpm dev
pnpm build
pnpm preview --open
```


## 環境変数

- `VITE_API_BASE_URL`（必須）: REST API のベースURL（例: `http://localhost:3000/api/v1`）
- `VITE_SOCKET_URL`（必須）: Socket.IO サーバのURL（例: `http://localhost:3000`）
- 任意の変数は Vite の規約に従い `VITE_` プレフィクスを付けてください。

バックエンドのCORS設定に `http://localhost:5173`（Viteのデフォルト）を許可してください。


## バックエンドとの接続

- バックエンドは別リポジトリ（Node.js 20 / Fastify or Express / Socket.IO / PostgreSQL）。
- ローカルで合わせて動かす場合:
  - API: `http://localhost:3000/api/v1`（例）
  - Socket: `http://localhost:3000`
  - 本フロントの `.env.local` を上記に合わせる
- ランキングのリアルタイム更新は Socket.IO の `contest:<id>:leaderboard` ルームに join して購読します。


## 開発メモ（簡易）

- 技術スタック: React 18（TypeScript推奨）, Vite, React Router, React Query, Socket.IO-client
- スタイル: CSS Modules または Tailwind のいずれか
- アクセシビリティ: フォーカス管理, スクリーンリーダー配慮, IME混入防止（`KeyboardEvent.isComposing` の考慮）
- タイピング処理: 入力対象は ASCII（ローマ字など）。ペースト/ドロップは無効化。


## よくあるトラブル

- 起動はするが API エラーになる
  - `.env.local` の `VITE_API_BASE_URL` を確認。バックエンドが実行中か、CORS が許可されているかを確認。

- ソケットに接続できない
  - `VITE_SOCKET_URL` のURLやプロトコル（http/https）を確認。プロキシ/ファイアウォールでブロックされていないか確認。

- ポート競合で起動できない
  - 既に 5173 を使っているプロセスがある可能性。`pnpm dev --port 5174` のように変更可能です。


## ディレクトリ構成（例）

```
typing-frontend/
  src/
    app/              # ルーティング（React Router）
    components/       # UI コンポーネント
    features/contest/ # コンテスト関連の機能
    api/              # React Query hooks / API クライアント
    lib/keyboard/     # キー入力エンジンやユーティリティ
  public/
  index.html
```


## ライセンス

社内/私用プロジェクトの前提です。公開方針が決まり次第更新してください。

