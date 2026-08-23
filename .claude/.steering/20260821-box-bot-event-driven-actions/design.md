# box-bot-event-driven-actions

## 目的

box-bot の既存 onClick 実装(`startHop` 等)を `useEventListener` 経由でも発火できるようにする。あわせて action の定義(現状のジャンプ)を整理する。`20260820-box-bot-samples` の後続作業。

## 背景・制約

- `20260820-action-reaction-design` steering で action(歩く/ジャンプ)/reaction(こける)の概念検討を実施済み。「ジャンプは既存クリックのまま維持、event listener 経由の発火経路を追加」という方針の実装ステップが本 steering に相当する。歩く/こける の概念検討自体はそちらのスコープのまま、本 steering では扱わない。
- 現状 `box-bot-3d` の `startHop`/`toggleLeft`/`toggleRight`(`_components/box-bot-model/index.hooks.ts`)は、`SketchBox` の `onClick` ハンドラに直接紐付いている。これは react-three-fiber の raycaster ベースのクリック(3D オブジェクトへの Pointer イベント)であり、DOM の `EventTarget`(window 等)を購読する `useEventListener`/`useEventDispatcher`(`src/hooks/event/`)とは仕組みが異なる。
- `useEventListener` は `type`(イベント名文字列)・`handler`・`target`(省略時 window)を受け取り、`EventTarget` の標準 addEventListener ベースで購読する。handler が Promise を返す場合は `useEventDispatcher` の戻り値がその完了を待つ。

## 実装計画

- [x] action の定義: ジャンプ(現状の `startHop` の整理。他 action と揃える命名・型があれば統一)
- [x] r3f の raycaster クリック(3D オブジェクトへの Pointer イベント)から `useEventDispatcher` でイベント発行するブリッジの設計
- [x] `useEventListener` 側で action 実行ロジック(ジャンプ発火)を受け取る設計・実装
- [x] `toggleLeft`/`toggleRight`(腕上げ下げ)も jump と同じパターン(`onClick` は dispatch のみ、実行判定は `useEventListener` 側)へ分離。`_action-hooks/` へそれぞれ専用 hook として切り出す
- [x] ref の context 化: `BoxBotEventProvider` と同様の `BoxBotRefsProvider`/`useBoxBotRefs` を新設し、`rootRef`/`spinRef`/`leftArmRef`/`rightArmRef`/`jumpRef` の5つを配布する形にした
- [x] action を外部から実行する仕組み(コントローラーからジャンプ指示のようなイメージ)。公開 dispatcher hook `useBoxBotActionDispatcher(eventTarget)` を新設し、呼び出し側が `ACTION_*` 定数や `new Event(...)` の組み立てを意識せず `jump()`/`armLeftToggle()`/`armRightToggle()` を呼べる形にする
  - 現状の `eventTarget` prop(`BoxBotModelProps`、省略時 instance 固有生成)と export 済みの `ACTION_JUMP`/`ACTION_ARM_LEFT_TOGGLE`/`ACTION_ARM_RIGHT_TOGGLE` により、外部が EventTarget を共有し `dispatchEvent(new Event(ACTION_JUMP))` する経路自体はすでに成立している。これを低レベル API のまま公開するか、box-bot 側で呼びやすい API を用意するかが論点だったが、後者を採用
  - 配置: box-bot-model 直下(`_action-hooks/` は内部実装専用のため区別。外部公開用は同ディレクトリ直下)
  - 実装: 内部で `useEventDispatcher(eventTarget)` をラップするのみの薄い関数群
  - 戻り値型: `UseBoxBotActionDispatcherReturn` を `index.types.ts` へ追加、プロパティ単位で JSDoc 付与
  - 呼び出し側イメージ:

    ```tsx
    const [eventTarget] = React.useState(() => new EventTarget())
    const { jump } = useBoxBotActionDispatcher(eventTarget)
    <BoxBotModel eventTarget={eventTarget} ... />
    <button onClick={jump}>Jump</button>
    ```

  - eventTarget の生成・共有責務は既存の `eventTarget` prop 設計のまま呼び出し側が持つ
