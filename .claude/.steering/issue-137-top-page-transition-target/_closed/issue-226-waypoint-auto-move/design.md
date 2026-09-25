# 中継点経由の経路統合と自動移動

issue: #226（親: #137）

## 目的

proto-03 で、中継点を経由した経路に沿って bot を自動移動させる。

## 背景・制約

- 親: [issue-137 backlog.md](../../backlog.md) の「非隣接クリック時の自動移動」「中継点設定」項目からの分割
- 実装済み（親 decision-records.md 2026-09-23）
  - 経路探索（BFS、`stage-07/_lib/hex-path.ts` の `findHexPath`）
  - `PathPreviewLayer` による経路プレビュー表示
  - 中継点フローの state 切替（`waypointFlowState: 'idle' | 'proposing' | 'selecting'`、`waypoints: HexCell[]`）
  - 中継点の設置・除去（`WaypointSelectLayer`）
  - `WaypointBubble` の表示・位置調整
- 自動移動は到達済み表示 ON 時のみ対象（視界制限不採用時は非隣接クリック自体が起きない）
- EN は経路の「形」に含めない（静的な障害物・一方通行のみで経路判定）。不足時の扱いは自動移動実装時に検討

実装計画: [backlog.md](backlog.md)。決定事項: [decision-records.md](decision-records.md)。

## 懸念・リスク

- 自動移動の開始トリガーが未定（中継点選択中の誤発火を避ける必要あり）
- EN 不足で経路途中停止する場合の扱いが未定
