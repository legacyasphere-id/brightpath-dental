// One-off build script: regenerates src/app/favicon.ico as a proper
// multi-size ICO (16/32/48) from the same pin mark used in the header,
// icon.svg, and apple-icon.tsx — so the favicon can't drift from the brand
// mark the way a hand-designed binary checked into git eventually does.
//
// Renders each size via next/og's ImageResponse (bundled with Next, no
// extra dependency), then packs the PNGs into an ICO using the format's
// PNG-embedding mode (supported since Vista — each ICONDIRENTRY can point
// at a full PNG instead of a raw BMP), which avoids needing a BMP encoder.
//
// Run manually after changing the brand mark: node scripts/generate-favicon.mjs
import { writeFileSync } from "node:fs";
import { ImageResponse } from "next/dist/compiled/@vercel/og/index.node.js";

const SIZES = [16, 32, 48];
const NAVY = "#1B4F72";

function pinIconJsx(pixelSize) {
  const pinSize = Math.round(pixelSize * 0.5);
  return {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: NAVY,
      },
      children: {
        type: "svg",
        props: {
          width: pinSize,
          height: pinSize,
          viewBox: "0 0 24 24",
          fill: "none",
          children: [
            {
              type: "path",
              props: {
                d: "M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z",
                stroke: "white",
                strokeWidth: 2.5,
              },
            },
            { type: "circle", props: { cx: 12, cy: 9, r: 2.5, fill: "white" } },
          ],
        },
      },
    },
  };
}

async function renderPng(size) {
  const res = new ImageResponse(pinIconJsx(size), { width: size, height: size });
  return Buffer.from(await res.arrayBuffer());
}

// ICO format: 6-byte ICONDIR header, then one 16-byte ICONDIRENTRY per
// image, then the image data blocks themselves, in the same order.
function packIco(images) {
  const count = images.length;
  const headerSize = 6 + 16 * count;
  let offset = headerSize;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: 1 = icon
  header.writeUInt16LE(count, 4);

  const entries = [];
  for (const { size, data } of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 means 256)
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // color palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8); // size of image data
    entry.writeUInt32LE(offset, 12); // offset of image data
    entries.push(entry);
    offset += data.length;
  }

  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

const images = [];
for (const size of SIZES) {
  const data = await renderPng(size);
  images.push({ size, data });
  console.log(`Rendered ${size}x${size}: ${data.length} bytes`);
}

const ico = packIco(images);
writeFileSync(new URL("../src/app/favicon.ico", import.meta.url), ico);
console.log(`Wrote src/app/favicon.ico: ${ico.length} bytes, ${images.length} sizes`);
