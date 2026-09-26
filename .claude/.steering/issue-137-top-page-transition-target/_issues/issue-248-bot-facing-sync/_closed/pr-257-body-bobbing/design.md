# proto-03 のステージ上の bot と独立 bot を歩行中に上下させる

PR: #257（issue: #248）

## 目的

ステージ上の bot と独立 bot を、box-bot の story（`body-bobbing`）と同様に歩行中に上下させる。

## 背景・制約

- 親: [issue-248 design.md](../../design.md)
- `bodyBobbingAction` は dispatch 不要で、walking の脚 swing に常時連動する（`actions` へ登録するだけ）
- 対象外
  - 脚振り周期のずれへの対応（PR #256 の目視確認で大きな問題なしと判断）
  - 移動速度に応じた振りの回数（周期）の調整

実装計画: [backlog.md](backlog.md)。決定事項: [decision-records.md](decision-records.md)。

## 懸念・リスク

- 上下量 `height` の既定値（0.025）はステージ上の小さい bot では視認できない
  - Stage07 にスライダー(`bodyBobHeight`)を追加して対応（[decision-records.md](decision-records.md)）
