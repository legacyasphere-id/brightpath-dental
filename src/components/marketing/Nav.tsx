"use client";

import { useState } from "react";
import Link from "next/link";

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 border-b border-clinic-border bg-clinic-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-clinic-navy">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="white" strokeWidth={2.5}>
              <path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z" />
              <circle cx="12" cy="9" r="2.5" fill="white" stroke="none" />
            </svg>
          </div>
          <span className="font-sans text-lg font-bold text-clinic-navy">BrightPath Dental</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {[
            { href: "#services", label: "Services" },
            { href: "#doctors", label: "Doctors" },
            { href: "#pricing", label: "Pricing" },
          ].map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-clinic-body transition-colors hover:text-clinic-navy"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <a
          href="#lead-form"
          className="hidden rounded-lg bg-clinic-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-clinic-navyDark md:inline-block"
        >
          Book Appointment
        </a>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-2 text-clinic-text md:hidden"
          aria-label="Toggle menu"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
            {open ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="flex flex-col gap-4 border-t border-clinic-border bg-clinic-surface px-6 py-5 md:hidden">
          {[
            { href: "#services", label: "Services" },
            { href: "#doctors", label: "Doctors" },
            { href: "#pricing", label: "Pricing" },
          ].map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-clinic-body"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <a
            href="#lead-form"
            className="rounded-lg bg-clinic-navy px-4 py-2.5 text-center text-sm font-semibold text-white"
            onClick={() => setOpen(false)}
          >
            Book Appointment
          </a>
        </div>
      )}
    </nav>
  );
}
