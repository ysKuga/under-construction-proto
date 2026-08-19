'use client'

import { Line } from '@react-three/drei'
import * as React from 'react'
import * as THREE from 'three'

import { boxEdges } from '../../../../_lib/box-edges'
import { jitterEdge } from '../../../../_lib/jitter-edge'
import { makeRng } from '../../../../_lib/make-rng'
import type { Vec3 } from '../../../../index.types'
import type { BoxBot3DConfig, Handlers } from '../../index.types'

/** 紙の面 ＋ 手描きジッター辺 ＋(任意)反転ハル縁取り */
export function SketchBox({
  cfg,
  handlers,
  position,
  rotation,
  seed,
  size,
}: {
  cfg: BoxBot3DConfig
  handlers?: Handlers
  position: Vec3
  rotation?: Vec3
  seed: number
  size: Vec3
}) {
  const [w, h, d] = size
  const edges = React.useMemo(() => {
    const rng = makeRng(seed)
    return boxEdges(w, h, d).map(([a, b]) =>
      jitterEdge(a, b, cfg.sketch, cfg.sketchDetail, rng),
    )
  }, [w, h, d, seed, cfg.sketch, cfg.sketchDetail])

  const ow = cfg.outlineWidth
  return (
    <group position={position} rotation={rotation}>
      {/* A. 反転ハル: 一回り大きい箱を裏面だけ描いてシルエット縁取り */}
      {cfg.outline && (
        <mesh raycast={() => null}>
          <boxGeometry args={[w + 2 * ow, h + 2 * ow, d + 2 * ow]} />
          <meshBasicMaterial color={cfg.ink} side={THREE.BackSide} />
        </mesh>
      )}
      {/* 紙の面(クリック対象) */}
      <mesh castShadow receiveShadow {...handlers}>
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={cfg.paper}
          metalness={0}
          roughness={0.95}
        />
      </mesh>
      {/* B. 手描きジッター辺(fat-line)。辺はレイキャスト無効にして面のクリックを妨げない */}
      {edges.map((pts, i) => (
        <Line
          color={cfg.ink}
          key={i}
          lineWidth={cfg.lineWidth}
          points={pts}
          raycast={() => null}
        />
      ))}
    </group>
  )
}