- [x] 歩く: `walking: boolean`(状態)を jump/arm と同じ event listener toggle パターンで実装。`useWalkingAction`(`ACTION_WALKING_TOGGLE`)。この段階では見た目の挙動(脚の上下・前後スイング・bobbing 等)は実装しない。定義自体は `action-reaction-design` 側の決定事項を参照
- [x] 歩く挙動: 脚 swing(前後スイング、x軸回転)/脚 bob(上下、y position)/body bobbing を個別 action(`useLegSwingAction`/`useLegBobAction`/`useBodyBobbingAction`)として実装。body bobbing は脚の実際の ref 値(swing の角度・bob の位置)から毎フレーム高さを直接算出する方式にし、周期・位相パラメータで近似する形は採らなかった(ズレる余地をなくすため)
  - 確定: swing 方式 → `walking` として採用(前進の歩行)。bob 方式 → 新規 `marching`(足踏み)として採用。当初検討していた `legMotion` props(1つの値で bob/swing/none を排他選択)は廃止し、`walking`/`marching` を jump/arm と同じ独立 toggle action(`ACTION_WALKING_TOGGLE`/`ACTION_MARCHING_TOGGLE`、`walkingRef`/`marchingRef`)にした。body bobbing はどちらの ref が true かで計算式を切替える
- [x] 姿勢(`posture`): `action-reaction-design` 側で 0(直立)〜1(倒れている)の数値と定義済み(`docs/concept/README.md` 参照)。こける/起き上がりの前提として先に導入する
  - [x] `postureRef`(number、0〜1)を `BoxBotRefs`/`BoxBotRefsProvider` へ追加
  - [x] `walking`/`marching` の実行条件へ `postureRef.current === 0`(直立時のみ)ガードを追加。`useWalkingAction`/`useMarchingAction` 側の toggle 実行判定(`interactive` チェックと同じ位置)に組込む
- [x] こける(`fall`)・起き上がり(`getUp`): `action-reaction-design` 側で「別 action に分離、`posture` を変化させる oneshot trigger」と定義済み。jump(`use-jump-action.ts`)のパターンを踏襲して実装した
  - [x] `ACTION_FALL`/`ACTION_GET_UP` 定数を `index.constants.ts` へ追加(`BoxBot-action-fall`/`BoxBot-action-get-up`)
  - [x] `fallRef`/`getUpRef`(各 -1: 非実行中、0以上: 経過秒数)を `BoxBotRefs`/`BoxBotRefsProvider` へ追加
  - [x] `_action-hooks/use-fall-action.ts` を新設。dispatch(`startFall`)は trigger のみ、実行判定(`postureRef.current === 0` の時のみ)・`fallRef` 起動は `useEventListener` 側の `fallAction` へ一本化(jump と同じ分離)。発火時に `walkingRef`/`marchingRef` を強制 false にし、歩行中の転倒でも歩きが止まるようにした
  - [x] `_action-hooks/use-get-up-action.ts` を新設。fall と対称の実装(実行判定は `postureRef.current === 1` の時のみ、完了時 `postureRef.current = 0` を確定)
  - [x] `useFrame` カーブ: fall/getUp 分離により「倒れる→静止→起き上がる」の3フェーズ想定は不要になった。各 action は単一フェーズのイージング(fall: `p*(2-p)` で減速しながら停止、getUp: `1-p*p` で加速しながら起立)を `rootRef.rotation.x` へ適用する形にした
  - [x] `index.hooks.ts` へ組込み、`startFall`/`startGetUp` を `UseBoxBotModelReturn` へ追加
  - [x] `useBoxBotActionDispatcher` へ `fall()`/`getUp()` を追加、`UseBoxBotActionDispatcherReturn` を更新
  - [x] 動作確認: Storybook `Fall` story(`Fall`/`Get Up` ボタン)を追加、Playwright ヘッドレスで転倒→静止→倒れている間の fall 無視(ガード)→起き上がり→直立復帰を確認済み
  - [ ] 被ダメージモーション(仮称)は `action-reaction-design` 側で定義未確定のため別途。こけると共通化できる部分(`postureRef` の再利用等)がないか実装時に確認

## 検討

