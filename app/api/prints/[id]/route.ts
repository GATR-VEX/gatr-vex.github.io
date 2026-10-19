import { NextResponse } from "next/server";
import {
  deletePrintJob,
  isPrintStatus,
  updatePrintJobStatus,
} from "@/lib/print-queue";
import { requireMember } from "@/lib/require-member";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const session = await requireMember();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as { status?: string };
  const status = body.status;

  if (!status || !isPrintStatus(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const job = await updatePrintJobStatus(id, status);
  if (!job) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return NextResponse.json({ job });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await requireMember();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const ok = await deletePrintJob(id);
  if (!ok) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
