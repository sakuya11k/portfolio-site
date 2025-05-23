// src/app/(admin)/layout.tsx
"use client"; // クライアントコンポーネント（認証状態を扱うため）

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState, ReactNode } from "react"; // ReactNode をインポート
import Link from "next/link";
import type { User } from "@supabase/supabase-js"; // ★ SupabaseのUser型をインポート

export default function AdminLayout({
  children,
}: {
  children: ReactNode; // ★ React.ReactNode から ReactNode へ (どちらでも可ですが、統一のため)
}) {
  // ★ user の型を User | null に変更
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession(); // エラーも取得

      if (error) {
        console.error("Error getting session:", error.message);
        setLoading(false);
        // エラーの種類によってはログインページにリダイレクトすることも検討
        // router.push("/login");
        return;
      }

      setUser(session?.user ?? null);
      setLoading(false);

      if (!session?.user) {
        router.push("/login"); // 未認証ならログインページへリダイレクト
      }
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        // 認証状態が変わり、ユーザーがいなくなった場合もリダイレクト
        if (!session?.user) {
          router.push("/login");
        }
      }
    );

    // クリーンアップ関数
    return () => {
      authListener?.subscription?.unsubscribe(); // ?. で安全にアクセス
    };
  }, [router]); // router を依存配列に含める

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error.message);
      // 必要に応じてユーザーにエラーを通知
    }
    router.push("/login"); // ログアウト後ログインページへ
  };

  if (loading) {
    return <p className="flex justify-center items-center h-screen">Loading...</p>; // ローディング表示を中央に
  }

  // user が null (未認証) の場合は、useEffect 内のリダイレクトに任せるか、
  // ここで明示的に何も表示しないか、リダイレクト中の表示を出す
  // useEffectでリダイレクト処理があるので、このコンポーネントが実際に表示されるのは認証済みの場合のみのはず
  if (!user) {
     // この状態はuseEffect内のリダイレクトでほぼ発生しないはずだが、
     // サーバーサイドレンダリング時や一瞬のちらつき防止のため
    return <p className="flex justify-center items-center h-screen">Redirecting to login...</p>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/dashboard" className="text-xl font-bold hover:text-gray-300 transition-colors">
            Admin Dashboard
          </Link>
          {user && ( // userが存在する場合のみログアウトボタンなどを表示
            <div className="flex items-center space-x-4">
              <span className="text-sm">Logged in as: {user.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded text-sm transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4">{children}</main>
      <footer className="bg-gray-200 dark:bg-gray-800 text-center p-4 text-sm text-gray-600 dark:text-gray-400">
        © {new Date().getFullYear()} Portfolio Admin
      </footer>
    </div>
  );
}