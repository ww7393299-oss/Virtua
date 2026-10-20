import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/login");

  return (
    <div className="container-px mx-auto max-w-3xl py-10">
      <h1 className="text-2xl font-semibold">My Account</h1>
      <p className="mt-1 text-sm text-muted">
        Signed in as {session.user.email} ({session.user.role})
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link href="/account/orders" className="card-surface p-5 hover:border-accent/50">
          <div className="font-medium">Orders</div>
          <div className="text-sm text-muted">Track and manage your orders</div>
        </Link>
        <Link href="/wishlist" className="card-surface p-5 hover:border-accent/50">
          <div className="font-medium">Wishlist</div>
          <div className="text-sm text-muted">Items you've saved</div>
        </Link>
        {session.user.role !== "CUSTOMER" && (
          <Link href="/admin" className="card-surface p-5 hover:border-accent/50">
            <div className="font-medium">Admin Dashboard</div>
            <div className="text-sm text-muted">Manage products &amp; orders</div>
          </Link>
        )}
      </div>
    </div>
  );
}
