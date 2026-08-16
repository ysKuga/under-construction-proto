# event-async-pending

## 目的

`time-control-03/_events` の event 駆動化 ([event-driven-decoupling](../20260813-event-driven-decoupling/design.md)) で、将来 async 処理 (API 呼出・重い計算等) を伴うイベントが出てきた際の pending 状態の扱い方を、実装前に方針として決めておく。

## 背景・制約

- 現状 `dispatch-decision` イベント (`_events/_event-listeners/use-dispatch-decision-event-listener/`) は sync。内部で `setTimeout` による auto-continue はあるが、dispatch 自体は即 return する void 処理。
- `useTimeControl03EventDispatcher()` の型は `(detail?: T) => void`。async 処理・pending 状態を持つイベントは現行の型では表現できない。
- `ScopeEventListeners` は「1 event = 1 listener」を前提にした構成 (各 `use-xxx-event-listener` を単純に並べて呼ぶだけ)。fan-out (同一イベントを複数 listener が購読) は想定されていない。

## 実装計画

実施済み。`time-control-03/_events/_event-listeners/use-async-sample-event-listener/` (実演用サンプル) + `_components/action-bar` の「async sample」ボタンで、下記「決定事項」の方針を実装。

- [x] 対象イベント発生時、下記「決定事項」の方針で実装する

## 決定事項

- **dispatcher 戻り値を `Promise<void>` にする方針を採用**。`src/hooks/use-event-listener.ts` に `target`・`type` ごとの実行中 handler Promise を記録する registry を追加し、`src/hooks/use-event-dispatcher.ts` が `dispatchEvent()` 直後にそれを読んで `Promise.all(...)` を返す。呼出元は `await dispatcher['xxx']()` するだけで pending 区間を把握できる。
  - 旧決定 (下記) は撤回。fan-out (同一 type を複数 listener が購読) 時の「誰の完了を待つか」問題は `Promise.all` (登録中の**全** listener の完了を待つ) で機械的に解決できるため、store/Context 等の中継機構は不要と判断した。
  - ~~pending 状態は event 側 (dispatcher) ではなく listener 側の store に持たせる方針を採用~~ → 撤回。dispatcher の型を変えない制約自体を見直した。
  - ~~dispatcher 戻り値を `Promise` 化する案は不採用~~ → 撤回。

## 懸念・リスク

- fan-out 時、`Promise.all` は登録中の**全** listener の完了を待つ。「特定の1つの listener だけ待ちたい」ケースが将来出てきた場合はこの方針では表現できない、再検討要。
