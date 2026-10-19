import { unzipSync, strFromU8 } from "fflate";

export type ThreeMfPreview =
  | { kind: "mesh"; buffer: ArrayBuffer }
  | { kind: "plates"; images: { name: string; url: string }[] };

const PLATE_PRIORITY = [
  "Metadata/plate_1.png",
  "Metadata/plate_no_light_1.png",
  "Metadata/top_1.png",
  "Metadata/pick_1.png",
  "Metadata/plate_1_small.png",
];

function hasMeshData(modelXml: string): boolean {
  return (
    /<vertex[\s>]/i.test(modelXml) &&
    (/<triangle[\s>]/i.test(modelXml) || /<mesh[\s>]/i.test(modelXml))
  );
}

function pickPlateImages(
  files: Record<string, Uint8Array>,
): { name: string; url: string }[] {
  for (const path of PLATE_PRIORITY) {
    const data = files[path];
    if (!data) continue;
    return [
      {
        name: path.split("/").pop() ?? path,
        url: URL.createObjectURL(
          new Blob([Uint8Array.from(data)], { type: "image/png" }),
        ),
      },
    ];
  }

  for (const [path, data] of Object.entries(files)) {
    if (!/^Metadata\/.*\.png$/i.test(path)) continue;
    if (/_small\.png$/i.test(path)) continue;
    return [
      {
        name: path.split("/").pop() ?? path,
        url: URL.createObjectURL(
          new Blob([Uint8Array.from(data)], { type: "image/png" }),
        ),
      },
    ];
  }

  return [];
}

/**
 * Bambu/Prusa ".gcode.3mf" project files often ship an empty 3D model and
 * embed plate preview PNGs instead. Prefer mesh when present; otherwise plates.
 */
export async function inspectThreeMf(url: string): Promise<ThreeMfPreview> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Could not load 3MF file.");
  }

  const buffer = await res.arrayBuffer();
  const files = unzipSync(new Uint8Array(buffer));

  let modelXml = "";
  for (const [path, data] of Object.entries(files)) {
    if (/^3D\/[^/]+\.model$/i.test(path)) {
      modelXml = strFromU8(data);
      break;
    }
  }

  if (modelXml && hasMeshData(modelXml)) {
    return { kind: "mesh", buffer };
  }

  const images = pickPlateImages(files);
  if (images.length === 0) {
    throw new Error("No mesh or plate preview found in this 3MF.");
  }

  return { kind: "plates", images };
}

export function revokePlateUrls(images: { url: string }[]) {
  for (const image of images) {
    URL.revokeObjectURL(image.url);
  }
}
