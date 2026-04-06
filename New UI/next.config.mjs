/** @type {import('next').NextConfig} */
/**
 * Render / public web: use "/" so `/_next` assets resolve on every route.
 * Capacitor: run `npm run build` without NEXT_ASSET_PREFIX → production uses "./".
 */
function assetPrefix() {
  if (process.env.NEXT_ASSET_PREFIX !== undefined) {
    return process.env.NEXT_ASSET_PREFIX
  }
  return process.env.NODE_ENV === 'production' ? './' : ''
}

const nextConfig = {
  output: 'export',
  assetPrefix: assetPrefix(),
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig