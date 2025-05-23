// src/app/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

// --- lucide-react からアイコンをインポート ---
import {
  FileCode, Paintbrush, Brain, Type, Atom, Network, Cog, DatabaseZap, Server, Zap, Star, TrendingUp,
  MonitorSmartphone, AppWindow, Settings2, Lightbulb, Gauge, Palette, ShieldCheck
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// --- ここまでアイコンのインポート ---

// ★ カルーセルコンポーネントをインポート
import { CommitmentCarousel } from '@/components/ui/CommitmentCarousel';


interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  category: string | null;
}

interface TechStackItemProps {
  name: string;
  LucideIconComponent: LucideIcon;
}
const TechStackItem: React.FC<TechStackItemProps> = ({ name, LucideIconComponent }) => {
  return (
    <div className="flex flex-col items-center p-4 border rounded-lg shadow-sm bg-slate-50 dark:bg-slate-800 hover:shadow-md transition-shadow">
      <div className="w-10 h-10 mb-3 flex items-center justify-center text-sky-600 dark:text-sky-400">
        <LucideIconComponent size={32} strokeWidth={1.5} />
      </div>
      <span className="font-medium text-slate-700 dark:text-slate-300 text-center">{name}</span>
    </div>
  );
};

interface ServiceItemProps {
  title: string;
  description: string;
  LucideIconComponent?: LucideIcon;
}
const ServiceItem: React.FC<ServiceItemProps> = ({ title, description, LucideIconComponent }) => {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center space-x-4 pb-2">
        {LucideIconComponent && (
          <div className="p-2 bg-sky-100 dark:bg-sky-800 rounded-md">
            <LucideIconComponent className="w-6 h-6 text-sky-600 dark:text-sky-400" />
          </div>
        )}
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-slate-600 dark:text-slate-400">{description}</p>
      </CardContent>
    </Card>
  );
};


