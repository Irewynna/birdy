import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/authGuard";

export async function POST(request) {
  const { errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  const body = await request.json();
  const { speciesId, dateSpotted, location, notes, photos } = body;

  if (!speciesId || !Array.isArray(photos) || photos.length === 0) {
    return NextResponse.json(
      { error: "speciesId and at least one uploaded photo are required." },
      { status: 400 }
    );
  }
  if (photos.some((p) => !p.url || !p.publicId)) {
    return NextResponse.json(
      { error: "One or more uploads are incomplete." },
      { status: 400 }
    );
  }

  try {
    // Shared date/location/notes are applied to every photo in this batch —
    // e.g. five photos from the same sighting at the same place and time.
    const created = await prisma.$transaction(
      photos.map((p) =>
        prisma.photo.create({
          data: {
            speciesId,
            url: p.url,
            publicId: p.publicId,
            dateSpotted: dateSpotted ? new Date(dateSpotted) : null,
            location: location?.trim() || null,
            notes: notes?.trim() || null,
          },
        })
      )
    );
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not save these sightings." },
      { status: 500 }
    );
  }
}
