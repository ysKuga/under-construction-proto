# src/components/CLAUDE.md

## 実装と組み合わせ (implementation and composition)

component を「実装する箇所」と「組み合わせる箇所」に分ける。

- 実装する箇所: ロジック・store 購読・見た目を持つ
  - 構造がデータで決まるもの（配列の列挙・条件分岐）も実装
  - 入れ子のレイアウト（ある要素へ別の要素を重ねる等）を持つ部品の組み合わせも実装
  - 中で使う部品は、親配下の `_components/` から import してよい（[component-nesting](../../.claude/rules/react/component-nesting.md)）
  - `_layers/` 等、他の置き場の独立した要素を内側へ入れる場合、children・slot で外から受ける。自身で import して配置しない
- 組み合わせる箇所: 子を並べ、そのレイアウトを設定するのみ
  - ロジック・状態・hook を持たない
- 組み合わせる対象は、それぞれ独立した component にする
  - 組み合わせる側から props でデータ・handler を渡さずに動く
  - 必要な値は自身で context 経由の store を selector で購読する（[component-input-layers](../../docs/concept/implementation/component-input-layers/README.md)）
  - 理由: 組み合わせる側へ配線のロジックが溜まると、並べ替え・入替えのたびに配線を直す必要が生じる

## レイアウト

組み合わせる側がレイアウトを用意し、子をはめ込む。

- 子同士の配置（並び・間隔・揃え）は組み合わせる側の className に集約する
  - 子側に配置の実装があると、組み合わせる側と整合させる必要が生じるため
  - 例: expedition の `stage-group` が `flex` で `stage`・`bot-status-panel` を並べる
- 子は自身の内側の見た目のみ持ち、外側の余白・配置を持たない
- 1 つの組み合わせが持つレイアウトは 1 階層のみ。自身のレイアウトを全ての子へ当てはめる
  - 入れ子のレイアウトが要る場合、以下のどちらかへ分ける
    - 子同士が独立している（並べるのみ） → 1 階層ずつ別の組み合わせにする
    - 子同士が関係する（重ねる等） → 入れ子のレイアウトを持つ実装にする
  - 理由: スコープの違うレイアウトが 1 つの組み合わせへ混ざると、どの子がどの並びに属するか読み取りにくい
    - 例: expedition の `stage-area` が、自身の縦並びに加え、1 段目の横並び・bot の状態表示の重ね方まで持っていた

ページ内の構成（`_contents` 等）への適用は [pages/CLAUDE.md](pages/CLAUDE.md) 参照。
