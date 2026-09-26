# src/components/CLAUDE.md

## レイアウト

格納する側（子を並べる component）がレイアウトを用意し、子をはめ込む。

- 子同士の配置（並び・間隔・揃え）は親側の className に集約する
  - 子側に配置の実装があると、親側と整合させる必要が生じるため
  - 例: find-path proto-03 の `stage-area` が `flex gap-8` で `stage`・`standalone-bot` を並べる
- 子は自身の内側の見た目のみ持ち、外側の余白・配置を持たない
- 親は組み合わせに徹し、ロジックを持たない
  - 単純な制御は許容する
  - 表示制御（表示・非表示の切替等）は、再レンダリングの範囲を限定するため要素側へ移すことを検討する
  - 要素側へ値を渡す場合、props でなく context 経由の store を selector で購読する（[component-input-layers](../../docs/concept/implementation/component-input-layers/README.md)）

ページ内の構成（`_contents` 等）への適用は [pages/CLAUDE.md](pages/CLAUDE.md) 参照。
