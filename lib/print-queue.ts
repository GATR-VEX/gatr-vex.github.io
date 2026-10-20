import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { del, list, put } from "@vercel/blob";
import {
  isAllowedPrintExtension,
  MAX_PRINT_FILE_BYTES,
  printFileTypeError,
} from "@/lib/print-files";
import {
  isPrintFileKind,
  isPrintPriority,
  isPrintStatus,
  normalizePrintJob,
  type PrintFileKind,
  type PrintJob,
  type PrintJobInput,
  type PrintPriority,
  type PrintStatus,
} from "@/lib/print-types";

export type { PrintJob, PrintStatus };
export {
  PRINT_STATUSES,
  isPrintStatus,
  statusLabel,
} from "@/lib/print-types";
export {
  isAllowedPrintExtension,
  MAX_PRINT_FILE_BYTES,
  PRINT_FILE_ACCEPT,
  PRINT_FILE_TYPES_LABEL,
  printFileTypeError,
} from "@/lib/print-files";

const DATA_DIR = path.join(process.cwd(), "data");
const QUEUE_FILE = path.join(DATA_DIR, "print-queue.json");
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "prints");
const BLOB_QUEUE_PATHNAME = "print-queue/queue.json";
const BLOB_QUEUE_REVISIONS_PREFIX = "print-queue/revisions/";

