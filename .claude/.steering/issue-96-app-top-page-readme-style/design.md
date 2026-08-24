# app-top-page-readme-style

issue: #96

## 目的

`src/app/page.tsx`(アプリのトップページ、`src/app/` 配下)を1ページ構成にし、README.md と同じような構成(タイトル+画像のみ)にする。

## 背景・制約

- 現状 `src/app/page.tsx` は bulletproof-react テンプレート由来の汎用ホーム画面。タイトル・ロゴ・説明文・ログイン導線ボタン(`Get started`)・GitHub リンクボタンを持つ。
- README.md は本作業で `# Under Construction Proto` + box-bot 画像(`.github/assets/box-bot.png`)のみのシンプル構成に整理済み。セットアップ手順は `SETUP.md` へ切り出し済み。
- `src/app/` 配下には他に `src/app/app/`(ログイン後のダッシュボード)・`src/app/auth/`(ログイン等)がある。今回の対象はトップページ(`src/app/page.tsx`)のみで、これらのサブルートは変更しない。

## 実装計画

- [x] `src/app/page.tsx` を README と同様の1ページ構成(タイトル+画像)に変更
- [x] 既存のログイン導線(`Get started` ボタン)・GitHub リンクボタンの扱いを検討(削除するか、別の形で残すか) → 削除(決定事項参照)
- [x] 表示する画像を検討(box-bot 画像を再利用するか、専用の画像を用意するか) → `samples/figure/box-bot` の `BoxBot`(3D)を再利用(決定事項参照)

今後の追加検討(表示調整・関連 samples 整理等)は個別のサブ steering ディレクトリへ分割する。

- [x] トップページ簡素化で到達不能になった bulletproof-react 由来 auth/dashboard 一式の削除 → `.claude/.steering/issue-96-app-top-page-readme-style/_closed/pr-97-remove-unused-app-auth/` へ分割、対応完了・close 済(PR #97)

## 決定事項

### 表示コンポーネント・ログイン導線 (2026-08-24)

- 表示物は `<h1>` タイトル(README と同じ "Under Construction Proto")+ `@/components/samples/figure/box-bot` の `BoxBot`(`mode="3d"`)。専用画像は用意せず、既存 samples を再利用する。
- 旧実装(bulletproof-react 由来のログイン導線ボタン・GitHub リンクボタン・ロゴ)は削除。トップページ以外にログインへのナビゲーション経路が無い状態になるが、URL 直打ち(`/auth/login`)は引続き機能するため許容する判断。

## 検討事項

- トップページの box-bot 表示完了(画面要素全表示完了)までの速度計測が未実施。本リポジトリで優先しているパフォーマンス・軽量方針との整合を確認し、表示速度向上案があれば検討する。
- タイトルと box-bot の位置調整: Canvas 分の領域が確保される都合で余白の見え方に課題あり。`components/ad/molecules/assembly` 適用の効果検証・適用要否を検討する。
- not-found ページの追加検討: box-bot 後方に "404" の文字を背景表示、home への戻るクリック時に box-bot を回転させる演出を検討する。
