# 選択肢パネルの新設（実行・中継点・キャンセル）

PR: #407（親: #393）

## 目的

選択肢の吹き出し（実行・中継点・キャンセル）を、設定アイコンの右隣の選択肢パネルへ移す。

## 背景・制約

- 方針・並び（../../decision-records.md 2026-10-23 選択肢パネル）
  - 上端・左端: 設定アイコンの右隣
  - 幅: 画面右端まで（`md` 以上はステージの右端まで）
  - 高さ: 状態表示と同じ。あふれたらスクロール
  - 下の段へ設定ポップオーバーと同様に重ね、状態表示より少しずらす
- event 設計（../../decision-records.md 2026-10-23 選択肢パネルの event 設計）
  - 実行: 既存の `Expedition-execute-path` を使う
  - 中継点の切替・キャンセル: `waypoint-flow` store を直接操作する
  - 表示条件: `useBotBubbles` の `visible$` の組み立てを移し、排他は [resolveVisibility](../../../../../../../src/components/theater/aside/bubble-slots/_lib/resolve-visibility.ts) を使い回す
- 構成
  - 表示部品: `_components/choice-panel`（選択肢を props で受け、story 付き）
  - 組み合わせ: `_contents/choice-panel`
- 依存: 設定ポップオーバーの Esc の fix PR（decision-records.md 2026-10-25 Esc）
- 対象外: EN スポットの使用・EN 切れの救助・揺れの event の改名（後続 PR）

## 懸念・リスク

- `resolveVisibility` がパネルの選択肢の形に合うか未確認
