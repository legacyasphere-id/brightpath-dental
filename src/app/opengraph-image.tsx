import { ImageResponse } from "next/og";

export const alt = "BrightPath Dental — Perawatan gigi modern di Bekasi";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const NAVY = "#1B4F72";
const MINT = "#2ECC71";
const MUTED = "#718096";
const BG = "#FAFAF8";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: BG,
          padding: "90px 120px",
        }}
      >
        {/* Logo mark — identical to the header: navy rounded square, white pin */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 128,
            height: 128,
            borderRadius: 28,
            backgroundColor: NAVY,
            marginBottom: 48,
          }}
        >
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z"
              stroke="white"
              strokeWidth={2.5}
            />
            <circle cx="12" cy="9" r="2.5" fill="white" />
          </svg>
        </div>

        {/* Clinic name — dominant */}
        <div
          style={{
            display: "flex",
            fontSize: 76,
            fontWeight: 800,
            color: NAVY,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          BrightPath Dental
        </div>

        {/* Indonesian positioning line */}
        <div
          style={{
            display: "flex",
            fontSize: 38,
            fontWeight: 600,
            color: MINT,
            marginTop: 24,
          }}
        >
          Perawatan gigi modern di Bekasi
        </div>

        {/* Quiet supporting line */}
        <div
          style={{
            display: "flex",
            fontSize: 24,
            fontWeight: 500,
            color: MUTED,
            marginTop: 40,
          }}
        >
          brightpath-dental.vercel.app
        </div>
      </div>
    ),
    { ...size },
  );
}
