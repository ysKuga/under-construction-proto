# 決定事項（expedition の盤面を表示領域へ収める）

- 2026-10-19: 表示領域の置き場・測り方を決めた
  - 置き場: `HexStage` の内側で scene を包む
    - 理由: `Stage` 側で包むと `ActorOverlayLayer` の吹き出しまで切れる
  - 幅: `max-width: calc(100vw - 32px)` + `overflow: hidden`
    - 理由: `max-width: 100%` は親の `w-min`・grid の `auto` 列の連鎖を崩す要がある
  - 高さ: 床の `getBoundingClientRect().height` を表示領域の `style.height` へ直書きする
    - 測る時: 初回・`setTilt`・`transitionend`
    - 下端揃え: `flex-direction: column` + `justify-content: flex-end`
