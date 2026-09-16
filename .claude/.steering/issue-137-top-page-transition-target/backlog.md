# 実装計画（issue #137）

- [ ] 「1 手戻す」と「戻る」を別枠操作として分離検討。インセンティブ設計未確立（design.md 懸念・リスク）
- [ ] 障害物 / 歩数制限 / 一方通行セル（パズル性、「挑戦」「工夫」実現の中心方針）
  - 衝突判定はセル境界のみで判定する方針確定済み（decision-records.md 2026-09-16）
  - 要素ごとに個別 steering へ分割: [障害物](20260916-obstacles/design.md) / [エネルギー](20260916-energy/design.md)（歩数制限から改称、decision-records.md 2026-09-16） / [一方通行セル](_closed/pr-180-one-way-cell/design.md)
  - 障害物は proto-01（PR #176）・proto-03（[20260916-proto03-obstacles/decision-records.md](20260916-proto03-obstacles/decision-records.md) 2026-09-16）で実装済み。一方通行セルは proto-01・proto-03 双方に実装済み（PR #180）。エネルギーは検討中（PR #180 マージ後に着手、design.md 背景・制約）
- [ ] 到達済みマス表示 ON 時 or 視界制限不採用時、非隣接クリックで自動経路探索移動（旧 stage-04 の BFS 実装移植候補。[stage-04-pathfinding/design.md](../_closed/20260716-stage-04-pathfinding/design.md)）
- [ ] ステージ上で動作する bot とは別に bot を独立表示し、「現在どちらを向いているか」を同期して表示する実装を検討
- [ ] find-path は現状固定ステージだが、ランダム生成を検討中
