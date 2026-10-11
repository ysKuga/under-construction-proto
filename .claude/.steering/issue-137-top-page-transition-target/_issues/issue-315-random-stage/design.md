# find-path ステージのランダム生成

issue: #315（親: #137）

## 目的

find-path（proto-03）のステージの全要素をランダム配置し、簡単なパズルとして遊べるようにする。

## 背景・制約

- 親 backlog の項目「find-path のステージをランダム生成する」から切り出した
  - [../../backlog.md](../../backlog.md)
  - (../../decision-records.md 2026-10-11)
- 資源配置とゲーム性の論点: [docs/concept/ideas](../../../../../docs/concept/ideas/README.md)「資源(補給アイテム等)の配置とゲーム性」
- 現状の配置
  - proto-03 の `constants.ts` に固定値で定義されている
  - 約 12 ファイルが定数を直接 import している（layer 群・`_lib/obstacle.ts`・`_lib/one-way.ts`・`fog/context`・`index.providers.tsx` 等）
- 現状のリセット: 位置・EN のみ戻し、盤面は保持する（親 decision-records.md 2026-09-28 案A）
- 本実装（page）へ移行する際は `_prototypes`・`src/prototypes` を参照せず、要素をすべて page 側へ移動する

## 仕様

- 対象: ゴール・障害物・一方通行・アイテム・スポット・開始位置
- EN 切れ時のチェックポイントへのリセット
  - 回数制限なし
  - 盤面ごと初期状態へ戻す
- 履歴
  - 使用した手数を確認できるようにする
  - 手数はリセットをまたいで通算
  - リセット自体も履歴へ追加（検討）
  - 全件保持（上限 10000 件程度）

## 基本構成案

- 配置を `StageLayout` 型（goal / obstacles / oneWays / items / spots / start）にまとめ、Context で配る
- 生成は seed 付きの純関数 `generateStage(seed, params) => StageLayout`
  - 乱数は mulberry32 程度
  - seed で配置を再現できる（デバッグ・テスト・リセット）
- 生成方式はまず「生成 → 検証 → だめなら再生成」
  - 難易度の制御が必要になったら「正解経路を先に敷き、経路外に障害物を置く」方式へ移る
- 再生成・盤面リセットは Provider を `key` 変更で再マウントする（store 群の個別リセット漏れを避ける）
  - 履歴は通算のため、再マウント対象の外に置く

## 懸念・リスク

- 到達性の検証は一方通行（進入方向）と EN（アイテム・スポット込み）を考慮する必要がある
  - EN 込みは `(cell, 残 EN, 取得済みアイテム)` の状態空間探索になる
- 候補セルは `isHexCellInGrid` で絞る（offset → axial 変換で範囲外セルが出る）
