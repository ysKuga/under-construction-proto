# 用語情報の集約

ゲーム内・システム内で使用する用語の情報を1箇所へ集約する実装案。\
本ファイル上位 [README.md](../README.md) の「ユーザビリティ・用語説明」の発展形。

## 集約する情報

- 名称(例: エネルギー)
- 英語名称(例: energy)
- 略称(例: EN)
- `className`(例: `ui-term-energy`)
- 画像(アイコン等)
- 説明(prototype 固有の挙動を含まない汎用的な説明)
- 表示 component(hover で説明を表示する)

## ディレクトリ構成

英語名称(kebab-case)で用語ごとにディレクトリを作成し、関連する実装をその配下へ置く。

```
terms/
  energy/
  energy-recovery-item/
  energy-recovery-spot/
  obstacle/
```

- 用語の定義(上記の集約する情報)と画像を同じディレクトリへ配置する
- `className` は英語名称から導出できる(`ui-term-` + 英語名称)
- 用語の表示 component も同ディレクトリの `index.tsx` へ置く

## 想定する用途

- hover 時の用語説明表示
  - 現状は `title` 属性による暫定表示
- 画面上で確認可能な用語のリスト表示
- UI 表示で省スペースが必要な箇所での略称の参照

## 現状との関係

`src/features/term-registry/` へ実装済み(issue #284)。

- 用語: `energy`・`energy-recovery-item`・`energy-recovery-spot`・`obstacle`
- 画像は当面、絵文字(`emoji`)で代用している
- 表示 component は `title` 属性による暫定の hover 説明表示
- 用語一覧は Storybook の `features/term-registry` で確認できる
- find-path の各 prototype で直書きしていた情報を用語の参照へ置き換えた
  - `className`(`item-presentation.ts`・`obstacle-layer`)
  - 名称・絵文字(`item-presentation.ts`・`describe-cell-content.ts`)
  - 略称 `EN`(`energy-debug-panel`・proto-01 の `action-bar`)

## 詰め切れていない点

- `docs/terminology/` との関係(用語の説明文の正をどちらに置くか)
  - 汎用的な説明は用語の `description` に持たせた
  - prototype 固有の挙動を含む hover 説明文は `item-presentation.ts` に残している
