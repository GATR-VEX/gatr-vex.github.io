export const PRINT_STATUSES = [
  "queued",
  "printing",
  "done",
  "failed",
] as const;

export type PrintStatus = (typeof PRINT_STATUSES)[number];

export const PRINT_PRIORITIES = ["low", "normal", "high", "urgent"] as const;
export type PrintPriority = (typeof PRINT_PRIORITIES)[number];

export const PRINT_MATERIALS = [
  "PLA",
  "PETG",
  "ABS",
  "ASA",
  "TPU",
  "Nylon",
  "Other",
] as const;

export type PrintJob = {
  id: string;
  name: string;
  status: PrintStatus;
  fileName: string;
  fileUrl: string;
  submittedBy: string;
  submittedByName: string | null;
  createdAt: string;
  updatedAt: string;

  /** Extra fields — leave blank when submitting if unused */
  description: string;
  quantity: number;
  material: string;
  color: string;
  priority: PrintPriority;
  neededBy: string;
  layerHeight: string;
  infillPercent: string;
  printer: string;
  team: string;
  notes: string;
};

export type PrintJobInput = {
  name: string;
  description?: string;
  quantity?: number;
  material?: string;
  color?: string;
  priority?: PrintPriority;
  neededBy?: string;
  layerHeight?: string;
  infillPercent?: string;
  printer?: string;
  team?: string;
  notes?: string;
};

export function isPrintStatus(value: string): value is PrintStatus {
  return (PRINT_STATUSES as readonly string[]).includes(value);
}

export function isPrintPriority(value: string): value is PrintPriority {
  return (PRINT_PRIORITIES as readonly string[]).includes(value);
}

export function statusLabel(status: PrintStatus): string {
  switch (status) {
    case "queued":
      return "Needs print";
    case "printing":
      return "In progress";
    case "done":
      return "Done";
    case "failed":
      return "Failed";
  }
}

export function priorityLabel(priority: PrintPriority): string {
  switch (priority) {
    case "low":
      return "Low";
    case "normal":
      return "Normal";
    case "high":
      return "High";
    case "urgent":
      return "Urgent";
  }
}

/** Normalize older queue entries that predate extra fields */
export function normalizePrintJob(
  job: Partial<PrintJob> &
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
): PrintJob {
  return {
    id: job.id,
    name: job.name,
    status: job.status,
    fileName: job.fileName,
    fileUrl: job.fileUrl,
    submittedBy: job.submittedBy,
    submittedByName: job.submittedByName ?? null,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    description: job.description ?? "",
    quantity:
      typeof job.quantity === "number" && job.quantity > 0 ? job.quantity : 1,
    material: job.material ?? "",
    color: job.color ?? "",
    priority:
      job.priority && isPrintPriority(job.priority) ? job.priority : "normal",
    neededBy: job.neededBy ?? "",
    layerHeight: job.layerHeight ?? "",
    infillPercent: job.infillPercent ?? "",
    printer: job.printer ?? "",
    team: job.team ?? "",
    notes: job.notes ?? "",
  };
}
