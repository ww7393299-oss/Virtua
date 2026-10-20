import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return null;
  }
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN", message: "Admin access required." } },
      { status: 403 }
    );
  }
  const products = await prisma.product.findMany({
    include: { category: true, images: { take: 1 } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ success: true, data: products });
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN", message: "Admin access required." } },
      { status: 403 }
    );
  }
  const body = await req.json();
  const product = await prisma.product.create({
    data: {
      name: body.name,
      slug: slugify(body.name) + "-" + Math.random().toString(36).slice(2, 6),
      description: body.description || "",
      categoryId: body.categoryId,
      basePrice: Number(body.basePrice),
      salePrice: body.salePrice ? Number(body.salePrice) : null,
      sku: "SKU-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      isFeatured: !!body.isFeatured,
      arEnabled: !!body.arEnabled,
      images: body.image ? { create: [{ url: body.image, sortOrder: 0 }] } : undefined,
    },
  });
  return NextResponse.json({ success: true, data: product, message: "Product created" });
}
