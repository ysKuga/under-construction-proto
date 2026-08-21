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

## 検討

- [ ] action を外部から実行する仕組み (コントローラーからジャンプ指示のようなイメージ)
- [ ] body などへの onClick と jump 処理とを分離
  - [ ] body への onClick は click-body イベント
  - [ ] click-body イベントに jump-action が紐づいている場合アクションなど

## 決定事項

- ジャンプ action 本体(`jumpAction`)を `_action-hooks/use-jump-action.ts` に分離。クリック(`startHop`)は `BoxBot-jump` イベントを dispatch するだけに徹し、実行判定(`interactive` チェック・`hop` 起動)は `useEventListener` 側の `jumpAction` へ一本化した。クリック由来でも外部の `useEventListener` 経由でも同じ判定を通る
- `onClick` は三項演算子で条件分岐せず常に `startHop` を登録する。`stopPropagation`(クリック伝播の抑止)は `interactive` に関わらず必要なため
- action 用の EventTarget は `index.contexts.tsx`(`BoxBotEventProvider`)が instance 固有に生成・配布する。`BoxBotModel` を outer(Provider 設置)/inner(既存ロジック呼出)の2コンポーネントに分割し、`useBoxBotModel` 内から `useContext` で取得できるようにした
  - 当初 ref に格納する設計を検討したが、React Compiler の `react-hooks/refs` ルール(ref の `.current` をレンダー中に読んで他の hook/JSX へ渡す操作を一律禁止)に抵触したため、`useState` の lazy initializer(setter 未使用、実質 const)に変更した
- action 実装の置き場所として `_action-hooks/`(`_hooks/` と区別し action であることを明記)を新設。box-bot は複数 action(歩く・ジャンプ・将来的な reaction 等)を前提とするため、jump 1個の段階から専用の置き場を用意した。1 action = 1 ファイル(`use-jump-action.ts`)の粒度は `time-control-03` の `_event-listeners/use-xxx-event-listener/` パターンを参考にしたが、box-bot は現状 action が少ないため、time-control-03 のような集約コンポーネント(`ScopeEventListeners` 相当)はまだ導入していない

## 懸念・リスク

- r3f のクリック処理(Object3D 単位の raycast)と DOM `EventTarget` ベースの `useEventListener` は仕組みが異なる。両者をどう繋ぐか(ブリッジの置き場所・イベント名の scope prefix 等)の設計が必要。
- `action-reaction-design` steering との役割分担: 概念検討(歩く/こける含む)はそちらに残し、本 steering は「ジャンプの event listener 化」という実装に限定する。将来 歩く/こける を実装する際は、本 steering で得た知見(ブリッジ設計)を再利用できるか要確認。
