# 実装計画（ゲームフェーズの導入）

- [x] game-phase store を作成する
  - フェーズ: `playing` / `clearing` / `cleared`
  - 遷移: ゴール進入で `clearing`、ゴール中心到着で `cleared`
- [x] フェーズごとの許可の表を作成する
  - store の `allows(permission)` で引く（購読・都度判定・rxjs とも同じ経路）
- [x] 操作・演出の可否を表の参照へ置き換える
  - 進入ガード・`interactive`・EN 切れ演出・吹き出し・EN 不足の警告
- [x] 表示・ゴールの演出をフェーズの参照へ置き換える
- [x] goal store を削除する
