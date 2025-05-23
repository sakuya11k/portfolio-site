// src/app/(admin)/portfolios/edit/[id]/page.tsx
"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter, useParams } from "next/navigation"; // useParamsを追加
import { useState, FormEvent, ChangeEvent, useEffect } from "react"; // useEffectを追加
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

// 選択肢の定義 (new/page.tsx と同じものを使用)
const technologyOptions = [
  "JavaScript", "TypeScript", "Python", "React", "Next.js", "Node.js", "Supabase", "Tailwind CSS", "HTML", "CSS"
];
const categoryOptions = [
  "Webアプリケーション開発", "LP・Webサイト制作", "業務効率化ツール開発", "プロトタイプ開発", "その他"
];
const roleOptions = [
  "企画・要件定義", "プロジェクト管理", "UI/UXデザイン", "フロントエンド開発", "バックエンド開発", "データベース設計"
];

// フォームデータの型定義 (new/page.tsx と同じ)
interface PortfolioFormData {
  title: string;
  description: string;
  thumbnail_file: File | null; // 新しい画像をアップロードする場合
  existing_thumbnail_url: string | null; // 既存の画像URL
  technologies: string[];
  demo_url: string;
  github_url: string;
  is_published: boolean;
  sort_order: number | string;
  category: string;
  roles_responsible: string[];
}

