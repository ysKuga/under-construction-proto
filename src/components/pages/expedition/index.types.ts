import { FogMode } from './_stores/fog/types'

export type ExpeditionProps = {
  /** 霧の適用範囲（初期表示）の初期値（既定 `all-hidden`） */
  initialFogMode?: FogMode
  /** 盤面生成の seed の初期値（未指定なら既定の固定配置、issue #315） */
  initialSeed?: number
}
