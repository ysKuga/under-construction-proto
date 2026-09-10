# rxjs 長押し検出 util（候補 C）

issue: #131 / PR: #145 / branch: `131-rxjs-long-press-util`
親 steering: [../../design.md](../../design.md)（候補 C）

## 目的

導入済で未使用の rxjs を実コードへ適用する第一歩。「押下 → 保持 → 解放」という時系列の組み合わせを operator 合成で宣言的に判定する util を作る。`docs/package/reactive/rxjs/README.md` が名指しする「長押し」用途そのもの。

依存が軽く独立して作れるため、候補 B（proto-01 jumpCount）より先行する。

## スコープ

- 純粋 factory のみ。React hook ラッパー・spin への接続は本 PR では行わない（util 単体提供にとどめ、利用は後続 PR）
- 入力源（pointer / keyboard / EventTarget）非依存。呼び出し側が `fromEvent` 等で `down$` / `up$` を作って渡す

## 配置

`src/lib/rxjs/` 配下。

- 既存 `src/lib/react-query.ts` の「ライブラリ名で関連実装をまとめる」パターンをサブディレクトリ化して踏襲。`src/` 直下の命名規則（レイヤ/機能名）を崩さない
- 将来 React hook 版が必要になったら `src/hooks/use-long-press/` に置き、`@/lib/rxjs/long-press` を利用する形にする

```text
src/lib/rxjs/
  long-press.ts       # createLongPressStream + 型
  long-press.test.ts  # TestScheduler marble テスト
```

- 1 関心 1 ファイルのため集約 index は作らない。参照は `@/lib/rxjs/long-press` 直接

## API

```ts
/** 長押し判定の設定 */
type LongPressOptions = {
  /** 長押し確定までの保持時間（ms） */
  holdMs: number
}

/** 長押し判定の結果イベント */
type LongPressEvent = 'tap' | 'start' | 'end'

/**
 * 押下 → 保持 → 解放の時系列から長押しを判定する Observable を作る
 *
 * @param down$ 押下イベントの流れ
 * @param up$ 解放イベントの流れ
 * @param options 保持時間の設定
 */
export const createLongPressStream = (
  down$: Observable<unknown>,
  up$: Observable<unknown>,
  options: LongPressOptions,
): Observable<LongPressEvent>
```

## セマンティクス

- `down$` 発火後 `holdMs` 以内に `up$` → `'tap'`（通常クリック扱い）
- `down$` 発火後 `holdMs` 保持 → `'start'` を emit、その後の最初の `up$` → `'end'` を emit
- 保持中に `down$` が再発火した場合は進行中の判定を破棄して測り直す（`switchMap`）
- `up$` を伴わずに次の `down$` が来るケースも測り直しで吸収する

## 実装スケッチ

```ts
down$.pipe(
  switchMap(() => {
    const longPress$ = timer(holdMs).pipe(
      mergeMap(() =>
        concat(
          of<LongPressEvent>('start'),
          up$.pipe(take(1), map((): LongPressEvent => 'end')),
        ),
      ),
    )
    const tap$ = up$.pipe(
      takeUntil(timer(holdMs)),
      take(1),
      map((): LongPressEvent => 'tap'),
    )
    return merge(tap$, longPress$)
  }),
)
```

## テスト

rxjs `TestScheduler` の marble テストで以下を検証する。

- `holdMs` 前に `up$` → `'tap'` のみ
- `holdMs` 到達 → `'start'`、その後 `up$` → `'end'`
- `holdMs` ちょうどの境界挙動
- 保持中に `down$` 再発火 → 前の判定を破棄して測り直す
- `up$` なしで `down$` 連続 → 測り直す

標準 `vitest.config.ts` を使用（一時 config 不要）。rxjs は `src/` 未使用のため `zustand` mock 等の影響なし。

## 実装計画

- [x] `src/lib/rxjs/long-press.test.ts`（marble テスト先行）
- [x] `src/lib/rxjs/long-press.ts`（`createLongPressStream` + 型）
- [x] テストパス確認（`npx vitest run src/lib/rxjs/long-press.test.ts`）
- [x] 親 [../../design.md](../../design.md) の実装計画「PR: 長押し util（候補 C）」をチェック

## 決定事項

- 2026-09-09: スコープは純粋 factory のみ。hook ラッパー・spin 接続は後続
- 2026-09-09: イベント粒度は `'tap' | 'start' | 'end'` の 3 種（連射 tick は含めない。find-path の連続 push が必要になった時点で別途拡張検討）
- 2026-09-09: 配置は `src/lib/rxjs/`（`src/rxjs/` 直下・`src/utils/rxjs/` は不採用）

## 懸念・リスク

- 連射（`start` 後の interval tick）が後で必要になった場合、`LongPressEvent` に `'tick'` を足す拡張になる。今回の 3 種構成はその拡張を妨げない
- `TestScheduler` の marble 記法と `timer` の相性（仮想時間）は初適用。フレーム計算がずれる場合は fake timers での実時間テストに切り替える
