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

- [ ] PR-E: スタート / ゴール配置 + ゴール到達判定
- [ ] PR-F: ジャンプ → 歩く解放を実行前アンロックとして接続

## 決定事項

- 2026-09-11: 段階 3 完了（PR-A #143 / PR-B #151 / PR-D #152 / PR-C #153、全マージ済）を受け段階 4 着手。空 PR #154 先行作成 → 本ディレクトリへ配置（段階 3 と同じ着手確定パス）
- 2026-09-11: 段階 4 を PR-E（ゴール到達判定）/ PR-F（アンロック接続）の 2 本に分割。着手順 E → F

## 懸念・リスク

- ゴール到達判定のトリガ位置（`moveActor` 呼出し側 or tick ドライバ側）は PR-E 着手時に要検討
- アンロック接続（PR-F）は proto-01 の EventTarget パターンを find-path proto へどう持ち込むか（そのまま流用 / find-path 用に作り直すか）は PR-F 着手時に要検討
