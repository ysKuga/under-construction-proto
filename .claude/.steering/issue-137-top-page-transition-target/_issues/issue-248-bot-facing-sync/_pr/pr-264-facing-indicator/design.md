# proto-03 の独立 bot 横へステージ上の bot の向きを示す矢印を表示する

PR: #264（issue: #248）

## 目的

ステージ上の bot の向きを、独立 bot とは別の矢印で表示する。

## 背景・制約

- 親: [issue-248 design.md](../../design.md)
- 独立 bot は状態（歩行・EN 切れ等）の表示に使うため、向きは同期しない
- 向きの出所は player bot と共有する EventTarget の `ACTION_FACE`（yaw）
  - `yawToScreenAngle`（box-bot-01）で画面角度へ戻して矢印を回す
- 回転は ref への `transform` 直書きとし、再レンダリングを発生させない（[game-state](../../../../../../rules/react/game-state.md)）

実装計画: [backlog.md](backlog.md)。決定事項: [decision-records.md](decision-records.md)。

## 懸念・リスク

- `screenAngleToYaw` は 0.5° 刻みの数値逆算のため、`yawToScreenAngle` で戻した角度に最大 0.25° 程度の誤差が出る
  - 表示用途のため許容する
