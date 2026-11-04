"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, CalendarCheck } from "lucide-react";
import { SECTION_PADDING } from "@/lib/utils";

const tourSlides = [
  {
    title: "Warm Reception & Waiting Lounge",
    subtitle: "Comfort & Hospitality",
    caption:
      "Sunlit sofa seating, warm oak interiors, and a calm atmosphere designed so patients never feel clinical anxiety.",
    image: "/images/facility/waiting-lounge.webp",
    alt: "BrightPath Dental Bekasi waiting lounge with warm oak paneling, curved white reception desk, and sunlit sofa seating",
  },
  {
    title: "Digital 3D Treatment Suite",
    subtitle: "Modern Clinical Technology",
    caption:
      "Ergonomic dental chairs paired with chairside 3D tooth arch monitors, intraoral scanners, and low-dose digital X-rays.",
    image: "/images/facility/treatment-suite.webp",
    alt: "Modern dental treatment room with navy ergonomic dental chair, chairside 3D dental arch monitor, and intraoral scanner",
  },
  {
    title: "Kid-Friendly Play Corner",
    subtitle: "Pediatric & Family Friendly",
    caption:
      "Equipped with wooden Montessori toys and picture books so children feel right at home before their check-up.",
    image: "/images/facility/kids-corner.webp",
    alt: "Warm kid-friendly play corner inside BrightPath Dental with low wooden activity table, pastel wooden toys, and children's books",
  },
  {
    title: "Hospital-Grade Sterilization",
    subtitle: "Class-B Autoclave Standard",
    caption:
      "Every dental instrument is individually pouched and sterilized in a medical Class-B autoclave between every patient.",
    image: "/images/facility/sterilization-room.webp",
    alt: "Stainless steel tray of dental instruments sealed in sterile autoclave pouches in front of a Class-B medical autoclave sterilizer",
  },
];

export function Facility() {
  const [startIndex, setStartIndex] = useState(0);

  const handlePrev = () => {
    setStartIndex((prev) => (prev === 0 ? tourSlides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setStartIndex((prev) => (prev + 1) % tourSlides.length);
  };

  const visiblePair = [
    tourSlides[startIndex],
    tourSlides[(startIndex + 1) % tourSlides.length],
  ];

  return (
    <section id="facility" className={`bg-clinic-bg ${SECTION_PADDING}`}>
      <div className="mx-auto max-w-6xl">
        {/* Damessa Figma "Clinic Virtual Tour" 1/3 Left Info + 2/3 Right Photo Carousel */}
        <div className="grid items-center gap-10 lg:grid-cols-12">
          {/* Left Column (4 cols) */}
          <div className="flex flex-col justify-between lg:col-span-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-clinic-navy/75">
                Inside BrightPath Bekasi
              </p>
              <h2 className="mt-2 font-sans text-4xl font-light tracking-tight text-clinic-text">
                Clinic{" "}
                <span className="font-semibold text-clinic-navy">
                  Virtual Tour
                </span>
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-clinic-body sm:text-base">
                Explore the facilities and welcoming spaces at BrightPath Dental
                Bekasi Selatan before your visit.
              </p>

              <a
                href="#lead-form"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-clinic-navy px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-clinic-navyDark"
              >
                <CalendarCheck size={16} strokeWidth={1.75} />
                Book a Visit
              </a>
            </div>

            {/* Carousel Controls + Slide Counter */}
            <div className="mt-8 flex items-center gap-3">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous clinic photo"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-clinic-border bg-white text-clinic-navy shadow-sm transition-colors hover:border-clinic-navy hover:bg-clinic-navy hover:text-white"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next clinic photo"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-clinic-border bg-white text-clinic-navy shadow-sm transition-colors hover:border-clinic-navy hover:bg-clinic-navy hover:text-white"
              >
                <ChevronRight size={20} />
              </button>
              <span className="ml-2 text-xs font-medium tabular-nums text-clinic-muted">
                {startIndex + 1} / {tourSlides.length} ·{" "}
                {tourSlides[startIndex].title}
              </span>
            </div>
          </div>

          {/* Right Column: 2 Side-by-Side Tall Facility Cards (8 cols) */}
          <div className="grid gap-6 sm:grid-cols-2 lg:col-span-8">
            {visiblePair.map((slide) => (
              <div
                key={slide.title}
                className="group relative overflow-hidden rounded-2xl border border-clinic-border bg-clinic-surface shadow-sm"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-clinic-mintLight">
                  <Image
                    src={slide.image}
                    alt={slide.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, 420px"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <p className="text-xs font-semibold text-clinic-mint">
                      {slide.subtitle}
                    </p>
                    <h3 className="mt-0.5 font-sans text-lg font-bold text-white">
                      {slide.title}
                    </h3>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm leading-relaxed text-clinic-body">
                    {slide.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Thumbnail Quick-Select Strip */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {tourSlides.map((slide, idx) => (
            <button
              key={slide.title}
              type="button"
              onClick={() => setStartIndex(idx)}
              className={`flex items-center gap-3 rounded-xl border p-2.5 text-left transition-colors ${
                idx === startIndex
                  ? "border-clinic-navy bg-white shadow-sm"
                  : "border-clinic-border bg-white/60 hover:bg-white"
              }`}
            >
              <div className="relative h-10 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-clinic-mintLight">
                <Image
                  src={slide.image}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <span className="truncate text-xs font-semibold text-clinic-text">
                {slide.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