export default function EditPortfolioPage() {
  const router = useRouter();
  const params = useParams(); // URLパラメータからidを取得
  const itemId = params.id as string; // string型であることを明示

  const [formData, setFormData] = useState<PortfolioFormData>({
    title: "",
    description: "",
    thumbnail_file: null,
    existing_thumbnail_url: null,
    technologies: [],
    demo_url: "",
    github_url: "",
    is_published: false,
    sort_order: 0,
    category: "",
    roles_responsible: [],
  });
  const [loading, setLoading] = useState(true); // 初期データロード中も考慮
  const [saving, setSaving] = useState(false);   // 保存処理中
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 初期データの読み込み
  useEffect(() => {
    if (!itemId) return;

    const fetchPortfolioItem = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("portfolios")
          .select("*") // 全カラムを取得
          .eq("id", itemId)
          .single(); // 1件のデータを取得

        if (error) throw error;
        if (data) {
          setFormData({
            title: data.title || "",
            description: data.description || "",
            thumbnail_file: null, // 初期はファイル選択なし
            existing_thumbnail_url: data.thumbnail_url || null,
            technologies: data.technologies || [],
            demo_url: data.demo_url || "",
            github_url: data.github_url || "",
            is_published: data.is_published || false,
            sort_order: data.sort_order === null ? '' : data.sort_order, // nullなら空文字
            category: data.category || "",
            roles_responsible: data.roles_responsible || [],
          });
        } else {
          setError("Portfolio item not found.");
        }
      } catch (err: any) {
        console.error("Error fetching portfolio item:", err);
        setError(err.message || "Failed to fetch portfolio item.");
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolioItem();
  }, [itemId]);


  // フォーム入力ハンドラ (new/page.tsx とほぼ同じ)
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    if (name === "is_published_toggle") {
        setFormData((prev) => ({ ...prev, is_published: checked! }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'number' && name === 'sort_order' ? (value === '' ? '' : Number(value)) : value,
      }));
    }
  };
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, thumbnail_file: e.target.files![0], existing_thumbnail_url: null })); // 新しいファイルが選択されたら既存URLはクリア(表示上)
    } else {
      setFormData((prev) => ({ ...prev, thumbnail_file: null }));
    }
  };
  const handleCheckboxChange = (field: "technologies" | "roles_responsible", value: string) => {
    setFormData((prev) => {
      const currentValues = prev[field];
      if (currentValues.includes(value)) {
        return { ...prev, [field]: currentValues.filter((item) => item !== value) };
      } else {
        return { ...prev, [field]: [...currentValues, value] };
      }
    });
  };
  const handleSelectChange = (field: "category" | "is_published_select", value: string) => {
    if (field === "is_published_select") {
        setFormData(prev => ({ ...prev, is_published: value === "true" }));
    } else {
        setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let thumbnailUrl = formData.existing_thumbnail_url; // デフォルトは既存のURL

      // 1. 新しい画像がアップロードされた場合のみStorageに保存
      if (formData.thumbnail_file) {
        const file = formData.thumbnail_file;
        const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("portfolio-thumbnails")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("portfolio-thumbnails")
          .getPublicUrl(fileName);
        thumbnailUrl = publicUrlData.publicUrl;

        // (任意) もし既存の画像があり、新しい画像に置き換えるなら、古い画像をStorageから削除する処理もここに追加できる
        // if (formData.existing_thumbnail_url) {
        //   const oldFileName = formData.existing_thumbnail_url.split('/').pop();
        //   if (oldFileName) await supabase.storage.from("portfolio-thumbnails").remove([oldFileName]);
        // }
      }

      // 2. データベースへの更新データ準備
      const dataToUpdate = {
        title: formData.title,
        description: formData.description || null,
        thumbnail_url: thumbnailUrl, // 新しいURLまたは既存のURL
        technologies: formData.technologies.length > 0 ? formData.technologies : null,
        demo_url: formData.demo_url || null,
        github_url: formData.github_url || null,
        is_published: formData.is_published,
        sort_order: formData.sort_order === '' ? 0 : Number(formData.sort_order),
        category: formData.category || null,
        roles_responsible: formData.roles_responsible.length > 0 ? formData.roles_responsible : null,
        updated_at: new Date().toISOString(), // 更新日時をセット
      };

      // 3. データベースを更新
      const { error: updateError } = await supabase
        .from("portfolios")
        .update(dataToUpdate)
        .eq("id", itemId); // 更新対象のIDを指定

      if (updateError) throw updateError;

      setSuccessMessage("Portfolio item updated successfully!");
      // router.push("/portfolios"); // 更新後一覧ページにリダイレクト

    } catch (err: any) {
      console.error("Error updating portfolio item:", err);
      setError(err.message || "Failed to update portfolio item.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-4">Loading item data...</p>;
  if (error && !formData.title) return <p className="p-4 text-red-500">Error: {error}</p>; // 初期ロードエラーでデータがない場合

  return (
    <Card className="max-w-3xl mx-auto my-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Edit Portfolio Item</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <p className="mb-4 text-sm text-red-500 bg-red-100 p-3 rounded-md">Error: {error}</p>}
        {successMessage && <p className="mb-4 text-sm text-green-500 bg-green-100 p-3 rounded-md">{successMessage}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 各フォーム項目 (new/page.tsx とほぼ同じUI) */}
          {/* タイトル */}
          <div>
            <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
            <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required />
          </div>

          {/* 概要説明 */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={5} />
          </div>

          {/* サムネイル画像 */}
          <div>
            <Label htmlFor="thumbnail_file">Thumbnail Image (Leave blank to keep existing)</Label>
            {formData.existing_thumbnail_url && (
              <div className="my-2">
                <p className="text-sm">Current image:</p>
                <img src={formData.existing_thumbnail_url} alt="Current Thumbnail" className="max-w-xs max-h-32 object-contain border rounded-md" />
              </div>
            )}
            <Input id="thumbnail_file" name="thumbnail_file" type="file" onChange={handleFileChange} accept="image/*" />
            {formData.thumbnail_file && <p className="text-sm mt-1">New image selected: {formData.thumbnail_file.name}</p>}
          </div>

          {/* 使用技術 (チェックボックス) */}
          <div>
            <Label className="mb-2 block font-medium">Technologies</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 border rounded-md">
              {technologyOptions.map((tech) => (
                <div key={tech} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tech-${tech}`}
                    checked={formData.technologies.includes(tech)}
                    onCheckedChange={() => handleCheckboxChange("technologies", tech)}
                  />
                  <Label htmlFor={`tech-${tech}`} className="font-normal cursor-pointer">{tech}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* カテゴリ (セレクトボックス) */}
          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              name="category"
              value={formData.category}
              onValueChange={(value) => handleSelectChange("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="-- Select Category --" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 担当した役割 (チェックボックス) */}
          <div>
            <Label className="mb-2 block font-medium">Roles Responsible</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 border rounded-md">
              {roleOptions.map((role) => (
                <div key={role} className="flex items-center space-x-2">
                  <Checkbox
                    id={`role-${role}`}
                    checked={formData.roles_responsible.includes(role)}
                    onCheckedChange={() => handleCheckboxChange("roles_responsible", role)}
                  />
                  <Label htmlFor={`role-${role}`} className="font-normal cursor-pointer">{role}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* デモサイトURL */}
          <div>
            <Label htmlFor="demo_url">Demo URL</Label>
            <Input id="demo_url" name="demo_url" type="url" value={formData.demo_url} onChange={handleInputChange} placeholder="https://example.com/demo" />
          </div>

          {/* GitHubリポジトリURL */}
          <div>
            <Label htmlFor="github_url">GitHub URL</Label>
            <Input id="github_url" name="github_url" type="url" value={formData.github_url} onChange={handleInputChange} placeholder="https://github.com/yourname/project" />
          </div>

          {/* 表示順 */}
          <div>
            <Label htmlFor="sort_order">Sort Order</Label>
            <Input id="sort_order" name="sort_order" type="number" value={formData.sort_order} onChange={handleInputChange} />
          </div>

          {/* 公開ステータス */}
          <div>
            <Label htmlFor="is_published_select">Status <span className="text-red-500">*</span></Label>
            <Select
              name="is_published_select"
              value={String(formData.is_published)}
              onValueChange={(value) => handleSelectChange("is_published_select", value)}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="true">Published</SelectItem>
                    <SelectItem value="false">Draft</SelectItem>
                </SelectContent>
            </Select>
          </div>

          <CardFooter className="flex justify-end space-x-2 pt-6">
            <Link href="/portfolios">
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
            <Button type="submit" disabled={saving || loading}>
              {saving ? "Updating..." : "Update Portfolio Item"}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}