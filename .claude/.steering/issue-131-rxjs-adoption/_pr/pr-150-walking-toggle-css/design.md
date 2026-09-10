# 「歩く / 止まる」切替の再レンダリング回避（候補 G）

issue: #131 / PR: #150 / branch: `131-walking-toggle-css`
親 steering: [../../design.md](../../design.md)（候補 G）
先行: 候補 F（PR #149、[../pr-149-css-boolean-cell/design.md](../pr-149-css-boolean-cell/design.md)）。**F へ積む。F マージ後に base を main へ付け替え**

## 目的

issue #131 後続課題 G。proto-01 の `toggleWalking` は `walkingToggle()`（event 発行）+ `setWalking((v) => !v)` で、切替のたび `walking` state が変わり Proto01 が再レンダリングされる。`walking` state はボタンラベル `歩く` ↔ `止まる` の出し分けにしか使っていない。この state を撤廃する。

## スコープ

- `proto-01/index.hooks.ts`: `walking` の `useState` を撤廃。`toggleWalking` は `walkingToggle()` dispatch + wrapper の `data-walking` 属性を ref で付け外し
- `proto-01/index.types.ts`: `walking: boolean` → `walkingRef`（wrapper 要素の ref）
- `proto-01/index.tsx`: wrapper に `group` + `ref`、ラベルを `歩く` / `止まる` の 2 span にして `group-data-[walking]:` で切替

### スコープ外

- box-bot 側の `ACTION_WALKING_START` / `STOP` 冪等化（姿勢ガードずれの厳密化）→ 影響調査後・別 PR

## 設計

### なぜ checkbox（`useCssBooleanCell`）でなく `data-walking` 属性か

候補 F は「Observable が押し込む値」を hidden checkbox の `checked` へ流す形。表示対象（歩くボタン）は checkbox の**兄弟**なので `peer` / `peer-checked:` が効く。

G のラベル span は `<Button>`（実 `<button>`）の**子**。checkbox を `<button>` の中に置くのは不正な HTML（interactive content のネスト）、`<button>` の前に置くと span が checkbox の兄弟にならず `peer-checked:` が届かない。`<label>` で包む案はボタンのキーボード操作・role を落とす。

→ wrapper（`<div>`）へ `data-walking` 属性を立て、`group-data-[walking]:` で子孫の span を切替える。属性の付け外しは wrapper の ref へ `toggleAttribute('data-walking')` を直書き（`usePerspectiveControl` が CSS 変数を直書きするのと同じ発想）。React state を持たないので切替で再レンダリングしない。

`useCssBooleanCell` は F 側（walk-unlock）専用のまま。

### `index.tsx`

```tsx
<div ref={walkingRef} className="group relative z-10 flex h-9 items-center">
  <input ref={walkUnlockedRef} aria-hidden className="peer hidden" readOnly tabIndex={-1} type="checkbox" />
  <Button
    className={cn(
      'pointer-events-none translate-y-3 opacity-0 transition-all duration-300 ease-out',
      'peer-checked:pointer-events-auto peer-checked:translate-y-0 peer-checked:opacity-100',
    )}
    onClick={toggleWalking}
    type="button"
    variant="outline"
  >
    <span className="group-data-[walking]:hidden">歩く</span>
    <span className="hidden group-data-[walking]:inline">止まる</span>
  </Button>
</div>
```

### `index.hooks.ts`

```ts
const walkingRef = useRef<HTMLDivElement>(null)

const toggleWalking = () => {
  void walkingToggle()
  walkingRef.current?.toggleAttribute('data-walking')
}
```

## テスト

- 挙動確認は Storybook（`peer-checked:` / `group-data-[walking]:` の CSS トグルのみ、ユニットテスト対象なし）
- `index.hooks.ts` は既存テストなし。`toggleWalking` の dispatch 経路は変えないため追加しない

## 実装計画

- [x] `index.hooks.ts`: `walking` state 撤廃、`walkingRef` + `toggleAttribute`
- [x] `index.types.ts`: `walking` → `walkingRef`
- [x] `index.tsx`: `group` + `data-walking` + ラベル 2 span
- [x] lint / tsc パス確認
- [x] F マージ後、base を main へ付け替え
- [x] 親 [../../design.md](../../design.md) の候補 G をチェック（マージ時）

## 決定事項

- 2026-09-09: G は F と別 PR、F へ積んで順次対応（ユーザー指示）
- 2026-09-09: walking は `useCssBooleanCell`（checkbox）でなく wrapper の `data-walking` 属性 + `group-data-[walking]:` で切替。ラベル span が checkbox の兄弟にできず、`<button>` のアクセシビリティを保つため

## 懸念・リスク

- 姿勢ガード（倒れている間の toggle 無視）で `data-walking` と box-bot 側 `walkingRef` がずれうる（現状の `walking` state でも同様）。厳密化は別 PR
- `data-walking` の初期状態は「未設定」= 止まっていない。`walkingToggle()` の初回 dispatch と属性追加のタイミングは揃う（同じハンドラ内）
