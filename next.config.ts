// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 既存の images 設定はそのまま
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ibbpevlqkdqhlerlwbbr.supabase.co', // あなたのSupabaseプロジェクトのホスト名
        port: '', // 通常は空でOK
        pathname: '/storage/v1/object/public/portfolio-thumbnails/**', // バケット名以下のパスを許可
      },
      // 他にも許可したい外部ドメインがあれば、ここに追加できます
      // {
      //   protocol: 'https',
      //   hostname: 'example.com',
      // },
    ],
  },

  // SVGR の設定をここに追加
  webpack(config: any) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
};
export default nextConfig;  
