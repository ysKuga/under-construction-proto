# 段階 4: ゲーム内容の深堀（ゴール到達判定 + アンロック接続）

親: [issue-137-top-page-transition-target/design.md](../../design.md) 段階 4

issue: #137
PR: #154

## 目的

find-path の残タスク（ゴール到達判定、proto-01 のジャンプ→歩く解放アンロック）を実装する。段階 3（PR-A〜D）で経路積み UI・tick 実行は前倒し実装済みのため、ここでは「一連の流れの完成」と「実行前アンロックの接続」が対象。

## 背景・制約

- 親 design.md 実装計画（段階 4）時点の未完項目:
  - スタート / ゴール配置、ゴール到達判定
  - proto-01「ジャンプ → 歩く解放」を実行前アンロックとして前段に接続
  - 障害物 / 歩数制限 / 一方通行セル（優先度低、本 PR スコープ外）
- 経路積み UI（`PlannedPathLayer`）・「実行」tick 進行（`ActionBar` + `useFindPathTick`）は段階 3 PR-C で実装済み
- proto-01（`src/components/pages/home/_prototypes/proto-01/`）のジャンプ 3 回 →「歩く」解放パターン（EventTarget 共有 + `useBoxBotActionDispatcher`）は find-path 側 proto とは別ページ。アンロック接続は find-path proto へ同パターンを持ち込む形になる

## PR 分割案

- **PR-E `137-find-path-goal-judgement`**: スタート / ゴール配置 + ゴール到達判定
  - stage-06 の grid 上にゴールセルを配置（表示・位置指定）
  - bot がゴールセルに到達した時点で判定（tick 消化後の位置チェック、または `moveActor` 呼出しにフック）
  - 到達時の UI 表示（クリア表示等、詳細は実装時に検討）
- **PR-F `137-find-path-jump-unlock`**: 「ジャンプ → 歩く解放」を実行前アンロックとして接続
  - proto-01 の EventTarget 共有パターンを find-path proto へ持ち込む
  - ジャンプ 3 回未達の間は「実行」ボタン（`ActionBar`）を無効化
  - 解放後は現状通り「実行」で tick 進行

依存: PR-E / PR-F は独立（ゴール到達判定とアンロック条件は別レイヤ）。着手順 E → F（到達判定が本筋機能、アンロックは追加ゲートのため）。

障害物 / 歩数制限 / 一方通行セルは優先度低のため本サブ steering のスコープ外（親 design.md に未完のまま残す）。

## 実装計画

- [x] PR-E: スタート / ゴール配置 + ゴール到達判定
- [x] PR-F: ジャンプ → 歩く解放を実行前アンロックとして接続

## 決定事項

- 2026-09-11: 段階 3 完了（PR-A #143 / PR-B #151 / PR-D #152 / PR-C #153、全マージ済）を受け段階 4 着手。空 PR #154 先行作成 → 本ディレクトリへ配置（段階 3 と同じ着手確定パス）
- 2026-09-11: 段階 4 を PR-E（ゴール到達判定）/ PR-F（アンロック接続）の 2 本に分割。着手順 E → F
- 2026-09-12: PR-E 実装完了。トリガ位置は tick ドライバ側（`useFindPathTick` の `applyNextStep`）に確定。`moveActor` 呼出し直後に `next` 座標を `GOAL_POSITION` と比較し、一致したら `reachedGoal` state を true にする。`execute()` 呼出し時にリセット（再実行でクリア表示をクリア）
  - **ゴール座標は隅を避けて `{col: 3, row: 3}` に確定**（GRID 5x5）。当初 `{col: 4, row: 4}`（右下隅）で試したところ、`ActorsLayer` の動作確認用静的 bot（`staticCells` = `(0,0)` / `(cols-1,rows-1)`）と同一セルになり、静的 bot の Canvas がクリックを吸ってしまい `PlannedPathLayer` のセルクリックが効かないバグを Storybook + Playwright 実機確認で発見。隅 2 マスは静的 bot 占有のため今後ゲーム内配置（ゴール・スタート等）から除外する
  - ゴール表示は `_components/goal-marker-layer/`（`PlannedPathLayer` と同型の絶対配置オーバーレイ、`pointerEvents: none` の非対話層）を新設し `GOAL_POSITION` セルに 🚩 表示。`Stage06` の children として `PlannedPathLayer` より下（DOM順で先）に重ね、クリックは `PlannedPathLayer` へ通す
  - 到達表示は `ActionBar` に `reachedGoal` を渡し「🎉 ゴール到達」を条件表示（`useFindPathTick` を呼ぶ箇所が `ActionBar` のみのため、hook の呼出し元をここに一本化）
  - 実機確認（Storybook + Playwright headless Chromium）: 旗表示 → 予定経路をゴールまで積む → 実行 → tick 消化後にクリア表示、を確認。単体テスト（`use-find-path-tick.test.ts`）にも到達 / リセットのケースを追加
