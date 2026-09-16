# 実装計画（issue #137）

- [ ] 「1 手戻す」と「戻る」を別枠操作として分離検討。インセンティブ設計未確立（design.md 懸念・リスク）
- [ ] 障害物 / 歩数制限 / 一方通行セル（パズル性、「挑戦」「工夫」実現の中心方針）。衝突判定はセル境界のみで判定する方針確定済み（decision-records.md 2026-09-16）
- [ ] 到達済みマス表示 ON 時 or 視界制限不採用時、非隣接クリックで自動経路探索移動（旧 stage-04 の BFS 実装移植候補。[stage-04-pathfinding/design.md](../_closed/20260716-stage-04-pathfinding/design.md)）
