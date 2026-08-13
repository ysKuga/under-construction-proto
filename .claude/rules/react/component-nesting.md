# コンポーネント配置

`_components/` 配下、特定の親コンポーネントからのみ使用する子コンポーネントは、親と同列に置かず親配下の `_components/` へ配置する。

## 判断基準

- 複数の親から参照される、またはページ直下(`index.tsx`)から直接使用される → 同列 `_components/`
- 特定の1コンポーネント配下でのみ使用される → そのコンポーネント配下の `_components/`

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

## 既存構成の見直し

新規追加時に限らず、実装が進み子コンポーネントの使用元が特定の親1つに絞られたと判明した時点でリファクタ対象とする。
