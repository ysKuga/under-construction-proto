# docs/terminology/theater/actor/aside/

actor の意識・思考等の内面を、観客 (プレイヤー) へ向けて表す要素を aside (傍白) とする。

- 由来: 役者が観客にだけ向けて心の内を明かす台詞。他の登場人物には聞こえない前提で語られる
- 例: 吹き出し (bubble)
- 対象外: hover・クリック等で操作するインタラクティブな要素
  - SP では hover 時の表現が難しいため
- 実装の置き場: `src/components/theater/aside/`
  - `src/components/theater/figure/` と同様、actor 階層を挟まない

## 区分名の選定

以下は既存の名前と衝突・混同するため採用しない。

- `state`: React の state・`_stores` と混同する
- `action`: box-bot の `_actions` と衝突する
- `behavior`: 範囲が広く、置くものが定まらない
- `monologue` (独白): 長い語りを連想させ、短い吹き出しに合わない
- `cue` (きっかけ): 舞台から役者への合図で、向きが逆
