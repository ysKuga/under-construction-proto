import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { cn } from '@/utils/cn'

import { useCssToggle } from './use-css-toggle'

/** 対象ボックス共通の見た目 + 遷移の演出 */
const boxClassName =
  'grid h-16 w-24 place-items-center rounded text-sm text-white transition-all duration-300 ease-out'

/**
 * useCssToggle を 1 つ使う最小デモ
 *
 * - トグルボタンで対象の表示/非表示を切り替える
 * - checkbox と対象をこのコンポーネント内の別 parent へ閉じ込める
 */
const ToggleItem = ({ color, label }: { color: string; label: string }) => {
  const { checkbox, toggle, toggledClassName } = useCssToggle()

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        className="rounded border border-gray-300 px-3 py-1 text-sm"
        onClick={toggle}
        type="button"
      >
        toggle {label}
      </button>
      <div className="relative h-16 w-24">
        {checkbox}
        <div className={cn(toggledClassName, boxClassName, color)}>{label}</div>
      </div>
    </div>
  )
}

const meta: Meta<typeof ToggleItem> = {
  component: ToggleItem,
}

export default meta
type Story = StoryObj<typeof ToggleItem>

/**
 * 各 useCssToggle をコンポーネント単位で分離配置
 *
 * - checkbox と対象がインスタンスごとに別 parent → 兄弟セレクターが他へ波及しない
 * - A / B / C はそれぞれ独立して切り替わる
 */
export const Separate: Story = {
  render: () => (
    <div className="flex gap-6">
      <ToggleItem color="bg-emerald-500" label="A" />
      <ToggleItem color="bg-sky-500" label="B" />
      <ToggleItem color="bg-violet-500" label="C" />
    </div>
  ),
}

/** checkbox の checked 状態（readout 用に story 側でミラーする） */
type CheckedState = { A: boolean; B: boolean; C: boolean }

/**
 * checkbox と対象を同一 parent の同列へ平置き
 *
 * - `.css.ts` の `checkbox` / `toggled` クラスは全インスタンス共通ハッシュ →\
 *   `checkbox:checked ~ .toggled` が「checked な checkbox より後方の toggled すべて」にマッチする
 * - `~` は「直後」でなく「後方の兄弟すべて」。toggle A を on にすると B / C も表示され、\
 *   その後 toggle B を押しても A の波及で表示済のため見た目は変わらない
 * - hook は state を持たないため、下部の readout は story 側の `useState` で別途ミラーする
 */
const SharedScopeRow = () => {
  const a = useCssToggle()
  const b = useCssToggle()
  const c = useCssToggle()

  const [checked, setChecked] = useState<CheckedState>({
    A: false,
    B: false,
    C: false,
  })

  const handleToggle = (key: keyof CheckedState, toggle: () => void) => () => {
    toggle()
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  // cascade: 各ボックスは「自分より前（自分含む）に checked な checkbox が 1 つでもあれば」表示
  const visible: CheckedState = {
    A: checked.A,
    B: checked.A || checked.B,
    C: checked.A || checked.B || checked.C,
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <button
          className="rounded border border-gray-300 px-3 py-1 text-sm"
          onClick={handleToggle('A', a.toggle)}
          type="button"
        >
          toggle A
        </button>
        <button
          className="rounded border border-gray-300 px-3 py-1 text-sm"
          onClick={handleToggle('B', b.toggle)}
          type="button"
        >
          toggle B
        </button>
        <button
          className="rounded border border-gray-300 px-3 py-1 text-sm"
          onClick={handleToggle('C', c.toggle)}
          type="button"
        >
          toggle C
        </button>
      </div>
      <div className="flex h-16 gap-4">
        {a.checkbox}
        <div className={cn(a.toggledClassName, boxClassName, 'bg-emerald-500')}>
          A
        </div>
        {b.checkbox}
        <div className={cn(b.toggledClassName, boxClassName, 'bg-sky-500')}>
          B
        </div>
        {c.checkbox}
        <div className={cn(c.toggledClassName, boxClassName, 'bg-violet-500')}>
          C
        </div>
      </div>
      <div className="grid grid-cols-[10rem_1fr] gap-y-1 font-mono text-xs text-gray-700">
        <span>checkbox checked</span>
        <span>
          A={String(checked.A)} B={String(checked.B)} C={String(checked.C)}
        </span>
        <span>box visible（波及後）</span>
        <span>
          A={String(visible.A)} B={String(visible.B)} C={String(visible.C)}
        </span>
      </div>
    </div>
  )
}

export const SharedScope: Story = {
  render: () => <SharedScopeRow />,
}
