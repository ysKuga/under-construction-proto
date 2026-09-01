import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

import { useEventListener } from '@/hooks/event'

import type { BoxBotActionContext } from '../types'

import {
  ACTION_AUTO_ROTATE,
  type AutoRotateConfig,
  type AutoRotateOverride,
} from './config'

/** auto-rotate が host から必要とする操作面 */
type AutoRotateHost = Pick<
  BoxBotActionContext<AutoRotateConfig>,
  'applyYawDelta' | 'config' | 'eventTarget' | 'interactive'
>

/**
 * 自動回転 action の購読・可視化
 *
 * - `ACTION_AUTO_ROTATE`(外部 dispatch)を購読し、1 回の dispatch で on/off をトグルする。\
 *   spin と違い自動で止まらず、もう一度 dispatch するまで回り続ける
 * - 角速度は `host.config`(`AUTO_ROTATE_DEFAULTS` ← `actionConfig.autoRotate` 上書き)を既定に、\
 *   on へ切替える dispatch の `CustomEvent.detail`(`AutoRotateOverride`)で 1 回だけ上書きできる
 * - yaw の適用は `host.applyYawDelta`(adapter が回転グループの `rotation.y` へ増分加算)。\
 *   spin と同じグループへ相乗りする。THREE を直接触らない
 *
 * @param host アクション実行に必要な操作面(adapter が実装)
 */
export const useAutoRotate = (host: AutoRotateHost): void => {
  const { applyYawDelta, config, eventTarget, interactive } = host

  /** 回転中か */
  const activeRef = useRef(false)
  /** on 中の解決済みパラメータ。null のときは `config` を使う */
  const configRef = useRef<AutoRotateConfig | null>(null)

  const onAutoRotate = (e: Event) => {
    if (!interactive) return

    if (activeRef.current) {
      activeRef.current = false
      configRef.current = null
      return
    }
    const override = (e as CustomEvent<AutoRotateOverride | undefined>).detail
    configRef.current = { ...config, ...override }
    activeRef.current = true
  }

  useEventListener(ACTION_AUTO_ROTATE, onAutoRotate, { target: eventTarget })

  // 回転中のみ、このフレーム分の回転量を適用
  useFrame((_, dt) => {
    if (!activeRef.current) return
    applyYawDelta((configRef.current ?? config).speed * dt)
  })
}
