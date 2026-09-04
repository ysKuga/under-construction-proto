# トップページ改修 対応予定

issue: #131

## 目的

トップページ box-bot 操作（3 回ジャンプ → 歩くボタン、歩行 bobbing）を土台に、以下を段階的に対応する。

- pages 配下の `_prototypes` 化：現実装を prototype として切り出し、`home/index.tsx` は採用中 prototype の描画のみにする
- Storybook で layout 相当を確認できるようにする
- rxjs 適用：操作 state による不要な再レンダリングを分離し、長押しなど文脈のある操作の基盤を作る

## 背景・制約

- `app/CLAUDE.md`：`src/app/` は配線のみ、実装は `src/components/pages/` へ置く
- `src/prototypes/` はバージョン違いを並存させ、若いバージョンからの import を許容する方針（`src/prototypes/README.md`）。pages 配下でも同様の運用にしたい
- Storybook `.storybook/preview.tsx` の decorator は `(Story) => <Story />` のみ。反映されるのは `globals.css` だけで、`app/layout.tsx`（`<html><body><main>`）・`AppProvider`（react-query / ErrorBoundary / Notifications）・`SerwistProvider` は未反映
- rxjs 導入済（PR #133、rxjs@7.8.2、`docs/package/reactive/rxjs/`）
- 再レンダリング課題は `docs/performance/home-box-bot-interaction/README.md` に整理済。判断の枠組みは `docs/performance/README.md`

## 実装計画

- [x] `src/components/pages/home/_prototypes/proto-01/` を新設し、現行のトップページ実装を `Proto01` として切り出す
  - [x] proto-01 に story を持たせる
  - [x] `home/index.tsx` は採用中 prototype（proto-01）を描画するだけにする
  - [x] 命名は `proto-01`（`_prototypes/` 配下、連番）
- [ ] Storybook で layout 反映
  - [ ] `src/components/layouts/_base/` にベース layout を切り出す。`<html lang>`/`<body>`/`SerwistProvider` をここに閉じる。story は用意しない
  - [ ] `src/components/pages/layout.tsx` を設置する。`AppProvider` + `<main>` を組む（`_base` は含めない）。`metadata` もここで持つ
  - [ ] `src/app/layout.tsx` は `_base` で `pages/layout` をラップして構成する。`metadata` は `pages/layout` から re-export
  - [ ] `src/components/layouts/` 配下を `pages/layout.tsx` の部品にする（`pages/layout.tsx` が骨格、`layouts/` が組み込むパーツ。依存方向は `pages/layout` → `layouts` の一方向）
  - [ ] `src/components/pages/layout.decorator.tsx` を設置し、story から使う（`preview.tsx` へ直書きしない）。`pages/layout`（= `_base` なし）をそのまま使えるか、別途組むか判断
  - [ ] `pages/layout` と `components/layouts` の各パーツにそれぞれ stories を用意する（`_base` は対象外）
  - [ ] decorator を pages の story のみに適用するか、全 story に効かせるか判断
- [ ] rxjs 適用
  - [ ] `jumpCount` 等の操作 state を Observable へ寄せ、しきい値超え判定の boolean のみ state 化（再レンダリング分離）
  - [ ] 「ジャンプした回数」を数えるか「クリック回数」を数えるかを確定（`ACTION_JUMP` 購読 vs `onClick`）
  - [ ] 長押し（押下 → 保持 → 解放）の検出 util を rxjs で作る（box-bot spin の press/release と接続できるか検討）

## 決定事項

- 2026-09-04: rxjs を先行導入（PR #133、issue 紐づけなし）。用途はゲームの文脈操作（長押し等）と複雑な非同期の宣言的記述、使用自体も目的
- 2026-09-04: `docs/performance/` を新設。useState 使用可否の判断基準を枠組み化し、個別事例を分離
- 2026-09-04: トップページ実装を `home/_prototypes/proto-01/` へ切り出し完了。`home/index.tsx` は採用 prototype の描画のみ。`_prototypes/` は `pages/_prototypes/` でなく `pages/home/_prototypes/`（home スコープに閉じる）
- 2026-09-04: 着手順は rxjs 導入を先行実施済。残り 3 項目（`_prototypes` 化 / Storybook decorator / rxjs 適用）の順序は未確定
- 2026-09-04: Storybook の layout 反映は `preview.tsx` へ直書きしない。`<html>`/`<body>`/`SerwistProvider` は `components/layouts/_base/` のベース layout へ分割し、`app/layout.tsx` で直接使う（`_base` で `pages/layout` をラップ）。`components/pages/layout.tsx` は `AppProvider` + `<main>` + `metadata`。`components/layouts/` 配下は `pages/layout` の部品（一方向依存）。story 用 `components/pages/layout.decorator.tsx` を設ける。stories は `pages/layout` と `components/layouts` パーツに用意（`_base` は story なし、`_layouts/` ディレクトリ案は取り下げ）

## 懸念・リスク

- `_prototypes` 化は現状ページ 1 枚に階層を 1 段増やす。prototype が増えるまでは過剰になり得る
- `preview.tsx` を全 story の decorator にすると、既存 story すべてに `AppProvider`（QueryClient 等）が乗る。副作用・パフォーマンスへの影響を確認する
- `app/layout.tsx` は `metadata` を `pages/layout` から re-export する必要がある（Next は app 側ファイルの `metadata` を読む）。`export { metadata } from ...` で足りるか確認
- `_base` に `SerwistProvider` を入れるため、`_base` を使うのは `app/layout.tsx` のみ。story・decorator 経路には `_base` が入らないので `SerwistProvider` の stub は不要
- rxjs と React state の境界（どこまで Observable、どこから state）を都度判断する必要がある。`docs/performance/README.md` の基準に沿わせる
