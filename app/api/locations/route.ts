import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const locations = await prisma.location.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(locations);
  } catch (err) {
    console.error("[locations GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "Location name is required" }, { status: 400 });
    }

    const location = await prisma.location.create({ data: { name: name.trim() } });
    return NextResponse.json(location, { status: 201 });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "Location already exists" }, { status: 409 });
    }
    console.error("[locations POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
