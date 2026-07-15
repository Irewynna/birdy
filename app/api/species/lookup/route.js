import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("name") || "").trim();

  if (!q) return NextResponse.json([]);

  const matches = await prisma.species.findMany({
    where: {
      OR: [
        { commonName: { contains: q, mode: "insensitive" } },
        { scientificName: { contains: q, mode: "insensitive" } },
      ],
    },
    select: { id: true, commonName: true, scientificName: true },
    take: 5,
  });

  return NextResponse.json(matches);
}
