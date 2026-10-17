import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  ArrowUpRight,
  UsersRound,
  ChartNoAxesCombined,
} from "lucide-react";
export const dynamic = "force-dynamic";
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireAdmin();
  } catch {
    redirect("/login?next=/admin");
  }
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div>
          <span className="admin-dot" />
          <strong>Store workspace</strong>
          <small>Mild edition</small>
        </div>
        <nav aria-label="Admin navigation">
          <Link href="/admin">
            <LayoutDashboard size={18} /> Overview
          </Link>
          <Link href="/admin/products">
            <Package size={18} /> Products
          </Link>
          <Link href="/admin/orders">
            <ShoppingBag size={18} /> Orders
          </Link>
          <Link href="/admin/customers">
            <UsersRound size={18} /> Customers
          </Link>
          <Link href="/admin/analytics">
            <ChartNoAxesCombined size={18} /> Analytics
          </Link>
        </nav>
        <Link href="/shop" className="text-link">
          Visit storefront <ArrowUpRight size={16} />
        </Link>
      </aside>
      <div className="admin-main">{children}</div>
    </div>
  );
}
