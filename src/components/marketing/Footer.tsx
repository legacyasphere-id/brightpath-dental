import { MapPin, Phone, Clock } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-clinic-border bg-clinic-surface px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <span className="font-sans text-xl font-bold text-clinic-navy">
              BrightPath Dental
            </span>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-clinic-body">
              Modern dental clinic in Bekasi delivering premium care through
              experienced specialists and AI-powered patient support.
            </p>
            <div className="mt-4 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-clinic-mint" />
              <span className="text-xs text-clinic-muted">
                AI Assistant Online 24/7
              </span>
            </div>
          </div>

          {/* Services links */}
          <div>
            <h4 className="font-sans text-sm font-semibold text-clinic-text">
              Services
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-clinic-body">
              {[
                "General Dentistry",
                "Teeth Whitening",
                "Dental Implants",
                "Orthodontics",
                "Root Canal",
                "Pediatric Dentistry",
              ].map((s) => (
                <li key={s}>
                  <a
                    href="#services"
                    className="transition-colors hover:text-clinic-navy"
                  >
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-sans text-sm font-semibold text-clinic-text">
              Contact
            </h4>
            <ul className="mt-4 space-y-3 text-sm text-clinic-body">
              <li className="flex gap-2.5">
                <MapPin size={16} className="mt-0.5 flex-shrink-0 text-clinic-muted" />
                <span>
                  Jl. Ahmad Yani No. 45, Bekasi Selatan,
                  <br />
                  Kota Bekasi 17141
                </span>
              </li>
              <li className="flex gap-2.5">
                <Phone size={16} className="mt-0.5 flex-shrink-0 text-clinic-muted" />
                <a
                  href="tel:+622188888888"
                  className="transition-colors hover:text-clinic-navy"
                >
                  +62 21-8888-8888
                </a>
              </li>
              <li className="flex gap-2.5">
                <Clock size={16} className="mt-0.5 flex-shrink-0 text-clinic-muted" />
                <span>
                  Mon–Sat: 08.00–20.00
                  <br />
                  Sun: 09.00–14.00
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-clinic-border pt-6 text-center text-xs text-clinic-muted sm:flex-row sm:text-left">
          <p>
            © {new Date().getFullYear()} BrightPath Dental. All rights
            reserved.
          </p>
          <p>Built with AI · Powered by Legacya Sphere</p>
        </div>
      </div>
    </footer>
  );
}
