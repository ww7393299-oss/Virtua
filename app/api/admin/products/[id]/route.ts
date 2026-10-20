import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return null;
  }
  return session;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN", message: "Admin access required." } },
      { status: 403 }
    );
  }
  const body = await req.json();
  const product = await prisma.product.update({
    where: { id: params.id },
    data: {
      name: body.name,
      basePrice: body.basePrice !== undefined ? Number(body.basePrice) : undefined,
      salePrice: body.salePrice !== undefined ? Number(body.salePrice) : undefined,
      isActive: body.isActive,
      isFeatured: body.isFeatured,
    },
  });
  return NextResponse.json({ success: true, data: product, message: "Product updated" });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN", message: "Admin access required." } },
      { status: 403 }
    );
  }
  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true, message: "Product deleted" });
}
