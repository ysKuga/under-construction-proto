# time-control-02 今後の検討事項 (方向 / Collision / Custom Event 疎結合化)

## 目的

`src/prototypes/time-control/time-control-02/` (issue #50) の延長として、以下3件を実装前に検討・計画する。

1. 方向 (Direction) の概念と英訳候補
2. 移動先衝突 (Collision) の概念と管理 store
3. Custom Event 経由でのドメイン間疎結合化 (アーキテクチャ全体方針)

いずれもまだ実装しない。方針・候補の洗い出しと決定事項の記録が目的。

## 背景・制約

- `docs/concept/ideas/action-phase.md` に 企図(Intent)→予備→実行→成否→事後(Resolution) の5段階モデルと、所要時間 (`ActionTiming`)・割込み (`interruptibleUntil`)・interrupt/intercept の区別が定義済み (未実装、概念のみ)。
- 座標は自由 `{ x, y }`、初期値 `{ x: 0, y: 0 }`、クランプなし (time-control-02 の既定方針)。
- 経路探索・境界処理は time-control-02 のスコープ外 (stage-04 と同じ限定)。
- **下記「実装済み: Intent/Execution 分離システム」節が現状の実装の正確な状態を示す (2026-07-30 時点)。この節より上の「背景・制約」旧記述は古いスナップショットなので参照しないこと。**

## 実装済み: Intent/Execution 分離システム (2026-07-30)

Direction/Collision/CustomEvent (下記の実装計画1〜3) とは別に、issue #50 の中で並行して大きく実装が進んだ。move (旧 aim) ボタンの即時移動を廃止し、企図→経路生成→tick刻み実行→履歴の一連のシステムを構築済み。**次回セッションはこの節を読めば実装状況を再構築できる。**

### ファイル構成

```
src/prototypes/time-control/time-control-02/
  types.ts                          # ActorId/Position/ActionPhase/MoveIntent/PathStep/MovePath/
                                     # ProgressMode/ScheduleRow/HistoryRow/ActionLogEntry/TimeEvent/EventLog
  _stores/actor-store.ts            # 本体 (zustand vanilla)。下記「store の状態」参照
  _contexts/actor-store-context.tsx # Context + useActorStore(selector)
  _lib/
    generate-move-path.ts           # 経路生成 (純粋関数)
    get-tick-ms.ts                  # BASE_TICK_MS / tickRate → tickMs
    build-schedule.ts               # 予定プレビュー用: 経路+tickCount+tickRate → ScheduleRow[] (時刻マージ)
    build-history.ts                # 履歴用: actionLog → HistoryRow[] (gameTimeMs マージ)
    stage-coords.ts                 # STAGE_SIZE/STAGE_CENTER/STAGE_SCALE + Position→CSS px 変換
  _components/
    action-bar/          # 全actor一括: 行動決定・mode(auto/manual)トグル・reset
    actor-item/           # actor毎の行: position/path数/target/eta/minPathSteps入力/set targetボタン
    stage-view/            # CSS絶対配置の舞台 (300x300px, bg-gray-50)
    actor-marker/           # actor毎: 現在位置(円+ラベル)・残り経路(灰点)・移動軌跡(薄青点、actionLog由来で消えない)
    schedule-preview/        # 「予定」テーブル: 経過時間列 + actor列(●印)
    action-log-panel/         # 「履歴」テーブル: 経過時間列 + actor列(phase+座標)
  __tests__/  (29件全通過)
  README.md
```

`index.tsx` レイアウト: ActionBar → [StageView | actor一覧ul] (flex横並び) → [予定 | 履歴] (flex横並び)。

### 移動フロー

1. **set target** (actor毎ボタン, `dispatchMoveIntent`): position は変えない。`generateMovePath(from, target, stepDistance, minSteps)` で経路生成、`movePathById` に格納。actionLog に `phase:'intent'` を1件追加。
2. **行動決定** (全actor一括, `ActionBar`): 各actorの `dispatchAction` をループ呼び出し。`progressModeById` に応じて:
   - `manual`: 1呼び出しで経路の先頭1 tick分だけ進む
   - `auto`: 呼び出し後、actor毎の `tickMs` 間隔で内部 `setTimeout` ループが経路を最後まで自動消化
   - 各tick: `actionLog` に `phase:'execution'`(途中)または`'resolution'`(最終) を追加、`positionById`/`movePathById` 更新
3. **mode** (全actor一括): auto/manual切替、`行動決定`の挙動を変える

### store の状態 (`ActorState`)

`actionLog` / `dispatchAction` / `dispatchMoveIntent` / `minPathStepsById` / `movePathById` / `positionById` / `progressModeById` / `reset` / `setMinPathSteps` / `setProgressMode` / `speedById` / `tickCountById` / `tickRateById`

- `speedById` (距離/ms, `DEFAULT_SPEED=0.01`) と `tickRateById` (`DEFAULT_TICK_RATE=2`) は別役割。`tickMs = getTickMs(tickRate) = BASE_TICK_MS(400) / tickRate`、`stepDistance = speed * tickMs`。
- `tickRateById` は内部実装専用の名前。画面表示用の「敏捷性 (agility)」は別概念として将来追加予定、変換式は未定 (ユーザー指示: 現在の実装にそのまま `agility` を使わず別名にしておきたい、という理由)。
- `tickCountById`: actor毎の**累積**tickカウンタ。企図のたびにリセットしない (重要、後述バグ参照)。
- `minPathStepsById` (`DEFAULT_MIN_PATH_STEPS=1`): 経路の最低step数。actor-item に数値inputで表示・編集可能。

### 経路生成ロジック (`generateMovePath`)

最終形: 最終step以外は必ず `stepDistance` いっぱい移動する (actorの移動可能距離を使い切る)。最終stepのみ端数を吸収してtargetに一致 (目的地前の減速・最終調整)。`minSteps` は距離が短すぎて `stepDistance` 基準のstep数がそれを下回る場合のみ、例外的に均等分割にフォールバックする。

### 修正済みバグ2件 (重要、再発させないこと)

1. **gameTimeMs衝突バグ**: 当初 `gameTimeMs` は企図ごとにリセットする相対値だった (`pathLengthById` 由来)。2回目以降の「行動決定」が1回目と同じ `gameTimeMs` を生成し、`buildHistory` が同一値でマージする際に旧entryを上書き→履歴が消えたように見えた。修正: `pathLengthById` を `tickCountById` (累積・非リセット) に置き換え、`gameTimeMs = tickCount * tickMs` を絶対ゲームクロックにした。`buildSchedule` も `tickCountById` を起点にし、予定と履歴の時間軸を連続させている。
2. **経路の不均等距離バグ**: 上記「経路生成ロジック」参照。旧実装は総距離を `stepCount` で均等割りしており、中間stepが `stepDistance` を使い切っていなかった。

### 画面の見た目調整の経緯 (今後同種の要望が来たら参照)

- 背景/ラベル: `StageView` に `bg-gray-50`、`ActorMarker` ラベルは `id.split('-').pop()` で短縮 (`actor-a`→`a`) + `font-bold`。長い文字列を小さい円に入れると白文字が白背景にはみ出て見えなくなる問題があった。
- `ActorItem` の `<li>` は `whitespace-nowrap` 必須、各 `<span>` に `min-w-*` を付けて列幅を揃えている (幅指定なしだとテキストが折り返し、行ごとにボタン位置がずれる)。
- `min` (最低step数) input は **バリデーションで onChange を条件付きにしてはいけない**。controlled input で無効値の時に `setState` をスキップすると、値が押し戻されて実質入力不能になる (実際に発生したバグ)。下限チェックは使用時 (`dispatchMoveIntent` 内で `Math.max(1, ...)`) に置くこと。
- `ui/table` の低レベル部品 (`TableElement`/`TableHeader`/`TableBody`/`TableRow`/`TableHead`/`TableCell`) を `SchedulePreview`/`ActionLogPanel` で使用、`table-fixed` で列幅均等化。
- `ui/button` の `Button` (`@/components/ui/button`) を生 `<button>` の代わりに使用。

### 検証時の注意 (CLAUDE.md にも記載済み)

- Storybook は常駐前提。`curl -sf http://localhost:6006` で起動確認、起動中なら再利用 (再起動しない)。
- Playwright検証スクリプトは `scratch/verify.mjs` 固定名 (許可リスト肥大化防止、`scratch/`はgitignore対象)。都度上書きする。
- `#storybook-root` 配下に絞って要素検索すること (絞らないと "No Preview" 等のダミーDOMにヒットする)。

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
