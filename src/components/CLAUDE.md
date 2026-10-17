# src/components/CLAUDE.md

## 実装と組み合わせ (implement and composition)

component を「実装する箇所」と「組み合わせる箇所」に分ける。

- 実装する箇所: ロジック・store 購読・見た目を持つ
  - 独立した component（組み合わせる対象になるもの）を内側へ入れる場合、children・slot で外から受ける。自身で import して配置しない
  - 実装を分割しただけの子部品（親から props を受け、単独で意味を持たない）は、親配下の `_components/` から import してよい（[component-nesting](../../.claude/rules/react/component-nesting.md)）
- 組み合わせる箇所: 実装した component をレゴブロックのように並べるのみ
  - ロジック・状態・hook を持たない
  - 許容: 定数の列挙で同じ component を並べる（`ITEM_KINDS.map` 等）
- 組み合わせる対象は、それぞれ独立した component にする
  - 組み合わせる側から props でデータ・handler を渡さずに動く
  - 必要な値は自身で context 経由の store を selector で購読する（[component-input-layers](../../docs/concept/implementation/component-input-layers/README.md)）
  - 理由: 組み合わせる側へ配線のロジックが溜まると、並べ替え・入替えのたびに配線を直す必要が生じる

## レイアウト

組み合わせる側がレイアウトを用意し、子をはめ込む。

- 子同士の配置（並び・間隔・揃え）は組み合わせる側の className に集約する
  - 子側に配置の実装があると、組み合わせる側と整合させる必要が生じるため
  - 例: expedition の `stage-area` が `flex` で `stage`・bot の状態表示を並べる
- 子は自身の内側の見た目のみ持ち、外側の余白・配置を持たない

ページ内の構成（`_contents` 等）への適用は [pages/CLAUDE.md](pages/CLAUDE.md) 参照。
