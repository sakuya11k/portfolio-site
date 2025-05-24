// src/app/(admin)/portfolios/new/page.tsx
"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation"; // ★ routerを使用するので残す
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
  technologies: string[];
  demo_url: string;
  github_url: string;
  is_published: boolean;
  sort_order: number | string;
  category: string;
  roles_responsible: string[];
}

export default function NewPortfolioPage() {
  const router = useRouter(); // ★ routerを使用するので残す
  const [formData, setFormData] = useState<PortfolioFormData>({
    title: "",
    description: "",
    thumbnail_file: null,
    technologies: [],
    demo_url: "",
    github_url: "",
    is_published: false,
    sort_order: 0,
    category: "",
    roles_responsible: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
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
    } else {
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
        const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        const { error: uploadError } = await supabase.storage // ★ uploadData を受け取らないように変更
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
        category: formData.category || null,
        roles_responsible: formData.roles_responsible.length > 0 ? formData.roles_responsible : null,
      };

      const { error: insertError } = await supabase
        .from("portfolios")
        .insert([dataToSave])
        .select();

      if (insertError) throw insertError;

      setSuccessMessage("Portfolio item created successfully!");
      setFormData({
        title: "", description: "", thumbnail_file: null, technologies: [], demo_url: "",
        github_url: "", is_published: false, sort_order: 0, category: "", roles_responsible: [],
      });
      router.push("/portfolios"); // ★ 作成後一覧ページへリダイレクト
    } catch (err: unknown) { // ★ any から unknown へ変更
      console.error("Error creating portfolio item:", err);
      setError(err instanceof Error ? err.message : "Failed to create portfolio item.");
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
          <div>
            <Label htmlFor="title-new">Title <span className="text-red-500">*</span></Label>
            <Input id="title-new" name="title" value={formData.title} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="description-new">Description</Label>
            <Textarea id="description-new" name="description" value={formData.description} onChange={handleInputChange} rows={5} />
          </div>
          <div>
            <Label htmlFor="thumbnail_file-new">Thumbnail Image</Label>
            <Input id="thumbnail_file-new" name="thumbnail_file" type="file" onChange={handleFileChange} accept="image/*" />
            {formData.thumbnail_file && <p className="text-sm mt-1">Selected: {formData.thumbnail_file.name}</p>}
          </div>
          <div>
            <Label className="mb-2 block font-medium">Technologies</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 border rounded-md">
              {technologyOptions.map((tech) => (
                <div key={tech} className="flex items-center space-x-2">
                  <Checkbox
                    id={`new-tech-${tech}`}
                    checked={formData.technologies.includes(tech)}
                    onCheckedChange={() => handleCheckboxChange("technologies", tech)}
                  />
                  <Label htmlFor={`new-tech-${tech}`} className="font-normal cursor-pointer">{tech}</Label>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="category-new">Category</Label>
            <Select
              name="category"
              value={formData.category}
              onValueChange={(value) => handleSelectChange("category", value)}
            >
              <SelectTrigger id="category-new">
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
                    id={`new-role-${role}`}
                    checked={formData.roles_responsible.includes(role)}
                    onCheckedChange={() => handleCheckboxChange("roles_responsible", role)}
                  />
                  <Label htmlFor={`new-role-${role}`} className="font-normal cursor-pointer">{role}</Label>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="demo_url-new">Demo URL</Label>
            <Input id="demo_url-new" name="demo_url" type="url" value={formData.demo_url} onChange={handleInputChange} placeholder="https://example.com/demo" />
          </div>
          <div>
            <Label htmlFor="github_url-new">GitHub URL</Label>
            <Input id="github_url-new" name="github_url" type="url" value={formData.github_url} onChange={handleInputChange} placeholder="https://github.com/yourname/project" />
          </div>
          <div>
            <Label htmlFor="sort_order-new">Sort Order</Label>
            <Input id="sort_order-new" name="sort_order" type="number" value={formData.sort_order} onChange={handleInputChange} />
          </div>
          <div>
            <Label htmlFor="is_published_select-new">Status <span className="text-red-500">*</span></Label>
            <Select
              name="is_published_select"
              value={String(formData.is_published)}
              onValueChange={(value) => handleSelectChange("is_published_select", value)}
            >
                <SelectTrigger id="is_published_select-new">
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