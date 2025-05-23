// src/app/(admin)/dashboard/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Welcome to the Dashboard!</h1>
      <p className="mb-6">This is your admin dashboard. More features coming soon.</p>
      <Link href="/portfolios">
        <Button>Manage Portfolios</Button>
      </Link>
    </div>
  );
}