- [ ] body などへの onClick と jump 処理とを分離
  - [ ] body への onClick は click-body イベント
  - [ ] click-body イベントに jump-action が紐づいている場合アクションなど
- [ ] `useFrame` の分割: 現状 `index.hooks.ts` の単一 `useFrame` 内に autoRotate(spin 回転)・腕角度補間(leftArm/rightArm)・ホップ(root 位置・スケール)の3関心が同居している。各 action hook(`useJumpAction`/`useArmAction`)側へそれぞれの `useFrame` を持たせ、「`useEventListener` でイベント受信→ action 実行(state/ref 更新)→ 同じ hook 内の `useFrame` で可視化」まで1 hook に閉じ込める案を検討中
  - r3f の `useFrame` は複数箇所で呼び出し可能(グローバルループへ個別登録される仕組み)なので機構的には分割可能
  - jump 側は root ref のみ渡せば完結しやすい(hopRef は hook 内で完結済み)
  - arm-toggle 側は `leftArmAngle`/`rightArmAngle` が `cfg.arm.leftAngle`/`rightAngle`(index.hooks.ts でマージ済みの cfg 由来)にも依存するため、ref だけでなく cfg 値も渡す必要があり結合がやや増える
  - マウント時初期角度反映(`useLayoutEffect`)をどちらに置くかも要判断
- 装備などをマウント可能にする仕組み(直近の実装計画は想定せず、将来アイディアとして記録)
  - 装備に限らず腕・脚などのパーツ自体をマウント可能な実装へ変更し、破壊時の分離などに対応できるようにする案

## 決定事項

- ref 変数命名: `useRef()` 戻り値変数(hook 戻り値プロパティ含む)は `Ref` サフィックス付与に統一。ルールを `.claude/rules/react/ref-naming.md` へ新設。box-bot-model 内 `root`/`spin`/`leftArm`/`rightArm` を `rootRef`/`spinRef`/`leftArmRef`/`rightArmRef` へリネーム
- `rootRef` の context 化(複数 action からの共有): 当初は歩く action 等2つ目の消費者が具体化するまで見送る方針だったが、先行して着手する判断に変更。`BoxBotEventProvider` と同様の `BoxBotRefsProvider`/`useBoxBotRefs` を新設し、`rootRef` に加え `spinRef`/`leftArmRef`/`rightArmRef`/`jumpRef` の5つ全てを配布する形にした。Provider 内で `useRef` 生成 → `useMemo` で Context 値を安定化。各 action hook(`useJumpAction` 等)は `useBoxBotEventTarget` と同様に `useBoxBotRefs` を自前で呼び出して必要な ref を取得する(props 経由の受け渡しは行わない)
- `useFrame` 分割: jump 側から着手。`root` ref の所有権を `index.hooks.ts` から `use-jump-action.ts` へ移し、ホップ中の位置・スケール制御 `useFrame` も同 hook 内へ統合した。「イベント受信→hopRef 起動→同 hook 内 useFrame で可視化」まで1 hook に閉じた。`index.hooks.ts` 側の `useFrame` は autoRotate・腕角度補間の2関心のみに縮小。arm 側(cfg 値依存あり)は未着手のまま
- ジャンプ action 本体(`jumpAction`)を `_action-hooks/use-jump-action.ts` に分離。クリック(`startHop`)は `BoxBot-action-jump` イベントを dispatch するだけに徹し、実行判定(`interactive` チェック・`hop` 起動)は `useEventListener` 側の `jumpAction` へ一本化した。クリック由来でも外部の `useEventListener` 経由でも同じ判定を通る
- `onClick` は三項演算子で条件分岐せず常に `startHop` を登録する。`stopPropagation`(クリック伝播の抑止)は `interactive` に関わらず必要なため
- action 用の EventTarget は `index.contexts.tsx`(`BoxBotEventProvider`)が instance 固有に生成・配布する。`BoxBotModel` を outer(Provider 設置)/inner(既存ロジック呼出)の2コンポーネントに分割し、`useBoxBotModel` 内から `useContext` で取得できるようにした
  - 当初 ref に格納する設計を検討したが、React Compiler の `react-hooks/refs` ルール(ref の `.current` をレンダー中に読んで他の hook/JSX へ渡す操作を一律禁止)に抵触したため、`useState` の lazy initializer(setter 未使用、実質 const)に変更した
