# ui/

UI 要素(操作・装飾問わず)、見た目・配置のみ検討する置き場。`_prototypes/` 配下、制御に関する実装(`control/` 側、未着手)と切り分ける。ここでは挙動(制御ロジック)を接続しない。

## 方針

- UI 要素、解放条件なし。最初から表示する
- 複数操作(A〜E相当)想定、要素ごとにディレクトリを切る
- ディレクトリ名、実装の特徴(配置形状等)を簡潔に反映する(例: 横一列配置 → `action-row/`)
- ボタンに限らず、他の UI 要素(スライダー・装飾メッシュ等)も同様の位置づけで検討対象
- 各バリエーション、単独で確認できる `index.stories.tsx` を持つ(`_story-decorators` 経由で bot 付き確認)
- 複数バリエーション共通の実装(bot 表示コンテナ等)は `_components/` へ切り出す

## バリエーション一覧

概要・詳細は各ディレクトリの `CLAUDE.md` 参照。

- `_components/`: 複数バリエーション共通の実装置き場
  - `bot-overlay`: bot 表示領域と同サイズのオーバーレイコンテナ(circle/square/anchor 共通の土台。実装済)
- `_story-decorators`: 各 `index.stories.tsx` 共通の Storybook decorator(`withBot`/`withBotStacked`/`withBotChildren`。実装済)。`_components/bot-overlay` を参照するため `_components/` と同列に配置(同列 import 回避)
- `action-row`: 横一列・常時表示(実装済・単独 story あり)
- `action-single`: 先頭 1 件のみ表示(実装済・単独 story あり)
- `action-circle`: bot を囲む真円、画面座標ベース(実装済・単独 story あり)
- `action-square`: bot を囲う四角形、画面座標ベース(実装済・単独 story あり)
- `action-anchor`: 各ボタンを対応する bot 部位のそばに配置、画面座標ベース(実装済・単独 story あり)
- `action-ring`: bot 足元、地面水平な円周に 3D 配置(実装済・単独 story あり。要調整、奥行きの遮蔽が未解決)
- `direction-arrow`: 歩く方向に矢印追随(未着手・保留。向き変更 action が box-bot 側に無い)
- `three/`: three.js(r3f)使用コンポーネント置き場。詳細は `three/CLAUDE.md` 参照
  - `ground-ring`: bot 足元を囲む平面リングメッシュ、装飾用途(実装済・単独 story あり)

`proto-02/index.tsx` は各バリエーションの旧来の呼び出し元(削除予定、変更しない)。`actionLayout` prop(Storybook: `Default`/`Single`/`Circle`/`Square`/`Anchor`/`Ring`/`GroundRing`)で切替表示するが、ここでの新規実装・統合は行わない。各バリエーションの正とする確認手段は自身の `index.stories.tsx`。
