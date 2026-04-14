import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(products);
  } catch (err) {
    console.error("[products GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, size, description, imageUrl, price, quantity } = await req.json();

    if (!name || !size || !description || !imageUrl || price == null || !quantity) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        size,
        description,
        imageUrl,
        price: parseFloat(price),
        totalQty: parseInt(quantity, 10),
        availableQty: parseInt(quantity, 10),
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    console.error("[products POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
