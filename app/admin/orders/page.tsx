import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export default async function AdminOrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    redirect("/auth/login");
  }

  const orders = await prisma.order.findMany({
    include: { items: true, user: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container-px mx-auto max-w-6xl py-10">
      <h1 className="mb-6 text-2xl font-semibold">Orders</h1>
      <div className="card-surface divide-y divide-border">
        {orders.map((o) => (
          <div key={o.id} className="flex items-center justify-between p-4 text-sm">
            <div>
              <div className="font-medium">{o.orderNumber}</div>
              <div className="text-xs text-muted">{o.user?.email}</div>
            </div>
            <div className="text-xs text-muted">{o.status}</div>
            <div>{formatPrice(o.total)}</div>
          </div>
        ))}
        {orders.length === 0 && <div className="p-6 text-sm text-muted">No orders yet.</div>}
      </div>
    </div>
  );
}
