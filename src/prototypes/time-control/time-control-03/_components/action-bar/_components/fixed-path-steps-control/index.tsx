import { useFixedPathStepsControl } from './index.hooks'

/**
 * 固定 step 数 (全 actor 一括) 設定UI
 *
 * - fixedPathSteps 購読をここに閉じ込め、`ActionBar` 本体・他ボタンの再レンダリングを避ける
 */
export const FixedPathStepsControl = () => {
  const {
    fixedPathSteps,
    isFixedPathSteps,
    setFixedPathStepsAll,
    setIsFixedPathStepsAll,
  } = useFixedPathStepsControl()

  return (
    <label className="flex items-center gap-1 text-gray-400">
      <input
        checked={isFixedPathSteps}
        onChange={(event) => {
          setIsFixedPathStepsAll(event.target.checked)
        }}
        type="checkbox"
      />
      固定(全員):
      <input
        className="w-12 rounded border border-solid border-gray-300 px-1 disabled:opacity-50"
        disabled={!isFixedPathSteps}
        min={1}
        onChange={(event) => {
          setFixedPathStepsAll(Number(event.target.value))
        }}
        type="number"
        value={fixedPathSteps}
      />
    </label>
  )
}
