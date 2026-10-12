# 実装計画（find-path ステージのランダム生成）

- [ ] 生成: 通行不能箇所（障害物・一方通行）が意味のない箇所に置かれやすい
  - 経路に関与しない位置（盤面の隅等）へ置かれ、パズルとして効いていない
  - 一方通行の壁が盤面外周の辺に置かれる（壁として効かない）
  - 進入禁止の解消のみ [_closed/pr-320-stage-blocker-placement](_closed/pr-320-stage-blocker-placement/design.md) で対応、経路への影響は一旦見送り
  - (_closed/pr-320-stage-blocker-placement/decision-records.md 2026-10-11)
- [ ] ギミック: 障害物を排除する仕組みの検討
  - (_closed/pr-320-stage-blocker-placement/decision-records.md 2026-10-11)
- [ ] 履歴: 手数の記録と表示
  - 手数はリセットをまたいで通算
  - リセット自体も履歴へ追加
  - 全件保持（上限 10000 件程度）
  - [_pr/pr-326-stage-move-history](_pr/pr-326-stage-move-history/design.md)
  - [_pr/pr-327-stage-move-history-display](_pr/pr-327-stage-move-history-display/design.md)
