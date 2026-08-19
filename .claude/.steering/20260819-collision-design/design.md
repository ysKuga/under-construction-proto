# collision-design

## 目的

`.claude/.steering/20260812-time-control-02-backlog/design.md` の実装計画2 (Collision 概念の追加) のうち未完了の4項目を切り出したもの。

1. 「回避検討」の発生条件 (判定機会) の具体化
2. 移動先に既に別 actor が存在する場合の挙動候補の列挙
3. 衝突判定・解決を担う専用 store の設計
4. `dispatchMoveIntent` との関係 (衝突判定を intent 側/resolution 側どちらで行うか)

まだ実装しない。方針・候補の洗い出しと決定事項の記録が目的。

## 背景・制約

- 体格 (Physique) の概念・「回避検討→衝突」の2段階方針・マージン (`margin = distance - (radiusA + radiusB)`) による衝突判定式は決定済み。詳細は `.claude/.steering/20260812-time-control-02-backlog/design.md` の「決定事項」節を参照 (このファイルからの分割元)。
- `docs/concept/ideas/action-phase.md` に 企図(Intent)→予備→実行→成否→事後(Resolution) の5段階モデルと、所要時間 (`ActionTiming`)・割込み (`interruptibleUntil`)・interrupt/intercept の区別が定義済み (未実装、概念のみ)。「回避検討」発生条件の検討にはこのモデルとの対応が必要。
- `src/prototypes/time-control/time-control-02/` (issue #50) の Intent/Execution 分離システム (positionById/movePathById 等) は実装済み。詳細は `.claude/.steering/20260727-time-control-02-next-steps/design.md` の「実装済み: Intent/Execution 分離システム」節を参照。
- 座標は自由 `{ x, y }`、初期値 `{ x: 0, y: 0 }`、クランプなし。経路探索・境界処理はスコープ外。
- Position 間の距離算出は `getPolarRelation` (極座標ユーティリティ) を再利用する想定。

## 実装計画

- [ ] 「回避検討」の発生条件 (判定機会) の具体化: action-phase.md のどの段階に対応させるか
- [ ] 移動先に既に別 actor が存在する場合の挙動候補を列挙 (移動拒否/入替/スタック許容/押し出し 等)
- [ ] 衝突判定・解決を担う専用 store の設計 (`actor-store.ts` の `positionById` から座標→actorId の逆引きが必要になる可能性)
- [ ] `dispatchMoveIntent` との関係: 衝突判定は intent 側で行うか、resolution 側で行うか (action-phase.md の PreAction/Outcome との対応も検討)

## 決定事項

<!-- 検討・決定した内容のログ -->

## 懸念・リスク

- Collision store の座標→actorId 逆引きは、actor 数増加時のパフォーマンスにも関わる (normalized state の設計次第、分割元 design.md より継承)。
