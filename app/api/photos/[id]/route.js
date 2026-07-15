import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/authGuard";

export async function DELETE(request, { params }) {
  const { errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  try {
    await prisma.photo.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not delete this photo." },
      { status: 500 }
    );
  }
}
