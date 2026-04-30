import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

/**
 * Serves the repository root `terms.md` verbatim (UTF-8) for the in-app overlay.
 */
export async function GET() {
  const filePath = path.join(process.cwd(), "terms.md");
  try {
    const text = await readFile(filePath, "utf8");
    return new NextResponse(text, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Terms document not found.", { status: 404 });
  }
}