- action 実装の置き場所として `_action-hooks/`(`_hooks/` と区別し action であることを明記)を新設。box-bot は複数 action(歩く・ジャンプ・将来的な reaction 等)を前提とするため、jump 1個の段階から専用の置き場を用意した。1 action = 1 ファイル(`use-jump-action.ts`)の粒度は `time-control-03` の `_event-listeners/use-xxx-event-listener/` パターンを参考にしたが、box-bot は現状 action が少ないため、time-control-03 のような集約コンポーネント(`ScopeEventListeners` 相当)はまだ導入していない
- `toggleLeft`/`toggleRight` は jump とは異なり `_action-hooks/arm-action/` ディレクトリへ統合した(jump 型の「1 action = 1 ファイル」から外れる判断)。左右で完全対称なロジックは `_hooks/use-arm-toggle.ts`(`useArmToggle`)へ共通化し、`index.ts`(`useArmAction`、ベース hook)から `left`/`right` それぞれのイベント名で2回呼び出す形にした
  - 「上げ下げ(toggle)」以外の腕の動作(将来的な「振る」等)を見越し、公開 hook 名は `useArmToggleAction` でなく `useArmAction`(toggle を含まない)にした。中身が toggle 実装のみである点は変わらないが、名前からは arm 全般の action を扱う hook として読める
  - ディレクトリ化した理由: 上記の名前変更で「`useArmAction` = arm の action 全般」という抽象度になったため、内部実装(toggle)は同名ファイルに同居させず部品 hook として分離。`.claude/rules/react/hooks.md` の「構成分割」パターン(`_hooks/` 配下に関心事ごとの部品 hook、1 hook = 1 ファイルでファイル名と hook 名を一致させる)に倣い `_hooks/use-arm-toggle.ts` とした。歩く action 等、将来 arm に関わる action が具体化した際にファイルを追加しやすくする狙い
- action イベント名の命名パターンを `<scope prefix>-action-<対象>-<動作>`(例: `BoxBot-action-jump`、`BoxBot-action-arm-left-toggle`)に統一した。`action-` を挟むことで、将来 box-bot が発行する非 action イベント(あれば)と区別しやすくする。scope prefix(`BoxBot-`)自体は grep 検索性のため維持(EventTarget が instance 固有でも、この理由で prefix を残す方針は既存踏襲)
  - 定数名は `ACTION_JUMP`/`ACTION_ARM_LEFT_TOGGLE`/`ACTION_ARM_RIGHT_TOGGLE` とした。`ACTION_` prefix がすでに「action の発火イベント名である」ことを示すため、`_EVENT_TYPE` サフィックスは冗長と判断し付けない。文字列値(`action-` 部分)はそのまま維持
  - 戻り値もフラットな `leftUp`/`toggleLeft`/`rightUp`/`toggleRight` から `arm: { left: ArmSideState, right: ArmSideState }`(`ArmSideState = { up, toggle }`)へオブジェクト化した。左右で同じ形の状態を持つことが型・呼び出し側どちらからも見えやすくなる
- 型定義は `.claude/rules/react/hooks.md` の「部品 hook の戻り値型は個別定義せず `index.types.ts` の `Use<ComponentName>Return` から `Pick` で抽出する」に従い、`UseBoxBotModelReturn` へ `arm: { left: ArmSideState, right: ArmSideState }` を追加した上で `Pick` する形にした
- `fall`/`getUp` は `rootRef.rotation.x` を前傾角度(`FALL_ANGLE = Math.PI / 2`)まで/から補間する形で実装した。jump が `rootRef.position.y`/`scale`、autoRotate が `spinRef.rotation.y` を触るのに対し、`rootRef.rotation.x` は他 action と未使用のプロパティだったため衝突なく追加できた。jump との同時発火(転倒中にジャンプする等)は今回考慮せず、将来課題として残す
  - 進行度カーブは jump の `Math.sin` 系(対称)ではなく、fall は `p * (2 - p)`(減速しながら停止)、getUp は `1 - p * p`(加速しながら起立)という非対称のイージングにした。「勢いよく倒れて静止」「ゆっくり起き上がる」という見た目の非対称性を、fall/getUp を分離した後も単一フェーズの式だけで表現している
  - `fall` の実行判定(`postureRef.current === 0` の時のみ)内で `walkingRef`/`marchingRef` を強制的に false へ戻す。歩行/足踏み中に転倒しても、歩行系の action 側に個別の中断処理を持たせずに済む
