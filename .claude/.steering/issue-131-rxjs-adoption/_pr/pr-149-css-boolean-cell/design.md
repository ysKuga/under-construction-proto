# 歩くボタン解放の表示制御を hidden checkbox + CSS 化（候補 F）

issue: #131 / PR: #149 / branch: `131-css-boolean-cell`
親 steering: [../../design.md](../../design.md)（候補 F）
先行: 候補 B（PR #146、[../pr-146-rxjs-proto01-jump-count/design.md](../pr-146-rxjs-proto01-jump-count/design.md)）

## 目的

issue #131 後続課題 F。proto-01 の「歩く」ボタン解放（`walkUnlocked`）の表示制御を React state から hidden checkbox + CSS へ移し、解放時の再レンダリングをなくす。

候補 B で `walkUnlocked` は「連番カウントを state に持たず `false → true` 1 回だけ state 化」まで削った。本 PR でその最後の 1 回の state も撤廃する。

表示切替の CSS は当初 tailwind `peer` / `peer-checked:` で組んだが、セレクター駆動のスタイルを型付きで一元管理するため vanilla-extract（ゼロランタイム CSS-in-JS）へ移行した（後述「決定事項」）。

## スコープ

- vanilla-extract 配線: `@vanilla-extract/css` + `next-plugin` + `vite-plugin` 導入。`next.config.mjs` / `.storybook/main.ts` / `vitest.config.ts` へプラグイン追加。`docs/package/styling/` 追記
- `src/hooks/use-css-toggle.tsx`（+ `.css.ts` + `__tests__/`）: boolean を hidden `<input type="checkbox">` の `checked` へ ref 直書きで橋渡しする汎用 hook。checkbox 要素と表示切替クラス（`.css.ts`）を hook が返す
- `proto-01/_hooks/use-walk-unlock.ts`: しきい値到達で `setWalkUnlocked(true)` でなく toggle の `set(true)` を呼ぶ
- `proto-01/index.hooks.ts` / `index.types.ts`: `walkUnlocked: boolean` を撤廃、`walkUnlockedCheckbox`（`ReactElement`）と `walkButtonClassName`（`string`）を公開
- `proto-01/index.tsx`: hook が返す checkbox を描画、ボタンの表示切替を className の `walkUnlocked ? ... : ...` から vanilla-extract の兄弟セレクターへ

### スコープ外

- `walking`（歩く / 止まる ラベルの出し分け）→ 候補 G（PR `131-walking-toggle-css`、F マージ後）
- box-bot 側の変更なし
- proto-01 以外のコンポーネントの vanilla-extract 移行（配線のみ済ませ、移行は必要になった箇所から）

## 設計

### `useCssToggle`

`src/hooks/use-css-toggle.tsx`（実装）と `src/hooks/use-css-toggle.css.ts`（スタイル）の 2 ファイル。

```ts
// use-css-toggle.css.ts
export const checkbox = style({ display: 'none' })

export const toggled = style({
  opacity: 0,
  pointerEvents: 'none',
  transform: 'translateY(0.75rem)',
  selectors: {
    [`${checkbox}:checked ~ &`]: {
      opacity: 1,
      pointerEvents: 'auto',
      transform: 'translateY(0)',
    },
  },
})
```

```ts
// use-css-toggle.tsx（要点）
export const useCssToggle = (defaultChecked = false): UseCssToggleReturn => {
  const checkboxRef = useRef<HTMLInputElement>(null)

  const set = useCallback((next: boolean) => {
    if (checkboxRef.current) checkboxRef.current.checked = next
  }, [])
  const toggle = useCallback(() => set(!checkboxRef.current?.checked), [set])

  const checkbox = (
    <input
      aria-hidden
      className={styles.checkbox}
      defaultChecked={defaultChecked}
      readOnly
      ref={checkboxRef}
      tabIndex={-1}
      type="checkbox"
    />
  )

  return { checkbox, set, toggle, toggledClassName: styles.toggled }
}
```

