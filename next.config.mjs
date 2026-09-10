import { withSerwist } from '@serwist/turbopack'
import { createVanillaExtractPlugin } from '@vanilla-extract/next-plugin'

// Next.js 16 + Turbopack。mode: 'auto' で Next16 以上のとき Turbopack 連携を有効化
const withVanillaExtract = createVanillaExtractPlugin({
  unstable_turbopack: { mode: 'auto' },
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

export default withSerwist(withVanillaExtract(nextConfig))
