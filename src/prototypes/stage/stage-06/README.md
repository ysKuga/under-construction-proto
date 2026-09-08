# Stage06

遠近ステージ + **actor 位置の ref 化**。stage-05 と同じ見た目・操作で、actor の移動が React 再レンダリングを伴わない版。段階 3（time-control 統合）の土台。

- 設計・経緯: `.claude/.steering/issue-137-top-page-transition-target/_pr/pr-142-time-control-integration/design.md`

## stage-05 との違い

| | stage-05 | stage-06 |
| --- | --- | --- |
| 遠近（傾き） | `usePerspectiveControl`（`--floor-tilt` を ref 直書き） | 同じものを import して流用 |
| actor 位置 | `ActorPositionProvider`（`useState`）→ 移動で再レンダリング | `ActorNodeRegistryProvider`（ref + DOM 直書き）→ 移動で再レンダリングなし |
| MoveIntent | `{ source, target }` を dispatch → resolver がクランプ | `moveActor(id, target)` を直接呼ぶ（クランプは registry 内） |

stage-05 は「即時移動 + 遠近」の参照実装として残す。

## actor-node-registry

`_contexts/actor-node-registry` が actor 位置を保持・反映する。

- `useState` を持たない。移動しても Provider 配下は再レンダリングしない（`usePerspectiveControl` が `--floor-tilt` を直書きするのと同じ狙い）。
- API:
  - `registerActorNode(id, el)` — bot ラッパー DOM を登録（`ref` コールバック）。登録時に現在セルを DOM へ反映（再マウント復帰）
  - `moveActor(id, target)` — clamp 済みの `left/top`（%）を登録ノードの `style` へ直書き
  - `getActorPosition(id)` — ref 保持の現在セル（初期配置・keyboard の相対移動が参照。**イベントハンドラ内でのみ呼ぶ**。レンダー中に呼ぶと React Compiler の `react-hooks/refs` に抵触するため、初期描画の配置は `initialPosition`（Provider prop、ref ではない）を使う）
  - `gridSize` / `initialPosition`
- 複数 actor 対応: `Map<id, HTMLElement>` + `Map<id, GridPosition>`（`.claude/rules/react/r3f-state.md` 複数消費者 → Context 配布）。stage-06 自体は `PLAYER_ACTOR_ID` の単一 actor。

## bot の重ね方

- `BoxBot01` は `ref` 非対応のため、位置決め用の `<div>` で 1 枚くるみ、その div に `cellStyle`（absolute + 逆 `rotateX` + `transition`）と `ref` を付ける。
- 移動は registry がこの div の `left/top` を書換え、セル間の補間は CSS `transition: left/top 150ms` が担う（滑らか補間の useFrame 化は将来）。
- box-bot-01 は表示領域 = 設置領域（#108）。`style={{ height: botSize, width: botSize }}` を渡すだけで Canvas が一致（`resize={{ offsetSize: true }}` 済みのため傾いた床でもずれない）。

## 操作 3 系統

- セルクリック（`geo-layer`）→ `moveActor(PLAYER_ACTOR_ID, { col, row })`
- 矢印キー・WASD（`_hooks/use-keyboard-move`）→ 現在セル + delta を `moveActor` へ
- bot クリック（`actors-layer` の `onClick`）→ 次セルへ順送り

## 動作確認（Storybook）

`prototypes/stage/Stage06`。devtools コンソールを開いた状態で:

1. 初回描画で `render: Stage06` / `render: GeoLayer` / `render: ActorsLayer` が 1 回ずつ
2. セルクリック / 矢印キー / bot クリックで bot が移動する
3. **移動しても `render: ActorsLayer` / `render: GeoLayer` が追加で出ない**（= 再レンダリングなし）。stage-05 は移動のたび `render: ...` が増えるのが対比
4. tilt スライダーで bot が床と一緒に傾き、直立を保つ

## 未対応 / 段階 3 以降

- time-control の tick 接続（`moveActor` を tick ドライバから呼ぶ）。PR-C。
- 複数 actor の z 順 / occlude、遠近に伴うセルのクリック判定歪み（stage-05 から継続）。
- `moveActor` の DOM 直書きと `cellStyle` の React inline `left/top` が二重管理。stage-06 が再レンダリングすると初期値へ戻る既知の割り切り（`--floor-tilt` と同じ。state を持たせない設計で回避）。
