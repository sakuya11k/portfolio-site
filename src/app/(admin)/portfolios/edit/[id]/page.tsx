// src/app/(admin)/portfolios/edit/[id]/page.tsx
"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter, useParams } from "next/navigation";
import { useState, FormEvent, ChangeEvent, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

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

const technologyOptions = [
  "JavaScript", "TypeScript", "Python", "React", "Next.js", "Node.js", "Supabase", "Tailwind CSS", "HTML", "CSS"
];
const categoryOptions = [
  "Webアプリケーション開発", "LP・Webサイト制作", "業務効率化ツール開発", "プロトタイプ開発", "その他"
];
const roleOptions = [
  "企画・要件定義", "プロジェクト管理", "UI/UXデザイン", "フロントエンド開発", "バックエンド開発", "データベース設計"
];

interface PortfolioFormData {
  title: string;
  description: string;
  thumbnail_file: File | null;
  existing_thumbnail_url: string | null;
  technologies: string[];
  demo_url: string;
  github_url: string;
  is_published: boolean;
  sort_order: number | string;
  category: string;
  roles_responsible: string[];
}

interface PortfolioDatabaseItem {
    id: string;
    created_at: string;
    title: string;
    description: string | null;
    thumbnail_url: string | null;
    technologies: string[] | null;
    demo_url: string | null;
    github_url: string | null;
    is_published: boolean;
    sort_order: number;
    category: string | null;
    roles_responsible: string[] | null;
    updated_at?: string;
}


export default function EditPortfolioPage() {
  const router = useRouter(); // ★ routerを使用するので残す
  const params = useParams();
  const itemId = params.id as string;

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
          .select("*")
          .eq("id", itemId)
          .single<PortfolioDatabaseItem>();

        if (fetchError) throw fetchError;

        if (data) {
          setFormData({
            title: data.title || "",
            description: data.description || "",
            thumbnail_file: null,
            existing_thumbnail_url: data.thumbnail_url || null,
            technologies: data.technologies || [],
            demo_url: data.demo_url || "",
            github_url: data.github_url || "",
            is_published: data.is_published || false,
            sort_order: data.sort_order === null ? '' : data.sort_order.toString(),
            category: data.category || "",
            roles_responsible: data.roles_responsible || [],
          });
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


  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    // const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined; // ★ checked は未使用なので削除
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' && name === 'sort_order' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, thumbnail_file: e.target.files![0] }));
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
      let thumbnailUrl = formData.existing_thumbnail_url;

      if (formData.thumbnail_file) {
        const file = formData.thumbnail_file;
        const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        const { error: uploadError } = await supabase.storage // ★ uploadData を受け取らないように変更
          .from("portfolio-thumbnails")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        if (formData.existing_thumbnail_url) {
            const oldFileNameMatch = formData.existing_thumbnail_url.match(/[^/]+$/);
            if (oldFileNameMatch && oldFileNameMatch[0]) {
                const oldFileName = decodeURIComponent(oldFileNameMatch[0]);
                await supabase.storage.from("portfolio-thumbnails").remove([oldFileName]);
            }
        }

        const { data: publicUrlData } = supabase.storage
          .from("portfolio-thumbnails")
          .getPublicUrl(fileName);
        thumbnailUrl = publicUrlData.publicUrl;
      }

      const dataToUpdate = {
        title: formData.title,
        description: formData.description || null,
        thumbnail_url: thumbnailUrl,
        technologies: formData.technologies.length > 0 ? formData.technologies : null,
        demo_url: formData.demo_url || null,
        github_url: formData.github_url || null,
        is_published: formData.is_published,
        sort_order: formData.sort_order === '' ? 0 : Number(formData.sort_order),
        category: formData.category || null,
        roles_responsible: formData.roles_responsible.length > 0 ? formData.roles_responsible : null,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from("portfolios")
        .update(dataToUpdate)
        .eq("id", itemId);

      if (updateError) throw updateError;

      setSuccessMessage("Portfolio item updated successfully!");
      setFormData(prev => ({
        ...prev,
        existing_thumbnail_url: thumbnailUrl,
        thumbnail_file: null,
      }));
      router.push("/portfolios"); // ★ 更新後一覧ページにリダイレクト
    } catch (err: unknown) {
      console.error("Error updating portfolio item:", err);
      setError(err instanceof Error ? err.message : "Failed to update portfolio item.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-4 text-center">Loading item data...</p>;
  if (error && !formData.title && !itemId) return <p className="p-4 text-red-500 text-center">Error: {error}</p>;

  return (
    <Card className="max-w-3xl mx-auto my-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Edit Portfolio Item</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <p className="mb-4 text-sm text-red-500 bg-red-100 p-3 rounded-md">Error: {error}</p>}
        {successMessage && <p className="mb-4 text-sm text-green-500 bg-green-100 p-3 rounded-md">{successMessage}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
            <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={5} />
          </div>
          <div>
            <Label htmlFor="thumbnail_file">Thumbnail Image (Leave blank to keep existing)</Label>
            {formData.existing_thumbnail_url && !formData.thumbnail_file && (
              <div className="my-2">
                <p className="text-sm">Current image:</p>
                <div className="relative w-full max-w-xs h-32">
                  <Image
                    src={formData.existing_thumbnail_url}
                    alt="Current Thumbnail"
                    fill
                    style={{ objectFit: "contain" }}
                    className="border rounded-md"
                  />
                </div>
              </div>
            )}
            <Input id="thumbnail_file" name="thumbnail_file" type="file" onChange={handleFileChange} accept="image/*" />
            {formData.thumbnail_file && <p className="text-sm mt-1">New image selected: {formData.thumbnail_file.name}</p>}
          </div>
          <div>
            <Label className="mb-2 block font-medium">Technologies</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 border rounded-md">
              {technologyOptions.map((tech) => (
                <div key={tech} className="flex items-center space-x-2">
                  <Checkbox
                    id={`edit-tech-${tech}`}
                    checked={formData.technologies.includes(tech)}
                    onCheckedChange={() => handleCheckboxChange("technologies", tech)}
                  />
                  <Label htmlFor={`edit-tech-${tech}`} className="font-normal cursor-pointer">{tech}</Label>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              name="category"
              value={formData.category}
              onValueChange={(value) => handleSelectChange("category", value)}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="-- Select Category --" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-2 block font-medium">Roles Responsible</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 border rounded-md">
              {roleOptions.map((role) => (
                <div key={role} className="flex items-center space-x-2">
                  <Checkbox
                    id={`edit-role-${role}`}
                    checked={formData.roles_responsible.includes(role)}
                    onCheckedChange={() => handleCheckboxChange("roles_responsible", role)}
                  />
                  <Label htmlFor={`edit-role-${role}`} className="font-normal cursor-pointer">{role}</Label>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="demo_url">Demo URL</Label>
            <Input id="demo_url" name="demo_url" type="url" value={formData.demo_url} onChange={handleInputChange} placeholder="https://example.com/demo" />
          </div>
          <div>
            <Label htmlFor="github_url">GitHub URL</Label>
            <Input id="github_url" name="github_url" type="url" value={formData.github_url} onChange={handleInputChange} placeholder="https://github.com/yourname/project" />
          </div>
          <div>
            <Label htmlFor="sort_order">Sort Order</Label>
            <Input id="sort_order" name="sort_order" type="number" value={formData.sort_order} onChange={handleInputChange} />
          </div>
          <div>
            <Label htmlFor="is_published_select">Status <span className="text-red-500">*</span></Label>
            <Select
              name="is_published_select"
              value={String(formData.is_published)}
              onValueChange={(value) => handleSelectChange("is_published_select", value)}
            >
                <SelectTrigger id="is_published_select">
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