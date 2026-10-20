"use client";

import { upload } from "@vercel/blob/client";
import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  PRINT_FILE_KINDS,
  PRINT_MATERIALS,
  PRINT_PRINTERS,
  PRINT_PRIORITIES,
  PRINT_STATUSES,
  fileKindLabel,
  priorityLabel,
  statusLabel,
  type PrintFileKind,
  type PrintJob,
  type PrintPriority,
  type PrintStatus,
} from "@/lib/print-types";
import { ModelViewer } from "@/components/ModelViewer";
import { btnPrimary, btnSecondary, inputClass } from "@/lib/ui";

const MAX_PRINT_FILE_BYTES = 50 * 1024 * 1024;

async function readApiJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    if (
      res.status === 413 ||
      /request entity too large/i.test(text) ||
      text.trimStart().startsWith("Request En")
    ) {
      throw new Error(
        "File is too large for the server (about 4.5 MB max). Try a smaller file, or refresh — large uploads should go direct to storage.",
      );
    }
    throw new Error(
      text.trim().slice(0, 200) || `Request failed (${res.status}).`,
    );
  }
}

function safeUploadName(original: string): string {
  return original.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

const emptyForm = {
  name: "",
  description: "",
  quantity: "1",
  material: "PLA",
  color: "",
  priority: "normal" as PrintPriority,
  neededBy: "",
  layerHeight: "",
  infillPercent: "",
  printer: "",
  team: "",
  fileKind: "needs_slicing" as PrintFileKind,
  notes: "",
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label className="block text-sm text-ink-muted mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  if (!value.trim()) return null;
  return (
    <div className="flex gap-3 text-sm py-1.5 border-b border-rule last:border-0">
      <dt className="w-36 shrink-0 text-ink-muted">{label}</dt>
      <dd className="text-ink min-w-0 break-words">{value}</dd>
    </div>
  );
}

export function PrintQueue() {
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [boardTab, setBoardTab] = useState<PrintStatus>("queued");
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editStatus, setEditStatus] = useState<PrintStatus>("queued");
  const [savingEdit, setSavingEdit] = useState(false);
  const [clientUpload, setClientUpload] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/prints");
      if (!res.ok) throw new Error("Could not load queue.");
      const data = (await res.json()) as {
        jobs: PrintJob[];
        clientUpload?: boolean;
      };
      setJobs(data.jobs);
      setClientUpload(Boolean(data.clientUpload));
    } catch {
      setError("Could not load the print queue.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const boardJobs = jobs.filter((j) => j.status === boardTab);
  const selected =
    boardJobs.find((j) => j.id === selectedId) ?? boardJobs[0] ?? null;

  useEffect(() => {
    if (selected && selected.id !== selectedId) {
      setSelectedId(selected.id);
    } else if (!selected && selectedId) {
      setSelectedId(null);
    }
  }, [selected, selectedId]);

  useEffect(() => {
    setEditing(false);
  }, [selectedId, boardTab]);

  function setField<K extends keyof typeof emptyForm>(
    key: K,
    value: (typeof emptyForm)[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setEditField<K extends keyof typeof emptyForm>(
    key: K,
    value: (typeof emptyForm)[K],
  ) {
    setEditForm((prev) => ({ ...prev, [key]: value }));
  }

  function startEdit(job: PrintJob) {
    setEditForm({
      name: job.name,
      description: job.description,
      quantity: String(job.quantity),
      material: job.material || "PLA",
      color: job.color,
      priority: job.priority,
      neededBy: job.neededBy,
      layerHeight: job.layerHeight,
      infillPercent: job.infillPercent,
      printer: job.printer,
      team: job.team,
      fileKind: job.fileKind,
      notes: job.notes,
    });
    setEditStatus(job.status);
    setEditing(true);
    setError(null);
  }

  async function saveEdit(id: string) {
    if (!editForm.name.trim()) {
      setError("Part name is required.");
      return;
    }

    setSavingEdit(true);
    setError(null);
    try {
      const res = await fetch(`/api/prints/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          quantity: Number(editForm.quantity) || 1,
          status: editStatus,
        }),
      });
      const data = (await res.json()) as { job?: PrintJob; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not save.");

      if (data.job) {
        setJobs((prev) => prev.map((j) => (j.id === id ? data.job! : j)));
        if (data.job.status !== boardTab) {
          setBoardTab(data.job.status);
        }
        setSelectedId(data.job.id);
      }
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSavingEdit(false);
    }
  }

  function partNameForFile(file: File): string {
    const stem =
      file.name.replace(/\.(gcode\.)?(stl|obj|3mf)$/i, "") || file.name;
    const base = form.name.trim();
    if (files.length === 1) return base || stem;
    if (!base) return stem;
    return `${base} — ${stem}`;
  }

  async function createJobForFile(file: File): Promise<PrintJob> {
    if (file.size <= 0 || file.size > MAX_PRINT_FILE_BYTES) {
      throw new Error(`“${file.name}” must be under 50 MB.`);
    }

    const fields = {
      ...form,
      name: partNameForFile(file),
      quantity: Number(form.quantity) || 1,
    };

    if (clientUpload) {
      const pathname = `prints/${crypto.randomUUID()}-${safeUploadName(file.name)}`;
      const blob = await upload(pathname, file, {
        access: "public",
        handleUploadUrl: "/api/prints/upload",
        multipart: file.size > 4 * 1024 * 1024,
      });

      const res = await fetch("/api/prints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fields,
          fileUrl: blob.url,
          fileName: file.name,
          fileSize: file.size,
        }),
      });
      const data = await readApiJson<{ job?: PrintJob; error?: string }>(res);
      if (!res.ok || !data.job) {
        throw new Error(data.error ?? `Could not add “${file.name}”.`);
      }
      return data.job;
    }

    const body = new FormData();
    body.set("file", file);
    for (const [key, value] of Object.entries(form)) {
      body.set(key, key === "name" ? partNameForFile(file) : value);
    }
    const res = await fetch("/api/prints", { method: "POST", body });
    const data = await readApiJson<{ job?: PrintJob; error?: string }>(res);
    if (!res.ok || !data.job) {
      throw new Error(data.error ?? `Could not add “${file.name}”.`);
    }
    return data.job;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (files.length === 0) return;

    setSubmitting(true);
    setError(null);

    try {
      let lastJob: PrintJob | undefined;
      for (let i = 0; i < files.length; i++) {
        const file = files[i]!;
        try {
          lastJob = await createJobForFile(file);
        } catch (err) {
          const detail =
            err instanceof Error ? err.message : "Upload failed.";
          throw new Error(
            files.length > 1
              ? `${detail} (file ${i + 1} of ${files.length})`
              : detail,
          );
        }
      }

      setForm(emptyForm);
      setFiles([]);
      setShowAddForm(false);
      const input = document.getElementById(
        "print-file",
      ) as HTMLInputElement | null;
      if (input) input.value = "";

      await load();
      if (lastJob) {
        setBoardTab(lastJob.status);
        setSelectedId(lastJob.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function setStatus(id: string, status: PrintStatus) {
    setError(null);
    const res = await fetch(`/api/prints/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      setError("Could not update status.");
      return;
    }
    const data = (await res.json()) as { job: PrintJob };
    setJobs((prev) => prev.map((j) => (j.id === id ? data.job : j)));
    setBoardTab(status);
    setSelectedId(id);
  }

  async function removeJob(id: string) {
    const job = jobs.find((j) => j.id === id);
    const label = job?.name ? `“${job.name}”` : "this print";
    if (!window.confirm(`Delete ${label}? This can’t be undone.`)) return;

    setError(null);
    const res = await fetch(`/api/prints/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Could not delete job.");
      return;
    }
    setJobs((prev) => prev.filter((j) => j.id !== id));
    setSelectedId((current) => (current === id ? null : current));
  }

  function closeAddForm() {
    setShowAddForm(false);
    setForm(emptyForm);
    setFiles([]);
    const input = document.getElementById(
      "print-file",
    ) as HTMLInputElement | null;
    if (input) input.value = "";
  }

  const isBulk = files.length > 1;
  const canSubmit = files.length > 0;

  return (
    <div className="space-y-10">
      <section>
        {!showAddForm ? (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className={btnPrimary}
          >
            Add print
          </button>
        ) : (
          <>
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="font-heading text-lg font-medium text-ink">
                Add print
              </h2>
              <button
                type="button"
                onClick={closeAddForm}
                className="text-sm text-ink-muted hover:text-ink"
              >
                Cancel
              </button>
            </div>
            <form onSubmit={onSubmit} className="space-y-4">
              <Field
                label={
                  isBulk ? "Name prefix (optional)" : "Part name (optional)"
                }
              >
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  className={inputClass}
                  placeholder={
                    isBulk
                      ? "Applied before each file name"
                      : "Defaults to file name"
                  }
                />
              </Field>

              <div className="space-y-2">
                <input
                  id="print-file"
                  type="file"
                  multiple
                  accept=".stl,.3mf,.obj"
                  className="sr-only"
                  onChange={(e) => {
                    const picked = Array.from(e.target.files ?? []);
                    if (picked.length === 0) return;
                    setFiles((prev) => {
                      const next = [...prev];
                      for (const file of picked) {
                        const dup = next.some(
                          (f) =>
                            f.name === file.name &&
                            f.size === file.size &&
                            f.lastModified === file.lastModified,
                        );
                        if (!dup) next.push(file);
                      }
                      return next;
                    });
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("print-file")?.click()
                  }
                  className={btnPrimary}
                >
                  Add files
                </button>
                {files.length > 0 ? (
                  <ul className="text-sm text-ink divide-y divide-rule border border-rule rounded-xl overflow-hidden">
                    {files.map((f, i) => (
                      <li
                        key={`${f.name}-${f.size}-${f.lastModified}-${i}`}
                        className="flex items-center justify-between gap-3 px-3 py-2"
                      >
                        <span className="truncate text-ink-muted">{f.name}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setFiles((prev) => prev.filter((_, j) => j !== i))
                          }
                          className="shrink-0 text-ink-muted hover:text-red-600 text-xs"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              <Field label="Description">
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  className={inputClass}
                  placeholder="What is this part for?"
                />
              </Field>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Field label="Quantity">
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={form.quantity}
                    onChange={(e) => setField("quantity", e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Material">
                  <select
                    value={form.material}
                    onChange={(e) => setField("material", e.target.value)}
                    className={inputClass}
                  >
                    <option value="">—</option>
                    {PRINT_MATERIALS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Color">
                  <input
                    type="text"
                    value={form.color}
                    onChange={(e) => setField("color", e.target.value)}
                    className={inputClass}
                    placeholder="e.g. black"
                  />
                </Field>
                <Field label="Priority">
                  <select
                    value={form.priority}
                    onChange={(e) =>
                      setField("priority", e.target.value as PrintPriority)
                    }
                    className={inputClass}
                  >
                    {PRINT_PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {priorityLabel(p)}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Field label="Needed by">
                  <input
                    type="date"
                    value={form.neededBy}
                    onChange={(e) => setField("neededBy", e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Layer height (mm)">
                  <input
                    type="text"
                    value={form.layerHeight}
                    onChange={(e) => setField("layerHeight", e.target.value)}
                    className={inputClass}
                    placeholder="e.g. 0.2"
                  />
                </Field>
                <Field label="Infill (%)">
                  <input
                    type="text"
                    value={form.infillPercent}
                    onChange={(e) => setField("infillPercent", e.target.value)}
                    className={inputClass}
                    placeholder="e.g. 20"
                  />
                </Field>
                <Field label="Printer">
                  <select
                    value={form.printer}
                    onChange={(e) => setField("printer", e.target.value)}
                    className={inputClass}
                  >
                    <option value="">—</option>
                    {PRINT_PRINTERS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Field label="Team">
                  <select
                    value={form.team}
                    onChange={(e) => setField("team", e.target.value)}
                    className={inputClass}
                  >
                    <option value="">—</option>
                    <option value="GATR1">GATR1</option>
                    <option value="GATR2">GATR2</option>
                    <option value="Both">Both</option>
                    <option value="Other">Other</option>
                  </select>
                </Field>
                <Field label="File type">
                  <select
                    value={form.fileKind}
                    onChange={(e) =>
                      setField("fileKind", e.target.value as PrintFileKind)
                    }
                    className={inputClass}
                  >
                    {PRINT_FILE_KINDS.map((kind) => (
                      <option key={kind} value={kind}>
                        {fileKindLabel(kind)}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Notes">
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setField("notes", e.target.value)}
                  className={inputClass}
                  placeholder="Orientation, tolerances, special instructions…"
                />
              </Field>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={submitting || !canSubmit}
                  className={`${btnPrimary} disabled:opacity-50`}
                >
                  {submitting
                    ? isBulk
                      ? `Adding ${files.length}…`
                      : "Adding…"
                    : isBulk
                      ? `Add ${files.length} to queue`
                      : "Add to queue"}
                </button>
                <button
                  type="button"
                  onClick={closeAddForm}
                  className={btnSecondary}
                >
                  Cancel
                </button>
              </div>
            </form>
          </>
        )}
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </section>

      <section className="space-y-6">
        <div className="flex flex-wrap gap-1 border-b border-rule">
          {PRINT_STATUSES.map((status) => {
            const count = jobs.filter((j) => j.status === status).length;
            const active = boardTab === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setBoardTab(status)}
                className={`px-3 py-2.5 text-sm transition-colors border-b-2 -mb-px ${
                  active
                    ? "border-accent text-ink font-medium"
                    : "border-transparent text-ink-muted hover:text-ink"
                }`}
              >
                {statusLabel(status)}
                <span className="ml-1.5 text-xs tabular-nums text-ink-muted">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 min-w-0">
          {loading ? (
            <p className="text-sm text-ink-muted">Loading…</p>
          ) : boardJobs.length === 0 ? (
            <p className="text-sm text-ink-muted">
              No prints in {statusLabel(boardTab).toLowerCase()}.
            </p>
          ) : (
            <ul className="space-y-2">
              {boardJobs.map((job) => {
                const active = job.id === selected?.id;
                return (
                  <li key={job.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(job.id)}
                      className={`w-full min-w-0 text-left rounded-xl border px-3 py-3 transition-colors ${
                        active
                          ? "border-ink bg-surface"
                          : "border-rule bg-white hover:border-ink/40 hover:bg-surface/70"
                      }`}
                    >
                      <p className="text-sm font-medium text-ink truncate">
                        {job.name}
                      </p>
                      <p className="text-xs text-ink-muted truncate mt-0.5">
                        {[
                          fileKindLabel(job.fileKind),
                          job.material,
                          job.color,
                          job.quantity > 1 ? `×${job.quantity}` : "",
                          priorityLabel(job.priority),
                        ]
                          .filter(Boolean)
                          .join(" · ") || job.fileName}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="lg:col-span-3">
          {selected ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-heading text-lg font-medium text-ink">
                    {selected.name}
                  </h3>
                  <p className="text-sm text-ink-muted mt-0.5">
                    {selected.fileName}
                    {selected.submittedByName
                      ? ` · ${selected.submittedByName}`
                      : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {!editing ? (
                    <>
                      <select
                        value={selected.status}
                        onChange={(e) =>
                          void setStatus(
                            selected.id,
                            e.target.value as PrintStatus,
                          )
                        }
                        className="border border-rule bg-white px-3 py-2 text-sm outline-none focus:border-ink rounded-full"
                      >
                        {PRINT_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {statusLabel(status)}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => startEdit(selected)}
                        className="text-sm text-ink-muted hover:text-ink"
                      >
                        Edit
                      </button>
                      <a
                        href={selected.fileUrl}
                        download={selected.fileName}
                        className="text-sm text-ink-muted hover:text-ink"
                      >
                        Download
                      </a>
                      <button
                        type="button"
                        onClick={() => void removeJob(selected.id)}
                        className="text-sm text-ink-muted hover:text-red-600"
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        disabled={savingEdit}
                        onClick={() => void saveEdit(selected.id)}
                        className={`${btnPrimary} disabled:opacity-50`}
                      >
                        {savingEdit ? "Saving…" : "Save"}
                      </button>
                      <button
                        type="button"
                        disabled={savingEdit}
                        onClick={() => {
                          setEditing(false);
                          setError(null);
                        }}
                        className={btnSecondary}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>

              <ModelViewer
                url={selected.fileUrl}
                fileName={selected.fileName}
                className="h-[320px] w-full border border-rule rounded-2xl overflow-hidden"
              />

              {editing ? (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Part name">
                      <input
                        type="text"
                        required
                        value={editForm.name}
                        onChange={(e) => setEditField("name", e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Status">
                      <select
                        value={editStatus}
                        onChange={(e) =>
                          setEditStatus(e.target.value as PrintStatus)
                        }
                        className={inputClass}
                      >
                        {PRINT_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {statusLabel(status)}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <Field label="Description">
                    <textarea
                      rows={2}
                      value={editForm.description}
                      onChange={(e) =>
                        setEditField("description", e.target.value)
                      }
                      className={inputClass}
                    />
                  </Field>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Field label="Quantity">
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={editForm.quantity}
                        onChange={(e) =>
                          setEditField("quantity", e.target.value)
                        }
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Material">
                      <select
                        value={editForm.material}
                        onChange={(e) =>
                          setEditField("material", e.target.value)
                        }
                        className={inputClass}
                      >
                        <option value="">—</option>
                        {PRINT_MATERIALS.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Color">
                      <input
                        type="text"
                        value={editForm.color}
                        onChange={(e) => setEditField("color", e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Priority">
                      <select
                        value={editForm.priority}
                        onChange={(e) =>
                          setEditField(
                            "priority",
                            e.target.value as PrintPriority,
                          )
                        }
                        className={inputClass}
                      >
                        {PRINT_PRIORITIES.map((p) => (
                          <option key={p} value={p}>
                            {priorityLabel(p)}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Field label="Needed by">
                      <input
                        type="date"
                        value={editForm.neededBy}
                        onChange={(e) =>
                          setEditField("neededBy", e.target.value)
                        }
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Layer height (mm)">
                      <input
                        type="text"
                        value={editForm.layerHeight}
                        onChange={(e) =>
                          setEditField("layerHeight", e.target.value)
                        }
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Infill (%)">
                      <input
                        type="text"
                        value={editForm.infillPercent}
                        onChange={(e) =>
                          setEditField("infillPercent", e.target.value)
                        }
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Printer">
                      <select
                        value={editForm.printer}
                        onChange={(e) =>
                          setEditField("printer", e.target.value)
                        }
                        className={inputClass}
                      >
                        <option value="">—</option>
                        {PRINT_PRINTERS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Field label="Team">
                      <select
                        value={editForm.team}
                        onChange={(e) => setEditField("team", e.target.value)}
                        className={inputClass}
                      >
                        <option value="">—</option>
                        <option value="GATR1">GATR1</option>
                        <option value="GATR2">GATR2</option>
                        <option value="Both">Both</option>
                        <option value="Other">Other</option>
                      </select>
                    </Field>
                    <Field label="File type">
                      <select
                        value={editForm.fileKind}
                        onChange={(e) =>
                          setEditField(
                            "fileKind",
                            e.target.value as PrintFileKind,
                          )
                        }
                        className={inputClass}
                      >
                        {PRINT_FILE_KINDS.map((kind) => (
                          <option key={kind} value={kind}>
                            {fileKindLabel(kind)}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <Field label="Notes">
                    <textarea
                      rows={2}
                      value={editForm.notes}
                      onChange={(e) => setEditField("notes", e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                </div>
              ) : (
                <dl>
                  <DetailRow label="Description" value={selected.description} />
                  <DetailRow
                    label="Quantity"
                    value={String(selected.quantity)}
                  />
                  <DetailRow label="Material" value={selected.material} />
                  <DetailRow label="Color" value={selected.color} />
                  <DetailRow
                    label="Priority"
                    value={priorityLabel(selected.priority)}
                  />
                  <DetailRow label="Needed by" value={selected.neededBy} />
                  <DetailRow
                    label="Layer height"
                    value={selected.layerHeight}
                  />
                  <DetailRow label="Infill %" value={selected.infillPercent} />
                  <DetailRow label="Printer" value={selected.printer} />
                  <DetailRow label="Team" value={selected.team} />
                  <DetailRow
                    label="File type"
                    value={fileKindLabel(selected.fileKind)}
                  />
                  <DetailRow label="Notes" value={selected.notes} />
                  <DetailRow
                    label="Submitted by"
                    value={selected.submittedBy}
                  />
                  <DetailRow
                    label="Submitted"
                    value={new Date(selected.createdAt).toLocaleString()}
                  />
                </dl>
              )}
            </div>
          ) : null}
        </div>
        </div>
      </section>
    </div>
  );
}
