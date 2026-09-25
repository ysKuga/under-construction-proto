# 実装計画（proto-03 の構造見直し）

- [x] PR-1 `refactor`: `*-layer` 8個を `_layers/` へ移動
  - import 更新
  - `_prototypes/CLAUDE.md` のパス修正
- [ ] PR-2 `refactor`: 共有 state を zustand store へ移す（PR-1 と並行可）
  - `_stores/waypoint-flow` 新設（`waypointFlowState`/`waypoints`/`objectiveCell`）
  - `currentCell`/`goalReached`/表示設定の置き場を決めて移す
- [ ] PR-3 `refactor`: `_contents/` を新設し `FindPathProto03Content` を分割（PR-1・PR-2 に依存）
  - 候補: `stage`/`bot-bubbles`/`control-panel`/`standalone-bot`
- [ ] PR-4 `docs`: `src/components/pages/CLAUDE.md` 新規作成
  - `_components`/`_layers`/`_contents` の役割
  - 依存方向（`_contents` → `_layers` → `_components`）
