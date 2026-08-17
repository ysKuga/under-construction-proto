# docs/concept

ゲームデザイン・構成など検討中のアイディアを集約する場所。`docs/terminology/` は確定した用語を扱うが、こちらは検討段階のものを扱う。内容が固まった項目は `docs/terminology/` 側へ随時移す。

移行元: [ysKuga/under-construction](https://github.com/ysKuga/under-construction) issues

- [structure/](structure/README.md) — 構成について (issue #1)
- 概念について (issue #2、本ファイル下記)
- [flow/](flow/README.md) — 関心について (issue #3)
- [ideas/](ideas/README.md) — あいであなど (issue #4)
- [event-driven-ui/](event-driven-ui/README.md) — UI とロジックの分離について
- [component-input-layers/](component-input-layers/README.md) — component の入力 (props/store/computed) 分離について

## 概念について

### 位置

ゲームはデータを投影した結果として表現される、という考え方。極端に言えばテキストのみでもゲームは実現できる。

- React の状態管理はゲームの実現にはあまり向かないと考える
  - 状態の変更が再レンダリングを引き起こす。多数 actor の同時更新など、パフォーマンスへの影響が懸念される
- 位置表示は ref を通じて DOM を直接更新する方式を採用 (`time-control-03`)
  - store (zustand) 自体は保持しつつ、購読・反映方法のみ imperative に変更
  - tick 間の移動補間は CSS transition で行う

### 時間

構成要素として各 interface などを定義するか検討。

- ポインター (現在)
- ヒストリー (履歴)
  - タイムマシン処理で使用など
- 操作
  - ヒストリーに関する処理 (ブラウザのような push, back, replace など)

### 疎通

### 関係

### 姿勢

### 認識
