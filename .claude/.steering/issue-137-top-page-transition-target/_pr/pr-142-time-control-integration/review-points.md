# 段階 3 確認ポイント（リモートレビュー用）

PR #142（設計）+ PR-A（stage-06 スキャフォールド）を進めた。出かけている間に見てもらう用のまとめ。
詳細は [design.md](design.md)。

## 1. 方針の是非（design.md の結論への同意可否）

- **store 持ち込みは C 方式**（中間）: `game-clock` / `planned-path` / `path` は tc-03 から import 流用、`position` / `intent` は find-path 用に差し替え。`_computed` / `_events` は段階 3 で持ち込まない
- **position の ref 化は DOM `left/top` 直書き**（r3f `useFrame` ではない）。理由: グリッド位置は three.js 内部でなく bot ラッパーの CSS。`usePerspectiveControl` の `--floor-tilt` 直書きと同方式
- **stage-06 新設**（stage-05 は即時移動版の参照として残す）
- **段階 3 を PR-A〜D に 4 分割**（stage-06 スキャフォールド / store 持ち込み / tick 実行 / proto 切替）

→ 違和感あれば PR #142 のコメントか design.md への追記で。

## 2. 未決事項（後続 PR で判断、先に意見あれば）

- `planned-path` へ足す `appendPlannedStep` / `popPlannedStep` を **tc-03 側 store に入れる**か **find-path 側の wrapper に閉じる**か（PR-B）
  - tc-03 に入れる = 既存 prototype を触る（他 time-control には影響なし、追加のみ）
  - wrapper = tc-03 無改変だが経路が二段になる
- `actor` / `actor-settings` の縮小利用: **import してそのまま一部 action だけ使う**か **find-path 用に薄く再実装**するか（PR-B）
- 「実行」の UI: 単純ボタン + time-scale スライダーで MVP。EventTarget 経由（proto-01 の `useBoxBotActionDispatcher` パターン）は段階 4 に回す — これで良いか

## 3. PR-A の動作確認（Storybook）

`src/prototypes/stage/stage-06` を追加。**stage-05 と同じ見た目・操作で、移動時に再レンダリングが起きないこと**が確認内容。

手順:

1. Storybook 起動（未起動なら）。`localhost:6006`
2. `prototypes/stage/Stage06` の `Primary` を開く
3. ブラウザの devtools コンソールを開く
4. 初回描画で `render: Stage06` / `render: GeoLayer` / `render: ActorsLayer` が 1 回ずつ出る
5. **セルをクリック / 矢印キー・WASD / bot をクリック（順送り）で bot が移動する**
6. **移動しても `render: ActorsLayer` が追加で出ないこと**（= 再レンダリングなし）を確認
   - stage-05 だと移動のたびに `render: ...` が増える。stage-06 は増えないのが期待値
7. tilt スライダーを動かして、bot が床と一緒に傾き、直立を保つこと（stage-05 と同じ）
8. `Primary` / `StrongTilt` / `NonSquareGrid` の 3 story で崩れないこと

NG だった場合（移動で再レンダリングされる / bot が動かない / tilt で位置がずれる）は、その story 名と devtools の様子を PR-A のコメントへ。

## 4. 進め方

- **PR-A = PR #143（draft）作成済**。型チェック・lint 通過。実ブラウザ（Storybook）確認は未
- PR-B 以降は **PR-A の方針 OK をもらってから**着手（PR-A の registry Provider の形が後続の土台になるため）
- 「そのまま進めて良い」なら PR-B（store 持ち込み）へ続行する

## 5. 作成済ブランチ / PR

- `137-time-control-integration` → PR #142（設計。この design.md / review-points.md）
- `137-stage-06-ref-position` → PR #143 draft（stage-06 スキャフォールド + ref position）
- issue #137 は reopen 済
