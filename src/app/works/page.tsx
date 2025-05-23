// src/app/works/page.tsx
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // Buttonもインポート

// ポートフォリオアイテムの型定義 (共通化推奨)
interface PortfolioWorkItem {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  category: string | null;
  // 必要に応じて他のフィールドも追加
}

// データを取得する非同期関数 (サーバーコンポーネント)
async function getAllPublishedWorks(): Promise<PortfolioWorkItem[]> {
  const { data, error } = await supabase
    .from("portfolios") // Supabaseのテーブル名は "portfolios"
    .select("id, title, description, thumbnail_url, category")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false }); // limitなし

  if (error) {
    console.error("Error fetching all published works:", error);
    return []; // エラー時は空配列を返す
  }
  return data || [];
}

export default async function AllWorksPage() {
  const works = await getAllPublishedWorks();

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <header className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white">
          制作実績一覧
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
          これまでに手がけたプロジェクトをご紹介します。
        </p>
      </header>

      {works.length === 0 && (
        <p className="text-center text-slate-600 dark:text-slate-400">
          現在公開されている実績はありません。
        </p>
      )}

      {works.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {works.map((item) => (
            <Card key={item.id} className="flex flex-col overflow-hidden group">
              <CardHeader className="p-0">
                {item.thumbnail_url ? (
                  <div className="aspect-video overflow-hidden">
                    <Image
                      src={item.thumbnail_url}
                      alt={item.title || "Portfolio thumbnail"}
                      width={600}
                      height={338}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300 ease-in-out"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                    <span className="text-slate-400 dark:text-slate-500">No Image</span>
                  </div>
                )}
              </CardHeader>
              <CardContent className="pt-4 flex-grow">
                {item.category && (
                  <p className="text-sm text-sky-600 dark:text-sky-400 mb-1 font-medium">{item.category}</p>
                )}
                <CardTitle className="text-xl font-semibold mb-2 text-slate-800 dark:text-white">
                  <Link href={`/works/${item.id}`} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                    {item.title}
                  </Link>
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3">
                  {item.description || "詳細はこちらをご覧ください。"}
                </CardDescription>
              </CardContent>
              <CardFooter className="pt-4">
                <Button variant="link" className="p-0 h-auto text-sky-600 dark:text-sky-400" asChild>
                  <Link href={`/works/${item.id}`}>
                    詳細を見る →
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <div className="text-center mt-16">
        <Button variant="outline" asChild>
            <Link href="/">トップページへ戻る</Link>
        </Button>
      </div>
    </div>
  );
}