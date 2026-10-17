export type UseStageSlidersReturn = {
  /** tilt スライダーの変更時。床の傾きを `Stage07Handle.setTilt` で反映する */
  handleTiltChange: (deg: number) => void
  /** セル間移動アニメーションの所要時間(ms) */
  moveDurationMs: number
  /** 移動時間を切り替える */
  setMoveDurationMs: (moveDurationMs: number) => void
}
