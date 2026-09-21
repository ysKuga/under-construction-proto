# 実装計画（エネルギー）

- [ ] proto-03 へ Energy-consume/Energy-depleted 経由の仕組み自体を導入する
  - `EnergyDebugPanel` の `-1` は proto-01 分のみイベント経由へ対応済み（decision-records.md 2026-09-21）
  - proto-03 は `handleCellChange` の直接 store 操作 + 自前差分判定のまま、`Energy-depleted` 購読自体が未導入のため `-1` のイベント化が予防姿勢演出に繋がらない
  - `+1`（回復）側イベントは未実装のため対象外（decision-records.md 2026-09-20 でスコープ外と判断済み）
