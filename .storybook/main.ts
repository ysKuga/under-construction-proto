import type { StorybookConfig } from '@storybook/nextjs-vite'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'

const config: StorybookConfig = {
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
  ],

  framework: '@storybook/nextjs-vite',
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],

  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },

  viteFinal(viteConfig) {
    viteConfig.plugins = viteConfig.plugins ?? []
    viteConfig.plugins.push(vanillaExtractPlugin())
    return viteConfig
  },
}

export default config
