export const PRINT_ALLOWED_EXTENSIONS = [
  ".stl",
  ".3mf",
  ".obj",
  ".step",
  ".stp",
] as const;

const ALLOWED_EXTENSIONS = new Set<string>(PRINT_ALLOWED_EXTENSIONS);

export const PRINT_FILE_ACCEPT = PRINT_ALLOWED_EXTENSIONS.join(",");
export const PRINT_FILE_TYPES_LABEL = ".stl, .3mf, .obj, .step, or .stp";

/** App limit. Vercel serverless body limit is ~4.5MB — use client Blob upload above that. */
export const MAX_PRINT_FILE_BYTES = 50 * 1024 * 1024;

export function printExtension(fileName: string): string {
  const base = fileName.split(/[/\\]/).pop() ?? fileName;
  const dot = base.lastIndexOf(".");
  if (dot < 0) return "";
  return base.slice(dot).toLowerCase();
}

export function isAllowedPrintExtension(fileName: string): boolean {
  return ALLOWED_EXTENSIONS.has(printExtension(fileName));
}

export function printFileTypeError(): string {
  return `File must be ${PRINT_FILE_TYPES_LABEL}.`;
}
