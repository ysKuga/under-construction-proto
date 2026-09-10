# proto-01 jumpCount の Observable 化（候補 B）

issue: #131 / PR: #146 / branch: `131-rxjs-proto01-jump-count`
親 steering: [../../design.md](../../design.md)（候補 B）
先行: 候補 C（PR #145、[../pr-145-rxjs-long-press-util/design.md](../pr-145-rxjs-long-press-util/design.md)）

## 目的

issue #131 積み残しの rxjs 適用、候補 B。proto-01 の `jumpCount` 連番 state を Observable 合成へ寄せ、UI に効く `walkUnlocked` の boolean だけを state 化する。あわせて「挙動と UI の分離」（積み残し）を hooks 構成分割で消化する。

## スコープ

- `jump$ = fromEvent(eventTarget, ACTION_JUMP)` → `scan` → `map(>= 3)` → `filter(Boolean)` → `take(1)` → `walkUnlocked`
- `jumpCount` の連番 state を廃止。`walkUnlocked` の `false → true` 1 回だけ `useState`
- ジャンプ回数の取得を `BoxBot` の `onClick` prop カウントから `ACTION_JUMP` 購読へ切替
- proto-01 を `index.tsx` / `index.hooks.ts` / `index.types.ts` / `_hooks/` 構成へ分割
- `walking`（ボタンラベル 歩く/止まる）state と `walkingToggle` 呼び出しは proto-01 に残す（単純 toggle のため）
- 候補 C の長押し util は使わない（ジャンプに「離す」概念なし）
- proto-01 は `samples/figure/box-bot` 依存のまま。actor 版への差し替えは別軸

## 変更点

### `samples/figure/box-bot` の公開 export に `ACTION_JUMP` を追加

- `box-bot-3d/index.tsx` と `box-bot/index.tsx` へ `ACTION_SPIN` と同様に re-export
- 外部消費者（proto-01）は公開 index 経由で購読する。deep path 参照しない

### proto-01 の構成分割

```text
proto-01/
  index.tsx            # JSX のみ。useProto01 を呼ぶだけ
  index.hooks.ts       # useProto01 — eventTarget 生成・useWalkUnlock・walking toggle をまとめる
  index.types.ts       # UseProto01Return
  index.stories.tsx    # 既存
  _hooks/
    use-walk-unlock.ts       # rxjs: fromEvent(ACTION_JUMP) → scan → map → filter → take(1) → { walkUnlocked }
    use-walk-unlock.test.ts  # renderHook + EventTarget dispatch
```

- `useWalkUnlock` の戻り値型は `Pick<UseProto01Return, 'walkUnlocked'>`（型の出所を `index.types.ts` に一元化。hooks.md ルール）

## 実装スケッチ（`use-walk-unlock.ts`）

```ts
const [walkUnlocked, setWalkUnlocked] = useState(false)

useEffect(() => {
  const subscription = fromEvent(eventTarget, ACTION_JUMP)
    .pipe(
      scan((count) => count + 1, 0),
      map((count) => count >= JUMPS_TO_UNLOCK_WALK),
      filter(Boolean),
      take(1),
    )
    .subscribe(() => setWalkUnlocked(true))

  return () => subscription.unsubscribe()
}, [eventTarget])
```

## テスト

`renderHook`（`@testing-library/react`）で以下を検証（標準 `vitest.config.ts`）。

- しきい値未満のジャンプでは `walkUnlocked` が `false` のまま
- しきい値（3 回）到達で `walkUnlocked` が `true`
- アンマウントで `removeEventListener` が呼ばれる（購読解除）

## 実装計画

- [x] `samples/figure/box-bot` の公開 export に `ACTION_JUMP` 追加
- [x] `proto-01/_hooks/use-walk-unlock.ts` + `.test.ts`
- [x] `proto-01/index.hooks.ts` / `index.types.ts` へ分割、`index.tsx` を JSX のみへ
- [x] テスト・lint・tsc パス確認
- [x] 親 [../../design.md](../../design.md) の候補 B をチェック

## 決定事項

- 2026-09-09: 分離は proto-01 内の `index.hooks.ts` 構成分割で行う（`control/` 新設はしない）
- 2026-09-09: `walking` state は proto-01 に残す（Observable 化対象は walk-unlock のみ）
- 2026-09-09: ジャンプ回数は `ACTION_JUMP` 購読（`onClick` prop カウント廃止）

## 懸念・リスク

- `use-walk-unlock.test.ts` が `@/components/samples/figure/box-bot` 経由で three を読み込むため "Multiple instances of Three.js" 警告が出る（`ACTION_JUMP` 定数のためだけの import）。テスト実行・結果には影響なし。deep path 参照で回避できるが外部消費者の参照経路ルールを優先し許容する
