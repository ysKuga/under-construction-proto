# Stage04

stage-03 を土台に、actor 移動をイベント駆動で実装。

## 移動操作 3 方式

- キーボード操作 (矢印キー / WASD): 隣接セルへ1マス移動
- actor クリック: stage-03 踏襲の自動順送り移動 (右へ1マス、右端で次行左端へ折り返し)
- セルクリック: クリックしたセルへ直接移動

## イベント駆動アーキテクチャ

各操作は `MoveIntentEvent` (`{ source, target }`) を `dispatchMoveIntent` するのみ。
実際の位置反映は `_contexts/actor-position-context.tsx` の `resolveMoveIntent` に一本化。

`docs/concept/ideas/action-phase.md` の企図・予備・実行・成否・事後 5 段階フェーズ構想のうち、
「企図 (Intent) → 即時 Resolution」のみを実装。経路探索は将来課題、スコープ外。

## 境界処理

| 発生源 | target 計算 | 境界処理 |
| --- | --- | --- |
| actor click | producer 側でラップ済み座標を算出 | ラップアラウンド |
| keyboard | producer 側は現在位置+差分のみ | resolver でクランプ (端で停止) |
| cell click | producer 側でクリック座標そのまま | 実質ノーオペ (常にグリッド内) |

## stage-03 からの変更点

- `ActorsLayer` の `rows` 未使用バグ (`cols` で代用) を修正。`gridSize` を Context から取得。
- 地形 layer を `GeoLayer` として独立コンポーネント化。
- `Stage03`/`memoizedGeoLayer` の二重ネストしたコンテナ div を解消。単一コンテナに `GeoLayer`/`ActorsLayer` を並置。

## stage/README.md との対応

- `actors position context` → 本プロトタイプで実装。
- `geo context` (地形側の串刺し) → 今回未着手。

## 既知の仕様

actor が乗っているセルは actor 側のボタンがクリックを受け取るため、
「同一セルへの cell-click」は事実上到達不能。
