# stage-area から stage-group・bot-status-panel を切り出す

PR: #381（親: #357）

## 目的

expedition の `stage-area` に混在していたレイアウトを分ける。\
見た目は変えない。

## 背景・制約

- 親 backlog の項目「content と component の置き場を分ける」の 2
  - [../../backlog.md](../../backlog.md)
- 基準: 組み合わせのレイアウトは 1 階層のみ
  - (../../decision-records.md 2026-10-18 content と component)
- 現状: `stage-area` が以下を 1 つに持つ
  - 自身の縦並び
  - 1 段目の横並び（`Stage`・bot の状態表示）
  - bot の状態表示の枠・縦並び・重ね方

## 構成

```
stage-area/                        縦並び
  _contents/
    stage-group/                   横並び（新規）
      _contents/
        stage/
        bot-status-panel/          枠付きの縦並び ＞ bot への重ね（新規）
          _components/
            standalone-bot/
            facing-sync-toggle/
            shortcuts/
            facing-indicator/
    cell-info-panel/
    move-history-panel/
```

- `stage-area`: `StageGroup`・`CellInfoPanel`・`MoveHistoryPanel` の縦並び。`w-min` を残す
- `stage-group`: `Stage`・`BotStatusPanel` の横並び
- `bot-status-panel`: 枠・縦並び・`absolute` の重ね・`z-10`
  - 子同士が関係する（重ねる）ため実装
- 周辺要素の位置は変わらない

## 懸念・リスク

- なし
