# フェーズ起点の処理 配置

ゲームフェーズ（`cleared` 等）起点の処理、見た目ごと（旗・腕上げ等）に個別配置しない。`_game-phases/<フェーズ名>/` へフェーズ単位でまとめる。

## 構成

```
_game-phases/
  cleared/
    index.tsx      # 入口 ClearedPhase。_contents/index.tsx から置く
    _components/   # フェーズ配下でのみ使う表示要素
    _hooks/        # 副作用・判定 hook
```

- 入口コンポーネント名: フェーズ名 + `Phase`（`cleared` → `ClearedPhase`）
- 他ディレクトリ（`_layers` 等）から読む判定 hook、入口 `index.tsx` から export。描画は参照元に残し、判定のみ移す
- `_stores/game-phase/` 配下に置かない。store ディレクトリ、store 実装のみ
- フェーズごとの操作・演出の可否、store の許可の表（`PHASE_PERMISSIONS`）側。本ディレクトリは「フェーズに入った時の処理」

## 置き場の判断

- `_contents/`: 組み合わせ（並べるのみ）
- `_components/`: 実装（[component-nesting.md](component-nesting.md)）
- `_hooks/`: 複数箇所で共有する hook
- `_game-phases/`: フェーズ起点の処理（表示・副作用・判定とも）

## 新しい置き場の作成前

まとめる軸（見た目単位か、起点単位か）、ユーザーへ確認してから着手する。

## 理由

issue #137 で、ゴール到達時の旗・腕上げを `_contents/goal-performance`（見た目単位）へまとめた後、意図がフェーズ起点でまとめることと判明し `_game-phases/cleared` へ移し直した（PR #339）。フェーズ（詰み等）追加ごとに同じ判断が繰り返されるため明文化。
