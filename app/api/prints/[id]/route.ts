import { NextResponse } from "next/server";
import {
  deletePrintJob,
  updatePrintJob,
  updatePrintJobStatus,
} from "@/lib/print-queue";
import {
  isPrintFileKind,
  isPrintPriority,
  isPrintStatus,
} from "@/lib/print-types";
import { requireMember } from "@/lib/require-member";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const session = await requireMember();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as Record<string, unknown>;

  // Status-only updates (queue dropdown)
  const keys = Object.keys(body);
  if (keys.length === 1 && keys[0] === "status") {
    const status = typeof body.status === "string" ? body.status : "";
    if (!isPrintStatus(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    const job = await updatePrintJobStatus(id, status);
    if (!job) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    return NextResponse.json({ job });
  }

  try {
    const patch: Parameters<typeof updatePrintJob>[1] = {};

    if (typeof body.name === "string") patch.name = body.name;
    if (typeof body.description === "string") patch.description = body.description;
    if (typeof body.material === "string") patch.material = body.material;
    if (typeof body.color === "string") patch.color = body.color;
    if (typeof body.neededBy === "string") patch.neededBy = body.neededBy;
    if (typeof body.infillPercent === "string")
      patch.infillPercent = body.infillPercent;
    if (typeof body.walls === "string") patch.walls = body.walls;
    if (typeof body.printer === "string") patch.printer = body.printer;
    if (typeof body.team === "string") patch.team = body.team;
    if (typeof body.notes === "string") patch.notes = body.notes;

    if (typeof body.quantity === "number") {
      patch.quantity = body.quantity;
    } else if (typeof body.quantity === "string" && body.quantity.trim()) {
      patch.quantity = Number(body.quantity);
    }

    if (typeof body.status === "string" && isPrintStatus(body.status)) {
      patch.status = body.status;
    }
    if (typeof body.priority === "string" && isPrintPriority(body.priority)) {
      patch.priority = body.priority;
    }
    if (typeof body.fileKind === "string" && isPrintFileKind(body.fileKind)) {
      patch.fileKind = body.fileKind;
    }

    const job = await updatePrintJob(id, patch);
    if (!job) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    return NextResponse.json({ job });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not update.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
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
