# 実装計画（find-path の本実装 expedition への移行）

- [ ] prototypes 間の import 方針を再検討する
  - 背景: なし崩しに import した部分がある
  - 対象: `src/prototypes/CLAUDE.md`（若いバージョンからの import 許容・共通置き場への昇格）
  - 本実装への移行方針（コピーして独立）との整合を取る
- [ ] 未決事項を決める
  - 元にする prototype（proto-03 のみか）
  - test・story もコピー対象とするか
- [ ] 依存先を本実装側へコピーする
  - `src/prototypes/stage/stage-07`
  - `src/prototypes/stage/stage-06/constants`
  - `find-path/_prototypes/_stores/energy`（proto-01/02/03 共有）
  - `src/prototypes/time-control/time-control-03/types`
  - (../../decision-records.md 2026-10-17 本実装移行)
- [ ] `expedition` に合わせて改名する
  - 対象: `FindPath-` の event 名・`FindPathProto03*` のコンポーネント名等
  - (../../decision-records.md 2026-10-17 名前)
- [ ] route を配線する
  - 現状: `src/app` に未設置
