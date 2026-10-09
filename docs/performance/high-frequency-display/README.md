# 高頻度に変化する値の表示

hover・pointer 位置・ゲーム内の状態など、短い間隔で何度も変化する値を画面へ表示する場合の実装方針。\
枠組み: [../README.md](../README.md) の「`useState` を使うかの判断」。

値をそのまま `useState` へ置くと、変化のたびに表示 component が再レンダリングされる。\
表示の性質によって、次の2通りに切り分ける。

| 分類 | 判断基準 | 実装 |
|---|---|---|
| 単純な表示 | 値が変わっても JSX の構造が変わらない | ref で DOM を直接書き換える（再レンダリングなし） |
| ゲーム内情報の表示 | 値によって JSX の構造が変わる | state で持ち、更新頻度を抑える |

## 単純な表示: ref で DOM を直接書き換える

### 対象

- テキスト・属性・style の書換だけで表示が済む（要素の数・出し分けが変わらない）
- 表示する値を他 component が参照しない
  - 参照される場合は store・event で配布する（[../README.md](../README.md) 基準）

### 書き方

- event の購読処理（`useXxxEventListener` 等）の中で `ref.current.textContent` 等を書き換える
- 書き換える要素は、React が子要素を描画しない空要素にする
  - React が描画したテキストを外から書き換えると、React が保持するテキストノードと実 DOM がずれる
- 初期表示は ref callback でマウント時に1度だけ書き込む
- レンダー中に `ref.current` を読まない（[.claude/rules/react/r3f-state.md](../../../.claude/rules/react/r3f-state.md) と同じ `react-hooks/refs` の制約）

```tsx
/** hover 中セルの表示文言 */
const formatHoveredCell = (cell: HexCell | undefined) =>
  cell ? `q=${cell.q}, r=${cell.r}` : 'なし'

const HoveredCellLabel = () => {
  /** 表示先の要素 */
  const labelRef = useRef<HTMLParagraphElement>(null)

  useStage07EventListener(
    'Stage07-cell-hover',
    useCallback((event) => {
      if (!labelRef.current) return

      labelRef.current.textContent = formatHoveredCell(event.detail.cell)
    }, []),
  )

  /** 表示先の要素を保持し、初期表示(hover なし)をマウント時に1度だけ書き込む */
  const attachLabel = useCallback((el: HTMLParagraphElement | null) => {
    labelRef.current = el
    if (el) el.textContent = formatHoveredCell(undefined)
  }, [])

  return <p aria-label="hover 中のセル" ref={attachLabel} />
}
```

### 事例

- stage-07 `CellHover` story の `HoveredCellLabel`（[index.stories.tsx](../../../src/prototypes/stage/stage-07/index.stories.tsx)、PR #308）
  - `useState` で持っていた時は hover のたびにラベルが再レンダリングされていた
  - ref による書換へ切り替え、hover しても再レンダリングされなくなった

## ゲーム内情報の表示: state で持ち、更新頻度を抑える

### 対象

- 値によって JSX の構造が変わる
  - 一覧の要素数が変わる
  - 種類によって表示する component が変わる
- store 等からゲーム内の情報を参照して組み立てる表示

例: マスをホバーした時の内包要素一覧（find-path proto-03 のセル情報パネル）。

### 前提

- state は表示 component 自身に閉じる（event・store を直接購読する）
  - 親で持つと、無関係な子 component まで再レンダリングされる
- 値が同じなら `setState` しない（同じセルに留まっている間など）

### 頻度を抑える手段

| 手段 | 効果 | 向く場面 |
|---|---|---|
| スロットル | 一定間隔に1回だけ反映する | 変化し続けている間も表示を追従させたい（pointer を動かしている間もパネルを更新） |
| デバウンス | 変化が止まってから反映する | 落ち着いてから表示すればよい（hover が止まってから詳細を出す） |
| `useTransition` / `useDeferredValue` | 再レンダリングの優先度を下げる | 描画が重く、他の操作の応答を優先したい |

- `useTransition` / `useDeferredValue` は再レンダリングの回数を減らさない
  - 優先度を下げるだけ。回数を減らしたい場合はスロットル・デバウンスと組み合わせる
- 間隔（ms）は表示の体感で決める
  - 長すぎると操作への追従が遅れて見える

### 未検証

- スロットル・デバウンスは本プロジェクトでの実装例なし
  - proto-03 のセル情報パネル（issue #137）で検証する
  - 実装用のライブラリは未導入。導入する場合は [docs/package/](../../package/README.md) へ追記する
- `useTransition` の比較検証: list-rendering list-02（[src/prototypes/list-rendering/list-02/](../../../src/prototypes/list-rendering/list-02/index.tsx)）
