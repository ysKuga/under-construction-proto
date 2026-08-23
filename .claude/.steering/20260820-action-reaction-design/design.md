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

- [x] action 定義: 歩く → `walking`(脚 swing)/`marching`(脚 bob)の2 action として確定
  - [x] 「姿勢」概念との関連整理 (実現可能性の勘案)。`posture` 数値(0=直立〜1=倒れている)として `docs/concept/README.md` へ定義、決定事項参照
- [ ] action 定義: ジャンプ
  - [ ] 既存クリックジャンプ (box-bot 3D `startHop`) はそのまま維持、event listener 経由の発火経路を追加
- [x] reaction 定義: こける (転倒の効果を受けて抵抗に失敗) → 英語命名 `fall` として確定
- [ ] reaction 定義: 被ダメージモーション (仮称、要 naming)
- [ ] action/reaction を event listener 経由で実行する仕組みの設計 (`useEventListener`/`useEventDispatcher` の活用方法)

## 決定事項

<!-- 検討・決定した内容のログ -->

- action定義: 歩く → `walking: boolean`(歩いている/いないの状態)として定義。見た目の動き(脚の上下・前後スイング・body の bobbing 等)はこの状態と分離し、別 action(reaction 含む)の組合せとして実装する方針。「姿勢」概念との厳密な対応整理は本決定では行わず、`walking` state を先行実装した上で挙動検討フェーズへ進む
  - 実装(state のみ、挙動なし)は `20260821-box-bot-event-driven-actions` 側で着手。jump/arm と同じ event listener 経由 toggle パターン(`useWalkingAction`)を踏襲
- 挙動検討の結果、「脚 swing(前後スイング)」と「脚 bob(上下)」を同一 `walking` state 配下の選択肢(`legMotion`)にせず、別々の action として確定した
  - `walking`(脚 swing): 前進の歩行として採用
  - `marching`(脚 bob、新規 action): 「足踏み」として定義。前進しないその場の動作
  - 両者とも jump/arm と同じ独立 toggle パターン(`ACTION_WALKING_TOGGLE`/`ACTION_MARCHING_TOGGLE`、`walkingRef`/`marchingRef`)。`legMotion` props は廃止し、各挙動 hook が自分の ref を直接見る形にした
- 姿勢概念: `docs/concept/README.md` に `posture`(0=直立 〜 1=完全に倒れている の連続値)として定義した。離散 state でなく数値にすることで、よろけ等の中間状態も同じ軸で表現できる見込み
  - box-bot 実装では `postureRef`(数値 ref)として持ち、こける/起き上がり action がこの値を変化させる。他 action(歩く等)の実行可否をこの値でガードする(決定事項の次項参照)
- reaction定義: こける → 英語命名 `fall` として確定。見た目は「前方につまずき転倒」まで
  - **転倒(`fall`)と起き上がり(`getUp`)は別 action に分離する。** 一連の自動モーションにはしない。倒れた後 `posture = 1` で静止し、起き上がりは別トリガーで明示的に発火する
  - トリガー方式: いずれも jump と同じ独立 oneshot trigger action(`ACTION_FALL`/`ACTION_GET_UP`、`fallRef`/`getUpRef`)として実装する。被ダメージシステム(ダメージ量・方向等の入力を伴う設計)との連携は将来検討とし、まず単体で `useBoxBotActionDispatcher` から呼べる trigger として着手する
  - 実行条件: `fall` は `posture === 0`(直立時)のみ発火可能、完了後 `posture = 1` で確定。`getUp` は `posture === 1`(倒れきっている時)のみ発火可能、完了後 `posture = 0` に戻す。二重発火・中途半端な状態からの遷移を防ぐ
  - 姿勢によるガード: `walking`/`marching` など他 action は `posture !== 0`(直立でない)間は開始不可にする。「体勢により歩行等への移行が不可」という制御を `posture` 数値の参照だけで表現する
  - action-phase.md の5段階モデルとの対応: 「こける」自体は Outcome(Failure)の結果を受けた Resolution 段階の可視化(見た目)に相当する想定。ただし本 steering・`20260821-box-bot-event-driven-actions` では ActionPhase 自体を導入せず、jump 同様「発火 → 見た目の動作 → 姿勢確定」という trigger action として実装する。ActionPhase との厳密な統合は将来課題として残す

## 懸念・リスク

- action-phase.md の5段階モデル (Intent/PreAction/Execution/Outcome/Resolution) との対応が未整理。reaction (こける) をどの段階の処理として位置づけるか要検討。
- `posture` 数値は box-bot 実装 (`fall`/`getUp`) を通じて初めて具体化するもので、他 action への一般化 (歩く以外のガード、複数キャラクター間での扱い等) は未検証。
