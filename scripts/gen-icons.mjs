// Generates the PWA raster icons from public/icon-512.svg.
// Run once after changing the source SVG:  node scripts/gen-icons.mjs
// Produces maskable-safe PNGs (the brand mark already sits on a full-bleed
// teal background, so it survives the maskable safe-zone crop).
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svg = await readFile(join(root, "public", "icon-512.svg"));

const sizes = [192, 512];
for (const size of sizes) {
  const out = join(root, "public", `icon-${size}.png`);
  await sharp(svg, { density: 384 })
    .resize(size, size, { fit: "cover" })
    .png()
    .toFile(out);
  console.log(`wrote public/icon-${size}.png`);
}

// Apple touch icon (180px, opaque background already present).
await sharp(svg, { density: 384 })
  .resize(180, 180, { fit: "cover" })
  .png()
  .toFile(join(root, "public", "apple-icon.png"));
console.log("wrote public/apple-icon.png");
