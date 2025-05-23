// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

const vercelUrl = process.env.VERCEL_URL;
// ローカル開発時はポート3000をデフォルトとする
const siteUrl = vercelUrl ? `https://${vercelUrl}` : 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl), // ★ VercelのURLまたはlocalhostを基準に

  title: '楓 (Kaede) - ビジネスを成功に導くプロダクト開発パートナー',
  description: '技術力とビジネスの深い理解で、期待を超えるプロダクトを開発。新規事業立ち上げからWebアプリケーション開発、LP制作まで、楓のポートフォリオサイトです。',

  openGraph: {
    title: '楓 (Kaede) - プロダクト開発パートナー',
    description: 'ビジネスの課題解決と成功に貢献するWebサイト・アプリケーションを開発します。',
    url: '/', // metadataBaseがあるので相対パスでOK
    siteName: '楓 ポートフォリオサイト',
    locale: 'ja_JP',
    type: 'website',
    // images: [], // OGP画像は設定しない
  },

  twitter: {
    card: 'summary', // 画像がない場合は 'summary' が無難
    title: '楓 (Kaede) - プロダクト開発パートナー',
    description: 'ビジネスの課題解決と成功に貢献するWebサイト・アプリケーションを開発します。',
    creator: '@EnSakya81360', // ★ Xのユーザー名を反映
    // images: [], // Twitterカード画像も設定しない
  },

  icons: {
    icon: [
      { rel: 'icon', url: '/favicon.ico', type: 'image/x-icon' },
      { rel: 'icon', url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>{children}</body>
    </html>
  );
}