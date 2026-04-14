import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "MANAGER" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;
    const { id } = await params;

    if (action === "COMPLETE") {
      const { additionalCompletedQty } = body;
      
      const allocation = await prisma.allocation.findUnique({ where: { id } });
      if (!allocation) return NextResponse.json({ error: "Not found" }, { status: 404 });

      // We allow them to pass additional completed items, or explicitly just calculate the total bounds
      const newTotal = (allocation.completedQty || 0) + (parseInt(additionalCompletedQty, 10) || 0);

      if (newTotal > allocation.quantity) {
         return NextResponse.json({ error: "Cannot complete more than allocated quantity" }, { status: 400 });
      }

      const updated = await prisma.allocation.update({
        where: { id },
        data: { completedQty: newTotal },
        include: {
          product: { select: { id: true, name: true, size: true, imageUrl: true } },
          location: { select: { id: true, name: true } },
          manager: { select: { id: true, name: true } },
        }
      });
      return NextResponse.json(updated);
    } 
    
    if (action === "EDIT") {
      const { quantity } = body;
      const newQty = parseInt(quantity, 10);
      
      if (newQty < 1) {
         return NextResponse.json({ error: "Quantity must be at least 1" }, { status: 400 });
      }

      // Check the 5 minute constraint
      const allocation = await prisma.allocation.findUnique({ where: { id } });
      if (!allocation) return NextResponse.json({ error: "Not found" }, { status: 404 });

      const diffMs = Date.now() - new Date(allocation.allocatedAt).getTime();
      const diffMins = diffMs / 1000 / 60;
      
      if (diffMins > 5 && session.role !== "ADMIN") {
        return NextResponse.json({ error: "Time limit exceeded. Please contact Admin to do it." }, { status: 403 });
      }

      const qtyDelta = newQty - allocation.quantity;

      // Use a transaction if there's a delta to safely adjust remaining Product availability
      if (qtyDelta !== 0) {
        const result = await prisma.$transaction(async (tx) => {
          const product = await tx.product.findUnique({ where: { id: allocation.productId } });
          if (!product) throw new Error("Product not found");
          
          if (qtyDelta > 0 && product.availableQty < qtyDelta) {
            throw new Error(`Only ${product.availableQty} units left in stock.`);
          }

          // Decrement by delta. (If delta is negative, decrementing a negative number adds it back)
          await tx.product.update({
            where: { id: allocation.productId },
            data: { availableQty: { decrement: qtyDelta } }
          });

          return tx.allocation.update({
            where: { id },
            data: { quantity: newQty },
            include: {
              product: { select: { id: true, name: true, size: true, imageUrl: true } },
              location: { select: { id: true, name: true } },
              manager: { select: { id: true, name: true } },
            }
          });
        });
        return NextResponse.json(result);
      } else {
        // No quantity change
        return NextResponse.json(allocation);
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    if (message.includes("units left in stock")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    console.error("[allocations UPDATE]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
