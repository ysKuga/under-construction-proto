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

## テスト実行

一時検証テスト(`__verify__.test.tsx` 等)実行時、`NEXT_PUBLIC_API_URL=http://localhost:3000` 付与のみで標準 `vitest.config.ts` 使用可。setupFiles 外した一時 config 作成不要。

- 理由: `src/testing/setup-tests.ts` が MSW server 起動、ハンドラが `src/config/env.ts` の `createEnv()` 呼出。\
  zod スキーマ `NEXT_PUBLIC_API_URL` 必須(`API_URL` ではない点 注意)。
- `__mocks__/zustand.ts` は `create`/`createStore` のみモック対象、`useStore` 未対応。\
  zustand vanilla store + `useStore` パターンのテストは `vi.unmock('zustand')` 要。
