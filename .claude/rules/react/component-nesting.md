# コンポーネント配置

`_components/` 配下、特定の親コンポーネントからのみ使用する子コンポーネントは、親と同列に置かず親配下の `_components/` へ配置する。

- 親が import してよいのは、親配下の `_components/` の部品
- `_layers/` 等、他の置き場の独立した要素を親の内側へ入れる場合、親は children・slot で受ける（[components/CLAUDE.md](../../../src/components/CLAUDE.md)「実装と組み合わせ」）

## 判断基準

- 複数の親から参照される、またはページ直下(`index.tsx`)から直接使用される → 同列 `_components/`
- 特定の1コンポーネント配下でのみ使用される → そのコンポーネント配下の `_components/`
  - pages 配下で組み合わせが並べる子は `_contents/`（下記「pages 配下」）

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

`src/components/pages/` 配下では、子の置き場を親子関係で分ける（[pages/CLAUDE.md](../../../src/components/pages/CLAUDE.md)「`_components`/`_layers`/`_contents` の役割」）。

- 組み合わせ（1 階層のレイアウトで子を並べる）が並べる子 → 組み合わせ配下の `_contents/`
  - 子が実装（ロジック・store 購読を持つ）でも `_contents/`
- 実装が中で使う部品 → 実装配下の `_components/`
- 既存の置き場を前例にする前に、上記に合っているか確認する（expedition は一部未対応）

### 理由

- 旧基準（store 購読 → `_contents/`）では、実装が中で使う部品（`stage-settings` 等）まで `_contents/` へ入った
- expedition の調整スライダー整理（PR #375）で、旧基準の置き場の判断を 2 回誤った
- 次の基準（実装 → `_components/`、組み合わせ → `_contents/`）では、`stage-area` の子（`stage`・`cell-info-panel` 等）を `_components/` へ移した（PR #379）
  - 実際の問題は置き場でなく、`stage-area` へスコープの違うレイアウトが混在していたこと
  - 実装かどうかでなく、親子関係で置き場を決める基準へ改めた

## 既存構成の見直し

新規追加時に限らず、実装が進み子コンポーネントの使用元が特定の親1つに絞られたと判明した時点でリファクタ対象とする。
