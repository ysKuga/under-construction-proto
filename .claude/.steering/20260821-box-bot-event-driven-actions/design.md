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
- [ ] 歩く挙動: `walking` state を受けて実際に動かす実装。上下(脚 y position 逆位相)/前後スイング(脚 x軸回転、arm と同型)/bobbing(body 全体上下) を個別 action として分離し、`walking` 側がそれらを組合せる形を検討
- [ ] こける/被ダメージモーション(仮称、要 naming)も jump と同じパターンで event listener 化。定義(`action-reaction-design` 側)完了後に着手

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

## 懸念・リスク

- r3f のクリック処理(Object3D 単位の raycast)と DOM `EventTarget` ベースの `useEventListener` は仕組みが異なる。両者をどう繋ぐか(ブリッジの置き場所・イベント名の scope prefix 等)の設計が必要。
- 命名: 当初 `hopRef`/`startHop`/`HOP_DUR` 等「hop」と「jump」(action 名・イベント名)が混在していたため、`jumpRef`/`startJump`/`JUMP_DUR` へ jump に統一した
- `action-reaction-design` steering との役割分担: 概念検討(歩く/こける含む)はそちらに残し、本 steering は「ジャンプの event listener 化」という実装に限定する。将来 歩く/こける を実装する際は、本 steering で得た知見(ブリッジ設計)を再利用できるか要確認。
- 装備・パーツのマウント化(検討section参照)について
  - 現状 `box-bot-model` は `SketchBox` を JSX 内に直接配置する構造。パーツを「マウント可能」にするには、パーツをコンポーネント境界(独立した Object3D の子)として切り出す再設計が必要になる
  - 今回導入した `BoxBotRefsProvider` は `rootRef`/`spinRef`/`leftArmRef`/`rightArmRef`/`jumpRef` の固定5つを前提にした設計。マウントパーツが動的に増減する構造になると、固定 ref でなく ref のマップ/配列的な管理への切替が必要になり、現状の設計と衝突する可能性がある
  - 「破壊時の分離」は Object3D の親子関係の動的な解除(three.js 側で group から detach する等)を伴う。現状の action(jump/arm-toggle)は position/rotation/scale の書き換えのみで完結しており、階層構造自体を変更する処理はまだない
  - 装備の着脱は見た目(ジオメトリ)の差し替えも伴うため、`SketchBox` のシード・サイズを `cfg` 由来で決め打ちしている現状構成から、装備ごとに独立した設定を持たせる形への拡張が必要になる
