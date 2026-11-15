import type { NextConfig } from 'next';
const config: NextConfig = { output: 'export', basePath: process.env.NEXT_PUBLIC_BASE_PATH || '', distDir: process.env.PORTFOLIO_LOCAL_ADMIN === '1' ? '.next-admin' : '.next', trailingSlash: true, images: { unoptimized: true } };
export default config;