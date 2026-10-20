import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    redirect("/auth/login");
  }

  const [orderCount, productCount, customerCount, orders] = await Promise.all([
    prisma.order.count(),
    prisma.product.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { items: true } }),
  ]);
  const revenueAgg = await prisma.order.aggregate({ _sum: { total: true } });
  const revenue = revenueAgg._sum.total || 0;
  const aov = orderCount ? revenue / orderCount : 0;

  const cards = [
    { label: "Revenue", value: formatPrice(revenue) },
    { label: "Orders", value: orderCount },
    { label: "Customers", value: customerCount },
    { label: "Products", value: productCount },
    { label: "Avg. Order Value", value: formatPrice(Math.round(aov)) },
  ];

  return (
    <div className="container-px mx-auto max-w-6xl py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <nav className="flex gap-4 text-sm text-muted">
          <Link href="/admin/products" className="hover:text-white">Products</Link>
          <Link href="/admin/orders" className="hover:text-white">Orders</Link>
        </nav>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="card-surface p-5">
            <div className="text-xs text-muted">{c.label}</div>
            <div className="mt-2 text-xl font-semibold">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="mb-4 text-lg font-semibold">Recent Orders</h2>
        <div className="card-surface divide-y divide-border">
          {orders.length === 0 && <div className="p-5 text-sm text-muted">No orders yet.</div>}
          {orders.map((o) => (
            <div key={o.id} className="flex items-center justify-between p-4 text-sm">
              <div>
                <div className="font-medium">{o.orderNumber}</div>
                <div className="text-xs text-muted">{o.items.length} item(s) · {o.status}</div>
              </div>
              <div>{formatPrice(o.total)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
