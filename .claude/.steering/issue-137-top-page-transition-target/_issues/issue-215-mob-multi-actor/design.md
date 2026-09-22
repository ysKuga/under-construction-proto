# mob(複数actor)をActorsLayerへ配置できるようにする(issue #215)

## 目的

`ActorsLayer`(stage-07 配下)の単一 actor 限定設計を複数 actor 対応へ変更し、プレイヤー以外の actor(mob)を画面へ配置できるようにする。

## 背景・制約

- `ActorsLayer`(`src/prototypes/stage/stage-07/_components/actors-layer/index.tsx`)は `currentCell: HexCell` を単一値で持ち、map/loop なしで `BoxBot01` を1体だけ描画する設計。複数 actor 対応は #162 で対象外と明記済み
- EN(エネルギー)個別化(`outOfEnergyRef` の actorId キー付き化、`energyOut` dispatcher のレジストリ化)は対応済み(PR #213)。mob 側は `useRegisterEnergyOut(actorId, energyOut)` を呼ぶだけで個別の EN 切れ演出が動く状態
- `EnergyDebugPanel`/`canEnterCell`(`proto-03/index.tsx`)の EN 判定は依然 `PLAYER_ACTOR_ID` 決め打ちのまま
- stage-06 系(proto-01/02 が依存)にも同様の `PLAYER_ACTOR_ID` 決め打ちが複数箇所ある(`use-initial-facing.ts`、`geo-layer/index.tsx`、`actors-layer/index.tsx` 等)。本 issue のスコープは stage-07/proto-03 側、stage-06 系は対象外
- `src/prototypes/CLAUDE.md` のバージョン間依存ルール(番号付き実装は小さい番号からのみ import 可)に従う。stage-07 側の変更が stage-06 側の既存 import 関係を壊さないこと

## 懸念・リスク

- `ActorsLayer` の型変更(`currentCell: HexCell` → 複数 actor 対応)は `Stage07`・`GeoLayer`・visibility registry への波及を伴う。影響範囲の洗い出しを実装前に行う
- EN 個別化時(2026-09-22)、mob 未実装の段階での型設計先行は投機的抽象化になりうるとユーザーと合意済み。本 issue 着手時点で mob の実際の配置要件(何体、どう動くか)が固まっているか要確認
