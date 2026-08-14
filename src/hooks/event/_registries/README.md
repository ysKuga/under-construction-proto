# hooks/event/_registries

`useEventListener`/`useEventDispatcher`/`useEventPending` を、React state を介さず繋ぐための module scope registry 群。

`dispatchEvent()` は同期関数で、listener 内の async 処理とは本来紐付かない。だが `useEventDispatcher` の戻り値が listener の完了を待てる (`await dispatcher(...)`)、`useEventPending` が発行元 (dispatcher) を介さず独立に pending 状態を観測できる、という2つの性質は、3 hook がそれぞれ別の React component instance で呼ばれても成立させたい。React state (Context 等) で受け渡すと呼出元同士に不要な結合が生まれるため、`target` (EventTarget) 単位の `WeakMap` に実行中 Promise・pending 変化の購読者を保持し、3 hook がここを介して間接的にやり取りする形にしている。詳細な経緯は「関連」参照。

## 構成

`index.ts` 1ファイルに集約している。

- listener 登録数管理 (`registerListener`/`unregisterListener`): `useEventListener` の多重登録検知用
- pending Promise 管理 (`registerPendingPromise`/`unregisterPendingPromise`/`getPendingPromises`): `useEventListener` の handler が返した Promise を保持、`useEventDispatcher` が発行直後に読んで完了を待つ
- pending 変化通知 (`subscribePendingChange`): pending Promise の増減を `useEventPending` が購読する

pending Promise 管理が増減時に pending 変化通知を呼ぶ、という1方向の依存以外、3つの間に依存関係はない。いずれもコード量が小さいため、ファイル分割せず1ファイルにまとめている (分割していた際、同列ファイル間の相互 import が発生していた)。

## 参照ルール

`use-event-listener`/`use-event-dispatcher`/`use-event-pending` の3 hook のみが参照する。`hooks/event` の外部消費者はこの registry を直接参照せず、3 hook 経由で使う。

## 関連

- 実装計画・決定事項: `.claude/.steering/20260814-event-async-pending/design.md`
