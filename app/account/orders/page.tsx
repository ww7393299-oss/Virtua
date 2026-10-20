import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

const timeline = ["PENDING", "CONFIRMED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { placed?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/login");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container-px mx-auto max-w-4xl py-10">
      <h1 className="text-2xl font-semibold">My Orders</h1>

      {searchParams.placed && (
        <div className="mt-4 rounded-lg border border-green-600/40 bg-green-600/10 p-3 text-sm text-green-400">
          Order {searchParams.placed} placed successfully!
        </div>
      )}

      {orders.length === 0 ? (
        <p className="mt-8 text-sm text-muted">No orders yet.</p>
      ) : (
        <div className="mt-8 space-y-6">
          {orders.map((o) => {
            const stepIdx = timeline.indexOf(o.status);
            return (
              <div key={o.id} className="card-surface p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-medium">{o.orderNumber}</div>
                    <div className="text-xs text-muted">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-sm font-medium">{formatPrice(o.total)}</div>
                </div>

                <div className="mt-4 flex items-center gap-1 overflow-x-auto text-[10px] text-muted">
                  {timeline.map((t, i) => (
                    <div key={t} className="flex items-center gap-1">
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${
                          i <= stepIdx ? "bg-accent2" : "bg-border"
                        }`}
                      />
                      <span className={i <= stepIdx ? "text-white/80" : ""}>
                        {t.replace(/_/g, " ")}
                      </span>
                      {i < timeline.length - 1 && <span className="mx-1">—</span>}
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-1 border-t border-border pt-3 text-sm text-muted">
                  {o.items.map((it) => (
                    <div key={it.id} className="flex justify-between">
                      <span>{it.productName} × {it.quantity}</span>
                      <span>{formatPrice(it.price * it.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
