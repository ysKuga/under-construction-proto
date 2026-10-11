# EN 切れ時のリセットで盤面ごと初期状態へ戻す

PR: #325（親: #315）

## 目的

EN 切れ時のチェックポイントへのリセットで、位置・EN だけでなく盤面ごと初期状態へ戻す。\
ランダム生成した盤面を、同じ配置のままやり直せるようにする。

## 背景・制約

- 親 design: [../../design.md](../../design.md)「仕様」「基本構成案」
- 現状のリセット（`FindPath-reset-to-checkpoint`、`use-reset-to-checkpoint-event-listener.ts`）
  - 位置・EN のみ戻し、盤面の状態・携行アイテムは保持する
  - (../../../../decision-records.md 2026-09-28 案A)
- 既存の盤面リセット手段
  - `ResetProvider`（`_contexts/reset`）: 配下を `key` で丸ごと再マウントし全 store を初期状態へ戻す（境界値テスト用、issue #181）
  - seed は `StageSeedProvider` で再マウントの外側に保持されるため、同じ配置へ戻る
- 履歴（手数の通算）は後続項目。再マウント対象の外に置く前提を崩さない

## 基本構成案

- `FindPath-reset-to-checkpoint` の受付判定（EN 切れ中・停止中・補給中でない）は維持する
- 受け付けた後の処理を、位置・EN の個別復帰から `useReset` による再マウントへ置き換える

## 懸念・リスク

- 再マウントで表示設定・霧のモード等、盤面以外の store も初期状態へ戻る
  - 保持すべきものがあれば再マウントの外側へ移す
- listener 自身が再マウント対象の内側にあるため、`reset` 呼出後の処理（`await` 後の参照等）が破棄済み store を触らないようにする
