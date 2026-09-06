# トップページ遷移先の新設（ステージ + 操作 bot + time-control 統合）

issue: #137

## 目的

トップページから遷移する新ページを作る。ステージ・操作キャラクター(bot)・time-control によるイベント管理を 1 ページに統合する。

## 背景・制約

- `src/app/CLAUDE.md`: `src/app/` は配線のみ、実装は `src/components/pages/` へ置く
- `src/prototypes/README.md`: 若いバージョンからの import を許容（バージョン違い並存）。pages 配下でも同様の運用
- 現状:
  - `src/components/pages/home/index.tsx` = BoxBot 単体表示のみ
  - `src/components/pages/home/_prototypes/proto-01/index.tsx` = ジャンプ3回 →「歩く」ボタン解放の操作土台（EventTarget 共有 + `useBoxBotActionDispatcher`）
- issue #131（トップページ改修）は close 済。積み残し: rxjs 適用（挙動と UI の分離 / 長押し util / `jumpCount` の Observable 化）

## 基本構成案

### 1. ステージ

- 遠近表現: 奥ほど小さい。CSS で検討（`perspective` / 行位置に応じた `scale` 補間 / `transform`）
- 既存資産: `src/prototypes/stage/stage-04`
  - layer 分割（`GeoLayer` / `ActorsLayer`）
  - absolute 位置指定
  - `MoveIntent` イベント駆動（`{ source, target }` を dispatch、位置反映は `resolveMoveIntent` に一本化）
  - 境界処理: actor click = wrap / keyboard = clamp / cell click = noop
- `src/prototypes/README.md` の「奥行 → z-index 問題」論点あり
  - top/left に加え z-index も変動させるか / 配列内部を移動に伴い並べ替えるか

### 2. 操作キャラクター (bot)

- 既存: `src/components/samples/figure/box-bot`
  - walking action あり
  - 向き変更（spin 相当）なし・「歩く」はその場足踏みで位置移動を伴わない
- proto-01 の EventTarget 共有パターンを流用
- stage-04 の grid 移動と box-bot の three.js Canvas をどう重ねるか要検討
  - `src/components/pages/home/_prototypes/ui-three` の知見（drei `Html` で 3D 投影可、ただし `occlude` が効かず背面ボタンが手前に浮く課題）

### 3. time-control によるイベント管理

- 既存: `src/prototypes/time-control/time-control-03`
  - `_stores/`: `game-clock` / `actor` / `actor-settings` / `intent` / `path` / `planned-path` / `position` / `async-sample`
  - `_events/_event-listeners/` 群（dispatch-target / set-fixed-path-steps / set-time-scale / toggle-progress-mode 等）
  - `_computed/` computed layer
  - `_components/`: `action-bar` / `schedule-preview` / `stage-view` / `actor-controller` / `action-log-panel`
- bot の move / action を tick に乗せる
- store 群をページスコープへどう持ち込むか検討（prototype は若いバージョンからの import 許容方針）

## 実装計画

- [ ] 配置先確定（新 route か `home/_prototypes/proto-02` か）/ ルート名確定
- [ ] ステージ: stage-04 を土台に遠近表現を追加した試作
  - [ ] 遠近表現の方式確定（CSS 2D perspective / scale 補間 / stage 3D 化）
  - [ ] 奥行きに伴う z-index / 描画順の扱い
- [ ] bot 配置: box-bot をステージ上に載せる。grid 移動と three.js Canvas の重ね方
- [ ] time-control 統合: time-control-03 の store 群をページ Context 構成へ束ねる
  - [ ] bot の move / action を tick 管理へ接続
- [ ] トップページからの遷移導線（`home/index.tsx` にリンク追加）

## 決定事項

- 2026-09-06: issue #137 起票。トップページ改修（#131）の後続テーマとして分離

## 懸念・リスク

- stage-04（画面座標 absolute）と box-bot（three.js Canvas）のレイヤ統合方式が未確定。`ui-three` の occlude 課題と同種の問題が出る可能性
- time-control-03 の store 数が多い。ページ 1 枚に持ち込む際の Context ネスト規模
- 遠近表現を CSS 2D で押し切るか 3D 化するかで実装コストが大きく変わる
- 「ジャンプ → 歩く」（proto-01）と stage の grid 移動の操作系をどう統合するか未整理
