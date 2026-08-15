# event-dispatcher/event-listener の汎用命名化 + イベント名 scope prefix 化

## 目的

`time-control-03/_events` の scope 専用 dispatcher/listener 命名を見直す。

- `useTimeControl03EventDispatcher`/`useTimeControl03EventListener` → 汎用名 (`useEventDispatcher`/`useEventListener` 等) への統一を検討
- イベント名自体に scope prefix (例: `'TimeControl03-dispatch-target'`) を埋め込み、grep 検索性を上げる案
- 将来的に scope 専用 `EventTarget` から window 等の共有 `EventTarget` への切替も視野に入れる

## 背景・制約

- 現行実装: `_events/README.md` 参照。scope (time-control-03 instance) 専用の `EventTarget` を `ScopeEventProvider` で生成・配布、`TimeControl03EventMap` で type-safe に payload 対応
- dispatcher 呼出箇所 (`timeControl03EventDispatcher['xxx']`) には、対応する listener へ grep ジャンプできるよう `// timeControl03EventListener\('xxx'` コメントを暫定で付与済み (7箇所: action-bar/index.hooks.ts 3, async-sample-button 1, use-fixed-path-setting.ts 2, use-target-dispatch.ts 1)
- `_events/_hooks/use-time-control-03-event-dispatcher.ts` 等が `@/hooks/event` の汎用 `useEventDispatcher`/`useEventListener` をラップする構成。ラッパー側を同名にすると `@/hooks/event` 版との名前衝突が起きるが、JSDoc・定義ジャンプで判別可能という判断
- prototype 間の依存ルール ([src/prototypes/CLAUDE.md](../../../src/prototypes/CLAUDE.md)) により、time-control-03 固有の変更は同ディレクトリ内で完結させる

## 実装計画

- [x] `TimeControl03EventMap` の全 8 イベント名に `TimeControl03-` scope prefix 付与
- [x] `_event-listeners/` 配下 8 listener の購読 type 文字列・JSDoc を prefix 済み名へ更新
- [x] dispatcher 呼出全 8 箇所 (grep コメント含む) を prefix 済み名へ更新
- [ ] hook 名の汎用化 (`useTimeControl03EventDispatcher` → `useEventDispatcher` 等) は未着手、副次対応として保留
- [ ] `TimeControl03EventMap` のキーを template literal 型 (例: `` `TimeControl03-${string}` ``) で制約する案は未着手

## 決定事項

- 2026-08-15: 検討継続、実装は保留。方針(命名変更のみ先行 or EventTarget 切替まで含める)が固まってから実装着手する
- 2026-08-16: 主目的をイベント名 scope prefix 化 (`'TimeControl03-dispatch-target'` 等) と確定、実装完了。\
  window 等への EventTarget 共有化は今回対象外、hook 名の汎用化は副次対応として別途保留

## 懸念・リスク

- イベント名への scope prefix 埋め込みは、現行の「scope 専用 EventTarget による衝突回避」という設計思想と方向性がずれる可能性がある。EventTarget を window 等の共有先へ切り替える具体的動機が未確認 → 今回は EventTarget 共有化を対象外としたため、この懸念は現時点では顕在化しない
- 汎用 hook 名への統一は `@/hooks/event` 版との名前衝突を招く。ジャンプ・JSDoc 前提の運用で許容するかは要合意 (未着手のため継続課題)
