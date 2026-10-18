# 実装計画（find-path の本実装 expedition への移行）

- [ ] 系列外からの直接 import を共通置き場経由へ改める（任意、着手予定なし）
  - 現状: `expedition/_prototypes` の proto-01/02/03・`_stores` → stage-06/07・time-control-03、stage-07 → time-control-03/types
  - 昇格候補の筆頭: `time-control-03/types`（4 か所から参照）
  - (decision-records.md 2026-10-17 import 方針)
- [ ] route を配線する
  - 現状: `src/app` に未設置
