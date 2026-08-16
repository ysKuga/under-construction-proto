# component の入力 (props/store/computed) 分離

component が扱う入力の分離について。[docs/concept/README.md](../README.md) の一覧の詳細。

## 課題

component が受け取る値の性質 (呼び出し元由来か、内部状態か、算出値か) を区別せず実装すると、責務の所在が曖昧になる。

- 例: `progressMode` (行動進行モードの全 actor 代表値) を `ActionBar` の hooks 内で `actor-settings-store` から直接算出していた旧実装 (`time-control-03`)。「全 actor 代表値で決める」という scope 固有の判断がリーフ component のロジックに埋め込まれ、他 component から参照・再利用しづらい構造になっていた。

## 方針: props / store / computed の3層分離

- **props**: 呼び出し元から注入される値。`createPropsContext` 経由で配布し、部品と外部とのインターフェースとして扱う。
- **store**: 部品内部で変化しうる状態。zustand vanilla store、`createStoreContext` 経由、selector 購読で再レンダリングを最小化する。
- **computed**: props・store から一意に算出される派生値。算出ロジック自体が「その scope 固有の判断」である場合に、値を使う個別 component から切り出す。

### 各層の使い分け基準

- 値が呼び出し元から与えられるか → props
- 値がユーザー操作等で内部変化しうるか → store
- 値は他の props/store から一意に決まるが、その決定ロジック自体が scope 固有の意味を持つか (個別 component の関心ごとを超えるか) → computed
  - 判断の目安: 「全 actor 代表値で決める」という判断自体は個別 component (`ActionBar`) の関心ごとではなく scope (`TimeControl03`) 全体のルールである、という言語化がそのまま採否の基準になる

### 実装パターン

- computed も store と同型で実装する (Context に生 store instance を乗せ、selector 購読)。理由は re-render 最小化。Context value に生値そのものを乗せると値の変化のたびに Provider 配下全体が再レンダリング対象になるが、store instance (不変参照) を乗せて selector 購読すれば、実際に値を参照する component のみが再レンダリング対象になる。
- computed は依存元 store の Context を参照するため、Provider は `StoresProvider` の内側に配置する。
- `_stores`/`_events` と同じ自己完結モジュール構成 (`index.ts`/`index.contexts.tsx`/`types.ts` + 個別実装ファイル) を揃え、外部消費者は集約 index 経由で参照する。
- 命名は対象 scope 名を prefix にした具体名で統一する (`useTimeControl03Props`/`useTimeControl03Computed` 等)。

## トレードオフ・懸念

層を増やすほど「新しい値をどこに置くか」の判断コストが増える。判断基準を明文化してもグレーゾーンは残る (store 側に算出ロジックを持たせるか computed に切り出すか等)。また computed が store に依存する一方向構造を保つため、依存元 store が多いプロトタイプでは Provider のネストが深くなりやすい。

## 関連

- 実装例: [time-control-03/_computed/README.md](../../../src/prototypes/time-control/time-control-03/_computed/README.md)
- 実装計画・決定事項: `.claude/.steering/20260817-time-control-03-computed-layer/design.md`
- store 層の元になった前例: `.claude/.steering/_closed/20260812-time-control-03-stores-context-restructure/design.md`
