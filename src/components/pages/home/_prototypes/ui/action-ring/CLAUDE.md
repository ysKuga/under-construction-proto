# action-ring

bot 足元、地面に水平な円周へボタン配置。3D 空間内配置(`@react-three/drei` の `Html`)、action-circle(画面座標)と別実装。

`index.stories.tsx` は `../../_story-decorators` の `withBotChildren` decorator 経由で利用(`BoxBot` の `children` として配置)。

## 状態: 動作するが未完成

- `Html` は Canvas の `children` prop 経由で box-bot 本体改修なしに実現できた(box-bot 側の変更不要)
- 遠近法で潰れた楕円状に配置(意図通り)
- 未解決: `occlude` 指定済みだが、bot 背面に回るボタン(起き上がり/足踏み)が隠れず手前に浮いて見える。box-bot 本体がワイヤーフレーム/アウトライン描画(ソリッドメッシュでの深度判定に不向きな構造の可能性)で、raycast ベースの遮蔽が効いていない
- 追加調整で解決する見込みだが未検証: 深度判定用の不可視ソリッドメッシュを別途配置する、`occlude` を明示的な ref 配列指定にする、等
- `RING_RADIUS` / `RING_Y` は目視調整の仮値。カメラ位置(`CAMERA_POSITION`)・注視点(`ORBIT_TARGET`)が変わると再調整必要
