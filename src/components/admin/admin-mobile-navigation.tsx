"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { adminModules } from "@/lib/admin/modules";

export function AdminMobileNavigation({ active, allowedKeys }: { active: string; allowedKeys: string[] }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeMenu = () => { setOpen(false); triggerRef.current?.focus(); };
  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); triggerRef.current?.focus(); }
      if (event.key !== "Tab") return;
      const controls = panelRef.current?.querySelectorAll<HTMLElement>("button, a[href]");
      if (!controls?.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const items = adminModules.filter((item) => allowedKeys.includes(item.key));
  return (
    <>
      <button ref={triggerRef} type="button" onClick={() => setOpen(true)} aria-label="打开后台导航" aria-expanded={open} aria-controls="admin-mobile-menu" className="admin-icon-button lg:hidden">
        <Menu size={21} aria-hidden="true" />
      </button>
      {open && <div className="fixed inset-0 z-50 lg:hidden" id="admin-mobile-menu">
        <button type="button" aria-label="关闭后台导航" onClick={closeMenu} className="absolute inset-0 bg-[#061a2f]/70" />
        <div ref={panelRef} role="dialog" aria-modal="true" aria-label="后台导航" className="absolute inset-y-0 left-0 flex w-[min(88vw,320px)] flex-col bg-[#061a2f] text-white shadow-2xl">
          <div className="flex h-16 items-center justify-between border-b border-white/15 px-5">
            <span className="text-base font-semibold">HCJ 企业后台</span>
            <button type="button" onClick={closeMenu} aria-label="关闭导航" className="grid h-11 w-11 place-items-center rounded-md hover:bg-white/10"><X size={20} /></button>
          </div>
          <nav aria-label="后台主导航" className="grid gap-1 overflow-y-auto px-3 py-4">
            {items.map((item) => {
              const Icon = item.icon;
              return <Link key={item.key} href={item.href} onClick={() => setOpen(false)} aria-current={active === item.key ? "page" : undefined} className={`flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium ${active === item.key ? "bg-[#1266bf] text-white" : "text-white/80 hover:bg-white/10 hover:text-white"}`}><Icon size={18} aria-hidden="true" />{item.label}</Link>;
            })}
          </nav>
        </div>
      </div>}
    </>
  );
}
