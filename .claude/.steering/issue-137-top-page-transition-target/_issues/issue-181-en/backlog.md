# 実装計画（エネルギー）

- [ ] 回復アイテムの配置を検討
  - (design.md 懸念・リスク)
- [ ] `EnergyDebugPanel` の +-操作を Energy-consume/Energy-depleted イベント経由にする
  - 現状 store 直接操作のため EN 切れ演出（予防姿勢）がデバッグパネル経由では発火しない
  - proto-01 の `-1` はイベント経由への切替可能だが、`+1`（回復）側イベントは未実装（decision-records.md 2026-09-20 でスコープ外と判断済み）
  - proto-03 はそもそも Energy-consume/Energy-depleted 経由の仕組み自体を導入していない（直接 store 操作 + 自前差分判定）
