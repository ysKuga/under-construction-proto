# box-bot-01 hopping action 復帰

- 親 issue: #108 (`../../design.md` の「未実装 action の復帰」節、最後の未実装 action)
- PR: #127
- base: main (PR #125 / #126 マージ済み: gait 系 + 基盤 refactor)

## 目的

`samples/figure/box-bot` にあり box-bot-01 に無い hopping (待機演出 = 連続ジャンプ) を、
box-bot-01 のレジストリ形式 (`_actions/<name>/` descriptor) へ復帰する。

## 背景・制約

- samples `.../box-bot-model/_action-hooks/use-hopping-action.ts`:
  - `ACTION_HOPPING_START` / `-STOP` で `hoppingRef` を切替。
  - 共有 `jumpRef` を直接叩いてジャンプ見た目を再利用 (`jumpRef.current = 0`)。
  - `botHoverRef` (bot への hover/touch 中) と `spinActionRef` (spin 実行中) の間は停止、
    収まれば自動再開。
  - `hoppingCooldownRef` で `jumpRef < 0` になってから `HOPPING_INTERVAL` (2.5s) 待って次を起動。
- box-bot-01 の制約:
  - アクション隔離。他 action のローカル ref (`jumpRef` 等) は不可視。共有はしない。
  - hover 状態は意図的に撤去済み (`box-bot-model/index.hooks.ts` の `hover` は cursor のみ、
    状態を持たない)。
  - ジャンプ見た目の再利用は **`ACTION_JUMP` を dispatch** する経路。jump の
    `config.ts` / `use-jump.ts` は既に「クリック起点・外部 dispatch・hopping 共通」と明記し、
    detail 無しの `ACTION_JUMP` を受けると `config` へ fallback する実装済み。
  - toggle 方式 (`ACTION_X` 1 回で on/off) が gait 系 (walking / marching) / auto-rotate の確立パターン。
  - `readPosture()` host verb は fall 用に既存。walking / marching が「倒れ中は開始しない」判定に使用。

## 実装方針 (最小案、2026-09-01 ユーザー確認)

spin / hover 状態との協調は **作り込まない**。posture gate のみ。

- jump と spin は変換軸が別 (jump = 表示領域 shift + squash、spin = yaw) で視覚的に共存可。
  spin 中の hopping 抑制はしない。
- hover 状態は box-bot-01 が撤去済み。再導入しない。
- jump 着地の同期 (`readJumpActive` 追加) もしない。固定 interval で `ACTION_JUMP` を撃ち、
  重複は jump 側の `jumpRef.current >= 0` ガードが弾く。net の cadence は
  `max(intervalSec, jump durSec)` 相当。待機演出なので十分。
- 新規 host verb ゼロ (既存 `readPosture` のみ使用)。

## 実装計画

### 1. `_actions/hopping/config.ts`

- `ACTION_HOPPING = 'BoxBot-action-hopping'`
- `type HoppingConfig = { intervalSec: number }` — ジャンプ 1 回ごとの間隔 (秒)
- `HOPPING_DEFAULTS: HoppingConfig = { intervalSec: 2.5 }` (samples `HOPPING_INTERVAL` と同値)
- Override 型は持たない (walking / marching と同じ。per-dispatch 上書きの需要が出たら追加)

### 2. `_actions/hopping/use-hopping.ts`

- `HoppingHost = Pick<BoxBotActionContext<HoppingConfig>, 'config' | 'eventTarget' | 'interactive' | 'readPosture'>`
- ローカル ref:
  - `activeRef` (連続ジャンプ中か)
  - `elapsedRef` (前回 dispatch からの経過秒。-1 = 次フレーム即撃ち)
- `useEventDispatcher(eventTarget)` で `ACTION_JUMP` を投げる (`../jump/config` から定数 import)
- `onHopping` (`ACTION_HOPPING` 購読): `interactive` && `readPosture() === 0` のとき
  `activeRef` をトグル、`elapsedRef = -1`
- `useFrame(dt)`:
  - `!activeRef` → return
  - `readPosture() !== 0` → `elapsedRef = -1` して return (倒れ中は撃たない。
    get-up で直立に戻れば次フレームから自動再開。トグル状態は保持)
  - `elapsedRef < 0` → `elapsedRef = 0`、`dispatch(ACTION_JUMP)`、return (トグル直後の即撃ち)
  - `elapsedRef += dt`。`elapsedRef >= config.intervalSec` → `elapsedRef = 0`、`dispatch(ACTION_JUMP)`

### 3. `_actions/hopping/index.ts`

- `defineAction<'hopping', never, HoppingConfig>({ defaults: HOPPING_DEFAULTS, event: ACTION_HOPPING, name: 'hopping', use: useHopping })`
- `export * from './config'`

### 4. 登録 `_actions/index.ts`

- import 追加、`BOX_BOT_ACTIONS` の `jumpAction` の直後へ `hoppingAction` (jump と対、
  jump より後 = 同フレーム内で jump listener 登録済み)
- `DEFAULT_CLICK_BINDINGS` へは登録しない (auto-rotate / arm-toggle / gait 系と同じ。
  無効化は `actions` prop から外す)

### 5. `_actions/hopping/index.stories.tsx`

- marching story に倣う。Hop トグルボタン + Fall ボタン + `intervalSec` スライダー
  (`actionConfig={{ hopping: { intervalSec } }}`)
- `marginLeft: 200` / `marginTop: 160`

## 検証 (2026-09-01)

- [x] `check-types` / `lint` (oxlint + eslint) / `test`
- [x] Storybook 目視 (Playwright ヘッドレス、表示領域 div の `style.top` を監視):
      Hop トグル on で `top` が sin 波振動 (連続ジャンプ)、再トグル off で base へ静止、
      Hop 中に Fall で振動が止まり fall の固定オフセットのみ (gate 動作)。ページエラーなし

## 決定事項

- 2026-09-01: hopping は toggle 方式。jump 見た目は `ACTION_JUMP` の dispatch で再利用
  (共有 ref は使わない)。
- 2026-09-01: spin / hover 状態との協調は作り込まない (最小案)。posture gate のみ。
  新規 host verb なし。
- 2026-09-01: 倒れ中は撃たず、get-up 後にトグル状態を保持したまま自動再開する
  (samples の「収まれば再開」に相当。posture gate だけで自然に得られる挙動)。

## 懸念・リスク

- 固定 interval dispatch のため、jump 継続時間 (`durSec`) より interval が短いと一部 dispatch が
  jump 側で弾かれ、実効 cadence が `max(intervalSec, durSec)` になる。既定 (2.5s vs 0.55s) では
  問題にならない。短い interval を試すなら story で確認。
- `../jump/config` からの定数 import はアクション間の cross-directory 依存。jump の config.ts は
  純定数・型のみで hopping を import し返さないため循環しない。jump 側コメントが hopping 前提を
  明記済み。
