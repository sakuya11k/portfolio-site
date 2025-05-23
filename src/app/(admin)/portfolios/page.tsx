// src/app/(admin)/portfolios/page.tsx
"use client";

import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2, ExternalLink, Eye, EyeOff } from "lucide-react";
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
import { Card } from "@/components/ui/card"; // ★ Card コンポーネントをインポート

// sonner を使う場合はインポート (インストールが必要: npm install sonner)
// import { toast } from "sonner";

// ポートフォリオアイテムの型 (表示に必要な項目に絞るか、editページと共通の型を使う)
interface PortfolioListItem {
  id: string;
  title: string;
  category: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string; // または Date型
  thumbnail_url: string | null; // サムネイルURLも追加 (削除時に使う可能性)
}

export default function AdminPortfoliosPage() {
  const [portfolios, setPortfolios] = useState<PortfolioListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<PortfolioListItem | null>(null);

  const fetchPortfolios = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("portfolios")
        .select("id, title, category, is_published, sort_order, created_at, thumbnail_url")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false })
        .returns<PortfolioListItem[]>();

      if (fetchError) throw fetchError;
      setPortfolios(data || []);
    } catch (err: unknown) {
      console.error("Error fetching portfolios:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch portfolios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      if (itemToDelete.thumbnail_url) {
        const fileNameMatch = itemToDelete.thumbnail_url.match(/[^/]+$/);
        if (fileNameMatch && fileNameMatch[0]) {
          const fileName = decodeURIComponent(fileNameMatch[0]);
          const { error: storageError } = await supabase.storage
            .from('portfolio-thumbnails')
            .remove([fileName]);
          if (storageError) {
            console.warn("Error deleting thumbnail from storage:", storageError.message);
          }
        }
      }

      const { error: deleteError } = await supabase
        .from("portfolios")
        .delete()
        .eq("id", itemToDelete.id);

      if (deleteError) throw deleteError;

      alert(`Portfolio item "${itemToDelete.title}" deleted successfully.`);
      setItemToDelete(null);
      fetchPortfolios();
    } catch (err: unknown) {
      console.error("Error deleting portfolio:", err);
      alert(err instanceof Error ? err.message : "Failed to delete portfolio item.");
      setItemToDelete(null);
    }
  };

  if (loading) return <p className="text-center p-8">Loading portfolios...</p>;
  if (error) return <p className="text-center p-8 text-red-500">Error: {error}</p>;

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Portfolio Management</h1>
        <Link href="/portfolios/new">
          <Button>
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Portfolio
          </Button>
        </Link>
      </div>

      {portfolios.length === 0 ? (
        <p className="text-center text-slate-500 dark:text-slate-400">No portfolio items found. Add one!</p>
      ) : (
        <Card> {/* ここでCardを使用 */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sort Order</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {portfolios.map((portfolio) => (
                <TableRow key={portfolio.id}>
                  <TableCell className="font-medium">{portfolio.title}</TableCell>
                  <TableCell>{portfolio.category || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={portfolio.is_published ? "default" : "secondary"}>
                      {portfolio.is_published ? <><Eye className="mr-1 h-3 w-3" />Published</> : <><EyeOff className="mr-1 h-3 w-3" />Draft</>}
                    </Badge>
                  </TableCell>
                  <TableCell>{portfolio.sort_order}</TableCell>
                  <TableCell>
                    {new Date(portfolio.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link href={`/works/${portfolio.id}`} target="_blank" rel="noopener noreferrer">
                       <Button variant="outline" size="icon" aria-label="View on site">
                         <ExternalLink className="h-4 w-4" />
                       </Button>
                    </Link>
                    <Link href={`/portfolios/edit/${portfolio.id}`}>
                      <Button variant="outline" size="icon" aria-label="Edit">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" aria-label="Delete" onClick={() => setItemToDelete(portfolio)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure you want to delete "{itemToDelete?.title}"?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the portfolio item.
                            {itemToDelete?.thumbnail_url && " The associated thumbnail image will also be deleted."}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}