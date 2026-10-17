# コンポーネント配置

`_components/` 配下、特定の親コンポーネントからのみ使用する子コンポーネントは、親と同列に置かず親配下の `_components/` へ配置する。

## 判断基準

- 複数の親から参照される、またはページ直下(`index.tsx`)から直接使用される → 同列 `_components/`
- 特定の1コンポーネント配下でのみ使用される → そのコンポーネント配下の `_components/`
  - pages 配下で store・context を購読する場合は `_contents/`（下記「pages 配下」）

## 例

`stage-view` 配下でのみ使う `planned-path-marker` `current-position-marker` は、`stage-view/_components/` へ配置する。

```
_components/
  action-bar/
  stage-view/
    index.tsx
    _components/
      planned-path-marker/
        index.tsx
      current-position-marker/
        index.tsx
```

`action-bar` は `index.tsx` から直接使用されるため同列のまま。

## pages 配下: `_contents/` と `_components/`

`src/components/pages/` 配下では、子の置き場を store・context の購読有無で分ける（[pages/CLAUDE.md](../../../src/components/pages/CLAUDE.md)「`_components`/`_layers`/`_contents` の役割」）。

- props のみで動く → 親配下の `_components/`
- store・context を購読する → 親配下の `_contents/`
- 既存の置き場を前例にする前に、上記に合っているか確認する

### 理由

expedition の調整スライダー整理（PR #375）で、store を購読する子を `_components/` へ置く誤りが 2 回続いた。

- `stage-sliders`: 本ファイルの記述どおり親配下の `_components/` へ置いた
- `motion-sliders`: 同じ誤りの前例 `energy-sliders` に揃えた

## 既存構成の見直し

新規追加時に限らず、実装が進み子コンポーネントの使用元が特定の親1つに絞られたと判明した時点でリファクタ対象とする。
