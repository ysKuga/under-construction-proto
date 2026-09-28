# 用語情報の集約

ゲーム内・システム内で使用する用語の情報を1箇所へ集約する実装案。\
本ファイル上位 [README.md](../README.md) の「ユーザビリティ・用語説明」の発展形。

## 集約する情報

- 名称(例: エネルギー)
- 英語名称(例: energy)
- 略称(例: EN)
- `className`(例: `ui-term-energy`)
- 画像(アイコン等)

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
- 用語に関連する実装(説明表示用のコンポーネント等)も同ディレクトリへ置くか

## 想定する用途

- hover 時の用語説明表示
  - 現状は `title` 属性による暫定表示
- 画面上で確認可能な用語のリスト表示
- UI 表示で省スペースが必要な箇所での略称の参照

## 現状との関係

find-path では用語の情報が各所へ分散している。

- `className`: 各 prototype の `_lib/item-presentation.ts`・`obstacle-layer` に直書き
- 表示名: `item-presentation.ts` の `title` 等

集約後は上記を用語ディレクトリからの参照へ置き換える想定。

## 詰め切れていない点

- 配置先(`src/` 配下のどこに置くか、prototype 横断で共有するか)
- `docs/terminology/` との関係(用語の説明文の正をどちらに置くか)
