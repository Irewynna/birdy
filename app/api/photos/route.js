import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/authGuard";

export async function POST(request) {
  const { errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  const body = await request.json();
  const { speciesId, url, publicId, dateSpotted, location, notes } = body;

  if (!speciesId || !url || !publicId) {
    return NextResponse.json(
      { error: "speciesId and an uploaded photo are required." },
      { status: 400 }
    );
  }

  try {
    const photo = await prisma.photo.create({
      data: {
        speciesId,
        url,
        publicId,
        dateSpotted: dateSpotted ? new Date(dateSpotted) : null,
        location: location?.trim() || null,
        notes: notes?.trim() || null,
      },
    });
    return NextResponse.json(photo, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not save this sighting." },
      { status: 500 }
    );
  }
}
