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

## ゲーム内容

経路プランニング制（キャラ操作 → ゴール）。

- グリッドステージにスタート・ゴール配置
- プレイヤーが移動先セルを順に指定 → `planned-path` store に積む
- 「実行」で time-control tick に乗せて bot が 1 手ずつ歩く
- 障害物 / 歩数制限 / 一方通行セルでパズル性（初期は最小、まず到達判定まで）
- proto-01 の「ジャンプ 3 回 → 歩く解放」を実行前アンロックとして前段に組込み可
- time-scale / progress-mode をそのまま早送り・巻戻し UI に流用
- 新規実装は「ゴール到達判定」「経路積み UI」が中心。`planned-path` / `schedule-preview` / `path` store と stage-04 の `MoveIntent` は流用

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

前提:

- [x] 配置先確定: 新 route `/find-path`（`src/app/find-path/page.tsx` → `src/components/pages/find-path/`。`src/app/CLAUDE.md` の re-export ルール踏襲、`components/pages/README.md`「使用構造」へ追記）
- [ ] ページ枠の骨組み作成（`components/pages/find-path/` + トップからの遷移導線 `home/index.tsx` にリンク追加）

段階 1: ステージ（遠近適用）

- [x] stage-04 を土台に遠近表現を追加した試作 → `src/prototypes/stage/stage-05`（`_lib/perspective.ts` の `projectCell` へ投影を集約）
- [x] 遠近表現の方式確定 → CSS 2D scale 補間（最奥行 `depthScale` 倍・最前行 等倍で線形補間、各行のセル高を奥から積み上げ）
- [x] 奥行きに伴う z-index / 描画順の扱い → z-index 不使用。奥の行から描画する DOM 順で解決。複数 actor / 障害物の前後（row 昇順ソート）は段階 4

段階 2: bot 配置

- [ ] `src/components/samples/figure/box-bot` をステージ上に載せる（stage-05 の `Robot01` を box-bot へ差し替え。今後 actor は基本 box-bot）
- [ ] grid 移動と three.js Canvas の重ね方（`ui-three` の occlude 課題を踏まえる）

段階 3: time-control 適用

- [ ] time-control-03 の store 群をページ Context 構成へ束ねる
- [ ] bot の move / action を tick 管理へ接続

段階 4: ゲーム内容の深堀

- [ ] スタート / ゴール配置、ゴール到達判定
- [ ] 経路積み UI（セル指定 → `planned-path` へ push）
- [ ] 「実行」で tick 進行 → bot が 1 手ずつ歩く配線
- [ ] proto-01「ジャンプ → 歩く解放」を実行前アンロックとして前段に接続
- [ ] 障害物 / 歩数制限 / 一方通行セル（パズル性、優先度低）

## 決定事項

- 2026-09-06: issue #137 起票。トップページ改修（#131）の後続テーマとして分離
- 2026-09-06: route 名 `/find-path` 確定。`proto-02` 枠でなく新 route（トップからの遷移先が要件のため）
- 2026-09-06: ゲーム内容は経路プランニング制に確定（tick 実行前にプレイヤーが `planned-path` を組む方式）
- 2026-09-06: 着手順を段階 1 ステージ → 段階 2 bot 配置 → 段階 3 time-control → 段階 4 ゲーム内容深堀 に確定
- 2026-09-06: 遠近方式は CSS 2D scale 補間に確定（perspective/rotateX・three.js 3D 化は不採用）。試作は `stage-05` 新設、stage-04 から import
- 2026-09-06: actor は box-bot を使用。以後このプロジェクトの操作キャラは基本 box-bot に統一（`Robot01` は stage-04 由来の暫定）

## 懸念・リスク

- stage-04（画面座標 absolute）と box-bot（three.js Canvas）のレイヤ統合方式が未確定。`ui-three` の occlude 課題と同種の問題が出る可能性
- time-control-03 の store 数が多い。ページ 1 枚に持ち込む際の Context ネスト規模
- 遠近を CSS 2D scale 補間で確定（stage-05）。床面の傾き表現・遠近に伴うクリック判定の歪み補正は未対応、段階 2 以降で box-bot（three.js Canvas）を重ねる際に再検討
- 「ジャンプ → 歩く」（proto-01）は実行前アンロックとして前段に置く方針だが、grid 移動の操作系との配線は未整理
