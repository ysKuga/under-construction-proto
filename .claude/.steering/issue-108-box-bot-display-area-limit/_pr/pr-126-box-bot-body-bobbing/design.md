# box-bot-01 body-bobbing action 復帰

- 親 issue: #108 (`../../design.md` の「未実装 action の復帰」節)
- PR: #126
- base: main (PR #125 マージ済み: walking / marching 復帰 + 基盤 refactor)

## 目的

walking (脚 swing) / marching (脚 bob) 中に体全体を上下させる body-bobbing を、box-bot-01 の
レジストリ形式 (`_actions/<name>/` descriptor) へ復帰する。

## 背景・制約

- samples `.../box-bot-model/_action-hooks/use-body-bobbing-action.ts`:
  `walkingBobRef` グループの `position.y` を脚 ref の現在値から毎フレーム算出する。
  - marching: 左右脚の `position.y` オフセットのうち最も低い方 (最も伸びた側) を持ち上げ量に換算
  - walking: 左右脚の `rotation.x` の余弦の大きい方 (支持脚) を正規化して持ち上げ量に換算
  - 歩いていない / `bodyBobbing` 無効なら 0 に固定 (脚が `approach` で戻るので body 側の減衰は不要)
  - `walkingBobRef` は jump の `rootRef` とは別グループなので jump と衝突しない
- box-bot-01 の action 方針: action は共有 group ref を直接触らず host の intent verb 経由。
  進行度など固有の値は action ローカルに `useRef`。
- walking / marching の状態 (`activeRef`・脚の現在角/オフセット) は現状 action ローカルで、
  外の action からは不可視。body-bobbing が脚の状態を読む経路を host に足す必要がある。

## 実装計画

### 1. `walkingBobRef` を共有 ref へ追加

- [ ] `box-bot-model/index.types.ts` `BoxBotRefs` に `walkingBobRef: RefObject<Group | null>` (flat。
      変換の役割であり部位でないため `rootRef` / `yawRef` / `fallPivotRef` と同じ扱い)。
      `UseBoxBotModelReturn` の `Pick` にも追加
- [ ] `box-bot-model/index.contexts.tsx` `BoxBotRefsProvider` に `useRef` + `useMemo`
- [ ] `box-bot-model/index.hooks.ts` — destructure + 戻り値
- [ ] `box-bot-model/index.tsx` — `<group ref={walkingBobRef}>` を bot 全体を包む位置へ挿入。
      `<group position={[0, -layout.center.y, 0]}>` の子として全 `SketchBox` / `Ink` を内包する。
      fall の前傾 (`fallPivotRef`) の内側、jump の squash (`rootRef`) の内側

### 2. host verb 追加

- [ ] `readLegSwing: () => { left: number; right: number }` — 脚グループの現在 `rotation.x`
- [ ] `readLegBob: () => { left: number; right: number }` — 脚グループの現在 `position.y` の
      base (`layout.leg.y`) からのオフセット
- [ ] `applyBodyBob: (y: number) => void` — `walkingBobRef` の `position.y` へ (絶対値、0 で静止)
- `_actions/types.ts` `BoxBotActionHost` へ 3 verb (JSDoc 付き)
- `box-bot-model/index.hooks.ts` — module scope `readLegSwing` / `readLegBob` / `writeBodyBob`。
  `readLegBob` は `layout.leg.y` を渡して減算した値を返す。`actionHost` へ配線

### 3. body-bobbing action (`_actions/body-bobbing/`)

- `config.ts`
  - `ACTION` 定数は不要 (dispatch で on/off しない。登録されていれば walking/marching に常時連動)
  - `type BodyBobbingConfig = { height: number; swingRef: number; bobRef: number }`
    - `height`: 体の最大持ち上げ量 (world)
    - `swingRef`: walking の脚振幅の基準 (正規化の分母)。walking の `swingAngle` 既定と揃える
    - `bobRef`: marching の脚 bob の基準。marching の `bobHeight` 既定と揃える
    - JSDoc に「walking / marching の振幅 config を変えたらここも合わせる」と明記
  - `BODY_BOBBING_DEFAULTS = { height: 0.025, swingRef: 0.5, bobRef: 0.12 }`
    (samples `BODY_BOB_HEIGHT = 0.025`、`LEG_SWING_ANGLE = 0.5`、`LEG_BOB_HEIGHT = 0.12`)
- `use-body-bobbing.ts`
  - `BodyBobbingHost = Pick<..., 'applyBodyBob' | 'config' | 'readLegBob' | 'readLegSwing'>`
  - `useFrame` で:
    - `bob = readLegBob()`、`swing = readLegSwing()`
    - marching 連動 (`|bob.left|` か `|bob.right|` が閾値超): `lift = -Math.min(bob.left, bob.right)`、
      `y = clamp(lift / bobRef, 0, 1) * height`
    - それ以外で walking 連動 (`|swing.*|` が閾値超): samples 式で
      `minSupport = Math.cos(swingRef)`、`support = Math.max(cos(swing.left), cos(swing.right))`、
      `y = clamp((support - minSupport) / (1 - minSupport), 0, 1) * height`
    - どちらも無ければ `applyBodyBob(0)` して return
    - 早期 return: 直前に 0 を書いており swing / bob とも閾値未満なら何もしない
  - 進行度に相当するローカル ref は不要 (脚の値が唯一の入力)。直前 y を `lastYRef` で持ち早期 return 判定に使う
- `index.ts`: `defineAction<'bodyBobbing', never, BodyBobbingConfig>({ defaults, name: 'bodyBobbing', use, event })`
  - `event` は他 action と衝突しないダミー (`'BoxBot-action-body-bobbing'`)。dispatch 経路は使わない
- `index.stories.tsx`: Walk / March / Fall ボタン + `height` スライダー。`marginLeft: 200`

### 4. 登録

- [ ] `_actions/index.ts` `BOX_BOT_ACTIONS` に `marchingAction` の後・`fallAction` の前へ
      `bodyBobbingAction` (脚の値を読むので walking / marching の後で実行)
- [ ] `DEFAULT_CLICK_BINDINGS` へは登録しない
- 無効化は `actions` prop から外す (registry 思想。config に `enabled` は持たせない)

## 検証

- `check-types` / `lint` (oxlint + eslint) / `test`
- Storybook 目視: Walk 中・March 中に体が上下、停止で 0 復帰、Fall との併用で破綻なし、
  既存 walking / marching / jump / fall のリグレッションなし
- 必要なら `scratch/verify.mjs` (固定名) で Playwright 確認、完了後削除

## 決定事項

- 2026-09-01: body-bobbing は dispatch で on/off する toggle にはしない。登録されていれば
  walking / marching に常時連動、それ以外は 0。無効化は `actions` 配列から外す
- 2026-09-01: 脚状態は host の read verb (`readLegSwing` / `readLegBob`) で読む。samples のように
  脚 ref を直接触らない (box-bot-01 の方針)

## 懸念・リスク

- `swingRef` / `bobRef` は walking / marching の config 値と二重管理になる。samples も
  `LEG_SWING_ANGLE` / `LEG_BOB_HEIGHT` の定数共有で同じ結合。box-bot-01 では body-bobbing の
  config へ明示的に出し、JSDoc で注意喚起する
- walking と marching を同時に動かした場合の体の上下は未定義。marching 連動を優先して分岐する
- `walkingBobRef` を JSX ツリーへ 1 段挟むため、既存の座標系 (fall の pivot chain・jump の squash)
  への影響を Storybook で要確認。挟む位置は「全 SketchBox を包む最内グループ」で、pivot より内側
