# next-upgrade

## 目的

Next.js 14→15 アップグレード実施(本ブランチ完了分)。加え oxlint 導入検討・Next.js 16 移行検討 記録。

## 背景・制約

- Next.js 最新16系だがReact19必須、影響範囲大。ユーザー方針: 15先行、16は別PR
- 今回更新範囲: Next関連 + 同メジャー帯内安全更新のみ(ユーザー選択)。zod4/zustand5/tailwindcss4/express5/typescript-eslint8等 次メジャーは対象外
- リポジトリはyarn管理。npm installで一度yarn.lock/package-lock.json汚染発生、復旧済み(以後npm outdated調査用途のみ許容、install/lockfile更新はyarn使用)
- Node.jsは22(Jod)が2025-10 Maintenance LTS入り済み、24(Krypton)が2025-10 Active LTS入り済み(EOL 2028-04)。次期LTSとして24採用

## 実装計画

- [x] Next.js 14.2.5→15.5.23 アップグレード(react/react-dom 18.3.1維持)
- [x] cookies()/params/searchParams 非同期API化対応(src/lib/api-client.ts, src/utils/auth.ts, src/app/page.tsx, src/app/app/discussions/page.tsx, src/app/public/discussions/[discussionId]/page.tsx)
- [x] eslint-plugin-react-hooks 4.6.2→5.2.0(eslint-config-next15内部要求版との衝突解消)
- [x] @types/express 追加(mock-server.ts既存型エラー解消、docs/package/testing/配下にdocs追加)
- [x] build/lint/test/check-types 全緑確認
- [x] Node.js 24系(Krypton, Active LTS)へアップグレード(別ブランチ node-24-upgrade、next-15-upgrade派生)。.nvmrc 22→24、@types/node 20→24、nvm install 24でローカル環境にも追加
- [x] oxlint 導入検討(oxc-full-migration ブランチで完了。oxlint 併用導入・ESLint v9(flat config)移行・oxfmt 導入・pre-commit 組込みまで実施、詳細は該当ブランチのコミット履歴・docs/package/lint/oxlint・docs/package/format 参照)
- [x] Storybook バージョンアップ検討(現状8.6.18、最新10.5.9。9系も存在(9.1.20)、8→9→10で2メジャー差、破壊的変更調査要る)

## 決定事項

- eslint-import-resolver-typescriptは3.6.1据置(3.10.1がtypescript-eslint8系要求し既存7.18.0と衝突するため)
- @testing-library/jest-dom は 6.9.1 に固定(`^`指定だと6.10.0が入り、Node22+/@testing-library/dom peer必須のbreaking変更を踏む)
- oxlint は `import/no-restricted-paths`・`check-file`・`perfectionist`・`tailwindcss` 等のカスタムルールに未対応のため、ESLint 併用に決定(全面置換せず)
- `next lint` 廃止に伴いESLint CLI直接実行(`eslint .`)へ切替、それに伴い ESLint 本体を v9(flat config)へアップグレード。`next/core-web-vitals` との プラグイン名前空間重複を解消するには v9 の `defineConfig`/`globalIgnores` が必須だったため
- oxfmt は Prettier からコード側フォーマットを置換(469/470ファイルで出力一致)。Markdown はコードフェンス構文破壊バグのため対象外、Prettier を継続使用

## 懸念・リスク

- `npm audit` で46件脆弱性検出(storybook系間接依存中心と推測)。未調査
- ESLint v8→v9移行で実行時間が28.7秒→96.4秒に悪化(flat config化・重複解消によるオーバーヘッド、原因未特定)
