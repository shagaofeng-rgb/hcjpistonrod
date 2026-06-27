"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";

export function RfqForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  async function submit(formData: FormData) {
    setStatus("sending");
    await fetch("/api/rfq", {
      method: "POST",
      body: formData,
    });
    setStatus("sent");
  }

  return (
    <form action={submit} className="grid gap-4 rounded-md border border-[var(--line)] bg-white p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
          Name
          <input required name="name" className="h-11 rounded-md border border-[var(--line)] px-3 outline-none focus:border-[var(--teal)]" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
          Email
          <input required type="email" name="email" className="h-11 rounded-md border border-[var(--line)] px-3 outline-none focus:border-[var(--teal)]" />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
          Product
          <select name="product" className="h-11 rounded-md border border-[var(--line)] px-3 outline-none focus:border-[var(--teal)]">
            <option>Hard Chrome Plated Rod</option>
            <option>Induction Hardened Chrome Rod</option>
            <option>Hollow Piston Rod</option>
            <option>Honed Tube</option>
            <option>Custom Drawing Part</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
          Drawing / File
          <input type="file" name="drawing" className="h-11 rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[var(--muted)] file:px-3 file:py-1.5" />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
        Specification
        <textarea
          required
          name="message"
          rows={5}
          placeholder="Diameter, length, material grade, tolerance, chrome thickness, quantity, destination port..."
          className="resize-none rounded-md border border-[var(--line)] px-3 py-3 outline-none focus:border-[var(--teal)]"
        />
      </label>
      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[var(--teal)] px-5 font-semibold text-white transition hover:bg-[var(--teal-dark)] disabled:cursor-wait disabled:opacity-70"
      >
        {status === "sending" ? <Loader2 className="animate-spin" size={18} /> : status === "sent" ? <CheckCircle2 size={18} /> : <Send size={18} />}
        {status === "sent" ? "RFQ Received" : "Submit RFQ"}
      </button>
      {status === "sent" && (
        <p className="text-sm text-[var(--teal-dark)]">
          Your request is saved in the local demo flow. Email delivery can be connected before Vercel launch.
        </p>
      )}
    </form>
  );
}
