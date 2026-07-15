import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/authGuard";

export async function GET() {
  const species = await prisma.species.findMany({
    orderBy: { commonName: "asc" },
    include: { photos: true },
  });
  return NextResponse.json(species);
}

export async function POST(request) {
  const { errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  const body = await request.json();
  const { commonName, scientificName, photo } = body;

  if (!commonName || !commonName.trim()) {
    return NextResponse.json(
      { error: "Common name is required." },
      { status: 400 }
    );
  }
  if (!photo || !photo.url || !photo.publicId) {
    return NextResponse.json(
      { error: "At least one photo is required." },
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.species.findFirst({
      where: { commonName: { equals: commonName.trim(), mode: "insensitive" } },
    });
    if (existing) {
      return NextResponse.json(
        {
          error: `"${existing.commonName}" is already in the catalogue.`,
          existingId: existing.id,
        },
        { status: 409 }
      );
    }

    const species = await prisma.species.create({
      data: {
        commonName: commonName.trim(),
        scientificName: scientificName?.trim() || null,
        photos: {
          create: {
            url: photo.url,
            publicId: photo.publicId,
            dateSpotted: photo.dateSpotted ? new Date(photo.dateSpotted) : null,
            location: photo.location?.trim() || null,
            notes: photo.notes?.trim() || null,
          },
        },
      },
      include: { photos: true },
    });
    return NextResponse.json(species, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not save this specimen. Check your database connection." },
      { status: 500 }
    );
  }
}
