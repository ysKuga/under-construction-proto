# time-control-02 由来 backlog (方向 / Collision / Custom Event 疎結合化)

## 目的

`.claude/.steering/20260727-time-control-02-next-steps/design.md` の実装計画1〜3を、時間管理 (time-control) とは別観点の課題として切り出したもの。以下3件を実装前に検討・計画する。

1. 方向 (Direction) の概念と英訳候補
2. 移動先衝突 (Collision) の概念と管理 store
3. Custom Event 経由でのドメイン間疎結合化 (アーキテクチャ全体方針)

いずれもまだ実装しない。方針・候補の洗い出しと決定事項の記録が目的。

## 背景・制約

- `docs/concept/ideas/action-phase.md` に 企図(Intent)→予備→実行→成否→事後(Resolution) の5段階モデルと、所要時間 (`ActionTiming`)・割込み (`interruptibleUntil`)・interrupt/intercept の区別が定義済み (未実装、概念のみ)。
- 座標は自由 `{ x, y }`、初期値 `{ x: 0, y: 0 }`、クランプなし (time-control-02 の既定方針)。
- 経路探索・境界処理は time-control-02 のスコープ外 (stage-04 と同じ限定)。
- `src/prototypes/time-control/time-control-02/` (issue #50) の Intent/Execution 分離システム (positionById/movePathById 等) は実装済み。詳細は `.claude/.steering/20260727-time-control-02-next-steps/design.md` の「実装済み: Intent/Execution 分離システム」節を参照。

## 実装計画

- [x] 1. Direction 概念・命名の検討 (用語決定、値の表現方式・Position との関係は今後)
  - [x] 候補比較・採用: `Direction` / `Facing` / `Heading` 併用開始、`Orientation` は必要になり次第追加 (決定事項参照)
  - [x] 値の表現方式: 角度を採用 (4方向/8方向 enum は不採用、決定事項参照)
  - [x] 内部表現方式: ハイブリッド採用 (Heading/Facing は独立した別値、決定事項参照)
  - [x] 角度の単位・基準・回転方向を決定 (ラジアン、y下向き screen 座標系、決定事項参照)
  - [x] `Position { x, y }` との関係整理: 2点間を極座標 (`distance`/`angleRad`) で算出する共通ユーティリティ方針を採用 (決定事項参照)
  - [x] 視界 (Field of View) 判定処理の方針を決定: Facing と対象方向の角度差 (正規化後) が閾値以内かで判定 (決定事項参照)
  - [ ] 視界の距離上限 (見える範囲) の具体値を決定
  - [ ] action-phase.md の `MoveIntent`/`target` との関係 (target 座標から算出 vs 明示的に dispatch する)
- [ ] 2. Collision 概念の追加
  - [x] 体格 (Physique) の概念を採用: 体の大きさを円 (半径) で表現するシンプルなモデル (決定事項参照)
  - [x] 段階を「回避検討 → 衝突」の2段階とする方針を決定 (決定事項参照)
  - [ ] 「回避検討」の発生条件 (判定機会) の具体化: action-phase.md のどの段階に対応させるか
  - [ ] 移動先に既に別 actor が存在する場合の挙動候補を列挙 (移動拒否/入替/スタック許容/押し出し 等)
  - [ ] 衝突判定・解決を担う専用 store の設計 (`actor-store.ts` の `positionById` から座標→actorId の逆引きが必要になる可能性)
  - [ ] `dispatchMoveIntent` との関係: 衝突判定は intent 側で行うか、resolution 側で行うか (action-phase.md の PreAction/Outcome との対応も検討)
- [ ] 3. Custom Event 経由の疎結合化 (アーキテクチャ全体方針)
  - [ ] `src/hooks/useEventListener.ts` の設計 (useEffect ベース、`window`/`EventTarget` どちらを対象にするか)
  - [ ] 各 store (actor-store, 将来の collision-store 等) が dispatch 系関数の直接 import ではなく、Custom Event の発行・購読で連携する設計への移行方針
  - [ ] イベント名・payload の型付け方針 (`CustomEvent<T>` のジェネリクス活用など)
  - [ ] 移行範囲: プロトタイプ限定ではなく `src/hooks/` への本実装 (共通実装) として位置付け

## 決定事項

### Direction 系用語 (2026-07-27)

`Direction` / `Facing` / `Heading` を併用する。`Orientation` (キャラクターの回転等) は状況に応じて追加、今回は対象外。

| 英語 | 日本語 | 用途 |
| --- | --- | --- |
| Direction | (訳語なし、包括語として使用) | シンプルな方向。目的地・目標などに対して使う汎用語 |
| Facing | 指向 | 移動方向と切り離した「向き」。後退・カニ歩きなど、移動方向と体の向きが一致しないケースを想定。軍事用語 (銃口の指向方向) から採用 |
| Heading | 針路 | 進行方向そのものを管理 |
| Orientation | (未定、保留) | キャラクターの回転など。必要になった時点で検討 |

今回 (time-control-02 で) 扱う情報の対象は **Facing (指向)** と **Heading (針路)**。`Direction` は個別の型・値ではなく概念の総称として位置づけ、型定義には直接登場しない想定。

ゆくゆくは `docs/` 配下 (`docs/terminology/` 想定) への切り出しを予定。この steering ファイルはその前段の検討ログ。

### Direction の値表現・位置関係管理 (2026-07-27)

- Facing/Heading の値表現は **角度** を採用する (4方向/8方向の enum 方式は不採用)。
- 座標 (`Position { x, y }`) は数値のまま扱う (grid 化・整数化はしない、現行方針を維持)。
- 位置関係の管理は **円を使用したもの** とする。actor 間の相対角度・距離といった位置関係を、円 (単位円・三角関数) ベースで算出する方針。
  - 例: 2点間の角度は `atan2(dy, dx)` で算出。

### 角度の単位・座標系 (2026-07-27)

- 単位は **ラジアン** を採用 (内部は常にラジアン、度への変換は表示層のみで行う)。理由: `Math.atan2`/`sin`/`cos` がラジアン前提のため、変換コストなしに直結できる。
- 座標系は **screen 座標系 (y 下向き)** を採用 (`Position` の y は下方向が正、stage-04 等の `top`/`left` ベース DOM 描画と一致させる)。
- 回転方向の注意点: `Math.atan2`/`sin`/`cos` は数学座標系 (y 上向き) では反時計回り正だが、screen 座標系 (y 下向き) では同じ計算式のまま **見た目は時計回り** になる (x 軸から +y 方向への回転が画面上で下向きに見えるため)。\
  内部の角度演算はそのまま標準の `Math`API を使い、「画面上は時計回りに見える」点だけ実装・UI表示側で認識しておく (符号反転などの補正は行わない)。

### Heading/Facing の内部表現 (2026-07-27)

Heading と Facing は独立した別値として持つ (一方から他方を導出しない)。

- **Heading**: 内部はベクトル `{ vx, vy }` (移動方向 + 速度を一体で保持)。移動計算は `x += vx * dt` の加算のみで済み、毎フレーム発生しうる更新のコストを抑える。
- **Facing**: 内部は角度そのもの。Heading とは独立に、明示的な dispatch 等で設定する (後退・カニ歩きのように Heading と一致しないケースを表現するのが目的のため)。
- `atan2` は Facing の算出元ではなく、「Heading(ベクトル) と Facing(角度) を比較したい」「actor 間の相対角度を求めたい」等、ベクトル⇔角度の変換が必要な場面で都度使う変換ユーティリティとして位置づける。

### Position 間の関係算出 (2026-07-27)

2点間の関係を極座標 (距離 + 角度) として算出する共通ユーティリティを想定する。

```ts
type PolarRelation = {
  distance: number // 2点間の距離 (= 円の半径)
  angleRad: number // atan2(dy, dx) によるラジアン角
}

const getPolarRelation = (from: Position, to: Position): PolarRelation => {
  const dx = to.x - from.x
  const dy = to.y - from.y
  return {
    distance: Math.sqrt(dx * dx + dy * dy),
    angleRad: Math.atan2(dy, dx),
  }
}
```

- `angleRad` は Facing/Heading との比較 (正面判定・視界判定など) に使う。
- `distance` は近接判定に使う。座標が自由 (grid でない) ため、「同一座標」判定ではなく「半径内」判定が現実的 → 体格 (Physique) / Collision の下地になる。

### 体格 (Physique) と Collision の段階 (2026-07-27)

- **体格 (Physique)**: 体の大きさを円 (半径のみ) で表現するシンプルなモデル。

  ```ts
  /** 体格。体の大きさを円で表現する単純なモデル */
  type Physique = {
    /** 半径 */
    radius: number
  }
  ```

- **Collision の段階**: 「回避検討」→「衝突」の2段階とする。
  - 判定の基準は、2 actor 間の `distance` (Position 間の関係算出を利用) と、双方の Physique の半径合計との差分 = マージン (`margin = distance - (radiusA + radiusB)`)。
  - マージンが 0 になった時点 (体が触れ合う距離まで接近した時点) が「衝突」。
  - マージンが 0 になるまでの間に判定機会が発生した場合、「回避検討」を実施する (接触前に回避可否を判定する猶予フェーズ)。「判定機会」の具体的な発生条件 (action-phase.md のどの段階に対応させるか) は未確定、残課題。

### 視界 (Field of View) 判定 (2026-07-27)

Facing (指向) を基準に、左右60度 (合計120度) を視界とする。判定は「Facing と対象方向の角度差が閾値以内か」で行う。

```ts
// -π 〜 π の範囲に正規化する (円環角度の差分計算に必須)
const normalizeAngle = (angleRad: number): number =>
  Math.atan2(Math.sin(angleRad), Math.cos(angleRad))

const isWithinFieldOfView = (
  facingRad: number,
  from: Position,
  to: Position,
  halfFovRad: number, // 左右60度なら Math.PI / 3
): boolean => {
  const { angleRad } = getPolarRelation(from, to) // Position 間の関係算出を再利用
  const diff = normalizeAngle(angleRad - facingRad)
  return Math.abs(diff) <= halfFovRad
}
```

- 角度差は単純な引き算だと円環の境界 (例: Facing=170°, 対象方向=-170° → 素の差 -340°) で破綻するため、`Math.atan2(Math.sin(θ), Math.cos(θ))` で -π〜π の主値に正規化してから比較する。
- 角度のみの判定であり、実際の「見える範囲」には距離上限も絡む。`getPolarRelation` の `distance` と組み合わせ、「角度内 かつ 距離内」で最終判定する方針 (距離上限の具体値は未確定、残課題)。

## 懸念・リスク

- Custom Event 化は疎結合を得る一方、型安全性・追跡可能性 (どこで発行されどこで購読されるか) が下がるリスクがある。イベント名の一元管理・型定義の方針を先に固める必要がある。
- Collision store の座標→actorId 逆引きは、actor 数増加時のパフォーマンスにも関わる (normalized state の設計次第)。
- Direction を独立状態として持つ場合、`dispatchMoveIntent` の度に Direction も更新する必要が生じ、store の責務境界 (position 管理 vs 向き管理) が曖昧にならないよう注意。
