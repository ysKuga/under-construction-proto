'use client'

import { FlagOverhead } from './_contents/flag-overhead'

/**
 * ゴール到達時の演出をまとめる
 *
 * - 起点はフェーズ `cleared` への遷移（bot がゴールセルの中心へ着いた時点）に統一する（issue #137）
 * - bot 頭上の旗を表示する
 */
export const GoalPerformance = () => <FlagOverhead />