- 動作確認は Storybook `Fall` story(`Fall`/`Get Up` ボタンを常時表示、内部ガードにより誤クリックは無視される設計)を追加し、Playwright ヘッドレスで一連の状態遷移(直立→転倒中→倒れた状態→倒れている間の fall 再クリック無視→起き上がり中→直立復帰)をスクリーンショットで確認した
- fall/getUp 実装後、フィードバックを受けて2点調整した
  - 回転中心を体の中心でなく接地点(脚の下端)にするため、`fallPivotRef` を新設。`rootRef` の直下に「接地点へ position で移動 → `fallPivotRef` で回転 → 元のローカル座標へ position で戻す」という pivot 構造を追加し、回転(`rotation.x`)は `rootRef` でなく `fallPivotRef` へ適用する形に変更した。pivot 位置の y 座標(`groundY`)は `useBoxBotModel` の戻り値に追加し、JSX の position props として渡す(action hook 側は回転のみ扱う)
  - fall 発火時に腕を前へ出す(`FALL_ARM_ANGLE`、`leftArmRef`/`rightArmRef` の `rotation.x` を即座に切替える toggle 実装)。getUp 発火時に 0 へ戻す。経過時間による補間はせず、fall/getUp の実行判定内で直接代入するだけの最小実装。将来この動き自体を独立 action(軌道)として分離する可能性がある(ユーザー要望として明示済み)
  - 動作確認時、通常のカメラ距離(fov 42)では転倒後の姿勢が Canvas 下端で見切れて確認しづらかったため、`Fall` story のみ `fov={45}`/`style={{ height: 600, width: 700 }}` を指定し、転倒後も全身が収まるようにした(この対応は後続のフィードバックで box-bot-3d 側の自動調整に置き換え、story 側の個別指定は撤去した)
- 上記実装後、さらにフィードバックを受けて3点調整した
  - 腕の位置を「頭寄り」に変更(`FALL_ARM_ANGLE = -3π/4`)。転倒に対して防御的に頭をかばう動きを意図
  - getUp を「fall の位置(頭寄り)から一度 床を押す位置(`GET_UP_ARM_PUSH_ANGLE = -0.35`)を経由して通常位置(0)へ戻る」2 フェーズの線形補間にした(進行度前半で頭寄り→床を押す位置、後半で床を押す位置→0)。腕を使って立ち上がるような動きを意図(この設計は後続のフィードバックで見直し、決定事項の続き参照)
  - 転倒時の見切れ対策を、story 側の個別 fov/Canvas サイズ指定(前段の対応)から、box-bot-3d 自体が自動調整する方式に置き換えた。新設 `useCameraFramingAction`(`_action-hooks/`)が `postureRef` を監視し、直立でない間 `camera.fov` を `CAMERA_FALLEN_FOV_OFFSET` 分だけ広げる(`approach` で滑らかに)。呼び出し側は box-bot-3d の camera props や Canvas サイズを一切意識しなくてよくなった
    - 実装時の学び: `useThree()` の戻り値 `camera` を直接 mutate すると React Compiler の `react-hooks/immutability` ルールに抵触するため、`useFrame` のコールバック引数(`state.camera`)から取得する必要があった
    - 実装時の学び: `camera.fov` を書き換えて `updateProjectionMatrix()` を呼べば反映されるが、オフセット量が小さいと視覚的な変化にほぼ気づけない(tan 比によるスケール変化のため、値を大きく振らないと体感できない)。検証時は一旦極端な値(120 度等)で反映有無を切り分けてから、実用的な値(基準 + 55 度)に絞り込んだ
    - 複数の `BoxBotModel` が同一 Canvas を共有する場合(`OverlapGrid3D` story 等)、各インスタンスがカメラを奪い合う懸念が残る。現状は 1 Canvas = 1 インスタンスの利用を前提とし、将来課題として残す
