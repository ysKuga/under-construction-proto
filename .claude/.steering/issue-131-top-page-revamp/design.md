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
- [x] Storybook で layout 反映（PR #134）
  - [x] `src/components/layouts/_base/` にベース layout を切り出す。`<html lang>`/`<body>`/`SerwistProvider` をここに閉じる。story は用意しない
  - [x] `src/components/pages/layout.tsx` を設置する。`AppProvider` + `<main>` を組む（`_base` は含めない）。`metadata` もここで持つ
  - [x] `src/app/layout.tsx` は `_base` で `pages/layout` をラップして構成する。`metadata` は `pages/layout` から re-export
  - [x] `src/components/pages/layout.decorator.tsx` を設置し、story から使う（`preview.tsx` へ直書きしない）。`pages/layout`（= `_base` なし）をそのまま decorator で使う
  - [x] `pages/layout` と `components/layouts` の各パーツにそれぞれ stories を用意する（`_base` は対象外）
  - [x] decorator は pages 相当の story（`home` / `not-found`）の meta のみに適用（全 story には効かせない）
  - [x] README 反映（`components/pages/README.md` / `components/layouts/README.md` 新設 / `src/app/CLAUDE.md`）
  - ~~`_prototypes/proto-01` の story にも `layoutDecorator` を追加（#134 は origin/main 分岐のため proto-01 story 未対象。#134 マージ後に追随）~~
    - proto-01 にはとりあえず不要 (ほかの proto には適用していく)
- [ ] rxjs 適用
  - [ ] `jumpCount` 等の操作 state を Observable へ寄せ、しきい値超え判定の boolean のみ state 化（再レンダリング分離）
  - [ ] 「ジャンプした回数」を数えるか「クリック回数」を数えるかを確定（`ACTION_JUMP` 購読 vs `onClick`）
  - [ ] 長押し（押下 → 保持 → 解放）の検出 util を rxjs で作る（box-bot spin の press/release と接続できるか検討）
  - [ ] 挙動（制御ロジック）とは別に、操作する UI 要素の検討を行う
    - `_prototypes/` 配下、制御に関する実装（ロジック）と UI に関する実装をそれぞれディレクトリを切って作成する（アンダーバー付与不要）
    - UI 側ディレクトリ名は実装の特徴（配置形状等）を簡潔に反映する（例: 横一列配置 → `action-row/`）
    - 配置バリエーションの実装は `home/_prototypes/ui/` に切り出し（呼び出し元は `home/_prototypes/proto-02/`）。詳細・状態は `ui/CLAUDE.md` および各 `ui/action-*/CLAUDE.md` 参照
      - `action-row`（横一列・常時表示）: 実装済
      - `action-single`（先頭 1 件のみ）: 実装済
      - `action-circle`（真円・画面座標）: 実装済
      - `action-square`（四角形・画面座標）: 実装済
      - `action-ring`（bot 足元、地面水平な円周・3D 配置）: 実装済だが未完成。`@react-three/drei` の `Html` で box-bot 本体の改修なしに 3D 投影を実現できた。ただし奥行きによる遮蔽（`occlude`）が効かず、リング背面のボタンが手前に浮いて見える課題が残る（box-bot がワイヤーフレーム/アウトライン描画でソリッドメッシュの深度判定に不向きな可能性）
      - `direction-arrow`（歩く方向に矢印追随）: 未着手・保留。proto が使う box-bot（`components/samples/figure/box-bot`）には向き変更（spin 相当）action が無く「回転」自体が発生しない（`theater/figure/box-bot` 版にはある、別実装）。「歩く」も現状その場足踏みで位置移動を伴わない。「回転」の仕様（`autoRotate` の角度を指すか、将来のユーザー操作を指すか）が未確定

## 決定事項

- 2026-09-04: rxjs を先行導入（PR #133、issue 紐づけなし）。用途はゲームの文脈操作（長押し等）と複雑な非同期の宣言的記述、使用自体も目的
- 2026-09-04: `docs/performance/` を新設。useState 使用可否の判断基準を枠組み化し、個別事例を分離
- 2026-09-04: トップページ実装を `home/_prototypes/proto-01/` へ切り出し完了。`home/index.tsx` は採用 prototype の描画のみ。`_prototypes/` は `pages/_prototypes/` でなく `pages/home/_prototypes/`（home スコープに閉じる）
- 2026-09-04: 着手順は rxjs 導入を先行実施済。残り 3 項目（`_prototypes` 化 / Storybook decorator / rxjs 適用）の順序は未確定
- 2026-09-04: Storybook の layout 反映は `preview.tsx` へ直書きしない。`<html>`/`<body>`/`SerwistProvider` は `components/layouts/_base/` のベース layout へ分割し、`app/layout.tsx` で直接使う（`_base` で `pages/layout` をラップ）。`components/pages/layout.tsx` は `AppProvider` + `<main>` + `metadata`。story 用 `components/pages/layout.decorator.tsx` を設ける。stories は `pages/layout` と `components/layouts` パーツに用意（`_base` は story なし、`_layouts/` ディレクトリ案は取り下げ）
- 2026-09-04: 実施完了（PR #134、origin/main 分岐、issue 紐づけなし）。`metadata` re-export は `next build` で title / manifest 反映を確認。decorator は全 story でなく `home` / `not-found` の meta のみに適用（既存 story へ `AppProvider` を乗せる副作用を回避）。README（`components/pages` / `components/layouts` 新設 / `src/app/CLAUDE.md`）へ反映

## 懸念・リスク

- `_prototypes` 化は現状ページ 1 枚に階層を 1 段増やす。prototype が増えるまでは過剰になり得る
- ~~`preview.tsx` を全 story の decorator にすると、既存 story すべてに `AppProvider` が乗る~~ → 解決: decorator は `home` / `not-found` の meta のみに適用
- ~~`app/layout.tsx` の `metadata` re-export が Next で通るか~~ → 解決: `export { metadata } from ...` で `next build` OK（Next 16.3.1）
- ~~`_base` の `SerwistProvider` stub 要否~~ → 解決: `_base` は `app/layout.tsx` のみ使用、story・decorator 経路に入らないため stub 不要
- rxjs と React state の境界（どこまで Observable、どこから state）を都度判断する必要がある。`docs/performance/README.md` の基準に沿わせる
