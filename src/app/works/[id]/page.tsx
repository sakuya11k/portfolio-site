// src/app/portfolio/[id]/page.tsx
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation"; // 404ページ表示用
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// アイコンライブラリ (例: lucide-react)
import { ExternalLink, Github } from 'lucide-react';

// ポートフォリオアイテムの型定義 (入力フォームと共通化しても良い)
interface PortfolioDetail {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  technologies: string[] | null;
  demo_url: string | null;
  github_url: string | null;
  is_published: boolean; // 公開判定に使う
  category: string | null;
  roles_responsible: string[] | null;
  // 必要に応じて他のフィールドも追加 (例: client_name, project_period など)
  created_at: string; // 日付表示など
}

// データを取得する非同期関数 (サーバーコンポーネントで直接async/awaitを使う)
async function getPortfolioItem(id: string): Promise<PortfolioDetail | null> {
  const { data, error } = await supabase
    .from("portfolios")
    .select("*") // 詳細ページなので全カラム取得
    .eq("id", id)
    .eq("is_published", true) // 公開されているもののみ表示
    .single(); // IDで1件取得

  if (error) {
    console.error("Error fetching portfolio item:", error);
    // 開発中はエラーをコンソールに出力し、本番ではロギングサービスへ
    return null;
  }
  if (!data) {
    return null;
  }
  return data as PortfolioDetail; // 型アサーション
}

// ページコンポーネント
export default async function PortfolioDetailPage({ params }: { params: { id: string } }) {
  const portfolioItem = await getPortfolioItem(params.id);

  if (!portfolioItem) {
    notFound(); // データが見つからない、または非公開なら404ページを表示
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      {/* 1. ヒーローセクション */}
      <header className="mb-12">
        {portfolioItem.thumbnail_url && (
          <div className="relative w-full aspect-[16/9] mb-6 rounded-lg overflow-hidden shadow-lg">
            <Image
              src={portfolioItem.thumbnail_url}
              alt={`${portfolioItem.title} thumbnail`}
              fill // 親要素いっぱいに広がる
              style={{ objectFit: "cover" }} // アスペクト比を保ちつつカバー
              priority // LCPになる可能性が高いので優先読み込み
            />
          </div>
        )}
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white mb-2">
          {portfolioItem.title}
        </h1>
        {portfolioItem.category && (
          <Badge variant="secondary" className="text-md">
            {portfolioItem.category}
          </Badge>
        )}
      </header>

      {/* 2. プロジェクト概要 & リンク */}
      <section className="mb-12 prose prose-slate dark:prose-invert max-w-none lg:prose-lg">
        {/* proseクラスでTailwind Typographyを適用 (Markdown表示などに便利) */}
        {portfolioItem.description ? (
          // MarkdownをHTMLに変換して表示する場合は、react-markdownなどのライブラリを使う
          // ここでは単純にテキストとして表示
          <p className="text-lg leading-relaxed whitespace-pre-wrap">
            {portfolioItem.description}
          </p>
        ) : (
          <p className="text-slate-500 dark:text-slate-400">このプロジェクトの詳細な説明はありません。</p>
        )}

        <div className="mt-8 flex flex-wrap gap-4">
          {portfolioItem.demo_url && (
            <Button asChild>
              <Link href={portfolioItem.demo_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                デモサイトを見る
              </Link>
            </Button>
          )}
          {portfolioItem.github_url && (
            <Button variant="outline" asChild>
              <Link href={portfolioItem.github_url} target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-4 w-4" />
                GitHubリポジトリ
              </Link>
            </Button>
          )}
        </div>
      </section>

      {/* 3. 技術スタック & 役割 */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {portfolioItem.technologies && portfolioItem.technologies.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-4">
              使用技術
            </h2>
            <div className="flex flex-wrap gap-2">
              {portfolioItem.technologies.map((tech) => (
                <Badge key={tech} variant="outline">{tech}</Badge>
              ))}
            </div>
          </section>
        )}

        {portfolioItem.roles_responsible && portfolioItem.roles_responsible.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-4">
              担当した役割
            </h2>
            <div className="flex flex-wrap gap-2">
              {portfolioItem.roles_responsible.map((role) => (
                <Badge key={role} variant="outline">{role}</Badge>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* 6. 他の実績への導線など */}
      <section className="text-center mt-16">
        <Button asChild variant="secondary">
          <Link href="/#portfolio">制作実績一覧へ戻る</Link>
        </Button>
      </section>
    </div>
  );
}

// (任意) generateStaticParams: ビルド時に静的ページを生成する場合
export async function generateStaticParams() {
  const { data: portfolios, error } = await supabase
    .from("portfolios")
    .select("id")
    .eq("is_published", true); // 公開されているものだけ

  if (error || !portfolios) {
    return [];
  }

  return portfolios.map((portfolio) => ({
    id: portfolio.id.toString(),
  }));
}