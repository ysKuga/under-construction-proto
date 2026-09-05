# ui/

操作 UI 要素、見た目・配置のみ検討する置き場。`_prototypes/` 配下、制御に関する実装(`control/` 側、未着手)と切り分ける。ここでは挙動(制御ロジック)を接続しない。

## 方針

- 操作要素、解放条件なし。最初から表示する
- 複数操作(A〜E相当)想定、要素ごとにディレクトリを切る
- ディレクトリ名、実装の特徴(配置形状等)を簡潔に反映する(例: 横一列配置 → `action-row/`)
- ボタンに限らず、他の UI 要素(スライダー等)も同様の位置づけで検討対象

## バリエーション一覧

概要・詳細は各ディレクトリの `CLAUDE.md` 参照。

- `action-row`: 横一列・常時表示(実装済)
- `action-single`: 先頭 1 件のみ表示(実装済)
- `action-circle`: bot を囲む真円、画面座標ベース(実装済)
- `action-square`: bot を囲う四角形、画面座標ベース(実装済)
- `action-anchor`: 各ボタンを対応する bot 部位のそばに配置、画面座標ベース(実装済)
- `action-ring`: bot 足元、地面水平な円周に 3D 配置(実装済・要調整。奥行きの遮蔽が未解決)
- `direction-arrow`: 歩く方向に矢印追随(未着手・保留。向き変更 action が box-bot 側に無い)

現在の呼び出し元は `proto-02/index.tsx`。`actionLayout` prop(Storybook: `Default`/`Single`/`Circle`/`Square`/`Anchor`/`Ring`)で切替表示する。
