import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/authGuard";

export async function GET(request, { params }) {
  const species = await prisma.species.findUnique({
    where: { id: params.id },
    include: { photos: { orderBy: { createdAt: "desc" } } },
  });

  if (!species) {
    return NextResponse.json({ error: "Specimen not found." }, { status: 404 });
  }
  return NextResponse.json(species);
}

export async function DELETE(request, { params }) {
  const { errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  try {
    // Photos cascade-delete via the schema relation, but Cloudinary assets
    // themselves are left in place — Cloudinary cleanup isn't wired up here
    // to keep the unsigned-upload setup simple. See README for notes.
    await prisma.species.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not delete this specimen." },
      { status: 500 }
    );
  }
}
