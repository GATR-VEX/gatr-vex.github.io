import { NextResponse } from "next/server";
import {
  createPrintJob,
  createPrintJobFromBlob,
  listPrintJobs,
  useBlobStorage,
} from "@/lib/print-queue";
import {
  isPrintFileKind,
  isPrintPriority,
  type PrintJobInput,
} from "@/lib/print-types";
import { requireMember } from "@/lib/require-member";

function formString(form: FormData, key: string): string {
  return String(form.get(key) ?? "").trim();
}

function fieldsFromRecord(source: Record<string, unknown>): PrintJobInput {
  const quantityRaw = source.quantity;
  const quantity =
    typeof quantityRaw === "number"
      ? quantityRaw
      : typeof quantityRaw === "string" && quantityRaw.trim()
        ? Number(quantityRaw)
        : 1;
  const priorityRaw =
    typeof source.priority === "string" ? source.priority : "normal";
  const fileKindRaw =
    typeof source.fileKind === "string" ? source.fileKind : "needs_slicing";

  return {
    name: typeof source.name === "string" ? source.name.trim() : "",
    description:
      typeof source.description === "string" ? source.description : "",
    quantity,
    material: typeof source.material === "string" ? source.material : "",
    color: typeof source.color === "string" ? source.color : "",
    priority: isPrintPriority(priorityRaw) ? priorityRaw : "normal",
    neededBy: typeof source.neededBy === "string" ? source.neededBy : "",
    layerHeight:
      typeof source.layerHeight === "string" ? source.layerHeight : "",
    infillPercent:
      typeof source.infillPercent === "string" ? source.infillPercent : "",
    printer: typeof source.printer === "string" ? source.printer : "",
    team: typeof source.team === "string" ? source.team : "",
    fileKind: isPrintFileKind(fileKindRaw) ? fileKindRaw : "needs_slicing",
    notes: typeof source.notes === "string" ? source.notes : "",
  };
}

export async function GET() {
  const session = await requireMember();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jobs = await listPrintJobs();
  return NextResponse.json({
    jobs,
    clientUpload: useBlobStorage(),
  });
}

export async function POST(request: Request) {
  const session = await requireMember();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const contentType = request.headers.get("content-type") ?? "";

    // Client already uploaded the file to Blob — JSON metadata only.
    if (contentType.includes("application/json")) {
      const body = (await request.json()) as Record<string, unknown>;
      const fileUrl = typeof body.fileUrl === "string" ? body.fileUrl : "";
      const fileName = typeof body.fileName === "string" ? body.fileName : "";
      const fileSize =
        typeof body.fileSize === "number"
          ? body.fileSize
          : typeof body.fileSize === "string"
            ? Number(body.fileSize)
            : 0;

      const job = await createPrintJobFromBlob({
        fileUrl,
        fileName,
        fileSize,
        submittedBy: session.user.email,
        submittedByName: session.user.name ?? null,
        fields: fieldsFromRecord(body),
      });

      return NextResponse.json({ job }, { status: 201 });
    }

    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required." }, { status: 400 });
    }

    const fields = fieldsFromRecord({
      name: formString(form, "name"),
      description: formString(form, "description"),
      quantity: formString(form, "quantity"),
      material: formString(form, "material"),
      color: formString(form, "color"),
      priority: formString(form, "priority"),
      neededBy: formString(form, "neededBy"),
      layerHeight: formString(form, "layerHeight"),
      infillPercent: formString(form, "infillPercent"),
      printer: formString(form, "printer"),
      team: formString(form, "team"),
      fileKind: formString(form, "fileKind"),
      notes: formString(form, "notes"),
    });

    const job = await createPrintJob({
      file,
      submittedBy: session.user.email,
      submittedByName: session.user.name ?? null,
      fields,
    });

    return NextResponse.json({ job }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not create job.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
