// src/app/(admin)/portfolios/[id]/page.tsx
"use client"; // データ取得や状態管理のためにクライアントコンポーネントにする可能性が高い

import { supabase } from "@/lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2, ExternalLink, Eye, EyeOff } from "lucide-react"; // 必要なアイコン
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
// import { toast } from "sonner"; // 通知にsonnerを使う場合

// 表示するポートフォリオアイテムの型 (editページや一覧ページと共通化推奨)
interface PortfolioDetailItem {
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
  sort_order: number;
  created_at: string;
  updated_at: string | null;
  // 必要に応じて他のフィールドも追加
  // project_period?: string | null;
  // client_name?: string | null;
  // project_background?: string | null;
  // challenges_faced?: string | null;
  // solutions_provided?: string | null;
  // results_achieved?: string | null;
}

export default function PortfolioDetailPageAdmin() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id as string;

  const [portfolioItem, setPortfolioItem] = useState<PortfolioDetailItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (!itemId) {
      setError("Portfolio ID is missing.");
      setLoading(false);
      return;
    }

    const fetchPortfolioItem = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from("portfolios")
          .select("*") // 詳細なので全カラム取得を想定
          .eq("id", itemId)
          .single<PortfolioDetailItem>();

        if (fetchError) throw fetchError;

        if (data) {
          setPortfolioItem(data);
        } else {
          setError("Portfolio item not found.");
        }
      } catch (err: unknown) {
        console.error("Error fetching portfolio item:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch portfolio item.");
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioItem();
  }, [itemId]);

  const handleDelete = async () => {
    if (!portfolioItem) return;
    try {
      // 画像削除ロジック (オプション)
      if (portfolioItem.thumbnail_url) {
        const fileNameMatch = portfolioItem.thumbnail_url.match(/[^/]+$/);
        if (fileNameMatch && fileNameMatch[0]) {
          const fileName = decodeURIComponent(fileNameMatch[0]);
          await supabase.storage.from('portfolio-thumbnails').remove([fileName]);
        }
      }
      // DBからレコード削除
      const { error: deleteError } = await supabase
        .from("portfolios")
        .delete()
        .eq("id", portfolioItem.id);

      if (deleteError) throw deleteError;

      // toast.success(`Item "${portfolioItem.title}" deleted.`);
      alert(`Item "${portfolioItem.title}" deleted.`);
      router.push("/portfolios"); // 削除後は一覧ページへ
    } catch (err: unknown) {
      console.error("Error deleting item:", err);
      // toast.error(err instanceof Error ? err.message : "Failed to delete item.");
      alert(err instanceof Error ? err.message : "Failed to delete item.");
    } finally {
      setShowDeleteDialog(false);
    }
  };

  if (loading) return <p className="text-center p-8">Loading portfolio details...</p>;
  if (error) return <p className="text-center p-8 text-red-500">Error: {error}</p>;
  if (!portfolioItem) return <p className="text-center p-8">Portfolio item not found.</p>;

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
      </Button>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl font-bold">{portfolioItem.title}</CardTitle>
              {portfolioItem.category && (
                <Badge variant="secondary" className="mt-1">{portfolioItem.category}</Badge>
              )}
            </div>
            <div className="flex space-x-2">
              <Link href={`/works/${portfolioItem.id}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <ExternalLink className="mr-2 h-4 w-4" /> View Live
                </Button>
              </Link>
              <Link href={`/portfolios/edit/${portfolioItem.id}`}>
                <Button variant="default" size="sm">
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
              </Link>
            </div>
          </div>
          <CardDescription className="mt-2">
            Status: {portfolioItem.is_published
              ? <Badge variant="default"><Eye className="mr-1 h-3 w-3" />Published</Badge>
              : <Badge variant="secondary"><EyeOff className="mr-1 h-3 w-3" />Draft</Badge>
            }
            <span className="ml-4">Sort Order: {portfolioItem.sort_order}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {portfolioItem.thumbnail_url && (
            <div className="relative w-full aspect-video rounded-md overflow-hidden">
              <Image
                src={portfolioItem.thumbnail_url}
                alt={`${portfolioItem.title} thumbnail`}
                fill
                style={{ objectFit: "cover" }}
                priority
              />
            </div>
          )}

          {portfolioItem.description && (
            <div>
              <h3 className="text-xl font-semibold mb-2">Description</h3>
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {portfolioItem.description}
              </p>
            </div>
          )}

          {portfolioItem.technologies && portfolioItem.technologies.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-2">Technologies Used</h3>
              <div className="flex flex-wrap gap-2">
                {portfolioItem.technologies.map((tech) => (
                  <Badge key={tech} variant="outline">{tech}</Badge>
                ))}
              </div>
            </div>
          )}

          {portfolioItem.roles_responsible && portfolioItem.roles_responsible.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-2">Roles Responsible</h3>
              <div className="flex flex-wrap gap-2">
                {portfolioItem.roles_responsible.map((role) => (
                  <Badge key={role} variant="outline">{role}</Badge>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portfolioItem.demo_url && (
              <div>
                <h3 className="text-xl font-semibold mb-1">Demo URL</h3>
                <Link href={portfolioItem.demo_url} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline break-all">
                  {portfolioItem.demo_url}
                </Link>
              </div>
            )}
            {portfolioItem.github_url && (
              <div>
                <h3 className="text-xl font-semibold mb-1">GitHub URL</h3>
                <Link href={portfolioItem.github_url} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline break-all">
                  {portfolioItem.github_url}
                </Link>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-1">Timestamps</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Created: {new Date(portfolioItem.created_at).toLocaleString()}
            </p>
            {portfolioItem.updated_at && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Last Updated: {new Date(portfolioItem.updated_at).toLocaleString()}
              </p>
            )}
          </div>

          {/* 他にも project_period, client_name などの項目があればここに追加 */}

        </CardContent>
        <CardFooter className="border-t pt-6 mt-6 flex justify-end">
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete Item
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{`Are you sure you want to delete "${portfolioItem.title}"?`}</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this portfolio item
                  {portfolioItem.thumbnail_url && " and its associated thumbnail image from storage"}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
}