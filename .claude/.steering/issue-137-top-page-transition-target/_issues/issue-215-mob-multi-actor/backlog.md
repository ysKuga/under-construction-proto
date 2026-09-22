# 実装計画（issue #215）

- [ ] `ActorsLayer`(stage-07)を複数 actor 対応へ変更
  - `currentCell: HexCell`(単一値)→ 複数 actor を表す型へ変更、内部を map/loop へ書き換え
  - 呼び出し元(`Stage07`)・`GeoLayer`・visibility registry との連携見直し
- [ ] `EnergyDebugPanel`/`canEnterCell`(proto-03)の `PLAYER_ACTOR_ID` 決め打ちを解消
