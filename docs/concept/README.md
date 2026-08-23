# docs/concept

ゲームデザイン・構成など検討中のアイディアを集約する場所。`docs/terminology/` は確定した用語を扱うが、こちらは検討段階のものを扱う。内容が固まった項目は `docs/terminology/` 側へ随時移す。

移行元: [ysKuga/under-construction](https://github.com/ysKuga/under-construction) issues

- [structure/](structure/README.md) — 構成について (issue #1)
- 概念について (issue #2、本ファイル下記)
- [flow/](flow/README.md) — 関心について (issue #3)
- [ideas/](ideas/README.md) — あいであなど (issue #4)
- [implementation/](implementation/README.md) — 実装方針について
  - [event-driven-ui/](implementation/event-driven-ui/README.md) — UI とロジックの分離について
  - [component-input-layers/](implementation/component-input-layers/README.md) — component の入力 (props/store/computed) 分離について

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

キャラクターの体勢を 0(直立) 〜 1(完全に倒れている) の連続値として持つ考え方。

- 離散的な state(standing/fallen 等の enum)でなく数値にすることで、よろけなど中間状態も同じ軸で表現できる
- 転倒(こける)・起き上がりは別 action とし、この数値を変化させる。一連の自動モーションにはしない
  - 転倒は直立時のみ発火可能、完了後は倒れた状態(1)で静止する
  - 起き上がりは倒れた状態のときのみ発火可能、完了後は直立(0)に戻る
- 他 action(歩く等)は直立(0)でない間 実行不可にする。姿勢の数値を参照するだけでこの制御を表現できる
- box-bot(`src/components/samples/figure/box-bot`)での実装例: `jump`/`arm` の toggle/trigger action パターンを踏襲し `postureRef`/`fall`/`getUp` として実装(`.claude/.steering/20260821-box-bot-event-driven-actions/design.md` 参照)

### 認識
