// src/app/login/page.tsx
"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Cardコンポーネントも使う場合はインポート
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        // Supabaseのエラーオブジェクトは 'message' プロパティを持つことが多い
        throw signInError;
      }
      router.push("/dashboard"); // ログイン成功後ダッシュボードへ (管理画面のトップを想定)
    } catch (err: unknown) { // ★ any から unknown へ変更
      console.error("Login error:", err);
      // Supabaseのエラーオブジェクトは 'message' を持つことが多い
      // より具体的に型ガードしても良い (例: if (err && typeof err === 'object' && 'message' in err))
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'object' && err !== null && 'message' in err && typeof err.message === 'string') {
        setError(err.message); // Supabaseのエラーオブジェクトの message を使う
      } else {
        setError("An unexpected error occurred during login.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
      <Card className="w-full max-w-md"> {/* Cardコンポーネントでラップ */}
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-slate-800 dark:text-slate-50">Admin Login</CardTitle>
          <CardDescription className="text-center text-slate-600 dark:text-slate-400 pt-2">
            Please enter your credentials to access the admin panel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password"  className="text-slate-700 dark:text-slate-300">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="mt-1"
              />
            </div>
            {error && <p className="text-sm text-center text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-3 rounded-md">{error}</p>}
            <div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </div>
          </form>
        </CardContent>
        {/* <CardFooter>
          <p className="text-xs text-center text-slate-500 w-full">
            <Link href="/" className="hover:underline">← Go back to portfolio</Link>
          </p>
        </CardFooter> */}
      </Card>
    </div>
  );
}