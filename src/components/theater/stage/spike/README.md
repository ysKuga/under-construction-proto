# components/theater/stage/spike/

actor の位置・向き等を示す目印 (場ミリ、[docs/terminology/theater/stage/spike/](../../../../../docs/terminology/theater/stage/spike/README.md)) を格納する。

## 目印

- `facing-arrow/` — 向き矢印。回転は呼び出し側が ref へ直書きする (再レンダリングなし)。
  - `center/` — 矢印自身の中心で回転する。find-path proto-03 で採用 (#248)。
  - `orbit/` — 基準 hex の外側を周回し、位置で向きを示す。
