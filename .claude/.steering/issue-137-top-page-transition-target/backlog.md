# 実装計画（issue #137）

- [ ] 非隣接クリック時、求めた経路(BFS)に沿って自動移動させる
  - proto-03 対象。到達済み表示 ON 時のみ(視界制限不採用時は非隣接クリック自体が起きないため対象外のまま)
  - 経路探索(BFS)・`PathPreviewLayer` によるプレビュー表示までは実装済み、自動移動の実行のみ残る(decision-records.md 2026-09-23)
- [ ] 経路上に中継点を設定できるようにする
  - 目的地クリック時、思考の吹き出し(発言吹き出しと区別)を表示、クリックで中継点選択モードへ移行
    - モード切替・設置/除去(state 切替)・bot 頭上への位置調整(`createPortal` + actors store 経由のオーバーレイコンテナ)・表示調整(思考=丸コネクタふわふわ/選択=三角しっぽ+文言切替)・selecting 中も表示継続まで実装済み(decision-records.md 2026-09-23)
  - 選択モード中のセルクリックは通常モードと別イベント(`WaypointSelectLayer`)で処理する(実装済み)
  - 中継点の経由順はクリック順でなく、設置箇所が近い同士を自動接続(最近傍法、TSP 風)で決定する(未着手)
  - 求めた中継点経由の経路を `PathPreviewLayer`/自動移動へ統合する(未着手)
  - `WaypointBubble` がマス(セル)と重なっているとクリックできない問題を解消する
    - 原因: bot 頭上の overlayContainer が Stage07 floor の preserve-3d 空間内にあり、奥行きヒットテストで GeoLayer 側のセルにクリックを奪われる(decision-records.md 2026-09-23)
    - 方針: overlayContainer を floor の 3D 空間外へ出す。bot 追従は CSS 継承でなく JS 側の座標計算に置き換える(decision-records.md 2026-09-23)
    - 実装済み: `ActorOverlayLayer` を floor 外に新設、`ActorsLayer` のアンカー DOM へ rAF 実測で追従(decision-records.md 2026-09-23)
- [ ] ステージ上で動作する bot とは別に bot を独立表示し、「現在どちらを向いているか」を同期して表示する実装を検討
- [ ] find-path は現状固定ステージだが、ランダム生成を検討中
- [ ] マスホバー/選択時の内包要素一覧表示を検討
  - (design.md 懸念・リスク)
