# direction-arrow

歩く用ボタンのみ表示、bot 進行方向へ三角矢印を表示・回転時追随。未着手(保留)。

## 保留理由

- 現状「歩く」(`walkingToggle`)、脚 swing + bodyBobbing のその場足踏みのみ。位置移動・向き変更を伴わない
- bot の向き変更、`autoRotate`(`rotateSpeed` 指定時のみ `spinRef.rotation.y` を継続加算)のみ存在。ユーザー操作でトリガーする向き転換 action(spin 相当)は samples 版 box-bot(`components/samples/figure/box-bot`、`ui/`・`ui-three/` の各 story で使用中のもの)に無い(`theater/figure/box-bot` 版には spin action あり、別実装)
- 「回転」の意味(仕様)が未確定。`autoRotate` の角度を矢印に反映する話か、将来実装するユーザー操作としての方向転換を指すか、要判断

## 実現アプローチ案(未検証、着手時の起点用メモ)

- `action-ring` で実証済みの `Html`(`@react-three/drei`)を使い、矢印自体を box-bot の `children` として Canvas 内に配置、`spinRef` 相当の向きに追随させる案。box-bot 本体の改修が不要な可能性がある
- 別案: box-bot 本体(`box-bot-3d`)へ向き(facing)を Canvas 外へ伝える新規 prop を追加し、Canvas 外 DOM の矢印を `useFrame` で直接更新する(`theater/figure/box-bot` の jump が `displayAreaRef.top` を書き換える前例の応用)。box-bot 本体の改修を伴う
