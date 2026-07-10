"use client";

import { useState } from "react";
import { CheckCircle2, FileUp, Loader2, Send } from "lucide-react";

const interestedProducts = [
  "Chrome Plated Rod",
  "Hydraulic Piston Rod",
  "Induction Hardened Chrome Rod",
  "Hollow Chrome Plated Rod",
  "Honed Tube",
  "Skived and Roller Burnished Tube",
];

export function RfqForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [feedback, setFeedback] = useState("");
  const [drawingName, setDrawingName] = useState("Choose PDF, Word, image, DWG, or DXF");

  async function submit(formData: FormData) {
    setStatus("sending");
    setFeedback("");
    try {
      const response = await fetch("/api/rfq", { method: "POST", body: formData });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.ok) {
        setStatus("error");
        setFeedback(result?.error ?? "Inquiry could not be submitted. Please email ada@hcjpistonrod.com directly.");
        return;
      }
      setStatus("sent");
      setFeedback(`Thank you. Your inquiry has been recorded and emailed to our sales team. Reference: ${result.reference}`);
    } catch {
      setStatus("error");
      setFeedback("The inquiry service is temporarily unavailable. Please email ada@hcjpistonrod.com directly.");
    }
  }

  return (
    <form action={submit} className="grid gap-4 rounded-md border border-[var(--line)] bg-white p-5">
      <label className="hidden" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
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
          WhatsApp / Phone
          <input name="phone" className="h-11 rounded-md border border-[var(--line)] px-3 outline-none focus:border-[var(--teal)]" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
          Company
          <input name="company" className="h-11 rounded-md border border-[var(--line)] px-3 outline-none focus:border-[var(--teal)]" />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
          Country
          <input name="country" className="h-11 rounded-md border border-[var(--line)] px-3 outline-none focus:border-[var(--teal)]" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
          Describe Yourself
          <select name="profile" className="h-11 rounded-md border border-[var(--line)] px-3 outline-none focus:border-[var(--teal)]">
            <option>Distributor</option>
            <option>Manufacturer</option>
            <option>Wholesaler</option>
            <option>End User</option>
            <option>Engineering Company</option>
          </select>
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
          Interested Product
          <select name="product" className="h-11 rounded-md border border-[var(--line)] px-3 outline-none focus:border-[var(--teal)]">
            {interestedProducts.map((product) => (
              <option key={product}>{product}</option>
            ))}
          </select>
        </label>
        <label className="grid min-w-0 gap-2 text-sm font-medium text-[var(--ink)]">
          Drawing Upload
          <span className="flex h-11 min-w-0 cursor-pointer items-center gap-2 rounded-md border border-[var(--line)] bg-white px-3 text-sm font-normal text-[var(--steel)]">
            <FileUp size={17} className="shrink-0 text-[var(--teal)]" />
            <span className="truncate">{drawingName}</span>
          </span>
          <input
            type="file"
            name="drawing"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.dwg,.dxf"
            className="sr-only"
            onChange={(event) => setDrawingName(event.target.files?.[0]?.name || "Choose PDF, Word, image, DWG, or DXF")}
          />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
        Message
        <textarea
          required
          name="message"
          rows={5}
          placeholder="Please share material, hardness requirement, chrome plating requirement, length, rod diameter, quantity, and drawing or sample details."
          className="resize-none rounded-md border border-[var(--line)] px-3 py-3 outline-none focus:border-[var(--teal)]"
        />
      </label>
      <label className="flex items-start gap-3 text-sm leading-6 text-[var(--steel)]">
        <input required type="checkbox" name="privacy" className="mt-1 h-4 w-4 shrink-0 accent-[var(--teal)]" />
        <span>
          I agree that XIJIU may use these details and uploaded drawings to respond to this inquiry under the{" "}
          <a href="/privacy-policy" className="font-semibold text-[var(--teal)] underline">Privacy Policy</a>.
        </span>
      </label>
      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[var(--amber)] px-5 font-semibold text-white transition hover:bg-[#a81825] disabled:cursor-wait disabled:opacity-70"
      >
        {status === "sending" ? <Loader2 className="animate-spin" size={18} /> : status === "sent" ? <CheckCircle2 size={18} /> : <Send size={18} />}
        {status === "sent" ? "Inquiry Sent" : "Submit Inquiry"}
      </button>
      {feedback && (
        <p className={`text-sm ${status === "error" ? "text-red-700" : "text-[var(--teal-dark)]"}`}>
          {feedback}
        </p>
      )}
    </form>
  );
}
