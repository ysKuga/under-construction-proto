# action-reaction-design

## 目的

action / reaction を定義し、event listener によりアクションを実行する仕組みを検討する。

まだ実装しない。方針・候補の洗い出しと決定事項の記録が目的。

## 背景・制約

- `docs/concept/ideas/action-phase.md` に 企図(Intent)→予備→実行→成否→事後(Resolution) の5段階モデルが定義済み(未実装、概念のみ)。reaction (こける) は成否結果 (Outcome) 段階の Failure に対応する可能性がある。
- `docs/concept/README.md` に「姿勢」の概念枠があるが中身は未検討 (空)。`docs/concept/ideas/README.md` の「動作を `移動` `姿勢` `動作` などの要素に分解」というアイディアと関連する。歩く action の実現可否を「姿勢」概念とどう勘案するかは今回の検討対象。
- `src/hooks/event/` に `useEventListener`/`useEventDispatcher` が実装済み。EventTarget 経由の発行・購読、listener が返す Promise の完了待ち (`useEventDispatcher` の戻り値) に対応済み。
- `src/components/samples/figure/box-bot` (3D版) に既存のクリックジャンプ (`startHop`、頭/胴クリックでホップ) が実装済み。既存の呼び出し経路はそのまま維持し、event listener 経由でも同等のアクションを発火できるようにする。

## 実装計画

- [ ] action 定義: 歩く
  - [ ] 「姿勢」概念との関連整理 (実現可能性の勘案)
- [ ] action 定義: ジャンプ
  - [ ] 既存クリックジャンプ (box-bot 3D `startHop`) はそのまま維持、event listener 経由の発火経路を追加
- [ ] reaction 定義: こける (転倒の効果を受けて抵抗に失敗)
- [ ] reaction 定義: 被ダメージモーション (仮称、要 naming)
- [ ] action/reaction を event listener 経由で実行する仕組みの設計 (`useEventListener`/`useEventDispatcher` の活用方法)

## 決定事項

<!-- 検討・決定した内容のログ -->

- action定義: 歩く → `walking: boolean`(歩いている/いないの状態)として定義。見た目の動き(脚の上下・前後スイング・body の bobbing 等)はこの状態と分離し、別 action(reaction 含む)の組合せとして実装する方針。「姿勢」概念との厳密な対応整理は本決定では行わず、`walking` state を先行実装した上で挙動検討フェーズへ進む
  - 実装(state のみ、挙動なし)は `20260821-box-bot-event-driven-actions` 側で着手。jump/arm と同じ event listener 経由 toggle パターン(`useWalkingAction`)を踏襲

## 懸念・リスク

- action-phase.md の5段階モデル (Intent/PreAction/Execution/Outcome/Resolution) との対応が未整理。reaction (こける) をどの段階の処理として位置づけるか要検討。
- 「姿勢」概念 (docs/concept/README.md) 自体が未検討のため、歩く action との関連付けは仮置きになる可能性がある。