- getUp の腕の動きを再度見直した。「fall の位置(頭寄り)から一度 床を押す位置を経由」という設計(体の回転と腕の戻りを同じ経過時間で並行制御)は、「手を前にした状態のまま体を垂直まで起こし、直立してから定位置に戻す」という順序立てた動きの要望により置き換えた
  - `GET_UP_ARM_PUSH_ANGLE` 定数は削除。新設 `ARM_RETURN_DUR`(腕を戻す所要時間)に置き換えた
  - 体の回転(`getUpRef`)と腕の戻り(新設 `armReturnRef`、`BoxBotRefs` へ追加)を別 ref で管理する 2 段階構成にした。体の回転が完了(`postureRef.current = 0` に確定)した瞬間に `armReturnRef.current = 0` をセットして腕の戻りフェーズを開始する。体の回転中は腕の角度に一切触れない(fall で設定された `FALL_ARM_ANGLE` がそのまま維持される)ため、「頭寄りのまま体だけ起こす」動きが自然に実現できた
  - 動作確認時、通常の `GET_UP_DUR`/`ARM_RETURN_DUR`(0.6秒/0.35秒)では headless Chromium 環境の低フレームレート(dt が 1 フレームあたり 0.08〜0.11 秒程度になることがあった)により中間状態のスクリーンショットが撮れなかったため、検証時のみ両定数を数秒単位に延ばして中間状態を確認し、確認後に元の値へ戻した
- 上記の2段階構成(体を起こしてから腕を戻す)は「get up 中に腕を垂直まで移動したい」という要望で再度見直した。体の回転と腕の戻りを同じ進行度(`getUpRef`)で並行制御する形に戻し、`armReturnRef`/`ARM_RETURN_DUR` は削除した。`fallPivotRef.rotation.x` と腕の `rotation.x` を両方とも同じイージング式 `FALL_ANGLE/FALL_ARM_ANGLE * (1 - p * p)` で計算する。前々段の並行制御(床を押す位置を経由)との違いは、経由点を挟まず fall の位置から通常位置(0)まで単一区間で補間する点
- カメラの自動フレーミング(`useCameraFramingAction`、`CAMERA_FALLEN_FOV_OFFSET`/`CAMERA_FOV_APPROACH_RATE`)は、いったん取りやめて撤去した。`_action-hooks/use-camera-framing-action.ts` を削除し、`index.hooks.ts` からの呼び出しも外した。転倒時の見切れ対策自体は継続検討課題として残る(git 履歴から復元可能)
- 「Canvas の表示領域(DOM 要素のサイズ)を拡大すれば見切れを解消できないか」という代替案を検証した。box-bot-3d の Canvas 高さを 900px に拡大して Playwright で確認したが、転倒後も画角の外に見切れたまま変化しなかった。three.js の `camera.fov` は垂直方向の視野角(度)であり、Canvas(DOM 要素・renderer)のピクセルサイズとは独立しているため、DOM サイズを拡大しても同じワールド座標範囲がより大きく描画されるだけで、見える範囲(視錐台)自体は変わらない。この検証結果を踏まえ、`useCameraFramingAction` を撤去前の実装のまま再導入した
- 再導入した `useCameraFramingAction` も「倒れた瞬間に見切れている」というフィードバックにより再度撤去した。`approach` による fov 補間(`CAMERA_FOV_APPROACH_RATE`)は、fall 発火直後(体が倒れ切る前)は目標値に収束しておらず、体が倒れ切った直後の一瞬はまだ元の fov に近いため、見切れが実際には解消しきれていなかった。カメラ側での動的な対応(fov 追従)は今回のスコープでは見送りとし、転倒時の見切れ対策は再度 継続検討課題として残す
- box-bot-3d のデフォルト `fov` を静的に広げる(42 → 64)方式で見切れ対策を再検討した。動的補間(`useCameraFramingAction`)は「切り替わりの遅延で倒れた瞬間だけ見切れる」問題を抱えていたが、常時固定の fov なら遅延自体が発生しない
  - 前例あり: jump 演出(頭部が上昇)による上方の見切れも、当初 fov 拡大(34 → 42、コミット `0e0cec1`)で常時固定的に解決していた。今回は同じ手法を下方(転倒)にも適用した形
  - Playwright で fov=58/64/70 を比較検証。58 は転倒直後にわずかに脚先が接する程度、70 は直立時に本体がやや小さく見えすぎる、64 が「直立時の見た目は元の fov=42 とほぼ変わらず、転倒直後(fall 発火 420ms 後)から起き上がり完了まで一貫して見切れない」バランス点として採用した
  - `index.stories.tsx` の `BASE_FOV` 定数(`fovForScale` の基準値、Grid3D/Circle story で Canvas 拡大率ぶん fov を補正するのに使う「BoxBot3D デフォルトと同じ値」というコメント付き定数)も 42 → 64 へ同期させた。ここを更新し忘れると Grid3D/Circle 表示で本体の見かけの大きさがずれるため
