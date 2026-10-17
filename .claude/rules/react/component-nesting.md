# コンポーネント配置

`_components/` 配下、特定の親コンポーネントからのみ使用する子コンポーネントは、親と同列に置かず親配下の `_components/` へ配置する。

- 親が import してよいのは、親の実装を分割しただけの子部品（単独で意味を持たない）のみ
- 独立した component を親の内側へ入れる場合、親は children・slot で受ける（[components/CLAUDE.md](../../../src/components/CLAUDE.md)「実装と組み合わせ」）

## 判断基準

- 複数の親から参照される、またはページ直下(`index.tsx`)から直接使用される → 同列 `_components/`
- 特定の1コンポーネント配下でのみ使用される → そのコンポーネント配下の `_components/`
  - pages 配下の組み合わせ（並べるのみ）は `_contents/`（下記「pages 配下」）

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

`src/components/pages/` 配下では、子の置き場を役割で分ける（[pages/CLAUDE.md](../../../src/components/pages/CLAUDE.md)「`_components`/`_layers`/`_contents` の役割」）。

- 実装（ロジック・store 購読・見た目を持つ） → `_components/`
  - store・context を購読しても `_components/`
- 組み合わせ（`_components/`・`_layers/` を並べるのみ） → `_contents/`
- 既存の置き場を前例にする前に、上記に合っているか確認する（expedition は旧基準で配置済み）

### 理由

- 旧基準（store 購読 → `_contents/`）では、`stage` のように部品として使われる実装が `_contents/` へ入り、組み合わせと実装が混ざった
- expedition の調整スライダー整理（PR #375）で、旧基準の置き場の判断を 2 回誤った

## 既存構成の見直し

新規追加時に限らず、実装が進み子コンポーネントの使用元が特定の親1つに絞られたと判明した時点でリファクタ対象とする。
