const TEXTURE_BASE = "/textures/items/assets/paintkits";

interface CollectionData {
  count: number;
  weapons: Record<string, {
    albedo: string;
    paint_index?: number;
  }>;
}

let textureSet: Set<number> | null = null;
let loadPromise: Promise<void> | null = null;

async function ensureLoaded() {
  if (textureSet) return;
  if (!loadPromise) {
    loadPromise = fetch("/paint_index_map.json")
      .then((r) => r.json())
      .then((data: Record<string, CollectionData>) => {
        textureSet = new Set();
        for (const col of Object.values(data)) {
          for (const info of Object.values(col.weapons)) {
            if (info.paint_index != null && info.albedo) {
              textureSet.add(info.paint_index);
            }
          }
        }
      });
  }
  return loadPromise;
}

export async function hasTexture(paintIndex: number): Promise<boolean> {
  await ensureLoaded();
  return textureSet?.has(paintIndex) ?? false;
}

export async function getAlbedoPath(paintIndex: number): Promise<string | null> {
  await ensureLoaded();
  // Need to re-lookup the albedo path
  if (!textureSet?.has(paintIndex)) return null;
  // Re-fetch to get the actual path
  const data: Record<string, CollectionData> = await fetch("/paint_index_map.json").then((r) => r.json());
  for (const col of Object.values(data)) {
    for (const info of Object.values(col.weapons)) {
      if (info.paint_index === paintIndex) {
        return `${TEXTURE_BASE}/${info.albedo}`;
      }
    }
  }
  return null;
}
