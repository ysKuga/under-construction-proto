# 歩くボタン解放の表示制御を hidden checkbox + CSS 化（候補 F）

issue: #131 / PR: #149 / branch: `131-css-boolean-cell`
親 steering: [../../design.md](../../design.md)（候補 F）
先行: 候補 B（PR #146、[../pr-146-rxjs-proto01-jump-count/design.md](../pr-146-rxjs-proto01-jump-count/design.md)）

## 目的

issue #131 後続課題 F。proto-01 の「歩く」ボタン解放（`walkUnlocked`）の表示制御を React state から hidden checkbox + CSS へ移し、解放時の再レンダリングをなくす。

候補 B で `walkUnlocked` は「連番カウントを state に持たず `false → true` 1 回だけ state 化」まで削った。本 PR でその最後の 1 回の state も撤廃する。

## スコープ

- `src/hooks/use-css-boolean-cell.ts`（+ `__tests__/`）: boolean を hidden `<input type="checkbox">` の `checked` へ ref 直書きで橋渡しする汎用 hook
- `proto-01/_hooks/use-walk-unlock.ts`: しきい値到達で `setWalkUnlocked(true)` でなく cell の `set(true)` を呼ぶ
- `proto-01/index.hooks.ts` / `index.types.ts`: `walkUnlocked: boolean` を撤廃、`walkUnlockedRef`（`RefObject<HTMLInputElement>`）を公開
- `proto-01/index.tsx`: hidden checkbox を描画、ボタンの表示切替を className の `walkUnlocked ? ... : ...` から tailwind `peer` / `peer-checked:` へ

### スコープ外

- `walking`（歩く / 止まる ラベルの出し分け）→ 候補 G（PR `131-walking-toggle-css`、F マージ後）
- box-bot 側の変更なし

## 設計

### `useCssBooleanCell`

```ts
/**
 * boolean を hidden checkbox の checked へ橋渡しする CSS state セル
 *
 * - 返す checkboxRef を hidden な <input type="checkbox"> へ付け、CSS 側は
 *   tailwind の peer / peer-checked: で表示を定義する
 * - set / toggle は checkbox.current.checked を直書きするだけ。React state を
 *   持たないため、切替で再レンダリングされない
 * - Observable の subscribe や event ハンドラから set を呼ぶ用途
 */
export const useCssBooleanCell = (): UseCssBooleanCellReturn => {
  const checkboxRef = useRef<HTMLInputElement>(null)

  const set = useCallback((next: boolean) => {
    if (checkboxRef.current) checkboxRef.current.checked = next
  }, [])

  const toggle = useCallback(() => {
    set(!checkboxRef.current?.checked)
  }, [set])

  return { checkboxRef, set, toggle }
}
```

- `toggle` は候補 G（`walking`）で使う。F では `set` のみ利用するが、hook として一緒に提供する（同一 util の対称 API）
- 初期値の props は取らない。初期 checked は JSX 側の `defaultChecked` で表現する

### proto-01 の DOM 構成

```tsx
<div className="relative z-10 flex h-9 items-center">
  <input
    ref={walkUnlockedRef}
    aria-hidden
    className="peer hidden"
    readOnly
    tabIndex={-1}
    type="checkbox"
  />
  <Button
    className={cn(
      'translate-y-3 opacity-0 pointer-events-none transition-all duration-300 ease-out',
      'peer-checked:translate-y-0 peer-checked:opacity-100 peer-checked:pointer-events-auto',
    )}
    onClick={toggleWalking}
    type="button"
    variant="outline"
  >
    {walking ? '止まる' : '歩く'}
  </Button>
</div>
```

- `hidden`（`display:none`）は peer 要素自身に付けるだけ。`:checked` は display と無関係にマッチするため表示切替に影響しない
- 対象（Button）の表示切替は `opacity` / `translate` / `pointer-events` のみ。`display:none` は使わない（300ms トランジション維持、内部に Canvas は無いが方針統一）
- peer 要素は操作対象でない → `aria-hidden` / `tabIndex={-1}` / `readOnly`

## テスト

### `use-css-boolean-cell.test.ts`（`src/hooks/__tests__/`）

- `set(true)` / `set(false)` で `checkboxRef.current.checked` が変わる
- `toggle()` で反転する
- `set` 呼び出しで再レンダリングが起きない（`renderHook` の描画回数が増えない）

### `use-walk-unlock.test.ts`（改修）

- 戻り値の `walkUnlocked` を廃止 → cell の `set` を渡す形へ。しきい値到達で `set(true)` が呼ばれる
- しきい値未満では呼ばれない
- アンマウントで購読解除（既存踏襲）

## 実装計画

- [ ] `src/hooks/use-css-boolean-cell.ts` + 型 + テスト
- [ ] `use-walk-unlock.ts` を cell 接続へ改修 + テスト更新
- [ ] `index.hooks.ts` / `index.types.ts` / `index.tsx` を checkbox + `peer-checked:` へ
- [ ] test / lint / tsc パス確認
- [ ] 親 [../../design.md](../../design.md) の候補 F をチェック

## 決定事項

- 2026-09-09: 橋渡しは `src/hooks/use-css-boolean-cell.ts` の汎用 hook。proto-01 ローカルにしない
- 2026-09-09: 表示切替は `opacity` / `visibility` 維持（`display:none` 不使用）
- 2026-09-09: `walking` は本 PR 対象外（候補 G）

## 懸念・リスク

- tailwind `peer` は「直前の sibling」制約。checkbox を Button より前に置く必要がある（DOM 順で担保）
- 候補 G で peer が 2 個（解放用 + walking 用）になる → 名前付き `peer/xxx` へ切替が要る。F では素の `peer` で置き、G でリネームする（小さな差分）
- `use-walk-unlock.test.ts` の three 多重読み込み警告は候補 B から継続（`ACTION_JUMP` import 由来、実害なし）
