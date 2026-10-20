import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import {
  isAllowedPrintExtension,
  MAX_PRINT_FILE_BYTES,
  printFileTypeError,
} from "@/lib/print-files";
import { useBlobStorage } from "@/lib/print-queue";
import { requireMember } from "@/lib/require-member";

export async function POST(request: Request): Promise<NextResponse> {
  const session = await requireMember();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!useBlobStorage()) {
    return NextResponse.json(
      { error: "Blob storage is not configured." },
      { status: 503 },
    );
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const base = pathname.split("/").pop() ?? pathname;
        if (!pathname.startsWith("prints/") || !isAllowedPrintExtension(base)) {
          throw new Error(printFileTypeError());
        }

        return {
          maximumSizeInBytes: MAX_PRINT_FILE_BYTES,
          addRandomSuffix: false,
          allowOverwrite: false,
          // Don't restrict MIME — browsers often mislabel CAD/mesh files.
          tokenPayload: JSON.stringify({
            email: session.user!.email,
          }),
        };
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
