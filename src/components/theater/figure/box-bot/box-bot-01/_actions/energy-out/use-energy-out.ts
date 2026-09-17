import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

import { useEventListener } from '@/hooks/event'

import type { BoxBotActionContext } from '../types'

import {
  ACTION_ENERGY_OUT,
  ENERGY_OUT_DUR,
  ENERGY_OUT_RECOVER_DUR,
  type EnergyOutConfig,
} from './config'

/** 進行度カーブ(ease-out。0→1 で減速しながら到達) */
const ease = (p: number): number => p * (2 - p)

/** energy-out が host から必要とする操作面 */
type EnergyOutHost = Pick<
  BoxBotActionContext<EnergyOutConfig>,
  | 'applyArmAngle'
  | 'applyArmLift'
  | 'applyTorsoTiltAngle'
  | 'config'
  | 'eventTarget'
  | 'interactive'
>

/**
 * EN 切れ → 予防姿勢 → (EN 回復で)復帰 action
 *
 * - 1 回の dispatch で状態をトグルする。通常時なら予防姿勢へ、予防姿勢で静止中なら復帰を起動する
 * - `phaseRef`: 0 通常 / 1 予防姿勢へ移行中 / 2 予防姿勢で静止 / 3 復帰中
 * - EN 切れは経路実行中に検知できる(想定内の停止)ため、fall(不意の転倒 ― シルエット中心軸で
 *   脚を含む全身を 90° 前傾・腕を頭側へ大きく引き寄せ・表示領域ずらしで崩れ落ちる)とは別の
 *   動きにする。腰(脚の付け根)を支点に上半身だけ少し前傾させ(`applyTorsoTiltAngle`、脚は
 *   接地したまま)、腕は地面に対して垂直(鉛直下向き)に垂らす ― 転倒しかけたときすぐ支えに
 *   使える準備姿勢。腕は `torsoRef` の内側にネストされているため、胴体の前傾ぶんそのままでは
 *   地面に対して傾いてしまう。`applyArmAngle`(x 軸)へ前傾と逆符号の角度を加え、胴体の前傾を
 *   打ち消して地面に対する鉛直を保つ。`applyArmLift`(z 軸、静的な肩の開きを打ち消す方向)は
 *   既定 0(開きをそのまま残す) ― 完全に体側へ寄せると体に埋もれてほぼ見えなくなるため。
 *   「転倒を防ぐための予防姿勢・動力を使わない安定した姿勢」を表す。表示領域ずらし・
 *   接地影の持ち上げは行わない(倒れていないため)。同じ姿勢(postureRef)は共有しない ―
 *   EN 切れは経路実行の tick 停止と同時に起きるため、walking/marching 側の開始阻止は
 *   tick 側の停止で足りる
 *
 * @param host アクション実行に必要な操作面(adapter が実装)
 */
export const useEnergyOut = (host: EnergyOutHost): void => {
  const {
    applyArmAngle,
    applyArmLift,
    applyTorsoTiltAngle,
    config,
    eventTarget,
    interactive,
  } = host

  /** 状態フェーズ。0 通常 / 1 予防姿勢へ移行中 / 2 予防姿勢で静止 / 3 復帰中 */
  const phaseRef = useRef(0)
  /** 現フェーズの経過秒。-1: アニメーションしていない */
  const tRef = useRef(-1)

  const onEnergyOut = (): void => {
    if (!interactive) return

    if (phaseRef.current === 0) {
      phaseRef.current = 1
      tRef.current = 0
    } else if (phaseRef.current === 2) {
      phaseRef.current = 3
      tRef.current = 0
    }
  }

  useEventListener(ACTION_ENERGY_OUT, onEnergyOut, { target: eventTarget })

  useFrame((_, dt) => {
    if (tRef.current >= 0) {
      const dur =
        phaseRef.current === 1 ? ENERGY_OUT_DUR : ENERGY_OUT_RECOVER_DUR
      tRef.current += dt
      if (tRef.current >= dur) {
        phaseRef.current = phaseRef.current === 1 ? 2 : 0
        tRef.current = -1
        if (phaseRef.current === 0) {
          applyTorsoTiltAngle(0)
          applyArmAngle(0)
          applyArmLift({ left: 0, right: 0 })
        }
      }
    }

    // 通常(未発火 / 復帰後)は何もしない
    if (phaseRef.current === 0) return

    const { armLift, tiltAngle } = config

    let progress: number
    if (phaseRef.current === 2) {
      progress = 1
    } else if (phaseRef.current === 1) {
      progress = ease(tRef.current / ENERGY_OUT_DUR)
    } else {
      // phase 3: 復帰(前傾・腕とも p^2 で 0 へ)
      const p = tRef.current / ENERGY_OUT_RECOVER_DUR
      progress = 1 - p * p
    }

    applyTorsoTiltAngle(tiltAngle * progress)
    // 胴体前傾(torsoRef)を打ち消し、腕を地面に対して鉛直に保つ(腕は torsoRef の内側)
    applyArmAngle(-tiltAngle * progress)
    // 静的な肩の開き(左: 負 / 右: 正、DEFAULTS.arm.*Angle)を打ち消す方向へ左右対称に加える
    applyArmLift({ left: armLift * progress, right: -armLift * progress })
  })
}
