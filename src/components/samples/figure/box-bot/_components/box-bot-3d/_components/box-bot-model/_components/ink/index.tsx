'use client'

import type { Vec3 } from '../../../../index.types'
import type { BoxBot3DConfig } from '../../index.types'

/** 目・口などの塗り */
export function Ink({
  cfg,
  position,
  size,
}: {
  cfg: BoxBot3DConfig
  position: Vec3
  size: Vec3
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={cfg.ink} roughness={0.6} />
    </mesh>
  )
}