- fov=64 を適用しても「story 上で見切れている」というフィードバックがあり調査したところ、原因は fov でなく Storybook の Controls パネルだった。Storybook の通常表示(canvas 直下に Controls パネルが表示される既定レイアウト)では、Canvas 外側 div の既定高さ(480px)がパネル分だけ表示領域を超え、転倒姿勢の下部がパネルの裏に隠れていた。BoxBot3D 自体(fov)は正しく機能しており、本番(BoxBotModel の実利用箇所には Controls パネルが存在しない)では発生しない Storybook 固有の表示問題
  - 対応は `Fall` story 側の Canvas 高さを `style={{ height: 320 }}` で既定(480px)より低くする形にした。BoxBot3D 本体や他 story には手を入れていない
- height 縮小(320px)後も「fall 完了時に見切れる」という報告が続いた。手元(1400×800 のビューポート)では再現しなかったため Playwright で段階的にビューポートを狭めて確認したところ、900×500 程度の狭いウィンドウで Actions/Interactions/Accessibility パネル(Controls を無効化しても他の addon タブは残る)が Canvas 領域を圧迫して再現した
  - `parameters: { controls: { disable: true } }` だけでは他の addon タブ(Actions 等)が残り不十分だった。`parameters: { options: { showPanel: false } }` に切り替え、addon パネル自体を非表示にした
  - それでも Canvas の絶対的な高さ(480px)がビューポートの残り高さを超えれば見切れるため、`showPanel: false` と `style={{ height: 320 }}` の両方を併用する形で最終決定した。片方だけでは狭いウィンドウを再現できなかった
- 「表示領域を拡大するたびに表示位置が下にいっている気がする」というフィードバックを受け、対症療法(story 側の Canvas 高さ調整)を繰り返すだけでなく、根本の見た目バランスを見直した
  - `BoxBot3D` の `OrbitControls` 注視点 `ORBIT_TARGET`(`[0, 0.4, 0]`)を `[0, -0.3, 0]` へ変更した。カメラの注視点を下げるほど本体全体が画面の上寄りに表示されるようになり、転倒時に画面下部へはみ出しにくくなる。box-bot-3d 全体(Mode3D/Grid3D/Circle/Walking 等の全 story・本番利用箇所)に影響する変更のため、Playwright で他 story の見た目に破綻がないことを確認してから採用した
  - `Fall` story の Canvas 高さは、この間ユーザー側で 320→450 に変更されていたが、900×500 のビューポートではまだ見切れることを確認し、300 へ調整し直した。ORBIT_TARGET 変更(汎用対応)と Canvas 高さ調整(story 固有の対症療法)は独立した対策であり、両方を組み合わせて狭いウィンドウでの見切れを解消している
