# if 文の意図記述

関数内の if 文(早期 return 含む)、条件と処理の意図を読み手に明示する。

## 対象

- 早期 return が複数並ぶ関数
- 複合条件(`&&`/`||` 連結)
- 否定条件(`!(await ...)` 等)

`if (!node) return` 等、条件自体で意図自明な null ガードは対象外。

## 書き方

- 条件、名前付き定数へ切り出す。JSDoc で意味を付与(否定を含む条件は肯定形で命名し、if 側で否定)
- if 直前、ラインコメントで `// 条件: 処理` を記述

```ts
/** 経路提示中の目標セルを再クリックしたか */
const isObjectiveReclick =
  flowState === 'proposing' &&
  objectiveCell?.q === cell.q &&
  objectiveCell.r === cell.r

// 目標セルの再クリック: 目標設定をキャンセルする
if (isObjectiveReclick) {
  waypointFlowStoreApi.getState().clear()

  return
}

/** listener が経路の提示を許可したか（EN 切れ等で拒否される） */
const proposeAllowed = await findPathEventDispatcher['FindPath-propose-path']({ cell })

// 提示を拒否された: 何もしない
if (!proposeAllowed) {
  return
}
```

## ts-pattern との使い分け

- 1つの値を場合分け → ts-pattern ([docs/package/control-flow/ts-pattern](../../docs/package/control-flow/ts-pattern/README.md))
- 別々の値を順に調べ途中で抜けるガードの並び → 本ルールの if 文
