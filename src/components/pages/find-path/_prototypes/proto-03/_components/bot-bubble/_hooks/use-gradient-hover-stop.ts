import { AnimationEvent, PointerEvent, useCallback, useRef } from 'react'

import * as styles from '../index.css'

type UseGradientHoverStopReturn = {
  /** 本体(button)の `onAnimationIteration`。hover 中なら帯が流れきった時点で止める */
  handleAnimationIteration: (event: AnimationEvent<HTMLElement>) => void
  /** 本体(button)の `onPointerEnter` */
  handlePointerEnter: () => void
  /** 本体(button)の `onPointerLeave`。止めていた帯の流れを再開する */
  handlePointerLeave: (event: PointerEvent<HTMLElement>) => void
}

/** 要素に掛かっている背景グラデーション(`gradientShift`)の CSS アニメーションを返す */
const findGradientAnimation = (el: HTMLElement) =>
  el
    .getAnimations()
    .find(
      (animation) =>
        animation instanceof CSSAnimation &&
        animation.animationName === styles.gradientShift,
    )

/**
 * hover 時、背景グラデーションの帯を途中で止めず流しきってから停止させる
 *
 * - CSS の `animation-play-state: paused` だと帯がその位置で止まるため、
 *   hover 中は 1 周(帯が終端へ流れきる)の境目 `animationiteration` で
 *   Web Animations API の `pause()` を呼ぶ。hover している間は次の帯を発生させない
 * - hover が外れたら `play()` で再開する(境目で止めているため、次の帯が端から流れ始める)
 */
export const useGradientHoverStop = (): UseGradientHoverStopReturn => {
  /** 本体(button)を hover 中か */
  const isHoveringRef = useRef(false)

  const handleAnimationIteration = useCallback(
    (event: AnimationEvent<HTMLElement>) => {
      if (
        !isHoveringRef.current ||
        event.animationName !== styles.gradientShift
      ) {
        return
      }

      findGradientAnimation(event.currentTarget)?.pause()
    },
    [],
  )

  const handlePointerEnter = useCallback(() => {
    isHoveringRef.current = true
  }, [])

  const handlePointerLeave = useCallback((event: PointerEvent<HTMLElement>) => {
    isHoveringRef.current = false
    findGradientAnimation(event.currentTarget)?.play()
  }, [])

  return { handleAnimationIteration, handlePointerEnter, handlePointerLeave }
}
