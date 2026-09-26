# src/components/pages/CLAUDE.md

## ページ内の構成

ページ（試作含む）の実装が大きくなった場合、以下の構成で分ける。
例: `find-path/_prototypes/proto-03`（issue #137 の構造見直し）。

```
page-name/
  index.tsx            # Provider 群とページ内容を組み合わせるのみ
  index.providers.tsx  # Provider 群の組み合わせ
  index.types.ts       # index.tsx・index.providers.tsx の双方が参照する props 型
  _contents/           # ページ内容
    index.tsx          # 各 content を並べるのみ
    title/
    stage-area/
      _contents/       # stage-area からのみ使う content
        stage/
  _layers/             # ステージの children として重ねるレイヤー
  _components/         # 部品
  _contexts/           # 個別 Context の実装
  _stores/
```

### `_components`/`_layers`/`_contents` の役割

- `_components/`: 部品（吹き出し・インジケータ等）。ページの状態を知らず、props で駆動する
- `_layers/`: ステージ（`Stage07` 等）の children として重ねるレイヤー
- `_contents/`: ページ内容を区画ごとに格納する。その階層の直下で使う実装の置き場
  - `_contents/index.tsx` は各 content を並べるのみとし、props・定数・className・状態を持たない
  - 各 content の props・定数・レイアウト用 className は content 側に持つ
  - 複数 content から参照される state は `_stores/` の store へ置き、selector で購読する（[game-state](../../../.claude/rules/react/game-state.md)）

### 依存方向

`_contents` → `_layers` → `_components`（逆方向の参照は禁止）。

- `_stores`/`_lib`/`_hooks`/`_events`/`_contexts` はいずれの層からも参照可
- store が layer の型を参照しないよう、store が扱う型は store の `types.ts` へ置く（`MoveTargetDisplayMode` の例）

### ネスト

特定の要素からのみ使う content・layer は、その要素配下の `_contents/`・`_layers/` へネストする。
判断基準は `_components` と同じ（[component-nesting](../../../.claude/rules/react/component-nesting.md)）。

- 例: `stage` は `stage-area` からのみ使うため `stage-area/_contents/stage`

### Provider

- `index.providers.tsx`: ページ全体で共有する Provider（store・event・context）を組み合わせる `<PageName>Providers`
  - Provider の初期値（初期配置・props の既定値）もここへ集約する
  - 並び順の制約（他の Provider の store を参照する等）は JSDoc に明記する
  - ネストは平坦化しない（Provider ごとに props が異なり、配列合成では型・可読性が落ちるため）
  - 前例: `src/prototypes/time-control/time-control-03/index.providers.tsx`
- `_contexts/`: 個別 Context の実装。`index.providers.tsx` はそれらを組み合わせるのみ
- `index.tsx` は `<PageName>Providers` と `<PageName>Contents` を組み合わせるのみにする

```tsx
const FindPathProto03 = (props: FindPathProto03Props) => (
  <FindPathProto03Providers {...props}>
    <FindPathProto03Contents />
  </FindPathProto03Providers>
)
```

### HTML 要素

ディレクトリ名（`_contents` 等）はコード上の置き場の区分で、HTML 要素の選択とは別に扱う。

- `<main>` は `layout.tsx` が提供済み。`_contents/index.tsx` のルートは `div`
- `header`・`section` 等のセマンティック要素を導入する場合、各 content でなく `layout.tsx` 側での対応を検討する