- `set` / `toggle` は `checkbox.current.checked` を直書きするだけ。React state を持たないため切替で再レンダリングされない
- checkbox 要素の生成を hook 内へ寄せ、消費側は `{checkbox}` を配置するだけ。`peer` マーカークラス・id・CSS 変数は不要
- `toggled` は off↔on の状態差分（opacity / pointer-events / transform）を持つ。遷移の時間・イージングは持たず、消費側で `transition` を足す
- `toggle` は候補 G（`walking`）で使う。F では `set` のみ利用するが、hook として一緒に提供する
- 初期 checked は引数 `defaultChecked`（`<input>` の `defaultChecked` へ渡す）

### proto-01 の DOM 構成

```tsx
<div className="relative z-10 flex h-9 items-center">
  {walkUnlockedCheckbox}
  <Button
    className={cn(walkButtonClassName, 'transition-all duration-300 ease-out')}
    onClick={toggleWalking}
    type="button"
    variant="outline"
  >
    {walking ? '止まる' : '歩く'}
  </Button>
</div>
```

- checkbox は表示切替対象（Button）の直前へ置く（`checkbox:checked ~ &` = 直後以降の兄弟）
- 対象の表示切替は `opacity` / `transform` / `pointer-events` のみ。`display:none` は使わない（300ms トランジション維持）
- checkbox は操作対象でない → `aria-hidden` / `tabIndex={-1}` / `readOnly`。非表示は `.css.ts` 側 `display:none`

## テスト

### `use-css-toggle.test.tsx`（`src/hooks/__tests__/`）

- `renderHook` で hook を描画、`render(result.current.checkbox)` で checkbox を実 DOM へマウント
- `set(true)` / `set(false)` で `input.checked` が変わる
- `toggle()` で反転する
- `set` / `toggle` で再レンダリングが起きない（`renderHook` 描画回数が増えない）
- `defaultChecked` で初期 checked を指定できる

### `use-walk-unlock.test.ts`（改修）

- 戻り値の `walkUnlocked` を廃止 → toggle の `set` を渡す形へ。しきい値到達で `set(true)` が呼ばれる
- しきい値未満では呼ばれない
- アンマウントで購読解除（既存踏襲）

## 実装計画

- [x] vanilla-extract 導入 + `next.config.mjs` / `.storybook/main.ts` / `vitest.config.ts` 配線
- [x] `src/hooks/use-css-toggle.tsx` + `.css.ts` + 型 + テスト
- [x] `use-walk-unlock.ts` を toggle 接続へ改修 + テスト更新
- [x] `index.hooks.ts` / `index.types.ts` / `index.tsx` を checkbox + 兄弟セレクターへ
- [x] `docs/package/styling/@vanilla-extract/**` 追記
- [x] test / lint / tsc / `yarn build`（Turbopack）/ `yarn build-storybook` パス確認
- [ ] 親 [../../design.md](../../design.md) の候補 F をチェック（マージ時）

## 決定事項

- 2026-09-09: 橋渡しは `src/hooks/use-css-toggle` の汎用 hook。proto-01 ローカルにしない
- 2026-09-09: 表示切替は `opacity` / `transform` 維持（`display:none` 不使用）
- 2026-09-09: `walking` は本 PR 対象外（候補 G）
- 2026-09-10: 表示切替 CSS を tailwind `peer` から vanilla-extract へ移行。理由: セレクター駆動のスタイル（`:checked ~ &`）を型付き・スコープ済みで一元管理する。StyleX は兄弟/子孫コンビネータ非対応のため除外
- 2026-09-10: checkbox 要素の生成を hook 内へ移動。消費側は配置のみ。`peer` / id / CSS 変数の受け渡しを廃止

## 懸念・リスク

- `@vanilla-extract/next-plugin` の Turbopack 連携は experimental（API unstable）。2026-09-10 時点で `yarn build` / `yarn build-storybook` / `yarn test` は通過。壊れた場合は `unstable_turbopack: { mode: 'off' }` で webpack ビルドへ退避
- checkbox は「直後以降の兄弟」制約。Button より前に置く必要がある（DOM 順で担保）
- 候補 G で状態が 2 個（解放用 + walking 用）になる → `.css.ts` 側でセレクターを分ける。素の `peer` 名前衝突の問題は vanilla-extract 移行で解消済み
- `use-walk-unlock.test.ts` の three 多重読み込み警告は候補 B から継続（`ACTION_JUMP` import 由来、実害なし）