export function useBlobStorage(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function useBlob(): boolean {
  return useBlobStorage();
}

export function isAllowedPrintBlobUrl(url: string): boolean {
  try {
    const u = new URL(url);
    const hostOk =
      u.hostname.endsWith(".blob.vercel-storage.com") ||
      u.hostname.endsWith(".public.blob.vercel-storage.com");
    return hostOk && u.pathname.includes("/prints/");
  } catch {
    return false;
  }
}

async function ensureDirs() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

function normalizeJobs(parsed: unknown): PrintJob[] {
  if (!Array.isArray(parsed)) return [];
  return parsed.map((job) =>
    normalizePrintJob(
      job as Partial<PrintJob> &
        Pick<
          PrintJob,
          | "id"
          | "name"
          | "status"
          | "fileName"
          | "fileUrl"
          | "submittedBy"
          | "createdAt"
          | "updatedAt"
        >,
    ),
  );
}

async function readQueueLocal(): Promise<PrintJob[]> {
  await ensureDirs();
  try {
    const raw = await fs.readFile(QUEUE_FILE, "utf8");
    return normalizeJobs(JSON.parse(raw) as unknown);
  } catch {
    return [];
  }
}

async function writeQueueLocal(jobs: PrintJob[]) {
  await ensureDirs();
  await fs.writeFile(QUEUE_FILE, JSON.stringify(jobs, null, 2), "utf8");
}

async function fetchJobsFromBlobUrl(url: string): Promise<PrintJob[]> {
  // Bust CDN cache — public blob URLs are cached aggressively by default.
  const bust = new URL(url);
  bust.searchParams.set("t", String(Date.now()));
  const res = await fetch(bust.toString(), { cache: "no-store" });
  if (!res.ok) return [];
  return normalizeJobs((await res.json()) as unknown);
}

async function readQueueBlob(): Promise<PrintJob[]> {
  try {
    // Prefer versioned revisions (unique URL per write) so deletes/edits stick.
    const revisions = await list({ prefix: BLOB_QUEUE_REVISIONS_PREFIX });
    if (revisions.blobs.length > 0) {
      const latest = [...revisions.blobs].sort(
        (a, b) =>
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
      )[0]!;
      return fetchJobsFromBlobUrl(latest.url);
    }

    // Legacy single-file queue (pre-revision storage)
    const listed = await list({ prefix: BLOB_QUEUE_PATHNAME, limit: 10 });
    const match = listed.blobs.find((b) => b.pathname === BLOB_QUEUE_PATHNAME);
    if (!match) return [];
    return fetchJobsFromBlobUrl(match.url);
  } catch {
    return [];
  }
}

async function writeQueueBlob(jobs: PrintJob[]) {
  const pathname = `${BLOB_QUEUE_REVISIONS_PREFIX}${Date.now()}-${randomUUID()}.json`;
  await put(pathname, JSON.stringify(jobs, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    // Keep cache short; reads also bust with a query param.
    cacheControlMaxAge: 60,
  });

  // Prune older revisions + legacy file so the queue doesn't grow forever.
  try {
    const listed = await list({ prefix: "print-queue/" });
    const obsolete = listed.blobs.filter((b) => b.pathname !== pathname);
    if (obsolete.length > 0) {
      await del(obsolete.map((b) => b.url));
    }
  } catch {
    // Best-effort cleanup
  }
}

async function readQueue(): Promise<PrintJob[]> {
  return useBlob() ? readQueueBlob() : readQueueLocal();
}

async function writeQueue(jobs: PrintJob[]) {
  if (useBlob()) {
    await writeQueueBlob(jobs);
  } else {
    await writeQueueLocal(jobs);
  }
}

export async function listPrintJobs(): Promise<PrintJob[]> {
  const jobs = await readQueue();
  return jobs.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function getPrintJob(id: string): Promise<PrintJob | null> {
  const jobs = await readQueue();
  return jobs.find((j) => j.id === id) ?? null;
}

function safeFileName(original: string): string {
  return original.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

function str(value: string | undefined): string {
  return (value ?? "").trim();
}

function buildJobFields(fields: PrintJobInput): {
  name: string;
  quantity: number;
  priority: PrintPriority;
  description: string;
  material: string;
  color: string;
  neededBy: string;
  infillPercent: string;
  walls: string;
  printer: string;
  team: string;
  fileKind: PrintFileKind | undefined;
  notes: string;
} {
  const name = str(fields.name);
  if (!name) {
    throw new Error("Part name is required.");
  }

  const quantity = fields.quantity ?? 1;
  if (!Number.isFinite(quantity) || quantity < 1 || quantity > 100) {
    throw new Error("Quantity must be between 1 and 100.");
  }

  const priorityRaw = str(fields.priority) || "normal";
  const priority = isPrintPriority(priorityRaw) ? priorityRaw : "normal";

  return {
    name,
    quantity,
    priority,
    description: str(fields.description),
    material: str(fields.material),
    color: str(fields.color),
    neededBy: str(fields.neededBy),
    infillPercent: str(fields.infillPercent),
    walls: str(fields.walls),
    printer: str(fields.printer),
    team: str(fields.team),
    fileKind: fields.fileKind,
    notes: str(fields.notes),
  };
}

async function appendJob(job: PrintJob): Promise<PrintJob> {
  const jobs = await readQueue();
  jobs.push(job);
  await writeQueue(jobs);
  return job;
}

/** Create a job from a file already uploaded to Vercel Blob (client upload). */
export async function createPrintJobFromBlob(input: {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  submittedBy: string;
  submittedByName: string | null;
  fields: PrintJobInput;
}): Promise<PrintJob> {
  const originalName = input.fileName || "model.stl";
  if (!isAllowedPrintExtension(originalName)) {
    throw new Error(printFileTypeError());
  }
  if (input.fileSize <= 0 || input.fileSize > MAX_PRINT_FILE_BYTES) {
    throw new Error("File must be under 50 MB.");
  }
  if (!isAllowedPrintBlobUrl(input.fileUrl)) {
    throw new Error("Invalid file URL.");
  }

  const built = buildJobFields(input.fields);
  const now = new Date().toISOString();
  const job = normalizePrintJob({
    id: randomUUID(),
    name: built.name,
    status: "queued",
    fileName: originalName,
    fileUrl: input.fileUrl,
    submittedBy: input.submittedBy,
    submittedByName: input.submittedByName,
    createdAt: now,
    updatedAt: now,
    description: built.description,
    quantity: built.quantity,
    material: built.material,
    color: built.color,
    priority: built.priority,
    neededBy: built.neededBy,
    infillPercent: built.infillPercent,
    walls: built.walls,
    printer: built.printer,
    team: built.team,
    fileKind: built.fileKind,
    notes: built.notes,
  });

  return appendJob(job);
}

export async function createPrintJob(input: {
  file: File;
  submittedBy: string;
  submittedByName: string | null;
  fields: PrintJobInput;
}): Promise<PrintJob> {
  const originalName = input.file.name || "model.stl";
  if (!isAllowedPrintExtension(originalName)) {
    throw new Error(printFileTypeError());
  }
  if (input.file.size <= 0 || input.file.size > MAX_PRINT_FILE_BYTES) {
    throw new Error("File must be under 50 MB.");
  }

  const built = buildJobFields(input.fields);
  const id = randomUUID();
  const storedName = `${id}-${safeFileName(originalName)}`;
  const buffer = Buffer.from(await input.file.arrayBuffer());

  let fileUrl: string;
  if (useBlob()) {
    const blob = await put(`prints/${storedName}`, buffer, {
      access: "public",
      addRandomSuffix: false,
      contentType: input.file.type || "application/octet-stream",
    });
    fileUrl = blob.url;
  } else {
    await ensureDirs();
    await fs.writeFile(path.join(UPLOAD_DIR, storedName), buffer);
    fileUrl = `/uploads/prints/${storedName}`;
  }

  const now = new Date().toISOString();
  const job = normalizePrintJob({
    id,
    name: built.name,
    status: "queued",
    fileName: originalName,
    fileUrl,
    submittedBy: input.submittedBy,
    submittedByName: input.submittedByName,
    createdAt: now,
    updatedAt: now,
    description: built.description,
    quantity: built.quantity,
    material: built.material,
    color: built.color,
    priority: built.priority,
    neededBy: built.neededBy,
    infillPercent: built.infillPercent,
    walls: built.walls,
    printer: built.printer,
    team: built.team,
    fileKind: built.fileKind,
    notes: built.notes,
  });

  return appendJob(job);
}

export async function updatePrintJobStatus(
  id: string,
  status: PrintStatus,
): Promise<PrintJob | null> {
  if (!isPrintStatus(status)) return null;

  const jobs = await readQueue();
  const index = jobs.findIndex((j) => j.id === id);
  if (index < 0) return null;

  const updated: PrintJob = {
    ...jobs[index]!,
    status,
    updatedAt: new Date().toISOString(),
  };
  jobs[index] = updated;
  await writeQueue(jobs);
  return updated;
}

export type PrintJobUpdate = {
  name?: string;
  status?: PrintStatus;
  description?: string;
  quantity?: number;
  material?: string;
  color?: string;
  priority?: PrintPriority;
  neededBy?: string;
  infillPercent?: string;
  walls?: string;
  printer?: string;
  team?: string;
  fileKind?: PrintFileKind;
  notes?: string;
};

export async function updatePrintJob(
  id: string,
  patch: PrintJobUpdate,
): Promise<PrintJob | null> {
  const jobs = await readQueue();
  const index = jobs.findIndex((j) => j.id === id);
  if (index < 0) return null;

  const current = jobs[index]!;
  const name =
    patch.name !== undefined ? str(patch.name) : current.name;
  if (!name) {
    throw new Error("Part name is required.");
  }

  let quantity = current.quantity;
  if (patch.quantity !== undefined) {
    if (
      !Number.isFinite(patch.quantity) ||
      patch.quantity < 1 ||
      patch.quantity > 100
    ) {
      throw new Error("Quantity must be between 1 and 100.");
    }
    quantity = patch.quantity;
  }

  const priority =
    patch.priority !== undefined
      ? isPrintPriority(patch.priority)
        ? patch.priority
        : current.priority
      : current.priority;

  const status =
    patch.status !== undefined
      ? isPrintStatus(patch.status)
        ? patch.status
        : current.status
      : current.status;

  const fileKind =
    patch.fileKind !== undefined
      ? isPrintFileKind(patch.fileKind)
        ? patch.fileKind
        : current.fileKind
      : current.fileKind;

  const updated = normalizePrintJob({
    ...current,
    name,
    status,
    quantity,
    priority,
    fileKind,
    description:
      patch.description !== undefined
        ? str(patch.description)
        : current.description,
    material:
      patch.material !== undefined ? str(patch.material) : current.material,
    color: patch.color !== undefined ? str(patch.color) : current.color,
    neededBy:
      patch.neededBy !== undefined ? str(patch.neededBy) : current.neededBy,
    infillPercent:
      patch.infillPercent !== undefined
        ? str(patch.infillPercent)
        : current.infillPercent,
    walls: patch.walls !== undefined ? str(patch.walls) : current.walls,
    printer:
      patch.printer !== undefined ? str(patch.printer) : current.printer,
    team: patch.team !== undefined ? str(patch.team) : current.team,
    notes: patch.notes !== undefined ? str(patch.notes) : current.notes,
    updatedAt: new Date().toISOString(),
  });

  jobs[index] = updated;
  await writeQueue(jobs);
  return updated;
}

export async function deletePrintJob(id: string): Promise<boolean> {
  const jobs = await readQueue();
  const job = jobs.find((j) => j.id === id);
  if (!job) return false;

  const remaining = jobs.filter((j) => j.id !== id);
  await writeQueue(remaining);

  if (useBlob() && /^https?:\/\//.test(job.fileUrl)) {
    try {
      await del(job.fileUrl);
    } catch {
      // File may already be gone
    }
  } else if (job.fileUrl.startsWith("/uploads/prints/")) {
    try {
      await fs.unlink(path.join(process.cwd(), "public", job.fileUrl));
    } catch {
      // File may already be gone
    }
  }
  return true;
}
