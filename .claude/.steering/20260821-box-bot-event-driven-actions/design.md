# box-bot-event-driven-actions

## 目的

box-bot の既存 onClick 実装(`startHop` 等)を `useEventListener` 経由でも発火できるようにする。あわせて action の定義(現状のジャンプ)を整理する。`20260820-box-bot-samples` の後続作業。

## 背景・制約

- `20260820-action-reaction-design` steering で action(歩く/ジャンプ)/reaction(こける)の概念検討を実施済み。「ジャンプは既存クリックのまま維持、event listener 経由の発火経路を追加」という方針の実装ステップが本 steering に相当する。歩く/こける の概念検討自体はそちらのスコープのまま、本 steering では扱わない。
- 現状 `box-bot-3d` の `startHop`/`toggleLeft`/`toggleRight`(`_components/box-bot-model/index.hooks.ts`)は、`SketchBox` の `onClick` ハンドラに直接紐付いている。これは react-three-fiber の raycaster ベースのクリック(3D オブジェクトへの Pointer イベント)であり、DOM の `EventTarget`(window 等)を購読する `useEventListener`/`useEventDispatcher`(`src/hooks/event/`)とは仕組みが異なる。
- `useEventListener` は `type`(イベント名文字列)・`handler`・`target`(省略時 window)を受け取り、`EventTarget` の標準 addEventListener ベースで購読する。handler が Promise を返す場合は `useEventDispatcher` の戻り値がその完了を待つ。

## 実装計画

- [ ] action の定義: ジャンプ(現状の `startHop` の整理。他 action と揃える命名・型があれば統一)
- [ ] r3f の raycaster クリック(3D オブジェクトへの Pointer イベント)から `useEventDispatcher` でイベント発行するブリッジの設計
- [ ] `useEventListener` 側で action 実行ロジック(ジャンプ発火)を受け取る設計・実装

## 決定事項

<!-- 検討・決定した内容のログ -->

## 懸念・リスク

- r3f のクリック処理(Object3D 単位の raycast)と DOM `EventTarget` ベースの `useEventListener` は仕組みが異なる。両者をどう繋ぐか(ブリッジの置き場所・イベント名の scope prefix 等)の設計が必要。
- `action-reaction-design` steering との役割分担: 概念検討(歩く/こける含む)はそちらに残し、本 steering は「ジャンプの event listener 化」という実装に限定する。将来 歩く/こける を実装する際は、本 steering で得た知見(ブリッジ設計)を再利用できるか要確認。
