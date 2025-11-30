/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}
module.exports = {
  images: {
    domains: ["logo.clearbit.com"],
  },
};
export default nextConfig
