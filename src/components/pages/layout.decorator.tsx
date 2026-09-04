import { Decorator } from '@storybook/nextjs-vite'

import PagesLayout from './layout'

/**
 * layoutDecorator — Storybook で `PagesLayout`(providers + `<main>`)を適用する decorator
 *
 * - `<html>`/`<body>` は Storybook 側が持つため `layouts/_base` は使わない
 * - ページ相当の story(`pages/` 配下)の meta へ個別に設定する
 */
export const layoutDecorator: Decorator = (Story) => (
  <PagesLayout>
    <Story />
  </PagesLayout>
)
