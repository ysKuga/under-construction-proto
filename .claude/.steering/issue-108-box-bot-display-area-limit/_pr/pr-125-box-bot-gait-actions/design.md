# box-bot-01 gait 系 action 復帰

- 親 issue: #108 (`../../design.md` の「未実装 action の復帰」節)
- PR: #125 (第一段階: 基盤 refactor + walking / marching)

## 目的

`samples/figure/box-bot` にあり `theater/figure/box-bot/box-bot-01` に無い gait 系 action を
box-bot-01 のレジストリ形式 (`_actions/<name>/` descriptor) へ復帰させる。

- walking (脚 swing、`rotation.x`)
- marching (足踏み、脚 bob、`position.y`)
- body-bobbing (walking/marching 中の体上下)
- hopping (待機演出、連続ジャンプ)

samples への移植ではなく box-bot-01 側で新規実装 (両実装は別物として維持、2026-09-01 決定)。

## 背景・制約

- 復帰済み: fall / spin / jump / auto-rotate / arm-toggle (auto-rotate/arm-toggle は PR #124)。
- box-bot-01 の action 方針:
  - 1 action = 1 フォルダ、`defineAction<Name, Arg, Config>` + `BOX_BOT_ACTIONS` 配列 +
    `for..of` orchestrator。dispatcher メソッド・型は配列から自動導出。
  - `use(host)` は `Pick<BoxBotActionContext<Config>, ...>` で必要な操作面のみ受ける。
    THREE.Group へ直接触れず host の intent verb (`applyXxx` / `readFacing`) 経由。
  - 共有 group ref のみ Context (`BoxBotRefsProvider`) 配布。進行度 ref は各 action ローカル。
  - adapter (`box-bot-model/index.hooks.ts`) の module scope `write*` に THREE 書き込みを隔離。
- gait 系の前提 (親 design.md 記載):
  - 脚グループ ref (`leftLegRef` / `rightLegRef`) の追加。
  - `refs` の役割軸ネスト (`refs.arm.*` / `refs.leg.*`)。YAGNI 解除条件成立
    (脚 ref 追加で arm/leg 両方が左右対)。
  - 倒れ姿勢の判定経路 `host.readPosture()` (現状 fall の `phaseRef` はローカル)。

## 実装計画

### PR #125: 基盤 refactor + walking / marching (実装済み 2026-09-01)

- [x] `BoxBotRefs` を役割軸ネストへ (`arm: { leftRef, rightRef }` / `leg: { leftRef, rightRef }`、
      `rootRef` / `yawRef` / `fallPivotRef` は flat 維持、`postureRef: RefObject<number>` 追加)
  - [x] `box-bot-model/index.types.ts` — `BoxBotRefs` 型、`UseBoxBotModelReturn` の Pick
  - [x] `box-bot-model/index.contexts.tsx` — `BoxBotRefsProvider` の useRef / useMemo
  - [x] `box-bot-model/index.hooks.ts` — destructure・`write*` 引数・戻り値
  - [x] `box-bot-model/index.tsx` — `<group ref>` bind (arm/leg はネストを plain 識別子へ展開してから
        ref 属性へ。member 経由の ref アクセスは `react(refs)` の render 中アクセス検出に触れるため)
- [x] `host.readPosture()` / `reportPosture()` 追加
  - [x] `_actions/types.ts` `BoxBotActionHost` に 2 verb
  - [x] `box-bot-model/index.hooks.ts` — `readPosture` / `writePosture` (module scope) + 配線
  - [x] `_actions/fall/use-fall.ts` — `FallHost` に `reportPosture`、`setPhase` ヘルパで phase 遷移時にミラー
- [x] host verb `applyLegSwing` / `applyLegBob` 追加 (`_actions/types.ts` + adapter。
      `writeLegBob` の base に `layout.leg.y` を渡すため `deriveLayout` を actionHost 構築前へ移動)
- [x] walking action (`_actions/walking/`: config.ts / use-walking.ts / index.ts / index.stories.tsx)。
      左右の現在角は action ローカル (`*AngleRef`) で所有し settle。arm-toggle と同型
- [x] marching action (`_actions/marching/`: 同構成。左右オフセットを `*OffsetRef` でローカル所有)
- [x] `_actions/index.ts` `BOX_BOT_ACTIONS` へ `walkingAction` / `marchingAction` を
      `armToggleAction` の後・`fallAction` の前に登録 (`DEFAULT_CLICK_BINDINGS` へは登録せず)
- [x] `check-types` / `lint` (oxlint + eslint) / `test` (122 passed) / Storybook 目視
      (Walking/Marching で脚の swing/bob・stop 時の 0 復帰・Fall 後の posture gate、
      ArmToggle/Fall/Spin/Jump/AutoRotate のリグレッションなしを Playwright で確認)

event-driven-actions.md の順 (event定義 → 挙動検討 → 挙動実装) で進めた。walking/marching は
toggle 方式 (auto-rotate 先例)、補間は `_lib/approach.ts` (arm-toggle 先例)。

### 後続 PR: body-bobbing

- [ ] `BoxBotRefs` に `walkingBobRef` 追加、JSX に body 全体を包む `<group ref={walkingBobRef}>`
- [ ] walking / marching が「実行中か + 現在の脚状態」を公開する host verb (`readGait()` 等)
- [ ] body-bobbing action。脚の現在値から body の `position.y` を上下。walking/marching が前提

### 後続 PR: hopping (単独で詳細設計要)

- [ ] jump / spin に「実行中か」を返す verb (`readJumpActive()` / `readSpinActive()`)
- [ ] hover 状態を保持する共有 ref を新設 (現状 model は hover 状態を持たない)
- [ ] hopping action。`ACTION_JUMP` を dispatch してトリガー、hover / spin 中は停止

## 決定事項

- 2026-09-01: PR 分割は「基盤 refactor + walking/marching を 1 PR、body-bobbing / hopping は
  後続で個別」。基盤 refactor だけの単独 PR は切らない (walking の第一歩で必要になるため同梱)。
- 2026-09-01: `refs` は役割軸ネスト。leg 追加のタイミングで arm も同時にネスト
  (親 design.md「refs のネスト再検討」の YAGNI 解除条件どおり)。`rootRef` / `yawRef` /
  `fallPivotRef` は部位でないため flat 維持。
- 2026-09-01: posture 共有は `postureRef` (number) + host verb `readPosture` / `reportPosture`。
  fall の `phaseRef` はローカルのまま、`postureRef` はそのミラー (他 action の読み取り専用)。
- 2026-09-01: gait 系は `DEFAULT_CLICK_BINDINGS` へ登録しない (arm-toggle と同じ。既定では
  クリック起動しない)。

## 懸念・リスク

- `refs` ネスト化は `arm.leftRef` / `arm.rightRef` を参照する既存箇所 (JSX の腕グループ、
  adapter の `writeArmAngle` / `writeArmLift`、arm-toggle / fall) に波及する。`check-types` +
  ArmToggle / Fall story のリグレッション確認を必須にする。
- walking 中に fall が発火したケースの脚 swing 停止は PR #125 では入れない (posture gate は
  「開始を弾く」のみ、samples と同じ)。歩行中に倒れると脚が斜めのまま残る挙動。必要なら後続。
- body-bobbing / hopping の cross-action 状態読み取り (walking/marching 実行中フラグ、
  jump/spin 実行中、hover 状態) は box-bot-01 では現状どこにも無い。後続 PR で host verb か
  共有 ref を新設する必要があり、設計判断が残っている。
