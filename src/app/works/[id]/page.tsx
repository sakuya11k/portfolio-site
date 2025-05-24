// src/app/works/[id]/page.tsx
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, ArrowLeft } from "lucide-react";

// ポートフォリオアイテムの詳細データの型定義
interface PortfolioWorkDetail {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  technologies: string[] | null;
  category: string | null;
  roles_responsible: string[] | null;
  demo_url: string | null;
  github_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string | null;
}

// 公開中のポートフォリオアイテムを取得する関数
async function getPublishedPortfolioItem(
  id: string
): Promise<PortfolioWorkDetail | null> {
  const { data, error } = await supabase
    .from("portfolios")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .single<PortfolioWorkDetail>();

  if (error || !data) {
    console.error(`ID=${id} の取得エラー:`, error?.message);
    return null;
  }
  return data;
}

// ページコンポーネント
export default async function PortfolioWorkDetailPage(
  props: { params: Promise<{ id: string }> }
) {
  // params を解決
  const { id } = await props.params;
  const portfolioItem = await getPublishedPortfolioItem(id);

  if (!portfolioItem) {
    notFound();
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="container mx-auto px-4 py-8 md:py-16 max-w-4xl">
        {/* 戻るボタン */}
        <div className="mb-8">
          <Link
            href="/works"
            className="inline-flex items-center text-sky-600 dark:text-sky-400 hover:underline"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            実績一覧へ戻る
          </Link>
        </div>

        {/* ヘッダー */}
        <header className="mb-10 md:mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-800 dark:text-slate-50 mb-4 leading-tight">
            {portfolioItem.title}
          </h1>
          <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
            {portfolioItem.category && (
              <Badge variant="outline" className="px-3 py-1">
                {portfolioItem.category}
              </Badge>
            )}
            <span>作成日: {new Date(portfolioItem.created_at).toLocaleDateString()}</span>
            {portfolioItem.updated_at && (
              <span>最終更新日: {new Date(portfolioItem.updated_at).toLocaleDateString()}</span>
            )}
          </div>

          {portfolioItem.thumbnail_url && (
            <div className="mt-8 relative w-full aspect-[16/9] rounded-xl overflow-hidden shadow-2xl">
              <Image
                src={portfolioItem.thumbnail_url}
                alt={`${portfolioItem.title} のサムネイル`}
                fill
                style={{ objectFit: "cover" }}
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          )}
        </header>

        {/* プロジェクト概要 */}
        {portfolioItem.description && (
          <section className="mb-10 md:mb-12 prose prose-lg dark:prose-invert max-w-none">
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-700 dark:text-slate-200 mb-4 border-b pb-2">
              プロジェクト概要
            </h2>
            <div className="whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300">
              {portfolioItem.description.split("\n").map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>
        )}

        {/* 使用技術と担当役割 */}
        <section className="mb-10 md:mb-12 grid md:grid-cols-2 gap-8">
          {portfolioItem.technologies?.length && (
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold text-slate-700 dark:text-slate-200 mb-4 border-b pb-2">
                使用技術
              </h2>
              <div className="flex flex-wrap gap-3">
                {portfolioItem.technologies.map((tech) => (
                  <Badge key={tech} variant="secondary" className="px-3 py-1 text-sm">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {portfolioItem.roles_responsible?.length && (
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold text-slate-700 dark:text-slate-200 mb-4 border-b pb-2">
                担当した役割
              </h2>
              <div className="flex flex-wrap gap-3">
                {portfolioItem.roles_responsible.map((role) => (
                  <Badge key={role} variant="secondary" className="px-3 py-1 text-sm">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 関連リンク */}
        {(portfolioItem.demo_url || portfolioItem.github_url) && (
          <section className="mb-10 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-700 dark:text-slate-200 mb-4 border-b pb-2">
              関連リンク
            </h2>
            <div className="flex flex-wrap gap-4">
              {portfolioItem.demo_url && (
                <Button asChild variant="default" size="lg">
                  <Link href={portfolioItem.demo_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-5 w-5" />
                    デモサイトを見る
                  </Link>
                </Button>
              )}
              {portfolioItem.github_url && (
                <Button asChild variant="outline" size="lg">
                  <Link href={portfolioItem.github_url} target="_blank" rel="noopener noreferrer">
                    <Github className="mr-2 h-5 w-5" />
                    GitHubリポジトリ
                  </Link>
                </Button>
              )}
            </div>
          </section>
        )}

        {/* トップページへのリンク */}
        <section className="text-center pt-8 mt-12 border-t border-slate-200 dark:border-slate-700">
          <Button asChild variant="link" className="text-lg">
            <Link href="/">トップページへ戻る</Link>
          </Button>
        </section>
      </div>
    </div>
  );
}

// 静的生成用のパラメータ取得
export async function generateStaticParams() {
  const { data: portfolios, error } = await supabase
    .from("portfolios")
    .select("id")
    .eq("is_published", true);

  if (error || !portfolios) {
    return [];
  }

  return portfolios.map((p) => ({ id: p.id.toString() }));
}