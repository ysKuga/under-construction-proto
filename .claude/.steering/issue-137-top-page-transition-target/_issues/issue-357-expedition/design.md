# find-path の本実装 expedition への移行

issue: #357（親: #137）

## 目的

find-path の prototypes を元に、prototypes から独立した本実装 `expedition` を設置する。

## 背景・制約

- 親 backlog の項目「本実装を prototypes からコピーして設置する」から切り出した
  - [../../backlog.md](../../backlog.md)
- 移行方針: 元の実装は移動せず prototypes に残し、コピーで独立した本実装を設置する
  - (../../decision-records.md 2026-10-17 本実装移行)
- 名前: 本実装は `expedition`、prototypes は `find-path` のまま残す
  - (../../decision-records.md 2026-10-17 名前)
- page の構成: [src/components/pages/CLAUDE.md](../../../../../src/components/pages/CLAUDE.md)
- prototypes 間の import: [src/prototypes/CLAUDE.md](../../../../../src/prototypes/CLAUDE.md)（若いバージョンからの import 許容・共通置き場への昇格）

## 懸念・リスク

- proto-03 は prototypes を広く import しており、コピー対象が大きい
- `find-path/_prototypes/_stores/energy` は proto-01/02/03 で共有している
