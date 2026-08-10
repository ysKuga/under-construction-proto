# src/prototypes/CLAUDE.md

## バージョン間の依存ルール

`stage-01 → 02 → 03` `time-control-01 → 02 → 03` のように番号付きで実装を重ねる prototype 対象。

- 自身より小さい番号の実装から import 可能。逆は不可。
  - 例: `time-control-03` は `time-control-02`/`time-control-01` に依存可能。
- 変更不要なファイル (純粋関数・型定義等) はコピーせず import で共有する。
- ロジック変更が生じるファイル、または Context/store の型に依存するファイルは新バージョン側に新規作成する。
- 実装が固まった内容は、prototype 直下の共通置き場 (例: `time-control/_lib/`) に昇格させ、番号なしの共通実装として全バージョンから参照可能にする。

経緯・検討過程は [README.md](README.md) 参照。
