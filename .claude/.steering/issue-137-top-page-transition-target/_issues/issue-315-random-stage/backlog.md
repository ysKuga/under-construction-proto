# 実装計画（find-path ステージのランダム生成）

- [ ] 生成: 通行不能箇所（障害物・一方通行）が意味のない箇所に置かれやすい
  - 経路に関与しない位置（盤面の隅等）へ置かれ、パズルとして効いていない
  - 一方通行の壁が盤面外周の辺に置かれる（壁として効かない）
  - 進入禁止の解消のみ [_closed/pr-320-stage-blocker-placement](_closed/pr-320-stage-blocker-placement/design.md) で対応、経路への影響は一旦見送り
  - (_closed/pr-320-stage-blocker-placement/decision-records.md 2026-10-11)
- [ ] ギミック: 障害物を排除する仕組みの検討
  - (_closed/pr-320-stage-blocker-placement/decision-records.md 2026-10-11)
- [ ] 履歴: アクションの結果（アイテムの携行・使用、ゴール到達等）を記録する
  - [_pr/pr-329-stage-action-history](_pr/pr-329-stage-action-history/design.md)
