# 実装計画（expedition の並べ方を狭い画面向けに切り替える）

- [ ] `stage`・`bot-status-panel` を `stage-section/_contents/` へ移し、`StageGroup` を廃止する
  - 旧パスの参照を付け替える（`stage-group` を前例に挙げる CLAUDE.md 含む）
- [ ] `StageSection` を grid にし、`md` 未満で並べ方を切り替える
  - (../../decision-records.md 2026-10-19 並べ方)
- [ ] ページの外枠を `min-h-screen` にし、`md` 未満は上寄せにする
- [ ] `story-verifier` で `md` 未満・以上の並びを確認する