- 2026-09-12: PR-F 実装完了。theater 版 `box-bot-01`（find-path が使う実体）に外部 `eventTarget` 共有機能を追加公開（`jumpAction` / `ACTION_JUMP` / `useBoxBotActionDispatcher` を `box-bot-01/index.tsx` から再 export）。home proto-01 が使う `samples/figure/box-bot`（旧版）とは別コンポーネントのため、jump 演出そのものは既に対応済みだったが外部公開されていなかった
  - `useJumpUnlock`（`useWalkUnlock` と同型）を find-path proto 側に新設。ACTION_JUMP 3 回で「実行」を解放
  - **ジャンプ操作は box-bot 本体クリックでなく `ActionBar` の専用「ジャンプ」ボタンに確定**。当初 home 側と同様「bot 本体(body)クリック」で実装したが、傾いた床上の 3D 空間（`preserve-3d` + `rotateX`）で、player bot（逆 rotateX で画面垂直に立つ）と `PlannedPathLayer`（傾いたまま平面上）のクリック領域が奥行きにより競合し、bot クリックが安定して拾えない不具合を Storybook + Playwright 実機確認で発見。DOM 順（`GeoLayer → children → ActorsLayer`、bot を最前面に）を試したが解消せず、3D 空間内の実際の奥行き競合が原因と判断。box-bot 本体クリックでの jump/spin 発火は stage-06 の grid 操作と併用不可という制約が明らかになったため、専用ボタン方式へ変更
  - この過程で `ActorsLayer` に `interactive` prop を追加（`Stage06.interactive` から伝播）。`false` で bot 本体クリックの「次セルへ順送り」を無効化し、`actions` で jump 等を有効化した際にセル移動と同時発火しないようにした。find-path は `interactive={false}` のため恩恵を受ける
  - 解放後は「ジャンプ」ボタン・ヒント文言を非表示にする
  - 実機確認（Storybook + Playwright）: ジャンプボタン初期表示・「実行」disabled → 3 回クリックで解放・ボタン非表示 → 経路積み → 実行 → ゴール到達、の一連の流れを確認

## 懸念・リスク

- ~~ゴール到達判定のトリガ位置（`moveActor` 呼出し側 or tick ドライバ側）は PR-E 着手時に要検討~~ → tick ドライバ側（`applyNextStep`）に確定
- ~~アンロック接続（PR-F）は proto-01 の EventTarget パターンを find-path proto へどう持ち込むか（そのまま流用 / find-path 用に作り直すか）は PR-F 着手時に要検討~~ → `useWalkUnlock` と同型の `useJumpUnlock` を新設。操作は box-bot 本体クリックでなく専用ボタンに変更（3D クリック競合のため）
- 複数 actor 導入時（障害物 NPC 等、将来）は隅 2 マス以外にも占有セルが増えうる。ゲーム内オブジェクト配置は `ActorsLayer` の静的表示と衝突しないか都度確認が要る
- **stage-06 の 3D 空間（`preserve-3d` + `rotateX`）で、bot 本体クリックと同一セルの平面オーバーレイ（`PlannedPathLayer`/`GoalMarkerLayer` 等）のクリック領域が奥行きにより競合しうる**。今回は player bot 側の操作を専用ボタンへ逃がして回避したが、根本原因（3D 奥行きソートの詳細）は未解明のまま。他レイヤーでも隅・傾き次第で類似の競合が起きうる。親 design.md 懸念「遠近に伴うセルのクリック判定歪み」と同系統の課題として残す
