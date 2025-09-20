# typing-frontend

React 18 + Vite で構築したタイピング練習サービスのフロントエンドです。リアルタイム更新や結果保存は別リポジトリのバックエンド（Node.js + PostgreSQL）と連携します。

## 必要要件
- Node.js 20 LTS 以上
- npm 9 以上（pnpm や Yarn でも可）

## セットアップ
```bash
npm install
cat > .env.local <<'ENV'
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_SOCKET_URL=http://localhost:3000
ENV
npm run dev
```
ブラウザで `http://localhost:5173` を開き、バックエンドを同じホストで起動してください。

## 主なスクリプト
- `npm run dev` : Vite 開発サーバを起動
- `npm run build` : 本番ビルドを生成
- `npm run preview` : ビルド結果をローカル確認
- `npm run lint` : ESLint チェック

## 環境変数
- `VITE_API_BASE_URL` : REST API のベースURL
- `VITE_SOCKET_URL` : Socket.IO サーバのURL
※ 追加の設定値は `VITE_` プレフィクスを付けて定義してください。

## 補足
バックエンドのCORS設定に `http://localhost:5173` を許可し、ランキング配信など Socket.IO のルーム (`contest:<id>:leaderboard`) を購読することでリアルタイム更新が機能します。
