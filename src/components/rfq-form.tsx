"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";

const interestedProducts = [
  "Hydraulic Cylinder",
  "Welded Hydraulic Cylinder",
  "Custom Hydraulic Cylinder",
  "Honed Tube",
  "Chrome Plated Rod",
  "Hydraulic Power Unit",
];

export function RfqForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  async function submit(formData: FormData) {
    setStatus("sending");
    setFeedback("");

    const profile = formData.get("profile");
    const country = formData.get("country");
    const company = formData.get("company");
    const phone = formData.get("phone");
    const message = formData.get("message");
    formData.set(
      "message",
      [
        `Company: ${company || "-"}`,
        `Country: ${country || "-"}`,
        `WhatsApp / Phone: ${phone || "-"}`,
        `Buyer profile: ${profile || "-"}`,
        "",
        String(message || ""),
      ].join("\n"),
    );

    const response = await fetch("/api/rfq", {
      method: "POST",
      body: formData,
    });

    const result = await response.json().catch(() => null);

    if (!response.ok || !result?.ok) {
      setStatus("error");
      setFeedback(result?.error ?? "Inquiry email could not be sent. Please email ada@hcjpistonrod.com directly.");
      return;
    }

    setStatus("sent");
    setFeedback("Thank you. Your inquiry has been emailed to ada@hcjpistonrod.com.");
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
        <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
          Drawing Upload
          <input type="file" name="drawing" className="h-11 rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[var(--muted)] file:px-3 file:py-1.5" />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
        Message
        <textarea
          required
          name="message"
          rows={5}
          placeholder="Please share drawing details, bore size, rod diameter, stroke length, working pressure, mounting style, quantity, and application environment."
          className="resize-none rounded-md border border-[var(--line)] px-3 py-3 outline-none focus:border-[var(--teal)]"
        />
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
