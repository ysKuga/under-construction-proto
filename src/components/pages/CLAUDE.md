# src/components/pages/CLAUDE.md

## ページ内の構成

ページ（試作含む）の実装が大きくなった場合、以下の構成で分ける。
例: `expedition`（issue #357）。\
`expedition/_prototypes/proto-03` は `_contents`/`_components` の配置・命名が下記の基準に未対応（試作のため）。

```
page-name/
  index.tsx            # Provider 群とページ内容を組み合わせるのみ
  index.providers.tsx  # Provider 群の組み合わせ
  index.types.ts       # index.tsx・index.providers.tsx の双方が参照する props 型
  _contents/           # ページ内容。組み合わせと、組み合わせが並べる子
    index.tsx          # 各 section を並べるのみ
    stage-section/     # ステージ・状態表示等を並べるのみ
      _contents/       # section が並べる子（group・実装）
  _layers/             # ステージの children として重ねるレイヤー
  _stage-components/   # ステージ本体（`hex-stage` 等）
  _components/         # 複数箇所で使う部品・ページ内容に含まれない実装（デバッグ要素等）
  _contexts/           # 個別 Context の実装
  _stores/
```

### `_components`/`_layers`/`_contents` の役割

置き場は親子関係で分ける（[components/CLAUDE.md](../CLAUDE.md)「実装と組み合わせ」）。
store・context の購読有無、実装かどうかでは分けない。

- `_contents/`: ページ内容の置き場
  - 組み合わせ（1 階層のレイアウトで子を並べる）と、組み合わせが並べる子を置く
  - 組み合わせが並べる子は、実装（`stage` 等）でも組み合わせ配下の `_contents/` へ置く
  - 組み合わせ自身はロジック・状態・hook・props を持たない。定数も定義しない
- `_components/`: 実装が中で使う部品の置き場
  - 特定の実装からのみ使う部品は、その実装配下の `_components/`
  - ページ内容に含まれない実装（story が並べるデバッグ要素等）も `_components/`
  - ロジック・store 購読を持ってよい。props のみで動く部品も同じ置き場
  - 複数 component から参照される state は `_stores/` の store へ置き、selector で購読する（[game-state](../../../.claude/rules/react/game-state.md)）
- `_stage-components/`: ステージ本体（`hex-stage` 等）。ゲーム上の役割を持つため `_components/` と分ける
  - ページの状態を知らず、props・handle で駆動する
  - 例: `expedition/_stage-components/hex-stage`（stage-07 のコピー）
- `_layers/`: ステージ（`Stage07` 等）の children として重ねるレイヤー

### 組み合わせの命名

- ページ直下の組み合わせ: `-section`（`stage-section` 等）
  - `-section` は入れ子にしない
  - HTML の `<section>` 要素とは無関係（下記「HTML 要素」）
- section の中の組み合わせ: `-group`（`stage-group` 等）

### レイアウト

`_contents/` がレイアウトを用意し、子をはめ込む（[components/CLAUDE.md](../CLAUDE.md) の「レイアウト」）。

### store の線引き

- ページ固有の変数（表示設定の切替等、ゲームの仕組みに関与しないもの）: ページ用の store 1 つへ集約する
  - 関心ごとに context を分けない。selector 購読で再レンダリングの範囲は保てる
- ドメイン（EN・アイテム・中継点フロー・ゴール到達等、ゲームの機能を成すもの）: 個別の store として維持する
  - 複数ページ・試作からの再利用（`energy` は proto-01/02/03 で共有）を妨げないため
- 境界は store 追加・見直しの都度精査する

### 依存方向

`_contents` → `_layers` → `_stage-components`・`_components`（逆方向の参照は禁止）。

- `_components` から `_layers` を参照しない。ステージへ重ねるレイヤーは `_contents` が children で渡す
- `_stage-components` は `_components` と同じ最下層。`_layers` はステージの children として重なるため、ステージ本体の型・event・store を参照する

- `_stores`/`_lib`/`_hooks`/`_events`/`_contexts` はいずれの層からも参照可
- store が layer の型を参照しないよう、store が扱う型は store の `types.ts` へ置く（`MoveTargetDisplayMode` の例）

### prototypes との依存

`_prototypes/` 配下（試作）・本実装とも、[src/prototypes/CLAUDE.md](../../prototypes/CLAUDE.md) の依存ルールに従う。

- 試作から `src/prototypes/` の番号付き実装の内部を直接 import しない。共通置き場経由のみ
- 本実装から `src/prototypes/`・`_prototypes/` を import しない。コピーして独立させる

### ネスト

特定の要素からのみ使う content・component・layer は、その要素配下の `_contents/`・`_components/`・`_layers/` へネストする。\
判断基準は [component-nesting](../../../.claude/rules/react/component-nesting.md)。

- 例: `stage-group` が並べる `stage` は `stage-group/_contents/stage`
- 例: `stage` が中で使う `stage-settings` は `stage/_components/stage-settings`

### Provider

- `index.providers.tsx`: ページ全体で共有する Provider（store・event・context）を組み合わせる `<PageName>Providers`
  - Provider の初期値（初期配置・props の既定値）もここへ集約する
  - 並び順の制約（他の Provider の store を参照する等）は JSDoc に明記する
  - ネストは平坦化しない（Provider ごとに props が異なり、配列合成では型・可読性が落ちるため）
  - 前例: `src/prototypes/time-control/time-control-03/index.providers.tsx`
- `_contexts/`: 個別 Context の実装。`index.providers.tsx` はそれらを組み合わせるのみ
- `index.tsx` は `<PageName>Providers` と `<PageName>Contents` を組み合わせるのみにする

```tsx
const Expedition = (props: ExpeditionProps) => (
  <ExpeditionProviders {...props}>
    <ExpeditionContents />
  </ExpeditionProviders>
)
```

### HTML 要素

ディレクトリ名（`_contents` 等）はコード上の置き場の区分で、HTML 要素の選択とは別に扱う。

- `<main>` は `layout.tsx` が提供済み。`_contents/index.tsx` のルートは `div`
- `header`・`section` 等のセマンティック要素を導入する場合、各 content でなく `layout.tsx` 側での対応を検討する
