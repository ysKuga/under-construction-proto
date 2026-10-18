# expedition の Stage07 を HexStage へ改名する

PR: #390（親: #357）

## 目的

expedition の hex-stage に残るコピー元の名前 `Stage07` を、ディレクトリ名 `hex-stage` に合わせて `HexStage` へ改名する。\
見た目・挙動は変えない。

## 背景・制約

- 親 backlog の項目「コピーした依存先に残るコピー元の名前を見直す」の前半
  - [../../backlog.md](../../backlog.md)
  - 後半（コメント内の言及）は別 PR
- 対象: `expedition` 配下（`_prototypes` 除く）
  - 識別子: `Stage07*`・`stage07*`・`useStage07*` 等 → `HexStage*`・`hexStage*`・`useHexStage*`
  - event key: `Stage07-*` → `HexStage-*`
  - ファイル・ディレクトリ名: `stage07-handle`・`use-stage07-event-*` → `hex-stage-handle`・`use-hex-stage-event-*`
- 対象外
  - `expedition/_prototypes` 配下・`src/prototypes/stage/stage-07`
  - コメント内の `find-path`・`proto-03`・`stage-06` 等への言及（識別子でないもの）

## 懸念・リスク

- なし
