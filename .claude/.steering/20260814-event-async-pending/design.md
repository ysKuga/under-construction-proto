# event-async-pending

## 目的

`time-control-03/_events` の event 駆動化 ([event-driven-decoupling](../20260813-event-driven-decoupling/design.md)) で、将来 async 処理 (API 呼出・重い計算等) を伴うイベントが出てきた際の pending 状態の扱い方を、実装前に方針として決めておく。

## 背景・制約

- 現状 `dispatch-decision` イベント (`_events/_event-listeners/use-dispatch-decision-event-listener/`) は sync。内部で `setTimeout` による auto-continue はあるが、dispatch 自体は即 return する void 処理。
- `useTimeControl03EventDispatcher()` の型は `(detail?: T) => void`。async 処理・pending 状態を持つイベントは現行の型では表現できない。
- `ScopeEventListeners` は「1 event = 1 listener」を前提にした構成 (各 `use-xxx-event-listener` を単純に並べて呼ぶだけ)。fan-out (同一イベントを複数 listener が購読) は想定されていない。

## 実装計画

未着手。実際に async 処理を伴うイベントが必要になった時点で着手する。

- [ ] 対象イベント発生時、下記「決定事項」の方針で実装する

## 決定事項

- **pending 状態は event 側 (dispatcher) ではなく listener 側の store に持たせる方針を採用**。event は「実行しろ」という通知のみに留め、実際に処理を行う store (例: `usePositionStore`) が `isDispatching` 等のフィールドを持ち、呼出元はその store を購読して pending を監視する。
  - 理由: 「プロパティは context/store、ロジックは event」という [event-driven-decoupling](../20260813-event-driven-decoupling/design.md) の決定事項と整合する。dispatcher の型 (`(detail?: T) => void`) を変えずに済む。
- **dispatcher 戻り値を `Promise` 化する案は不採用**。`ScopeEventListeners` が「1 event = 1 listener」前提のため、fan-out した場合「どの listener の完了を待つか」が曖昧になり破綻する。現状の構成前提と食い合わせが悪い。

## 懸念・リスク

- 将来 `ScopeEventListeners` が fan-out (同一イベントを複数 listener が購読) する構成に変わった場合、上記の pending 方針も再検討要。
- store 側に pending フィールドを増やすと、各 store の責務 (state 保持 vs 非同期処理の状態管理) が肥大化する可能性あり。実装時に store 分割の要否を判断する。
