# app-top-page-readme-style

## 目的

`src/app/page.tsx`(アプリのトップページ、`src/app/` 配下)を1ページ構成にし、README.md と同じような構成(タイトル+画像のみ)にする。

## 背景・制約

- 現状 `src/app/page.tsx` は bulletproof-react テンプレート由来の汎用ホーム画面。タイトル・ロゴ・説明文・ログイン導線ボタン(`Get started`)・GitHub リンクボタンを持つ。
- README.md は本作業で `# Under Construction Proto` + box-bot 画像(`.github/assets/box-bot.png`)のみのシンプル構成に整理済み。セットアップ手順は `SETUP.md` へ切り出し済み。
- `src/app/` 配下には他に `src/app/app/`(ログイン後のダッシュボード)・`src/app/auth/`(ログイン等)がある。今回の対象はトップページ(`src/app/page.tsx`)のみで、これらのサブルートは変更しない。

## 実装計画

- [ ] `src/app/page.tsx` を README と同様の1ページ構成(タイトル+画像)に変更
- [ ] 既存のログイン導線(`Get started` ボタン)・GitHub リンクボタンの扱いを検討(削除するか、別の形で残すか)
- [ ] 表示する画像を検討(box-bot 画像を再利用するか、専用の画像を用意するか)

## 決定事項

<!-- 検討・決定した内容のログ -->

## 懸念・リスク

- ログイン導線を削除する場合、認証フローへの入り口が無くなる。ヘッダー等、他のナビゲーション経路があるか要確認。
- README 用画像(`.github/assets/` 配下)は `public/` の外にあるため、Next.js の `<img>`/`next/image` から参照するには `public/` への複製、または別画像の用意が必要。