export default function HomePage() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublishedPortfolios = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: supabaseError } = await supabase
          .from("portfolios")
          .select("id, title, description, thumbnail_url, category")
          .eq("is_published", true)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: false })
          .limit(3);

        if (supabaseError) throw supabaseError;
        setPortfolioItems(data || []);
      } catch (err: any) {
        console.error("Error fetching published portfolios:", err);
        setError(err.message || "Failed to fetch portfolios.");
      } finally {
        setLoading(false);
      }
    };
    fetchPublishedPortfolios();
  }, []);

  // カルーセルに渡すこだわりポイントのデータ
  const commitmentItemsData: { id: number; title: string; description: string; IconComponent: LucideIcon }[] = [
    {
      id: 1,
      title: "パフォーマンスとUX",
      description: "Next.jsの最適化機能を最大限に活かし、サイト全体の軽快な動作と快適なユーザー体験の実現を目指しました。もちろん、レスポンシブデザインにも配慮し、どのデバイスからでも見やすいサイトを心がけています。",
      IconComponent: Gauge, // lucide-reactのGaugeアイコン (前回提案から)
    },
    {
      id: 2,
      title: "デザインの一貫性と開発効率",
      description: "UIコンポーネントライブラリ shadcn/ui とユーティリティファーストな Tailwind CSS を組み合わせることで、サイト全体でデザインの一貫性を保ちつつ、迅速なUI開発を実現しました。これにより、見た目の美しさと開発スピードを両立させています。",
      IconComponent: Palette, // lucide-reactのPaletteアイコン (前回提案から)
    },
    {
      id: 3,
      title: "動的なコンテンツ管理",
      description: "ポートフォリオの実績を柔軟に追加・編集できるよう、認証機能を備えた管理画面をSupabaseを活用して構築しました。これにより、常に最新の情報をサイトに反映できる動的なシステムを実現しています。",
      IconComponent: DatabaseZap, // lucide-reactのDatabaseZapアイコン (前回提案から)
    },
    {
      id: 4,
      title: "コード品質への追求",
      description: "TypeScriptによる型付けを徹底することで、開発段階でのエラーを抑制し、コードの堅牢性を高めました。また、意味のあるコンポーネント分割や適切な命名規則を意識し、将来的なメンテナンスや機能追加が容易な、可読性と保守性の高いコードベースを目指しました。",
      IconComponent: ShieldCheck, // lucide-reactのShieldCheckアイコン (前回提案から)
    },
  ];

  return (
    <>
      {/* ===== Hero Section ===== */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-700 text-white py-20 md:py-32">
         <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            ビジネスへの深い理解で、<br />期待を超えるプロダクトを。
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-3xl mx-auto">
            技術力はもちろん、ビジネスの目標達成を最優先に考えます。新規事業立ち上げやプロダクトマネージャーの経験から得た深いビジネスへの理解で、開発委託時に起こりがちな認識の齟齬や追加コストのリスクを徹底的に排除。あなたの期待を超える価値を提供し、Win-Winの関係を築きます。
          </p>
          <div className="space-x-4">
            <Link href="#portfolio">
              <Button size="lg" variant="secondary" className="transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
                制作実績を見る
              </Button>
            </Link>
            <Link href="#contact">
              <Button size="lg" variant="secondary" className="transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
                お問い合わせ
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Portfolio Section (公開側) ===== */}
      <section id="portfolio" className="py-16 md:py-24 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-slate-800 dark:text-white">
            制作実績
          </h2>
          {loading && <p className="text-center text-slate-600 dark:text-slate-400">Loading projects...</p>}
          {error && <p className="text-center text-red-500">Error: {error}</p>}
          {!loading && !error && portfolioItems.length === 0 && (
            <p className="text-center text-slate-600 dark:text-slate-400">実績は現在準備中です。</p>
          )}
          {!loading && !error && portfolioItems.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {portfolioItems.map((item) => (
                <Card key={item.id} className="flex flex-col overflow-hidden group">
                  <CardHeader className="p-0">
                    {item.thumbnail_url ? (
                      <div className="aspect-video overflow-hidden">
                        <Image src={item.thumbnail_url} alt={item.title || "Portfolio thumbnail"} width={600} height={338} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300 ease-in-out"/>
                      </div>
                    ) : (
                      <div className="aspect-video bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        <span className="text-slate-400 dark:text-slate-500">No Image</span>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="pt-4 flex-grow">
                    {item.category && (<p className="text-sm text-sky-600 dark:text-sky-400 mb-1 font-medium">{item.category}</p>)}
                    <CardTitle className="text-xl font-semibold mb-2 text-slate-800 dark:text-white">
                      <Link href={`/works/${item.id}`} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">{item.title}</Link>
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3">{item.description || "詳細はこちらをご覧ください。"}</CardDescription>
                  </CardContent>
                  <CardFooter className="pt-4">
                    <Button variant="link" className="p-0 h-auto text-sky-600 dark:text-sky-400" asChild>
                      <Link href={`/works/${item.id}`}>詳細を見る →</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          {!loading && !error && portfolioItems.length > 0 && (
             <div className="text-center mt-12">
               <Button variant="outline" asChild><Link href="/works">すべての実績を見る</Link></Button>
             </div>
          )}
        </div>
      </section>

      {/* ===== About Me Section (写真なしバージョン) ===== */}
      <section id="about" className="py-16 md:py-24 bg-slate-50 dark:bg-slate-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-slate-800 dark:text-white">
            私について (About Me)
          </h2>
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-semibold text-center text-slate-700 dark:text-slate-200 mb-6">
              楓 (Kaede) - ビジネスを成功に導く、プロダクト開発パートナー
            </h3>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-6 leading-relaxed text-center md:text-left">
              アイデアが具体的な形になる瞬間に強い魅力を感じ、Web開発の世界へ。特にAI技術の可能性に惹かれ、これを活用することで、より速く、より本質的な価値を提供できると確信しています。このポートフォリオサイトも、モダン技術とAIのサポートを組み合わせ、私自身の手で構築しました。
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-6 leading-relaxed text-center md:text-left">
              私の強みは、単に開発を行うだけではありません。ビジネスサイドへの深い理解と、自身が新規事業を立ち上げた経験を活かし、プロジェクトを成功へと導きます。これにより、特にベンチャー企業様などで外部に開発を委託した際に発生しがちな『期待とのズレ』や『想定外のコスト・工数増』といった問題を未然に防ぎ、技術とビジネス、双方の視点から最適なソリューションをご提案します。
            </p>
            <div className="mt-8">
              <h4 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-3 text-center md:text-left">
                大切にしていること / スキルハイライト
              </h4>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 text-lg md:text-left marker:text-sky-500 dark:marker:text-sky-400">
                <li>Win-Winの関係構築: クライアントやチームと対等なパートナーとして、共に成功を目指すことを最も大切にしています。</li>
                <li>ビジネス視点の開発: 技術は目的達成の手段。常にビジネスゴールを意識し、成果に繋がるプロダクト開発を追求します。</li>
                <li>AI活用の推進: AI技術を積極的に取り入れ、開発効率の向上はもちろん、新しい価値創造の可能性を探求します。</li>
                <li>迅速な具現化力: アイデアを素早くプロトタイプにし、検証を繰り返しながら、市場のニーズに合ったプロダクトへと磨き上げます。</li>
                <li>透明性の高いコミュニケーション: 認識の齟齬を防ぎ、スムーズなプロジェクト進行のために、明確でオープンなコミュニケーションを心がけます。</li>
              </ul>
            </div>
            <div className="mt-10 flex justify-center space-x-4">
              <Link href="https://x.com/EnSakya81360" target="_blank" rel="noopener noreferrer" aria-label="X (旧Twitter) プロフィール"> {/* ★ Xユーザー名を反映 */}
                <Button variant="outline" size="icon" className="rounded-full transition-colors hover:bg-accent hover:text-accent-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </Button>
              </Link>
              <Link href="https://www.threads.net/@sssayurh" target="_blank" rel="noopener noreferrer" aria-label="Threads プロフィール"> {/* ★ Threadsユーザー名を反映 */}
                <Button variant="outline" size="icon" className="rounded-full transition-colors hover:bg-accent hover:text-accent-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10c.63 0 1.246-.062 1.842-.181l.093-.02.002.002c.01 0 .019-.002.03-.002.532-.105 1.033-.27 1.502-.482l.007-.003.003.001c.008-.003.016-.007.024-.01.42-.187.818-.418 1.19-.685l.004-.003.002.001c.004-.003.008-.006.012-.009.326-.23.63-.49.91-.776l.004-.004.001.002c.002-.003.004-.005.006-.008.242-.245.467-.51.67-.79l.004-.005.002.002c.002-.003.003-.005.005-.008.17-.238.328-.487.47-.746l.003-.005.002.002c.001-.003.002-.005.003-.007.118-.22.224-.446.318-.678l.003-.005c.001-.002.001-.003.002-.005.075-.19.142-.383.2-.578l.002-.005c.001-.002.001-.002.001-.004.042-.15.077-.3.105-.45l.001-.003c.001-.002.001-.002.001-.003.021-.116.036-.23.048-.345l.001-.003c.008-.102.012-.2.012-.3 0-.01 0-.02.002-.03.002-.02.002-.03.002-.05v-.02c0-.016.002-.03.002-.048l.001-.01c0-.01 0-.01.001-.02 0-.02.001-.04.001-.06 0-.63-.062-1.246-.181-1.842L21.8 10.1c.002-.01.002-.019.002-.03.105-.532.27-1.033.482-1.502l.003-.007.001.003c.003-.008.007-.016.01-.024.187-.42.418-.818.685-1.19l.003-.004.001.002c.003-.004.006-.008.009-.012.23-.326.49-.63.776-.91l.004-.004c.003-.002.005-.004.008-.006.245-.242.51-.467.79-.67l.005-.004c.003-.002.005-.003.008-.005.238-.17.487-.328.746-.47l.005-.003c.003-.001.005-.002.007-.003.22-.118.446-.224.678-.318l.005-.003c.002-.001.003-.001.005-.002.19-.075.383-.142.578-.2l.005-.002c.002-.001.002-.001.004-.001.15-.042.3-.077.45-.105l.003-.001c.002-.001.002-.001.003-.001.116-.021.23-.036.345-.048l.003-.001c.102-.008.2-.012.3-.012.01 0 .02 0 .03-.002.02-.002.03-.002.05-.002h.02c.016 0 .03-.002.048-.002l.01 0c.01 0 .01 0 .02-.001.02 0 .04-.001.06-.001C17.523 2.062 16.91 2 16.28 2 10.757 2 6.28 6.477 6.28 12S10.757 22 16.28 22c5.523 0 10-4.477 10-10 0-.63-.062-1.246-.181-1.842a9.98 9.98 0 0 0-1.819-4.682A9.98 9.98 0 0 0 16.28 2zm-4.278 14.89c-.818.49-1.745.76-2.722.76-2.37 0-4.308-1.81-4.308-4.04s1.938-4.04 4.308-4.04c.977 0 1.904.27 2.722.76V7.72H9.998v8.56h2.004v-2.99c0-.78.63-1.41 1.41-1.41.78 0 1.41.63 1.41 1.41v2.99h2.004V9.51c.818-.49 1.745-.76 2.722-.76 2.37 0 4.308 1.81 4.308 4.04s-1.938 4.04-4.308 4.04c-.977 0-1.904-.27-2.722-.76v1.61z"/></svg>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Tech Stack Section (lucide-react アイコン使用 - 被り回避) ===== */}
      <section id="tech-stack" className="py-16 md:py-24 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-slate-800 dark:text-white">
            技術スタック (My Tech Stack)
          </h2>
          {/* フロントエンド */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-6 text-center md:text-left">
              フロントエンド
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              <TechStackItem name="HTML5" LucideIconComponent={FileCode} />
              <TechStackItem name="Tailwind CSS" LucideIconComponent={Paintbrush} />
              <TechStackItem name="JavaScript" LucideIconComponent={Brain} />
              <TechStackItem name="TypeScript" LucideIconComponent={Type} />
              <TechStackItem name="React" LucideIconComponent={Atom} />
              <TechStackItem name="Next.js" LucideIconComponent={Network} />
            </div>
          </div>
          {/* バックエンド / BaaS */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-6 text-center md:text-left">
              バックエンド / BaaS
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              <TechStackItem name="Node.js" LucideIconComponent={Cog} />
              <TechStackItem name="Supabase" LucideIconComponent={DatabaseZap} />
            </div>
          </div>
          {/* インフラ・デプロイ */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-6 text-center md:text-left">
              インフラ / デプロイ / サーバーレス
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              <TechStackItem name="Vercel" LucideIconComponent={Server} />
              <TechStackItem name="AWS Lambda" LucideIconComponent={Zap} />
            </div>
          </div>
          {/* 強調したい技術 */}
          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-semibold text-sky-600 dark:text-sky-400 mb-3 text-center md:text-left">
                  <Star className="inline-block w-6 h-6 mr-2 align-text-bottom" />
                  特に得意とする技術
                </h4>
                <p className="text-lg text-slate-600 dark:text-slate-300 text-center md:text-left">
                  React (Next.js を含む) を中心としたフロントエンド開発を得意としており、
                  インタラクティブで使いやすいUIの構築に自信があります。
                  TypeScript を用いた型安全な開発を推進しています。
                </p>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-amber-600 dark:text-amber-400 mb-3 text-center md:text-left">
                  <TrendingUp className="inline-block w-6 h-6 mr-2 align-text-bottom" />
                  今後挑戦したい・勉強中技術
                </h4>
                <p className="text-lg text-slate-600 dark:text-slate-300 text-center md:text-left">
                  AWS Lambda をはじめとする AWS のサーバーレス技術を活用した、よりスケーラブルなバックエンド・インフラ構築に挑戦していきたいと考えています。
                  コンテナ技術などにも積極的に取り組んでいく予定です。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Services Section ===== */}
      <section id="services" className="py-16 md:py-24 bg-slate-50 dark:bg-slate-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-slate-800 dark:text-white">
            提供サービス (Services)
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ServiceItem
              title="Webサイト・LP制作"
              description="魅力的で成果の出るランディングページや、情報発信のためのウェブサイトを制作します。レスポンシブデザインに対応し、あらゆるデバイスで最適に表示されます。"
              LucideIconComponent={MonitorSmartphone}
            />
            <ServiceItem
              title="Webアプリケーション開発"
              description="React, Next.js, Supabaseなどを活用し、インタラクティブなWebアプリケーションを開発します。アイデアを形にし、ユーザーに価値を提供します。"
              LucideIconComponent={AppWindow}
            />
            <ServiceItem
              title="業務効率化ツール開発"
              description="日常の繰り返し作業や煩雑な業務を自動化・効率化するためのカスタムツールを開発します。あなたのビジネスをサポートします。"
              LucideIconComponent={Settings2}
            />
            <ServiceItem
              title="新規事業立ち上げ支援"
              description="ビジネスサイドの深い理解に基づき、アイデア創出からプロダクト戦略、開発、グロースまで、新規事業の立ち上げをプロダクトマネージャーとして一気通貫でサポートします。"
              LucideIconComponent={Lightbulb}
            />
          </div>
          <div className="mt-12 text-center">
            <p className="text-lg text-slate-600 dark:text-slate-400">
              上記の開発サービスに加え、プロダクトマネジメントや新規事業の構想段階からのご相談も歓迎します。
              まずはお気軽にお問い合わせください。
            </p>
          </div>
        </div>
      </section>

      {/* ===== このサイトについて (技術スタックとこだわり) Section ===== */}
      <section id="site-tech" className="py-16 md:py-24 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-slate-800 dark:text-white">
            このサイトについて <span className="block md:inline text-2xl md:text-3xl text-sky-600 dark:text-sky-400">(技術スタックとこだわり)</span>
          </h2>
          <div className="max-w-3xl mx-auto space-y-10">
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              このポートフォリオサイトは、私自身のスキルと経験を示すための制作実績の一つとして、モダンな技術スタックを積極的に採用し構築しました。
              ご覧いただいている皆様に、私の技術力や開発に対する姿勢を感じていただければ幸いです。
            </p>

            <div>
              <h3 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-4 text-center md:text-left">
                主な使用技術
              </h3>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 text-lg marker:text-sky-500 dark:marker:text-sky-400">
                <li><strong>Next.js (App Router):</strong> 最新のReactフレームワークを活用し、パフォーマンスと開発者体験を両立。</li>
                <li><strong>TypeScript:</strong> 型安全性を高め、堅牢なコードベースを実現。</li>
                <li><strong>Tailwind CSS:</strong> ユーティリティファーストなCSSフレームワークで、迅速かつ柔軟なスタイリング。</li>
                <li><strong>shadcn/ui:</strong> アクセシビリティとカスタマイズ性に優れたUIコンポーネントライブラリ。</li>
                <li><strong>Supabase:</strong> ポートフォリオデータの管理（データベース、ストレージ）に利用。</li>
                <li><strong>Vercel:</strong> Next.jsとの親和性が高く、手軽かつ高機能なデプロイプラットフォーム。</li>
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-8 text-center md:text-left">
                サイト構築のこだわり
              </h3>
              <CommitmentCarousel slides={commitmentItemsData} options={{ slidesToScroll: 1, loop: false }} />
            </div>
          </div>
        </div>
      </section>

      {/* ===== Contact Section (Formspree対応) ===== */}
      <section id="contact" className="py-16 md:py-24 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-slate-800 dark:text-white">
            お問い合わせ (Contact)
          </h2>
          <div className="max-w-xl mx-auto">
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 text-center">
              ご依頼、ご相談、その他メッセージがございましたら、下記フォームよりお気軽にご連絡ください。
              <br />
              通常1〜2営業日以内に返信いたします。
            </p>
            <form
              action="https://formspree.io/f/meogdwvl"
              method="POST"
              className="space-y-6"
            >
              <div>
                <Label htmlFor="contact-name" className="text-slate-700 dark:text-slate-300">お名前 <span className="text-red-500">*</span></Label>
                <Input type="text" id="contact-name" name="name" required className="mt-1" placeholder="山田 太郎"/>
              </div>
              <div>
                <Label htmlFor="contact-email" className="text-slate-700 dark:text-slate-300">メールアドレス (返信先) <span className="text-red-500">*</span></Label>
                <Input type="email" id="contact-email" name="_replyto" required className="mt-1" placeholder="your-email@example.com"/>
              </div>
              <div>
                <Label htmlFor="contact-subject" className="text-slate-700 dark:text-slate-300">件名</Label>
                <Input type="text" id="contact-subject" name="_subject" className="mt-1" placeholder="ポートフォリオサイトからのお問い合わせ"/>
              </div>
              <div>
                <Label htmlFor="contact-message" className="text-slate-700 dark:text-slate-300">お問い合わせ内容 <span className="text-red-500">*</span></Label>
                <Textarea id="contact-message" name="message" rows={6} required className="mt-1" placeholder="お問い合わせ内容をご記入ください..."/>
              </div>
              <input type="text" name="_gotcha" style={{ display: 'none' }} />
              <div className="text-center">
                <Button type="submit" size="lg" className="w-full md:w-auto">
                  メッセージを送信する
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}