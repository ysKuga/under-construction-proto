# time-control-02 今後の検討事項 (方向 / Collision / Custom Event 疎結合化)

## 目的

`src/prototypes/time-control/time-control-02/` (issue #50) の延長として、以下3件を実装前に検討・計画する。

1. 方向 (Direction) の概念と英訳候補
2. 移動先衝突 (Collision) の概念と管理 store
3. Custom Event 経由でのドメイン間疎結合化 (アーキテクチャ全体方針)

いずれもまだ実装しない。方針・候補の洗い出しと決定事項の記録が目的。

**上記3件は時間管理と別観点のため、2026-08-12 に `.claude/.steering/20260812-time-control-02-backlog/design.md` へ切り出し済み。実装計画・決定事項はそちらを参照。**

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

## 実装計画・決定事項・懸念リスク (Direction/Collision/Custom Event)

`.claude/.steering/20260812-time-control-02-backlog/design.md` へ切り出し済み (2026-08-12)。
