# Constellation App

## 概要
Constellation Appは、ユーザーが好きな画像をアップロードし、その上に星座を作成するためのアプリケーションです。最大10個の星を配置し、星同士を点線で繋げることができます。最終的には、星と点線が重なった画像を生成して表示します。

## 機能
- 画像のアップロード
- 星の配置（最大10個）
- 星同士を点線で繋ぐ機能
- 星と点線が重なった画像の出力

## ファイル構成
- `src/components/ImageUploader.tsx`: 画像をアップロードするコンポーネント
- `src/components/StarCanvas.tsx`: 星を配置するキャンバスコンポーネント
- `src/components/OutputImage.tsx`: 最終的な画像を出力するコンポーネント
- `src/utils/imageUtils.ts`: 画像処理に関するユーティリティ関数
- `src/types/index.ts`: 型定義ファイル
- `src/App.tsx`: アプリケーションのメインコンポーネント
- `src/index.tsx`: アプリケーションのエントリーポイント
- `public/index.html`: HTMLテンプレート

## セットアップ手順
1. リポジトリをクローンします。
2. 必要な依存関係をインストールします。
   ```
   npm install
   ```
3. アプリケーションを起動します。
   ```
   npm start
   ```

## GitHub Pages で公開する手順
1. このリポジトリを GitHub に push します。
2. `package.json` の `homepage` を以下の形式に変更します。
   ```json
   "homepage": "https://<GitHubユーザー名>.github.io/<リポジトリ名>"
   ```
3. 依存関係をインストールします。
   ```
   npm install
   ```
4. デプロイを実行します。
   ```
   npm run deploy
   ```
5. GitHub のリポジトリ設定で Pages の配信元を `gh-pages` ブランチに設定します（初回のみ）。

## 使用方法
1. アプリを起動
   cd constellation-app
   npm start

2. 画像をアップロード
3. 星を配置し、必要に応じて点線で繋ぎます。
4. 最終的な画像を生成し、表示します。
