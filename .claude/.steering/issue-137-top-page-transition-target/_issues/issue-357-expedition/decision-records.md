# 決定事項（find-path の本実装 expedition への移行）

- 2026-10-17: 親 #137 の backlog 項目「本実装を prototypes からコピーして設置する」を、複数 PR にわたるため #357 として切り出した。前提となる「prototypes 間の import 方針の再検討」も併せて移した（方針は親 decision-records.md 2026-10-17 本実装移行・名前）
- 2026-10-17（import 方針）: prototypes 間の import 方針を `src/prototypes/CLAUDE.md` へ追記した
  - 同系列のバージョン間ルール（若い番号からの import 可）は現状維持
  - 系列外からの import は共通置き場経由に限る。既存の直接 import は修正せず backlog へ記録する（prototypes は凍結扱いで、移行コストに見合わないため）
  - 本実装から prototypes への import を禁止する（移行方針「コピーして独立」と揃えるため）
  - 昇格はコピー前に行わない。expedition のコピー対象は変わらない
