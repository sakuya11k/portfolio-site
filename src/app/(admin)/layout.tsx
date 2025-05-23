// src/app/(admin)/layout.tsx
"use client"; // クライアントコンポーネント（認証状態を扱うため）

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation"; // next/navigation から
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
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
        if (!session?.user) {
          router.push("/login");
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login"); // ログアウト後ログインページへ
  };

  if (loading) {
    return <p>Loading...</p>; // ローディング表示
  }

  if (!user) {
    // この状態はuseEffect内のリダイレクトでほぼ発生しないはずだが念のため
    return <p>Redirecting to login...</p>;
  }

  return (
    <div>
      <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <Link href="/dashboard" className="text-xl font-bold">Admin Dashboard</Link>
        {user && (
          <div>
            <span className="mr-4">Logged in as: {user.email}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Logout
            </button>
          </div>
        )}
      </header>
      <main className="p-4">{children}</main>
    </div>
  );
}