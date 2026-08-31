import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import type { Camera } from 'three'
import { Vector3 } from 'three'

import { useEventListener } from '@/hooks/event'

import type { BoxBotActionContext } from '../types'

import {
  ACTION_FALL,
  FALL_ANGLE,
  FALL_ARM_ANGLE,
  FALL_DUR,
  type FallConfig,
  type FallOverride,
  GET_UP_DUR,
} from './config'

/** 転倒の進行度カーブ(ease-out。0→1 で減速しながら到達) */
const ease = (p: number): number => p * (2 - p)

/**
 * facing 前方水平ベクトルをカメラ投影し、画面横方向(右+)の単位成分を返す
 *
 * - `facing` の水平ベクトル `(sin θ, 0, cos θ)` と原点を NDC へ投影し、差を正規化した x
 * - 縦成分は使わない。前後向き(カメラの奥/手前)では ≈ 0、真横向きで ≈ ±1
 * - 足元の縦位置を facing で暴れさせないため。縦ずれは `dropDistance` 一本で合わせる
 */
const projectFacingScreenX = (camera: Camera, facing: number): number => {
  const origin = new Vector3(0, 0, 0).project(camera)
  const tip = new Vector3(Math.sin(facing), 0, Math.cos(facing)).project(camera)
  const x = tip.x - origin.x
  const y = tip.y - origin.y
  const len = Math.hypot(x, y) || 1
  return x / len
}

/** fall が host から必要とする操作面 */
type FallHost = Pick<
  BoxBotActionContext<FallConfig>,
  | 'applyArmAngle'
  | 'applyShift'
  | 'applyTiltAngle'
  | 'config'
  | 'eventTarget'
  | 'interactive'
  | 'readFacing'
>

/**
 * 転倒 → 横倒しで静止 → 起き上がり を 1 アクションで扱う
 *
 * - `phaseRef`: 0 直立 / 1 転倒中 / 2 横倒しで静止 / 3 起き上がり中
 * - `ACTION_FALL`(クリック起点・外部 dispatch 共通)を購読。直立中なら転倒、\
 *   横倒し中なら起き上がりを起動する(アニメ中は無視)。get-up は転倒の逆補間
 * - Canvas 内は姿勢のみ: 前傾は `host.applyTiltAngle`(adapter がシルエット中心 pivot の\
 *   `rotation.x` へ)、腕は `host.applyArmAngle`。いずれも前傾と同じ進行度で補間する
 * - 「倒れ込み」の移動は `host.applyShift`(adapter が表示領域 DOM をずらす)。\
 *   横方向は倒れ始めの facing(`host.readFacing`)をカメラ投影した画面横成分 × `shiftDistance`\
 *   (前後向きは ≈ 0、真横向きで最大)。縦方向は facing に依らず `dropDistance` 一本で、\
 *   中心 pivot で足元が浮くぶんを画面下へ補正する。\
 *   前傾と同じ進行度で補間し、get-up で 0 へ戻す。THREE / DOM は直接触らない
 * - 転倒開始時は腕を即座に `FALL_ARM_ANGLE` へ切替え、起き上がりでのみ 0 へ補間して戻す。\
 *   ずらし距離・投影済み横成分は起動時に解決して `shiftConfigRef` / `shiftXRef` に固定\
 *   (get-up も同じ値を逆再生)
 * - `useFrame` は jump と同じく毎フレーム現在の目標値を無条件適用する。横倒し静止中も\
 *   書き続けるので、再レンダーで表示領域の inline style(`top`/`left` 50%)が復元されても\
 *   次フレームで倒れ位置へ戻る(早期 return して放置すると中心へスナップして見える)
 *
 * @param host アクション実行に必要な操作面(adapter が実装)
 */
export const useFall = (host: FallHost): void => {
  const {
    applyArmAngle,
    applyShift,
    applyTiltAngle,
    config,
    eventTarget,
    interactive,
    readFacing,
  } = host

  const camera = useThree((s) => s.camera)

  /** 姿勢フェーズ。0 直立 / 1 転倒中 / 2 横倒しで静止 / 3 起き上がり中 */
  const phaseRef = useRef(0)
  /** 現フェーズの経過秒。-1: アニメーションしていない */
  const tRef = useRef(-1)
  /** 実行中の転倒の解決済みずらし距離。null のときは `config` を使う */
  const shiftConfigRef = useRef<FallConfig | null>(null)
  /** 倒れ始めに固定した画面ずらしの横成分(右+、-1〜1) */
  const shiftXRef = useRef(0)

  const onFall = (e: Event) => {
    if (!interactive) return

    if (phaseRef.current === 0) {
      const override = (e as CustomEvent<FallOverride | undefined>).detail
      shiftConfigRef.current = { ...config, ...override }
      shiftXRef.current = projectFacingScreenX(camera, readFacing())
      phaseRef.current = 1
      tRef.current = 0
    } else if (phaseRef.current === 2) {
      phaseRef.current = 3
      tRef.current = 0
    }
  }

  useEventListener(ACTION_FALL, onFall, { target: eventTarget })

  // 転倒中〜横倒し〜起き上がりの間、毎フレーム現在の目標値を無条件適用する。
  //   posture: 0 = 直立 … 1 = 横倒し。前傾角・ずらし量はこれに比例
  //   arm: 転倒開始で即 FALL_ARM_ANGLE、get-up 進行度で 0 へ戻す(前傾とは別カーブ)
  // 横倒し静止中も書き続けるので、再レンダーで表示領域の inline style が復元されても戻る。
  useFrame((_, dt) => {
    // アニメ中のフェーズはタイマーを進め、終端でフェーズを切替える
    if (tRef.current >= 0) {
      const dur = phaseRef.current === 1 ? FALL_DUR : GET_UP_DUR
      tRef.current += dt
      if (tRef.current >= dur) {
        const wasGetUp = phaseRef.current === 3
        phaseRef.current = phaseRef.current === 1 ? 2 : 0
        tRef.current = -1
        if (wasGetUp) {
          // 復帰完了。最後に一度 0 へ戻し、以降は shift を jump に委ねる
          applyTiltAngle(0)
          applyArmAngle(0)
          applyShift({ x: 0, y: 0 })
        }
      }
    }

    // 直立(未転倒 / 復帰後)は何もしない。表示領域ずらしは jump が所有する
    if (phaseRef.current === 0) return

    const { dropDistance, shiftDistance } = shiftConfigRef.current ?? config
    const shiftX = shiftXRef.current

    let posture: number
    let arm: number
    if (phaseRef.current === 2) {
      posture = 1
      arm = FALL_ARM_ANGLE
    } else if (phaseRef.current === 1) {
      posture = ease(tRef.current / FALL_DUR)
      arm = FALL_ARM_ANGLE
    } else {
      // phase 3: 起き上がり(前傾・腕とも p^2 で 0 へ)
      const p = tRef.current / GET_UP_DUR
      posture = 1 - p * p
      arm = FALL_ARM_ANGLE * (1 - p * p)
    }

    applyTiltAngle(FALL_ANGLE * posture)
    applyArmAngle(arm)
    // 横: facing の画面横成分ぶん倒れ込む / 縦: facing に依らず足元の浮きを打ち消す
    applyShift({
      x: shiftX * shiftDistance * posture,
      y: -dropDistance * posture,
    })
  })
}
