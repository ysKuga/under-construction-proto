# time-control-03/_events

scope (この time-control-03 instance) 専用の CustomEvent 基盤。部品が「処理を行う」のではなく「処理を行うよう通知を出す」だけにすることで、部品から全体構造 (どの store が存在するか) への依存を切り離す。背景・設計判断の詳細は「関連」参照。

## 構成

```
_events/
  index.ts                  # 外部公開用の集約 index (index.contexts / index.hooks を re-export)
  index.contexts.tsx        # ScopeEventProvider。scope 専用 EventTarget を生成し配布する
  index.hooks.ts            # useTimeControl03EventDispatcher / useTimeControl03EventListener を re-export
  index.types.ts            # TimeControl03EventMap (イベント名 → payload 型の対応表)
  _contexts/
    scope-event-context.ts  # ScopeEventContext / useScopeEventTarget (Context 定義のみ)
  _hooks/
    use-time-control-03-event-dispatcher.ts     # 汎用 useEventDispatcher の scope 向けラッパー
    use-time-control-03-event-listener.ts       # 汎用 useEventListener の scope 向けラッパー
  _event-listeners/
    index.tsx                                   # ScopeEventListeners。各購読 hook をまとめて呼ぶ component
    use-xxx-event-listener/                      # イベントごとの購読 + 実処理 (例: use-reset-all-event-listener)
```

`_stores` の各 store ディレクトリと同様、個別イベントの実装 (`use-reset-all-event-listener` 等) は `_events` の内部実装として `_event-listeners/` 配下に置く。`_event-listeners` 配下の実装は `_hooks` 直下 (`useTimeControl03EventListener` 等) に依存してよい。

## 新しいイベントを追加する手順

1. `index.types.ts` の `TimeControl03EventMap` にイベント名と payload 型を追加する。イベント名には `TimeControl03-` prefix を付与する(grep 検索性のため、詳細は `index.types.ts` の JSDoc 参照)
2. 購読が必要なら `_event-listeners/use-xxx-event-listener/` を新設し、`_event-listeners/index.tsx` の `ScopeEventListeners` に呼び出しを1行足す
3. 発行側は `useTimeControl03EventDispatcher()` の戻り値オブジェクトから該当イベント名で呼ぶ (`dispatcher['event-name']()`)

## 依存関係

`ScopeEventListeners` が各 store の Context を参照するため、`_events → _stores` の一方向依存になる。`_stores` 側は event 実装を一切知らない。`ScopeEventProvider` は `StoresProvider` の内側に配置する前提。

## 参照ルール

- `_events` の外部消費者 (`action-bar` 等の component/hooks) は集約 index (`_events`) 経由で参照する
- `_events` 内部の実装 (`use-reset-all-event-listener` 等) は集約 index を経由せず `_hooks/` 配下から直接参照する (集約 index 経由だと import 循環を誘発するため)

## 懸念・トレードオフ

event 駆動化は移植容易性と引き換えに、「通知発行で何が起きるか」を静的解析 (grep 等) で追いにくくする。副作用の一覧性とのトレードオフとして認識した上で採用している。

## 関連

- 概念: [docs/concept/event-driven-ui/README.md](../../../../../docs/concept/event-driven-ui/README.md)
- 実装計画・決定事項: `.claude/.steering/20260813-event-driven-decoupling/design.md`
- 実装例・store 構成: [time-control-03/README.md](../README.md)
