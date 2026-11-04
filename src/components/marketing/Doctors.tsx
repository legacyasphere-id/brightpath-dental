"use client";

import { useState } from "react";
import Image from "next/image";
import { Calendar, GraduationCap, Clock, RotateCcw } from "lucide-react";
import { SECTION_PADDING } from "@/lib/utils";

const ALL_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

type DayName = (typeof ALL_DAYS)[number];

const doctors = [
  {
    name: "drg. Anisa Rahma",
    // Only Anisa and Budi hold a Sp. title. drg. Citra Dewi does not, and
    // this must never say otherwise (see BRIGHTPATHHANDOFF.md, RUN A).
    credential: "Sp.KG",
    roleLabel: "Dental Specialist · Conservative & Cosmetic",
    specialty: "Conservative & Cosmetic Dentistry",
    defaultService: "Root Canal Treatment",
    years: "12+",
    university: "Universitas Indonesia",
    days: ["Monday", "Wednesday", "Friday", "Saturday"] as DayName[],
    scheduleText: "Mon, Wed, Fri, Sat",
    shift: "Morning & Evening",
    bio: "drg. Anisa Rahma, Sp.KG is a Conservative Dentistry specialist graduated from Universitas Indonesia with 12+ years of clinical experience in painless root canal therapy, aesthetic fillings, veneers, and professional teeth whitening.",
    photo: "/images/doctors/anisa-rahma.webp",
    alt: "drg. Anisa Rahma, Sp.KG, spesialis konservasi gigi dan estetika",
  },
  {
    name: "drg. Budi Santoso",
    credential: "Sp.Ort",
    roleLabel: "Dental Specialist · Orthodontics",
    specialty: "Orthodontics",
    defaultService: "Orthodontics & Braces",
    years: "9+",
    university: "Universitas Airlangga",
    days: ["Tuesday", "Thursday", "Saturday"] as DayName[],
    scheduleText: "Tue, Thu, Sat",
    shift: "Morning & Evening",
    bio: "drg. Budi Santoso, Sp.Ort is an Orthodontic specialist graduated from Universitas Airlangga with 9+ years of experience treating 2,000+ patients using metal braces, ceramic braces, and transparent clear aligners for children and adults.",
    photo: "/images/doctors/budi-santoso.webp",
    alt: "drg. Budi Santoso, Sp.Ort, spesialis ortodontik",
  },
  {
    name: "drg. Citra Dewi",
    credential: null,
    roleLabel: "General & Pediatric-Trained Dentist",
    specialty: "Pediatric & General Dentistry",
    defaultService: "Pediatric Dentistry",
    years: "7+",
    university: "Universitas Trisakti",
    days: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Sunday",
    ] as DayName[],
    scheduleText: "Mon–Fri, Sun",
    shift: "Morning & Afternoon",
    bio: "drg. Citra Dewi is a graduate of Universitas Trisakti with 7+ years of experience in routine family check-ups, gentle scaling, and child-friendly pediatric dental care designed to keep young patients relaxed and confident.",
    photo: "/images/doctors/citra-dewi.webp",
    alt: "drg. Citra Dewi, dokter gigi umum dan spesialis anak",
  },
];

const specialties = [
  "Conservative & Cosmetic Dentistry",
  "Orthodontics",
  "Pediatric & General Dentistry",
];