- ORBIT_TARGET はユーザー側でさらに `[0, -0.6, 0]` まで調整されていたが、これにより「Grid3D で表示が小さくなった」という新たな問題が発生した
  - 原因調査の結果、Grid3D/OverlapGrid3D は `orbit={false}` のため ORBIT_TARGET とは無関係と判明(見当違いの仮説を最初に立てていた)。真因は別の変更、`index.stories.tsx` の `BASE_FOV` 定数を「BoxBot3D デフォルトと同じ値」として box-bot-3d の fov 変更(42→64)に追従させていたことだった
  - `fovForScale`(Canvas 拡大率に応じて fov を広げ見た目のスケールを一定に保つ関数)は `tan` 比のスケーリング計算で、BASE_FOV が大きくなるほど同じ拡大率でも実効 fov が非線形に(90 度に近づくほど急激に)広がる。BASE_FOV を 42→64 にしたことで、Grid3D の実効 fov が 94 度→120 度超まで広がり、広角レンズの周辺歪みで本体が縮小して見えていた
  - 対応方針を検討し、「fovForScale 周りの数値を修正する」(assembly パターンで box-bot-3d 自体をラップし直す案とは別軸)を選んだ。`BASE_FOV` を box-bot-3d のデフォルト追従(64)から切り離し、Grid3D/Circle が意図した見た目を保っていた元の値(42)に戻すことで解決した。box-bot-3d 自体の fov 調整(見切れ対策)と、Grid3D/Circle 用の見た目スケール基準(BASE_FOV)を独立させる設計に修正した形
  - Grid3D/Circle/OverlapGrid3D/Mode3D/Fall のいずれも Playwright で見た目に問題ないことを確認済み
  - BASE_FOV 修正の検証過程で ORBIT_TARGET を一時的に `[0, -0.15, 0]` に下げて Grid3D への影響を切り分けたが、最終的に `[0, -0.6, 0]` はユーザー側の判断・コミット(`ec647b1`)で確定した。ORBIT_TARGET(box-bot-3d 全体のカメラ注視点)と BASE_FOV(Grid3D/Circle 固有の見た目スケール基準)が完全に独立したため、ORBIT_TARGET をどこまで下げても Grid3D の見た目には影響しないことを確認済み
- assembly パターン(`docs/terminology/assembly/`、container/body + `position: absolute` による部品組合せ、`scale` による拡縮)で box-bot-3d をラップする案は、今回は見送り継続検討とした。box-bot-3d の Canvas 配置構造自体を変える、より大きい設計変更のため

## 懸念・リスク

- r3f のクリック処理(Object3D 単位の raycast)と DOM `EventTarget` ベースの `useEventListener` は仕組みが異なる。両者をどう繋ぐか(ブリッジの置き場所・イベント名の scope prefix 等)の設計が必要。
- 命名: 当初 `hopRef`/`startHop`/`HOP_DUR` 等「hop」と「jump」(action 名・イベント名)が混在していたため、`jumpRef`/`startJump`/`JUMP_DUR` へ jump に統一した
- `action-reaction-design` steering との役割分担: 概念検討(歩く/こける含む)はそちらに残し、本 steering は「ジャンプの event listener 化」という実装に限定する。将来 歩く/こける を実装する際は、本 steering で得た知見(ブリッジ設計)を再利用できるか要確認。
- 装備・パーツのマウント化(検討section参照)について
  - 現状 `box-bot-model` は `SketchBox` を JSX 内に直接配置する構造。パーツを「マウント可能」にするには、パーツをコンポーネント境界(独立した Object3D の子)として切り出す再設計が必要になる
  - 今回導入した `BoxBotRefsProvider` は `rootRef`/`spinRef`/`leftArmRef`/`rightArmRef`/`jumpRef` の固定5つを前提にした設計。マウントパーツが動的に増減する構造になると、固定 ref でなく ref のマップ/配列的な管理への切替が必要になり、現状の設計と衝突する可能性がある
  - 「破壊時の分離」は Object3D の親子関係の動的な解除(three.js 側で group から detach する等)を伴う。現状の action(jump/arm-toggle)は position/rotation/scale の書き換えのみで完結しており、階層構造自体を変更する処理はまだない
  - 装備の着脱は見た目(ジオメトリ)の差し替えも伴うため、`SketchBox` のシード・サイズを `cfg` 由来で決め打ちしている現状構成から、装備ごとに独立した設定を持たせる形への拡張が必要になる
