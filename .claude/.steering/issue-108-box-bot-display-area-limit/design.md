# box-bot アクション範囲 (表示領域) の限定

## 目的

box-bot 3D のアクション (特に fall 完全転倒) が canvas 矩形を逸脱して見切れる問題を、
canvas を設置領域と一致させたまま解消する。試作は `src/prototypes/box-bot/box-bot-01/` で行う。

GitHub #108 / Jira UC-10「box bot 改善」内「アクション範囲 (表示領域) の限定」に対応。
コピー設置は #107 に切り出し済み。

## 背景・制約

### 用語

- 設置領域: 他要素との組み合わせのための領域。`Assembly` (`ui-container` + `ui-assembly`) の正方形。
- 表示領域: アクションのために設置領域を逸脱させた領域。現状の `Canvas`。

### 現状の構造 (samples/figure/box-bot/_components/box-bot-3d)

- `Assembly` 内に `Canvas` を `position: absolute` で配置。
- Canvas サイズ `heightPx = assemblySize / BODY_HEIGHT_RATIO` (`BODY_HEIGHT_RATIO ≒ 233/480 ≒ 0.485`)。
  → Canvas が設置領域の約 2 倍。`transform: translate(-50%, calc(-50% + offset))` で中央 + 下方向オフセット。
- fall/jump の可動域を Canvas はみ出しで確保している。
- 破綻の兆候:
  - 404 ページで「BoxBot の表示領域を広くしているため」404 リンクに `z-10` 手当て。
  - `OrbitControls` の target を `-0.6` 上へずらして fall 時の見切れを回避。
  - `orbit={false}` 時に `onCreated` で明示 lookAt が必要 (Grid3D story の経緯)。

### 現状の fall 実装 (use-fall-action.ts)

- `fallPivotRef` = 接地点 (脚下端 `groundY`) へ pivot 移動したグループ。ここに `rotation.x = FALL_ANGLE` (≒90°)。
- 接地点を軸に前傾するため、頭が前方かつ下方へ張り出す。この張り出し分を Canvas はみ出しで確保していた。
- `useFrame` 内で `fallRef` 進行度 `p` に応じて `fallPivotRef.current.rotation.x` を補間。完了時 `postureRef = 1`。
- get-up (`use-get-up-action.ts`) は別 action。逆再生に相当。

### 前提の確認結果 (2026-08-27 ユーザー確認)

- fall 完全転倒 (90° → 横倒しで静止 → get-up) の表現は **必須**。→ 手足限定案は不可。
- 拡大縮小 (`style.height` での可変サイズ) は **禁止して固定サイズでよい**。→ `BODY_HEIGHT_RATIO` 逆算・可変ロジックを撤去可能。
- 複数 canvas 構成: box-bot の story にはあるが、現状は単独 canvas。単独 canvas 前提は後々検討。
  → 原則 (設置領域逸脱の禁止) は先取りするが、設置領域 ref の Canvas 外配線は最小実装に留める。

## 実装計画

### フェーズ 0: コピー設置 (#107、完了)

- [x] `samples/figure/box-bot` の 3D 実装を `src/prototypes/box-bot/box-bot-01/` へコピー。
- [x] `@/components/ad/molecules/assembly` をローカルコピー (`_components/box-bot-3d/_components/assembly/`)。
- [x] `@/hooks/event` / `@/utils/*` は import 維持。
- [x] entry (`index.tsx`) / stories は 3D のみ。2D SVG・samples 固有の調査 story は除外。
- [x] グループ README (`src/prototypes/box-bot/README.md`)。

### フェーズ 1: 案2 の試作 (#108 本来の目的、ブランチ 108-box-bot-fall-display-area で着手)

方針: **Canvas 内は姿勢 (回転) のみ + 転倒移動は表示領域シフト (jump 方式)**。
2026-08-30 ユーザーと合意。当初案の「`ui-container` を ref 移動」は不採用 —
jump と同じ表示領域 DOM シフトで足りる。`ui-container` 移動は UC-10 の portal/context 設計と
密結合 (下記「懸念・リスク」) のため見送り、暫定形を採る。

