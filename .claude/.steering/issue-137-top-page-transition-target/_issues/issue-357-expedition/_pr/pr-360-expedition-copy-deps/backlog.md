# 実装計画（expedition への依存先のコピー）

- [ ] stage のコピー先ディレクトリ名を決める
  - 候補: `expedition/_components/hex-stage`（props 駆動の部品として扱う）
- [ ] stage-07 をコピーする
  - 同梱: stage-06/constants・stage-05 の `use-perspective-control`・time-control-03/types
  - 型は使用するもののみコピーする
- [ ] energy store を `expedition/_stores/energy` へコピーする
- [ ] コピーした test を通す
- [ ] `src/prototypes/`・`_prototypes/` への import が残っていないか確認する
