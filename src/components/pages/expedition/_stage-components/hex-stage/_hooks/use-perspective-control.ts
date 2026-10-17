import { RefObject, useCallback, useRef } from 'react'

/** rotateX 角度の下限 (deg) */
const TILT_MIN = 0

/** rotateX 角度の上限 (deg)。90 に近づくと床が消えるため手前で止める */
const TILT_MAX = 85

type UsePerspectiveControlReturn = {
  /** 床面 (rotateX を掛ける要素) へ渡す ref */
  floorRef: RefObject<HTMLDivElement | null>
  /** rotateX 角度を設定する。再レンダリングを起こさず style を直接書換える */
  setTilt: (deg: number) => void
}

/**
 * CSS perspective の傾き (rotateX) を ref 経由で制御する
 *
 * - `--floor-tilt` カスタムプロパティを floorRef の style へ直接書込む
 * - React state を持たないため、傾き変更でセル群は再レンダリングされない
 * - 値は TILT_MIN〜TILT_MAX にクランプする
 */
export const usePerspectiveControl = (): UsePerspectiveControlReturn => {
  const floorRef = useRef<HTMLDivElement>(null)

  const setTilt = useCallback((deg: number) => {
    const clamped = Math.min(Math.max(deg, TILT_MIN), TILT_MAX)

    floorRef.current?.style.setProperty('--floor-tilt', `${clamped}deg`)
  }, [])

  return { floorRef, setTilt }
}
