import { NextResponse } from "next/server";
import { createPrintJob, listPrintJobs } from "@/lib/print-queue";
import {
  isPrintFileKind,
  isPrintPriority,
  type PrintJobInput,
} from "@/lib/print-types";
import { requireMember } from "@/lib/require-member";

function formString(form: FormData, key: string): string {
  return String(form.get(key) ?? "").trim();
}

export async function GET() {
  const session = await requireMember();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jobs = await listPrintJobs();
  return NextResponse.json({ jobs });
}

export async function POST(request: Request) {
  const session = await requireMember();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required." }, { status: 400 });
    }

    const quantityRaw = formString(form, "quantity");
    const quantity = quantityRaw ? Number(quantityRaw) : 1;
    const priorityRaw = formString(form, "priority") || "normal";
    const fileKindRaw = formString(form, "fileKind") || "needs_slicing";

    const fields: PrintJobInput = {
      name: formString(form, "name"),
      description: formString(form, "description"),
      quantity,
      material: formString(form, "material"),
      color: formString(form, "color"),
      priority: isPrintPriority(priorityRaw) ? priorityRaw : "normal",
      neededBy: formString(form, "neededBy"),
      layerHeight: formString(form, "layerHeight"),
      infillPercent: formString(form, "infillPercent"),
      printer: formString(form, "printer"),
      team: formString(form, "team"),
      fileKind: isPrintFileKind(fileKindRaw) ? fileKindRaw : "needs_slicing",
      notes: formString(form, "notes"),
    };

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
