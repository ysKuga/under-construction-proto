# mob(複数actor)をActorsLayerへ配置できるようにする(issue #215)

## 目的

`ActorsLayer`(stage-07 配下)の単一 actor 限定設計を拡張し、プレイヤー以外の actor(mob)を画面へ静止配置できるようにする。

## 背景・制約

- `ActorsLayer`(`src/prototypes/stage/stage-07/_components/actors-layer/index.tsx`)は `currentCell: HexCell` を単一値で持ち、map/loop なしで player 用 `BoxBot01` を1体だけ描画する設計。複数 actor 対応は #162 で対象外と明記済み
- 当初「複数 actor 対応」で検討したが、実装前調査で `useActorNodeRegistry`(単一 `currentCell`/`moveActor`)・`useHexMove`・`Stage07` まで player 前提で一直線に繋がっており、registry の複数 actor 化は大規模になると判明(decision-records.md 2026-09-22)
- ユーザーと協議の上、本 issue のスコープを「mob は静止表示のみ(自己移動・EN 等の動的挙動なし)」に確定
- EN 個別化(`outOfEnergyRef` の actorId キー付き化、`energyOut` dispatcher のレジストリ化)は対応済み(PR #213)だが、mob が動的挙動を持たない本スコープでは使用しない。`EnergyDebugPanel`/`canEnterCell` の `PLAYER_ACTOR_ID` 決め打ち解消は対象外(mob が自律移動する段階で再検討)
- 初回実装は `ActorsLayer` へ `mobs` prop を渡す方式だったが、レビューで `docs/performance/README.md` の「内部状態は zustand store + selector 購読」方針に反する(mob 変化のたび `Stage07` 以下全体が再レンダリング対象になる)と指摘され、ランダム spawn/despawn を近い将来導入予定であることも踏まえ `ActorNodeRegistryProvider` を zustand store(`_stores/actors`、actorId ごとの位置を保持)へ一般化する方式へ作り直した(decision-records.md 2026-09-22)
- `src/prototypes/CLAUDE.md` のバージョン間依存ルール(番号付き実装は小さい番号からのみ import 可)に従う。stage-06 系(proto-01/02 が依存)は変更しない

## 懸念・リスク

なし（静止表示スコープに確定、decision-records.md 2026-09-22 参照）
