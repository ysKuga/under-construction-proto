module.exports = {
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
}
