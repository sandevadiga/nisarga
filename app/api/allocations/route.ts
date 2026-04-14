import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const allocations = await prisma.allocation.findMany({
      orderBy: { allocatedAt: "desc" },
      include: {
        product: { select: { id: true, name: true, size: true, imageUrl: true } },
        location: { select: { id: true, name: true } },
        manager: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json(allocations);
  } catch (err) {
    console.error("[allocations GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, locationId, quantity } = await req.json();
    if (!productId || !locationId || !quantity || quantity < 1) {
      return NextResponse.json({ error: "productId, locationId and quantity are required" }, { status: 400 });
    }

    const qty = parseInt(quantity, 10);

    // Check available stock in a transaction
    const allocation = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new Error("Product not found");
      if (product.availableQty < qty) throw new Error(`Only ${product.availableQty} units available`);

      await tx.product.update({
        where: { id: productId },
        data: { availableQty: { decrement: qty } },
      });

      return tx.allocation.create({
        data: {
          productId,
          locationId,
          managerId: session.userId,
          quantity: qty,
        },
        include: {
          product: { select: { id: true, name: true, size: true, imageUrl: true } },
          location: { select: { id: true, name: true } },
          manager: { select: { id: true, name: true } },
        },
      });
    });

    return NextResponse.json(allocation, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    if (message.includes("available") || message.includes("not found")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    console.error("[allocations POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
