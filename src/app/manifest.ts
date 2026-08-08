import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BrightPath Dental",
    short_name: "BrightPath",
    description: "Perawatan gigi modern di Bekasi",
    start_url: "/",
    display: "standalone",
    background_color: "#FAFAF8",
    theme_color: "#1B4F72",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