fall モーション = 姿勢回転 (Canvas 内) + 表示領域シフト (DOM) の合成。
接地点 pivot の見た目は「中心回転 + 定ベクトル平行移動」に等しい
(`点 x → (中心pivot結果) + (I−R(θ))·(中心→足)`、平行移動量は x に依らない)。
厳密な足固定は閉形式で出せるが、`FWD`/`DOWN` を手調整の定数 + ease にして jump と揃える。

- [x] Canvas 固定サイズ化 — #107 / #118 で完了 (`DEFAULT_HEIGHT = 234`、Canvas = 設置領域と一致)。
- [x] fall の回転 pivot を接地点 → **シルエット中心** (`layout.center.y` = 足元〜頭上端の中点) へ。
      `index.tsx` に `translate(center.y) → fallPivotRef → translate(-center.y)` チェーン。
      体心 (原点) だと頭が長いぶん横倒しで左下へ寄るため、中点に変更 (PR #119 `4f469ae`)。
- [x] jump の `applyLift(px)` を `applyShift({ x, y })` へ一般化。`writeLift` → `writeShift`
      (`displayAreaRef` の `left` / `top` を `calc(50% ± …)` で書換)。`use-jump` は
      `applyShift({ x: 0, y: lift })` へ移行 (PR #119 `f389ed6`)。
- [x] fall の `useFrame` で `applyTiltAngle(FALL_ANGLE · ease(p))` と
      `applyShift({ x: shiftX · p, y: shiftY · p })` を同時適用。`shiftX` / `shiftY` は
      `FallConfig` (既定 `-40` / `-70`)、Fall story にスライダー (PR #119 `ca20e74`)。
- [x] get-up の逆補間 (回転 + shift の 0 への復帰)。`useFrame` は毎フレーム無条件適用へ
      (早期 return だと再レンダーで inline style が復元され中心へスナップ、PR #119 `15ffabf`)。
- [ ] 404 ページの `z-10` 手当て・`OrbitControls` target ずらしが不要になることを確認。

不採用 (当初案から変更、2026-08-30):

- ~~接地点の辻褄合わせを `ui-container` の ref 移動で表現~~ → 表示領域 (`displayAreaRef`) の DOM シフトへ統一。
- ~~設置領域 ref を Canvas 外へ供給する配線 (`containerRef` prop / context)~~ → `displayAreaRef` が既にその役割。
- ~~横倒し時の一様縮小 (`FallConfig.scale`)~~ → 追加したが (PR #119 `da231aa`)、シルエット中心 pivot だけで
  表示領域にほぼ収まり不要と判断し撤去 (`e7b70ef`)。

### 詰めるパラメータ (実測要)

- 固定 Canvas サイズ: 済 (`DEFAULT_HEIGHT = 234`)。
- シフト量 `FWD` / `DOWN`: 横倒し時に体を前方・下方へずらす px。中心回転を接地点 pivot 相当に見せる補正。
  数学的には `(I−R(θ))·(体心→足)` の平行移動だが、手調整定数 + ease で近似 (厳密な足固定より jump との一貫性優先)。
- 影の追従: ~~cast/contact shadow は接地面固定~~ → contact 影を **body 形状に紐づく固定楕円** (drei `Shadow`) へ
  差し替え、`facing` ぶん接地面内で回す。転倒で体が浮くぶんは `FallConfig.shadowLift` (world +y、進行度同期) で
  影を体へ寄せる (体である程度覆われてよい)。ブランチ 108-box-bot-fall-shadow-grid。cast は未対応。

### フェーズ 1 の後続: 向き (facing) からの転倒方向算出 (実装済み 2026-08-30、ブランチ 108-box-bot-fall-facing-direction)

現状 fall の画面シフトは screen 固定 (常に左下)。bot がどちら向きでも同じ方向へ倒れ込む。
「向き」概念を入れ、転倒方向を facing から算出する。

方針 (2026-08-30 ユーザーと合意):

- **向き = 既存 yaw と同一概念**。`rotationY` prop を「向き (facing、rad、0 = カメラ正面 +z)」として
  意味づけ強化 (改名しない)。実効 facing = `rotationY` + `yawRef.rotation.y` (spin / autoRotate 累積)。
- **向きは連続 (角度 rad)**。離散 enum ではない。

転倒方向の算出は 2 パート:

- **A. 3D の傾き軸 — 追加不要**。`fallPivotRef` は既に `yawRef > rootRef(rotationY)` の内側にあり、
  local x 軸まわりの `rotation.x` 傾きがそのまま「facing 前方へ倒れる」になる。現状維持。
- **B. 画面シフト方向 — facing から算出**。現状の `shiftX` / `shiftY` (screen 固定 2 値) を
  `shiftDistance` (スカラ 1 値) + facing 由来の方向へ置き換える。
  1. 倒れ始めに実効 facing `θ = rotationY + yawRef.current.rotation.y` を固定
     (`shiftConfigRef` と同様 `facingRef` へ。get-up も同じ θ で逆再生)
  2. world 前方水平ベクトル `d = (sin θ, 0, cos θ)`
  3. カメラ投影で画面 2D 方向へ:
     `p0 = Vec3(0, center.y, 0).project(camera)` / `p1 = Vec3(d.x, center.y, d.z).project(camera)`、
     `screen = normalize(p1 - p0)` (NDC y と画面 px y の符号差は実測調整)
  4. `applyShift({ x: screen.x · shiftDistance · posture, y: screen.y · shiftDistance · posture })`
  - カメラ固定 → θ 不変なら投影は 1 回。spin 中に倒れて θ が変わる時のみ再投影 (倒れ始め固定なら不要)。

実装結果:

- `FallConfig`: `shiftX` / `shiftY` → `shiftDistance` (facing 方向へのずらし、スカラ、既定 80) +
  `dropDistance` (facing 非依存の画面下げ量、既定 60、実測要)。中心 pivot で横倒し時に足元が
  立ち姿勢の接地点より浮くため、`dropDistance` で下げて足元高さへ戻す。`shiftAngleOffset` は
  facing スライダーで全方向テストでき YAGNI と判断し不採用 (符号ズレが実測で出たら追加)
- host に `readFacing(): number` を追加 (`rotationY` + `yawRef.rotation.y`)。`apply*` と違い読み取り。
  fall だけが `Pick`。adapter は module scope `readFacing(yawRef, rotationY)` を閉じ込め
- fall action: `useThree((s) => s.camera)` でカメラ直参照 (host に足さない)。`projectFacingScreenX`
  で `(sin θ, 0, cos θ)` と原点を NDC 投影し差を正規化、**x 成分 (画面横) のみ**返す。`center.y` は
  使わず y=0 で投影。倒れ始めに 1 回計算し `shiftXRef` へ固定、get-up も同じ値を逆再生
- **画面ずらしの縦成分は facing に載せない**。カメラが斜め見下ろしのため facing の奥/手前成分が
  投影 y に強く出て、正面が下・背面が上へ暴れる (足元がバラつく)。縦は `dropDistance` 一本
  (facing 非依存) にして 5 向きとも足元が揃うようにした。横 (`shiftX·shiftDistance`) は前後向きで
  ≈ 0、真横向きで最大
- `rotationY` JSDoc に「向き (facing)。fall の倒れ込み方向の基準」を明記
- Fall story: bot 5 体を `FACE_CAMERA_YAW` (bot→カメラ水平 yaw) 基準のオフセットで並べる
  (左斜め / 正面 / 右斜め / 右向き / 背面)。`rotationY = 0` は world +z で斜め見下ろしカメラでは
  画面上斜めを向くため。`CAMERA_POSITION` / `ORBIT_TARGET` を `index.tsx` から export。
  bot ごとに独立 `eventTarget` (共有すると listener 多重登録エラー)、Fall ボタン 1 回で全体へ
  `ACTION_FALL` 直 dispatch。`shiftDistance` / `dropDistance` スライダーは全体共通

### フェーズ 1 の後続: grid story と挙動調整 (実装済み、ブランチ 108-box-bot-fall-shadow-grid)

facing 転倒方向の後続。Fall story を並び替え + fall の縦挙動 + 影を調整。

- Fall story を **3x3 グリッド 9 体**へ。周囲 8 セルは `FACE_CAMERA_YAW` から 45° 刻み 8 方向、
  セルの方角 = bot の向き = 倒れ込む向き。周囲は `orbit=false` で視点固定 (同条件比較)、
  中央 1 体は `orbit=true` で回転可 (立体確認用)。左列が見切れないよう grid に `marginLeft`
- **画面ずらしの縦成分を「進行方向」へ戻す**。`projectFacingScreenX` (横のみ) → `projectFacingToScreen`
  (2D) へ。`applyShift` の縦に facing 投影の縦成分を復活: 奥向き=画面上、手前向き=画面下、横向き=左右。
  `dropDistance` は facing 非依存の一定下げとして残す (足元浮き補正、小さめ)。
  既定 `shiftDistance` 55 / `dropDistance` 25
- **接地影を body 形状 + facing 連動の楕円**へ (drei `Shadow`)。`bodyWidth × bodyDepth` の楕円を
  `facing` ぶん回す。転倒で姿勢が変わっても形は不変
- **転倒時に影を体へ寄せる**。`FallConfig.shadowLift` (world +y、既定 0.5) を進行度同期で影グループの
  `position.y` へ。配線は `displayAreaRef` パターン踏襲 (`shadowLiftRef` prop + host `applyShadowLift`)

## box-bot アクションレジストリの後続作業 (PR #111 派生)

PR #111 で jump をレジストリ形式へ移行 (`_actions/<name>/` descriptor + `BOX_BOT_ACTIONS` 配列 +
`for..of` orchestrator + Context 注入)。fall/spin 等は検証のため一旦全削除、新形式で復帰予定。
経緯は PR #111 [design.md](_closed/pr-111-jump-display-area/design.md) の「実装済み: 案A」参照。
移行後に残った box-bot ↔ アクション間の結合が以下。実装は box-bot-01 で直接、別 PR 想定。

### 残る結合

A / B / C は PR #114 / #115、D / E はブランチ 108-box-bot-registry-followup で解消済み。
残る結合はなし。fall 復帰済み (ブランチ 108-box-bot-fall-restore)。次はフェーズ1。

#### 解消済み

- **A. config が bot の型に穴を開けていた** — PR #114 (`ceb3de7`)
  - `defineAction<Name, Arg, Config>` が `defaults` を持ち、`use` を `config` 差し込みでラップ。
    `BoxBot3DConfig` から `jump` フィールド・`DEFAULTS.jump` を撤去。`actionConfig` bag は
    box-bot-model 内部で緩い型、`BoxBot3D` 外殻で `BoxBotActionConfigs` の厳密型。詳細は下記「A の実装方針」
- **B. `BoxBotActionContext` が service locator だった** — PR #115 (`fc3258a`)
  - narrow host (`BoxBotActionHost`) + adapter (`box-bot-model/index.hooks.ts` の module scope `write*`)。
    各アクションは `Pick` で必要分だけ受ける (`JumpHost` / `SpinHost`)。fat な base ctx
    (`cfg` / `refs` / `props` 丸ごと) は撤去。詳細は下記「B の pilot」
- **C. 型の相互依存** — B の副作用で消滅
  - `box-bot-model/index.types.ts` は `_actions` から import するのみの一方向。循環なし

- **D. `use-box-bot-action-dispatcher` が `BOX_BOT_ACTIONS` を直参照** — ブランチ 108-box-bot-registry-followup
  - `useBoxBotActionDispatcher(eventTarget, actions?)` の第2引数化。省略時 `BOX_BOT_ACTIONS`、
    戻り値型はアクション一覧からジェネリック導出。直参照は既定値の1箇所へ縮小
- **E (補足). `use-click-bindings` が要素イベント 2 種をハードコード** — ブランチ 108-box-bot-registry-followup
  - `ON_CLICK_BODY` / `ON_CLICK_HEAD` を単一 `ON_CLICK_ELEMENT`(`detail` に押下要素)へ集約。
    `use-click-bindings` は 1 リスナで中継。部位追加時にこの hook を触らない
    (`ClickTarget` ループ案は `react-hooks/rules-of-hooks` に触れるため単一イベント + detail 分岐へ)

### A の実装方針 (検討済み 2026-08-29)

現状の配線: `_actions/jump/config.ts` が `JumpConfig` 型 + `JUMP_DEFAULTS` 値を持つ。それを
box-bot-model が `BoxBot3DConfig.jump` (型) / `DEFAULTS.jump` (値 import) / `useBoxBotModel` の
`jump: { ...DEFAULTS.jump, ...opts.jump }` (マージ1行) の 3 箇所へ引き込んでいる。`useJump` は
`ctx.cfg.jump` をキー名込みで読む。

方針:

1. **`BoxBot3DConfig` を純ジオメトリ/見た目へ**。`jump` フィールド削除、`JumpConfig`/`JumpOverride`
   re-export 削除。`DEFAULTS` から `jump` キー削除、`JUMP_DEFAULTS` import 撤去。
   → `index.constants.ts` の値 import (`_actions` → box-bot-model 方向) が消え、C の実害部分も軽くなる。
2. **descriptor が `defaults` を持つ**。`defineAction` に `Config` 型パラメータ追加、
   `jumpAction = defineAction<'jump', JumpOverride, JumpConfig>({ ..., defaults: JUMP_DEFAULTS })`。
   `BoxBotActionConfigs<typeof BOX_BOT_ACTIONS>` を mapped type で導出 (`BoxBotActionDispatchers` と同手口)。
   `defaults` は optional (config なしアクション対応)。
3. **props は nested bag**。`BoxBotModelProps` に
   `actionConfig?: Partial<BoxBotActionConfigs<typeof BOX_BOT_ACTIONS>>` を追加。
   使い方: `<BoxBot3D actionConfig={{ jump: { liftPx: 200 } }} />`。per-action であることを型で明示。
4. **`use()` は generic ctx。config 復元は descriptor 内で行う**。
   - `BoxBotActionContext<Config = never>` を generic 化し `config: Config` を持たせる。
     `useJump(ctx: BoxBotActionContext<JumpConfig>)` は `ctx.config` を型付きで読む (`ctx.cfg.jump` 依存消滅)。
   - `defineAction<Name, Arg, Config>({ defaults, use })` が、内部で `use` を
     `(ctx: BoxBotActionContext) => use({ ...ctx, config: { ...defaults, ...ctx.actionConfig?.[name] } })`
     にラップして返す。per-action の `Config` 型は `defineAction` の型引数で保持され、ラッパー境界で確定。
   - orchestrator (`useBoxBotModel` の `for (const action of actions)`) は raw な
     `actionConfig: opts.actionConfig ?? {}` を base ctx に載せ `action.use(baseCtx)` を回すだけ。
     `AnyBoxBotAction` に潰れても `use` の中身はラップ済みなので型は緩まない。base ctx の型は
     `BoxBotActionContext` (= `BoxBotActionContext<never>`、`config` へはアクセス不可)。
   - defaults マージは descriptor 内に閉じる。`useBoxBotModel` の per-key マージ (`arm`/`body`/...) は現状維持、
     action ぶんの畳み込みループは持たない。
   - stringly な `actionConfig?.[name]` は `defineAction` 内部の 1 箇所のみ。アクション作者は触らない。
5. **`cfg` は ctx に残す** (純ジオメトリ化後の geometry/見た目参照用。将来 fall の `groundY` 算出等)。
   jump は `cfg` を touch しなくなる。

影響ファイル (各小): `_actions/types.ts` (generic ctx + `BoxBotActionConfigs` + ctx へ `actionConfig`) /
`_actions/define-action.ts` (`Config` 型パラメータ + `defaults` + `use` ラップ) / `_actions/jump/index.ts` (`defaults` 渡す) /
`_actions/jump/use-jump.ts` (`ctx.config` へ) / `box-bot-model/index.types.ts` (`jump` 削除・`actionConfig` prop 追加) /
`box-bot-model/index.constants.ts` (`JUMP_DEFAULTS` 撤去) / `box-bot-model/index.hooks.ts` (base ctx へ raw `actionConfig`)。

未整理: dispatch 時 1 回上書き (`JumpOverride` = `CustomEvent.detail`) は `Arg` 型パラメータ経由で別系統。
本方針は触らない。`Config` (既定) と `Arg` (1回上書き) は jump では両方 `JumpConfig` 系だが概念別、型パラメータは分ける。

### 次にやるなら

1. ~~**A** (config を descriptor へ)~~ — 実装済み PR #114
2. ~~**B** (narrow host + adapter)~~ — pilot 実装済み PR #115。fall 復帰時に 3 個目 consumer で host 語彙を再検討
3. ~~**D / E**~~ — 実装済み ブランチ 108-box-bot-registry-followup。レジストリ結合は解消完了
4. ~~**fall の復帰**~~ — 実装済み ブランチ 108-box-bot-fall-restore。下記
5. **フェーズ1** (案2、fall 表示領域限定) — fall 復帰が前提。#108 の本来の目的
6. ~~部位アンカーの戻り値まとめ (`layout`)~~ — 実装済み 2026-08-29、ブランチ 108-box-bot-layout-anchors。下記

### B の pilot (実装済み 2026-08-29、ブランチ 108-box-bot-action-host)

spin (one-shot) を 2 個目の consumer として復帰させ B を試作。

- host = `BoxBotActionHost` (`interactive` / `eventTarget` / `applySquash` / `applyLift` / `applyYawDelta`)。
  各アクションは `Pick` で narrow に受ける (`JumpHost` / `SpinHost`)。fat な base ctx (`cfg` / `refs` / `props` 丸ごと) 撤去
- adapter = `box-bot-model/index.hooks.ts`。THREE / DOM 書き込みは module scope の `write*` に隔離、
  render scope では ref オブジェクトを渡すだけ (`react-hooks/refs` 対策。`useMemo` ラップは不可、module scope 関数が正解)
- **C は副作用で消滅**: `_actions/types.ts` の import がゼロ。`box-bot-model → _actions` の一方向のみ、循環なし
- yaw 累積グループの ref を `spinRef` → `yawRef` へ改名 (spin 専用でなく spin / autoRotate が相乗り)
- spin の局所進行度 ref は `spinRef` のまま (`use-jump` の `jumpRef` と対)
- 残: `onFrame` / `onAction` は host に載せず r3f / `useEventListener` 直 import 継続。
  fall 復帰時に 3 個目の consumer で host 語彙を再検討

### fall の復帰 (実装済み 2026-08-30、ブランチ 108-box-bot-fall-restore)

fall (転倒 → 横倒しで静止 → 起き上がり) を 3 個目の consumer として新レジストリ形式へ復帰。
接地点まわりの前傾は据え置き (表示領域中心への pivot 変更はフェーズ1)。

- **単一 descriptor**。`_actions/fall/` (`config.ts` 定数 / `use-fall.ts` / `index.ts`)。
  get-up は別 action にせず `useFall` 内の逆補間。`phaseRef` (0 直立 / 1 転倒中 / 2 横倒し静止 / 3 起き上がり中) を
  `useFrame` 内で進める。1 回の `fall()` dispatch が直立 ⇄ 横倒しをトグル。config なし (継続時間・角度は定数固定)
  → `defineAction<'fall'>` の `defaults` なし経路 (config-less アクション) の初適用
- **host 語彙 (3 個目 consumer の結論)**: intent verb を 2 つ追加。
  `applyTiltAngle(rad)` (接地点 pivot の絶対 `rotation.x`) / `applyArmAngle(rad)` (左右腕グループの絶対 `rotation.x`)。
  `applyYawDelta` の増分と違い絶対値 (`applyLift` / `applySquash` と同系)。`onFrame` / `onAction` は据え置き (host 非搭載)
- **adapter**: `index.hooks.ts` に module scope `writeTilt` / `writeArmAngle` を追加、`actionHost` へ配線。
  render scope では ref オブジェクトを渡すだけ (既存パターン踏襲)
- **共有 ref**: `BoxBotRefs` に `fallPivotRef` / `leftArmRef` / `rightArmRef` を追加 (JSX と adapter 双方が参照)。
  進行度 (`phaseRef` / `tRef`) は `useFall` ローカル
- **JSX pivot chain**: `rootRef` 内側に `translate(ground.y) → fallPivotRef → translate(-ground.y)` を挟む。
  腕は外側グループで静的 z 傾き、内側 `*ArmRef` グループを fall が x 軸で回す (z 傾きを clobber しない)
- **`layout.ground.y`** を追加実装 (`deriveLayout` / `BoxBotLayout` / test)。`-body.h/2 - leg.h` = 脚下端
- 未実施 (フェーズ1): 404 ページ `z-10` / `OrbitControls` target ずらしの撤去確認、影の追従
- **`refs` のネスト再検討**: `fallPivotRef` / `leftArmRef` / `rightArmRef` が増えたので `layout` と対で判断可能に。
  現状は flat 5 個 (`rootRef` / `yawRef` / `fallPivotRef` / `leftArmRef` / `rightArmRef`)。
  腕は左右で対 → `refs.arm.leftRef` / `refs.arm.rightRef` のネスト余地あり。別ブランチで検討

### 部位アンカーの戻り値まとめ (`layout`、実装済み 2026-08-29、ブランチ 108-box-bot-layout-anchors)

`useBoxBotModel` の戻り値のうち cfg から計算する部位配置 (`headY` / `headFront` / `shoulderX` / `shoulderY` /
`legX` / `legY`) をネスト化。アクセスは `layout.leg.x` / `layout.head.front` の形。

- コンテナ名 `layout` (部位の配置アンカー)
- 形: `{ head: { y, front }, shoulder: { x, y }, leg: { x, y } }`。2 階層固定 `layout.<部位>.<軸 | 意味>`
- 純関数 `deriveLayout(cfg): BoxBotLayout` を `box-bot-model/_lib/derive-layout.ts` へ切り出し、hook は呼ぶだけ。
  `__tests__/derive-layout.test.ts` で DEFAULTS からの導出値・スケール方向を検証
- `UseBoxBotModelReturn` の flat 6 キー → `layout` 1 つ。`BoxBotLayout` を `index.types.ts` に定義、各フィールド JSDoc。
  消費は `BoxBotModelInner` のみ
- raw 寸法直参照 (`cfg.body.w` / `cfg.eye.offset` 等) は `cfg.*` のまま
- ~~未実施 (fall 復帰時): `groundY` (脚下端) を `layout.ground.y` として追加~~ — 実装済み (fall 復帰と同時)。
  将来 host が raw `cfg` でなく `layout` (読み取り専用の派生幾何) を露出する形の下地
  (上記「A の実装方針」5 の「cfg は ctx に残す」を絞った版)
- **`refs` のネストは fall 復帰後に `layout` と対で再検討** — fall 復帰済み。上記「fall の復帰」の末尾参照

## 決定事項

- 2026-08-27: 案2 (表示領域中心で回転 + 設置領域の相対位置アニメ) を採用。fall 完全転倒を維持。Canvas 固定サイズ。
- 2026-08-27: 試作は samples を汚さず prototypes/box-bot/box-bot-01 で行う。assembly もローカルコピーし改変対象にする。
- 2026-08-27: コピー設置は #107 に切り出し。案2 の実装は別 issue とする。

## 懸念・リスク

- 設置領域 ref の Canvas 外配線は、UC-10 の別項目「layout 常駐 + createPortal + context 経由 props」と密結合。
  その設計が固まる前に配線を作り込むと手戻りの可能性。フェーズ 1 では暫定形 (体心その場回転、足元が浮く) で切り、
  container オフセットを後回しにする選択肢も残す。
- 体心回転にすると 90° 回転時に bot の縦横が入れ替わる。横倒し時の水平方向の広がり = 元の体高。
  固定 Canvas を「体高を収める正方形」にすれば足りるはずだが、影・ジャンプ余白との兼ね合いは実測次第。
- r3f Canvas はページ内絶対位置をずらすと内部描画がズレる既知現象あり (samples stories の Grid3D コメント参照)。
  設置領域 (Canvas の親) を動かす方式がこれに抵触しないか要検証。