export function Doctors() {
  const [selectedDay, setSelectedDay] = useState<DayName | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(
    null,
  );

  const filteredDoctors = doctors.filter((doc) => {
    const matchesDay = !selectedDay || doc.days.includes(selectedDay);
    const matchesSpecialty =
      !selectedSpecialty || doc.specialty === selectedSpecialty;
    return matchesDay && matchesSpecialty;
  });

  const handleBookDoctor = (service: string, doctorName: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("brightpath:preselect-booking", {
          detail: {
            service,
            doctorNote: `Preferred doctor: ${doctorName}`,
          },
        }),
      );
    }
  };

  return (
    <section id="doctors" className={`bg-clinic-surface ${SECTION_PADDING}`}>
      <div className="mx-auto max-w-6xl">
        {/* Centered Header (matching Damessa Figma "Jadwal Dokter Gigi") */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-clinic-navy/75">
            Meet the Team &amp; Schedule
          </p>
          <h2 className="mt-2 font-sans text-4xl font-light tracking-tight text-clinic-text">
            Our Doctors{" "}
            <span className="font-semibold text-clinic-navy">
              &amp; Practice Schedule
            </span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-clinic-body sm:text-base">
            Experienced dental specialists who put patient comfort and clinical
            excellence first. Filter by practice day or specialty below.
          </p>
        </div>

        {/* Damessa Figma 2-Column Layout: Left Filter Sidebar (3 cols) + Right Doctor Rows (9 cols) */}
        <div className="grid items-start gap-8 lg:grid-cols-12">
          {/* Left Filter Card */}
          <aside className="rounded-2xl border border-clinic-border bg-clinic-bg p-6 lg:col-span-4">
            <div className="flex items-center justify-between border-b border-clinic-border pb-3">
              <h3 className="font-sans text-sm font-bold text-clinic-text">
                Filter Schedule
              </h3>
              {(selectedDay || selectedSpecialty) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDay(null);
                    setSelectedSpecialty(null);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-clinic-navy hover:underline"
                >
                  <RotateCcw size={12} />
                  Reset
                </button>
              )}
            </div>

            {/* Filter by Day */}
            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-wider text-clinic-navy">
                Practice Day
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {ALL_DAYS.map((day) => {
                  const active = selectedDay === day;
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedDay(active ? null : day)}
                      className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        active
                          ? "border-clinic-navy bg-clinic-navy text-white"
                          : "border-clinic-border bg-white text-clinic-body hover:border-clinic-navy"
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter by Specialty */}
            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-wider text-clinic-navy">
                Specialty
              </p>
              <div className="mt-2.5 space-y-2">
                {specialties.map((spec) => {
                  const active = selectedSpecialty === spec;
                  return (
                    <button
                      key={spec}
                      type="button"
                      onClick={() =>
                        setSelectedSpecialty(active ? null : spec)
                      }
                      className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-xs font-medium transition-colors ${
                        active
                          ? "border-clinic-navy bg-clinic-navy text-white"
                          : "border-clinic-border bg-white text-clinic-body hover:border-clinic-navy"
                      }`}
                    >
                      <span>{spec}</span>
                      <span
                        className={`h-2 w-2 rounded-full ${
                          active ? "bg-clinic-mint" : "bg-clinic-border"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Right Doctor Profile Rows */}
          <div className="space-y-5 lg:col-span-8">
            {filteredDoctors.length === 0 ? (
              <div className="rounded-2xl border border-clinic-border bg-clinic-bg p-8 text-center">
                <p className="text-sm font-medium text-clinic-text">
                  No doctor matches that exact day and specialty combination.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDay(null);
                    setSelectedSpecialty(null);
                  }}
                  className="mt-3 text-xs font-semibold text-clinic-navy underline"
                >
                  Show all 3 doctors
                </button>
              </div>
            ) : (
              filteredDoctors.map((doc) => (
                <div
                  key={doc.name}
                  className="flex flex-col gap-6 rounded-2xl border border-clinic-border bg-clinic-bg p-6 transition-shadow hover:shadow-md sm:flex-row sm:items-start"
                >
                  {/* Left Portrait Column (3:4 studio portrait ratio) */}
                  <div className="relative mx-auto h-52 w-40 flex-shrink-0 overflow-hidden rounded-xl border border-clinic-border bg-white sm:mx-0">
                    <Image
                      src={doc.photo}
                      alt={doc.alt}
                      width={720}
                      height={960}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover object-top"
                    />
                  </div>

                  {/* Right Details Column */}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-clinic-teal">
                      {doc.roleLabel}
                    </p>
                    <h3 className="mt-1 font-sans text-xl font-bold text-clinic-text">
                      {doc.name}
                      {doc.credential && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-clinic-mintLight px-2.5 py-0.5 text-xs font-bold text-clinic-navy">
                          {doc.credential}
                        </span>
                      )}
                    </h3>

                    <p className="mt-2.5 text-sm leading-relaxed text-clinic-body">
                      {doc.bio}
                    </p>

                    {/* Credentials & Practice Days Bar */}
                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-clinic-border pt-3.5 text-xs text-clinic-muted">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-clinic-navy">
                        <Clock size={13} />
                        {doc.years} Years Practice
                      </span>
                      <span className="inline-flex items-center gap-1.5 font-medium text-clinic-text">
                        <GraduationCap size={14} className="text-clinic-navy" />
                        {doc.university}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar size={13} className="text-clinic-navy" />
                        {doc.scheduleText}
                      </span>
                    </div>

                    <div className="mt-4">
                      <a
                        href="#lead-form"
                        onClick={() =>
                          handleBookDoctor(doc.defaultService, doc.name)
                        }
                        className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-clinic-navy shadow-sm ring-1 ring-clinic-border transition-colors hover:bg-clinic-navy hover:text-white"
                      >
                        Book with {doc.name} →
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
