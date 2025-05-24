// src/app/works/[id]/page.tsx
import { supabase } from "@/lib/supabaseClient"; // Supabaseクライアント
import Image from "next/image";                  // Next.js Imageコンポーネント
import Link from "next/link";                    // Next.js Linkコンポーネント
import { notFound } from "next/navigation";      // 404ページ表示用
import { Badge } from "@/components/ui/badge";   // shadcn/ui Badgeコンポーネント
import { Button } from "@/components/ui/button"; // shadcn/ui Buttonコンポーネント
import { ExternalLink, Github, ArrowLeft } from 'lucide-react'; // アイコン

// ポートフォリオアイテムの詳細データの型定義
// (管理画面の PortfolioDatabaseItem と項目を合わせるか、公開用に別途定義)
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
  is_published: boolean; // 念のため公開判定にも使える
  created_at: string;
  updated_at: string | null;
  // 管理画面で追加した他の項目もここに追加
  // project_period?: string | null;
  // client_name?: string | null;
  // project_background?: string | null;
  // challenges_faced?: string | null;
  // solutions_provided?: string | null;
  // results_achieved?: string | null;
}

// データを非同期に取得する関数
async function getPublishedPortfolioItem(id: string): Promise<PortfolioWorkDetail | null> {
  const { data, error } = await supabase
    .from("portfolios") // Supabaseのテーブル名
    .select("*")        // 詳細なので全カラム取得
    .eq("id", id)
    .eq("is_published", true) // 公開されているもののみ
    .single<PortfolioWorkDetail>(); // 型を指定して1件取得

  if (error) {
    console.error(`Error fetching portfolio item (ID: ${id}):`, error.message);
    return null; // エラー時はnullを返す
  }
  if (!data) {
    return null; // データがない場合もnullを返す
  }
  return data;
}

// ページコンポーネント (サーバーコンポーネント)
export default async function PortfolioWorkDetailPage({ params }: { params: { id: string } }) {
  const portfolioItem = await getPublishedPortfolioItem(params.id);

  if (!portfolioItem) {
    notFound(); // データが見つからない、または非公開なら404ページを表示
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="container mx-auto px-4 py-8 md:py-16 max-w-4xl"> {/* コンテンツ幅を少し広げる */}
        {/* 戻るボタン */}
        <div className="mb-8">
          <Link href="/works" className="inline-flex items-center text-sky-600 dark:text-sky-400 hover:underline">
            <ArrowLeft className="mr-2 h-5 w-5" />
            実績一覧へ戻る
          </Link>
        </div>

        {/* 1. ヒーローセクション (タイトルとメイン画像) */}
        <header className="mb-10 md:mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-800 dark:text-slate-50 mb-4 leading-tight">
            {portfolioItem.title}
          </h1>
          <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
            {portfolioItem.category && (
              <Badge variant="outline" className="text-base px-3 py-1">{portfolioItem.category}</Badge>
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
                alt={`${portfolioItem.title} メイン画像`}
                fill
                style={{ objectFit: "cover" }}
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // sizes属性の例
              />
            </div>
          )}
        </header>

        {/* 2. プロジェクト概要 */}
        {portfolioItem.description && (
          <section className="mb-10 md:mb-12 prose prose-lg dark:prose-invert max-w-none">
             {/* prose-slate を削除し、カスタムスタイルを適用しやすくする or prose-lg などで調整 */}
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-700 dark:text-slate-200 mb-4 border-b pb-2">
              プロジェクト概要
            </h2>
            <div className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {/* もしMarkdownで保存しているなら、react-markdownなどを使う */}
              {portfolioItem.description.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p> // 改行を<p>タグに変換する簡単な例
              ))}
            </div>
          </section>
        )}

        {/* (オプション) プロジェクトの背景、課題、解決策、成果など (管理画面で入力項目を追加した場合) */}
        {/*
        {portfolioItem.project_background && (
          <section className="mb-10 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-700 dark:text-slate-200 mb-4 border-b pb-2">背景と目的</h2>
            <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{portfolioItem.project_background}</p>
          </section>
        )}
        */}

        {/* 3. 使用技術 & 担当役割 */}
        <section className="mb-10 md:mb-12">
          <div className="grid md:grid-cols-2 gap-8">
            {portfolioItem.technologies && portfolioItem.technologies.length > 0 && (
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-slate-700 dark:text-slate-200 mb-4 border-b pb-2">
                  使用技術
                </h2>
                <div className="flex flex-wrap gap-3">
                  {portfolioItem.technologies.map((tech) => (
                    <Badge key={tech} variant="secondary" className="px-3 py-1 text-sm">{tech}</Badge>
                  ))}
                </div>
              </div>
            )}

            {portfolioItem.roles_responsible && portfolioItem.roles_responsible.length > 0 && (
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-slate-700 dark:text-slate-200 mb-4 border-b pb-2">
                  担当した役割
                </h2>
                <div className="flex flex-wrap gap-3">
                  {portfolioItem.roles_responsible.map((role) => (
                    <Badge key={role} variant="secondary" className="px-3 py-1 text-sm">{role}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 4. 関連リンク */}
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

        {/* 5. トップページへの導線 */}
        <section className="text-center pt-8 mt-12 border-t border-slate-200 dark:border-slate-700">
          <Button asChild variant="link" className="text-lg">
            <Link href="/">トップページへ戻る</Link>
          </Button>
        </section>
      </div>
    </div>
  );
}

// (任意) generateStaticParams: ビルド時に静的ページを生成する場合
export async function generateStaticParams() {
  const { data: portfolios, error } = await supabase
    .from("portfolios")
    .select("id")
    .eq("is_published", true);

  if (error || !portfolios) {
    return [];
  }

  return portfolios.map((portfolio) => ({
    id: portfolio.id.toString(),
  }));
}