# bot-overlay

bot 表示領域と同サイズのオーバーレイコンテナ。画面座標(screen space)ベースで bot を囲む配置パターン(circle/square/anchor 等)共通の土台。

`children`(bot 本体)を中央配置、`overlay` prop へ渡した要素(`action-anchor` 等)を同サイズで重ねる。呼び出し側は `size`(bot 表示領域の一辺、px)を渡すのみで、コンテナのサイズ・中央配置は本コンポーネントが担う。

現在 `action-anchor` のみ移行済。circle/square は `proto-02` 側に旧来の実装が残る(未移行)。
