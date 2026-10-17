export type UseStageSlidersReturn = {
  /** 歩行中の体の上下の最大持ち上げ量(world) */
  bodyBobHeight: number
  /** tilt スライダーの変更時。床の傾きを `Stage07Handle.setTilt` で反映する */
  handleTiltChange: (deg: number) => void
  /** walking の脚振り角の振幅(rad) */
  legSwingAngle: number
  /** walking の脚振り周期の上限(秒) */
  maxWalkCycleSec: number
  /** セル間移動アニメーションの所要時間(ms) */
  moveDurationMs: number
  /** 体の上下量を切り替える */
  setBodyBobHeight: (bodyBobHeight: number) => void
  /** 脚振り角を切り替える */
  setLegSwingAngle: (legSwingAngle: number) => void
  /** 歩行周期の上限を切り替える */
  setMaxWalkCycleSec: (maxWalkCycleSec: number) => void
  /** 移動時間を切り替える */
  setMoveDurationMs: (moveDurationMs: number) => void
}
