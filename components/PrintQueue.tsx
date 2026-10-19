"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  PRINT_MATERIALS,
  PRINT_PRIORITIES,
  PRINT_STATUSES,
  priorityLabel,
  statusLabel,
  type PrintJob,
  type PrintPriority,
  type PrintStatus,
} from "@/lib/print-types";
import { ModelViewer } from "@/components/ModelViewer";
import { btnPrimary, btnSecondary, inputClass } from "@/lib/ui";

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
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [boardTab, setBoardTab] = useState<PrintStatus>("queued");

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/prints");
      if (!res.ok) throw new Error("Could not load queue.");
      const data = (await res.json()) as { jobs: PrintJob[] };
      setJobs(data.jobs);
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

  function setField<K extends keyof typeof emptyForm>(
    key: K,
    value: (typeof emptyForm)[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file || !form.name.trim()) return;

    setSubmitting(true);
    setError(null);

    const body = new FormData();
    body.set("file", file);
    for (const [key, value] of Object.entries(form)) {
      body.set(key, value);
    }

    try {
      const res = await fetch("/api/prints", { method: "POST", body });
      const data = (await res.json()) as { job?: PrintJob; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Upload failed.");

      setForm(emptyForm);
      setFile(null);
      setShowAddForm(false);
      const input = document.getElementById(
        "print-file",
      ) as HTMLInputElement | null;
      if (input) input.value = "";

      await load();
      if (data.job) {
        setBoardTab(data.job.status);
        setSelectedId(data.job.id);
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
    setFile(null);
    const input = document.getElementById(
      "print-file",
    ) as HTMLInputElement | null;
    if (input) input.value = "";
  }

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
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Part name">
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setField("name", e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="File (.stl / .obj / .3mf)">
                  <input
                    id="print-file"
                    type="file"
                    required
                    accept=".stl,.3mf,.obj"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="w-full text-sm text-ink-muted file:mr-3 file:rounded-full file:border-0 file:bg-surface file:px-3 file:py-2 file:text-sm file:text-ink"
                  />
                </Field>
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
                  <input
                    type="text"
                    value={form.printer}
                    onChange={(e) => setField("printer", e.target.value)}
                    className={inputClass}
                    placeholder="e.g. Bambu X1C"
                  />
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
                  disabled={submitting || !file || !form.name.trim()}
                  className={`${btnPrimary} disabled:opacity-50`}
                >
                  {submitting ? "Adding…" : "Add to queue"}
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
                <div className="flex items-center gap-3">
                  <select
                    value={selected.status}
                    onChange={(e) =>
                      void setStatus(selected.id, e.target.value as PrintStatus)
                    }
                    className="border border-rule bg-white px-3 py-2 text-sm outline-none focus:border-ink rounded-full"
                  >
                    {PRINT_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {statusLabel(status)}
                      </option>
                    ))}
                  </select>
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
                </div>
              </div>

              <ModelViewer
                url={selected.fileUrl}
                fileName={selected.fileName}
                className="h-[320px] w-full border border-rule rounded-2xl overflow-hidden"
              />

              <dl>
                <DetailRow label="Description" value={selected.description} />
                <DetailRow label="Quantity" value={String(selected.quantity)} />
                <DetailRow label="Material" value={selected.material} />
                <DetailRow label="Color" value={selected.color} />
                <DetailRow
                  label="Priority"
                  value={priorityLabel(selected.priority)}
                />
                <DetailRow label="Needed by" value={selected.neededBy} />
                <DetailRow label="Layer height" value={selected.layerHeight} />
                <DetailRow label="Infill %" value={selected.infillPercent} />
                <DetailRow label="Printer" value={selected.printer} />
                <DetailRow label="Team" value={selected.team} />
                <DetailRow label="Notes" value={selected.notes} />
                <DetailRow label="Submitted by" value={selected.submittedBy} />
                <DetailRow
                  label="Submitted"
                  value={new Date(selected.createdAt).toLocaleString()}
                />
              </dl>
            </div>
          ) : null}
        </div>
        </div>
      </section>
    </div>
  );
}
