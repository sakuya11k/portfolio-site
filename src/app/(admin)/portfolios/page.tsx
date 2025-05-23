// src/app/(admin)/portfolios/page.tsx
"use client";

import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// shadcn/ui の Alert Dialog を使う場合は事前に追加
// npx shadcn@latest add alert-dialog
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
} from "@/components/ui/alert-dialog"; // 追加

interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  is_published: boolean;
  created_at: string;
  thumbnail_url: string | null; // thumbnail_url を追加 (画像削除のため)
}

export default function PortfoliosPage() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null); // 削除対象のIDを管理

  // データ取得関数
  const fetchPortfolioItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("portfolios")
        .select("id, title, description, is_published, created_at, thumbnail_url") // thumbnail_url を追加
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPortfolioItems(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch portfolio items.");
      console.error("Error fetching portfolio items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioItems();
  }, []);

  // 削除処理関数
  const handleDelete = async (itemId: string, thumbnailUrl: string | null) => {
    if (!itemId) return;
    setDeletingId(itemId); // 削除処理中のIDをセット (ローディング表示などに使える)
    try {
      // 1. (もしあれば) Storageから画像を削除
      if (thumbnailUrl) {
        const fileName = thumbnailUrl.split('/').pop(); // URLからファイル名を取得
        if (fileName) {
          const { error: storageError } = await supabase.storage
            .from("portfolio-thumbnails")
            .remove([fileName]);
          if (storageError) {
            // 画像削除エラーはログに出すが、DB削除は続行する (DB整合性優先)
            console.error("Error deleting image from storage:", storageError);
          }
        }
      }

      // 2. Databaseからアイテムを削除
      const { error: dbError } = await supabase
        .from("portfolios")
        .delete()
        .eq("id", itemId);

      if (dbError) throw dbError;

      // 削除成功後、リストを再取得して更新
      await fetchPortfolioItems();
      alert("Portfolio item deleted successfully!"); // またはトースト通知など

    } catch (err: any) {
      alert(`Error deleting item: ${err.message || "Unknown error"}`);
      console.error("Error deleting portfolio item:", err);
    } finally {
      setDeletingId(null);
    }
  };


  if (loading && portfolioItems.length === 0) return <p>Loading portfolio items...</p>; // 初期ロード時のみ
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Portfolio Management</h1>
        <Link href="/portfolios/new">
          <Button>Add New Portfolio Item</Button>
        </Link>
      </div>

      {portfolioItems.length === 0 && !loading ? ( // ローディング中でない場合のみ表示
        <p>No portfolio items found. Add one!</p>
      ) : (
        <Table>
          <TableCaption>A list of your portfolio items.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {portfolioItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell>{item.description ? `${item.description.substring(0, 50)}...` : '-'}</TableCell>
                <TableCell>{item.is_published ? "Published" : "Draft"}</TableCell>
                <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Link href={`/portfolios/edit/${item.id}`}>
                    <Button variant="outline" size="sm" className="mr-2">Edit</Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" disabled={deletingId === item.id}>
                        {deletingId === item.id ? "Deleting..." : "Delete"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the
                          portfolio item "{item.title}" and its associated image (if any).
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(item.id, item.thumbnail_url)}>
                          Yes, delete it
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}