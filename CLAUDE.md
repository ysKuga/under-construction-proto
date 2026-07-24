# CLAUDE.md

## 文体

本ファイル・分割後の各ファイル、原始人口調で記述。敬語・クッション・前置き 不要。体言止め・助詞省略可。

## アイディア参照

「アイディア」「あいでぃあ」関連 質問・追記依頼時、`docs/concept/ideas/README.md` 参照。

- 雑多アイディア集 (issue #4)
- 内容固まった項目 → `docs/terminology/` へ切り出し
- 追記時 既存文体(通常日本語)に合わせる

## docs/concept 構成

- [structure/](docs/concept/structure/README.md) — 構成 (issue #1)
- [README.md](docs/concept/README.md) — 概念 (issue #2)
- [flow/](docs/concept/flow/README.md) — 関心 (issue #3)
- [ideas/](docs/concept/ideas/README.md) — あいであ (issue #4)

## コーディング規約

### hooks 変数命名

`useXxx()` 呼出結果 受ける変数、`use` 除いた部分そのまま変数名にする。

```ts
const actorPosition = useActorPosition()
```

複数プロパティ 分割代入で受ける場合(`const { dispatchMoveIntent, gridSize } = useActorControl()` 等)は対象外、各プロパティ名そのまま使用。

### JSDoc 構成

ホバー表示は Markdown 解釈される。タイトル(簡潔な要約) → 1行空け → 詳細(箇条書き) の構成にする。

```ts
/**
 * タイトル
 *
 * - 詳細1
 * - 詳細2
 */
```

- 単一行で完結する短い説明(プロパティの一言コメント等)はタイトルのみで可、詳細不要・空行不要。
- 詳細内の1文が複数行にまたがり、かつ改行を維持したい場合(別の詳細と混ざらないようにしたい場合)、行末に `\` 必須。\
  単に見た目の折返しで1文を分割しているだけなら不要(表示時に自動で連結される)。

### プロパティ JSDoc

type/関数戻り値オブジェクトの各プロパティ、`/** ... */` で個別コメント付与。型全体のコメントとは別に、フィールド単位で意味を明示する。

```ts
type Stage04Props = {
  /** 列数 */
  cols: number
  /** 行数 */
  rows: number
}
```

### 関数引数 JSDoc

公開関数(export 対象)の引数、`@param` で個別コメント付与。内部 helper・自明な引数(useReducer の reducer 等 契約上決まる形)は対象外。`@param` 群は JSDoc 構成でいう「詳細」に相当、タイトルとの間を1行空ける。

```ts
/**
 * 状態遷移を1ステップ進める
 *
 * @param state 現在の状態
 * @param event 受信した生イベント
 */
export const reducePointerState = (
  state: PointerState,
  event: PointerRawEventType,
): PointerTransition => /* ... */
```

## テスト実行

一時検証テスト(`__verify__.test.tsx` 等)実行時、`NEXT_PUBLIC_API_URL=http://localhost:3000` 付与のみで標準 `vitest.config.ts` 使用可。setupFiles 外した一時 config 作成不要。

- 理由: `src/testing/setup-tests.ts` が MSW server 起動、ハンドラが `src/config/env.ts` の `createEnv()` 呼出。\
  zod スキーマ `NEXT_PUBLIC_API_URL` 必須(`API_URL` ではない点 注意)。
- `__mocks__/zustand.ts` は `create`/`createStore` のみモック対象、`useStore` 未対応。\
  zustand vanilla store + `useStore` パターンのテストは `vi.unmock('zustand')` 要。

## 実ブラウザ動作確認

Storybook + Playwright ヘッドレス Chromium 検証、コンテナに依存ライブラリ (`libnss3` 等) 未導入の場合あり。

- 事前に `npx playwright install-deps` 実行要 (Claude からは実行不可、ユーザー側で実行)。\
  `sudo npx ...` は不可 (npx が現在ユーザ環境に導入されており sudo の PATH に無い)。npx 自体は非 sudo で起動、内部で apt 導入が必要な箇所のみ権限昇格される。
- 導入済なら Playwright script で `chromium.launch()` 直接可、`chromium-cli` 不在時の代替手段。
