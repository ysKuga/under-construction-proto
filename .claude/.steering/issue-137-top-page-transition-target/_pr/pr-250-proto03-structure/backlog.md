# 実装計画（proto-03 の構造見直し）

- [x] PR-1 `refactor`: `*-layer` 8個を `_layers/` へ移動
  - import 更新
  - `_prototypes/CLAUDE.md` のパス修正
- [x] PR-2 `refactor`: 共有 state を zustand store へ移す（#251）
  - `_stores/waypoint-flow` 新設（`waypointFlowState`/`waypoints`/`objectiveCell`）
  - `currentCell` → actors store 参照
  - `_stores/display-settings`/`_stores/goal` 新設
- [x] PR-3 `refactor`: `_contents/` を新設し `FindPathProto03Content` を分割（#252）
  - `stage`/`bot-bubbles`/`control-panel`（独立 bot は Content に残す）
- [ ] PR-4 `docs`: `src/components/pages/CLAUDE.md` 新規作成
  - `_components`/`_layers`/`_contents` の役割
  - 依存方向（`_contents` → `_layers` → `_components`）
