// src/app/(admin)/portfolios/new/page.tsx
"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useState, FormEvent, ChangeEvent } from "react";
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

// 選択肢の定義
const technologyOptions = [
  "JavaScript", "TypeScript", "Python", "React", "Next.js", "Node.js", "Supabase", "Tailwind CSS", "HTML", "CSS"
  // ... 他にも必要な技術を追加
];
const categoryOptions = [
  "Webアプリケーション開発", "LP・Webサイト制作", "業務効率化ツール開発", "プロトタイプ開発", "その他"
  // ... 他にも必要なカテゴリを追加
];
const roleOptions = [
  "企画・要件定義", "プロジェクト管理", "UI/UXデザイン", "フロントエンド開発", "バックエンド開発", "データベース設計"
  // ... 他にも必要な役割を追加
];

// フォームデータの型定義
interface PortfolioFormData {
  title: string;
  description: string;
  thumbnail_file: File | null;
  technologies: string[];
  demo_url: string;
  github_url: string;
  is_published: boolean;
  sort_order: number | string;
  category: string;
  roles_responsible: string[];
}

export default function NewPortfolioPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<PortfolioFormData>({
    title: "",
    description: "",
    thumbnail_file: null,
    technologies: [],
    demo_url: "",
    github_url: "",
    is_published: false, // デフォルトは下書き (false)
    sort_order: 0,
    category: "", // 初期値を空文字列に
    roles_responsible: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> // Selectは別途処理
  ) => {
    const { name, value, type } = e.target;
    // HTMLInputElementにキャストしてcheckedプロパティにアクセス
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    if (name === "is_published_toggle") { // もしトグルスイッチを使う場合の仮の処理
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
      setFormData((prev) => ({ ...prev, thumbnail_file: e.target.files![0] }));
    } else {
      setFormData((prev) => ({ ...prev, thumbnail_file: null })); // ファイル選択がキャンセルされた場合
    }
  };

  const handleCheckboxChange = (
    field: "technologies" | "roles_responsible",
    value: string
  ) => {
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
    } else { // category の場合
        setFormData(prev => ({ ...prev, [field]: value }));
    }
  };


  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let thumbnailUrl = null;
      if (formData.thumbnail_file) {
        const file = formData.thumbnail_file;
        const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`; // スペースをアンダースコアに置換
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("portfolio-thumbnails")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("portfolio-thumbnails")
          .getPublicUrl(fileName);
        thumbnailUrl = publicUrlData.publicUrl;
      }

      const dataToSave = {
        title: formData.title,
        description: formData.description || null,
        thumbnail_url: thumbnailUrl,
        technologies: formData.technologies.length > 0 ? formData.technologies : null,
        demo_url: formData.demo_url || null,
        github_url: formData.github_url || null,
        is_published: formData.is_published,
        sort_order: formData.sort_order === '' ? 0 : Number(formData.sort_order),
        category: formData.category || null, // カテゴリが空文字列ならnullを許容するならこのまま
        roles_responsible: formData.roles_responsible.length > 0 ? formData.roles_responsible : null,
      };

      const { error: insertError } = await supabase
        .from("portfolios")
        .insert([dataToSave]);

      if (insertError) throw insertError;

      setSuccessMessage("Portfolio item created successfully!");
      setFormData({ // フォームリセット
        title: "", description: "", thumbnail_file: null, technologies: [], demo_url: "",
        github_url: "", is_published: false, sort_order: 0, category: "", roles_responsible: [],
      });
      // router.push("/portfolios"); // 必要なら一覧ページへリダイレクト

    } catch (err: any) {
      console.error("Error creating portfolio item:", err);
      setError(err.message || "Failed to create portfolio item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto my-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Add New Portfolio Item</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <p className="mb-4 text-sm text-red-500 bg-red-100 p-3 rounded-md">Error: {error}</p>}
        {successMessage && <p className="mb-4 text-sm text-green-500 bg-green-100 p-3 rounded-md">{successMessage}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
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
            <Label htmlFor="thumbnail_file">Thumbnail Image</Label>
            <Input id="thumbnail_file" name="thumbnail_file" type="file" onChange={handleFileChange} accept="image/*" />
            {formData.thumbnail_file && <p className="text-sm mt-1">Selected: {formData.thumbnail_file.name}</p>}
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
                <SelectValue placeholder="-- Select Category --" /> {/* プレースホルダーを指定 */}
              </SelectTrigger>
              <SelectContent>
                {/* プレースホルダー用の Item は削除、または value に空でない一意の値を設定 */}
                {categoryOptions.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
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

          {/* 公開ステータス (セレクトボックス例) */}
          <div>
            <Label htmlFor="is_published_select">Status <span className="text-red-500">*</span></Label>
            <Select
              name="is_published_select"
              value={String(formData.is_published)} // "true" または "false"
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
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Portfolio Item"}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}