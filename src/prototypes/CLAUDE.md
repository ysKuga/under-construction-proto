# src/prototypes/CLAUDE.md

## バージョン間の依存ルール

`stage-01 → 02 → 03` `time-control-01 → 02 → 03` のように番号付きで実装を重ねる prototype 対象。

- 自身より小さい番号の実装から import 可能。逆は不可。
  - 例: `time-control-03` は `time-control-02`/`time-control-01` に依存可能。
- 変更不要なファイル (純粋関数・型定義等) はコピーせず import で共有する。
- ロジック変更が生じるファイル、または Context/store の型に依存するファイルは新バージョン側に新規作成する。
- 実装が固まった内容は、prototype 直下の共通置き場 (例: `time-control/_lib/`) に昇格させ、番号なしの共通実装として全バージョンから参照可能にする。

## 系列外からの依存ルール

`stage` から `time-control`、`components/pages/*/_prototypes/` から `src/prototypes/` のように、系列をまたぐ import 対象。

- 番号付き実装 (`stage-07` 等) の内部を直接 import しない。共通置き場 (`<系列>/_lib/` 等) 経由のみ可能。
- 系列外から参照したくなった時点で、対象を共通置き場へ昇格させる。
- 既存の直接 import は修正せず残す (prototypes は凍結扱いのため)。

## 本実装からの依存ルール

本実装 (prototypes を元に設置した page 等) から、`src/prototypes/`・`components/pages/*/_prototypes/` を import しない。

- 必要な実装は本実装側へコピーして独立させる。
- 依存方向は prototypes → 本実装の一方向に限る。

経緯・検討過程は [README.md](README.md) 参照。
