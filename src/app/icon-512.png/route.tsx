import { ImageResponse } from "next/og";

// A dedicated maskable icon for the Android "Add to Home Screen" prompt —
// manifest.ts references this at a real 512x512 bitmap size, since Chrome's
// install UI wants a large PNG rather than relying on icon.svg alone. Not a
// Next.js metadata file-convention name (those only cover icon/apple-icon),
// so this lives as a literal route segment instead.
//
// Maskable icons get cropped into a circle/squircle by the OS, so content
// stays inside a safe ~80% zone (padding here is generous, well past that)
// and the background fills the full canvas — no transparency, no baked-in
// rounding, so nothing shows through at the mask edges.
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1B4F72",
        }}
      >
        <svg width="240" height="240" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z"
            stroke="white"
            strokeWidth={2.5}
          />
          <circle cx="12" cy="9" r="2.5" fill="white" />
        </svg>
      </div>
    ),
    { width: 512, height: 512 },
  );
}
