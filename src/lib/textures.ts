const TEXTURE_BASE = "/textures/items/assets/paintkits";

interface WeaponInfo {
  albedo: string;
  material_mask?: string;
  normal?: string;
  roughness?: string;
  paint_index?: number;
}

interface CollectionData {
  count: number;
  weapons: Record<string, WeaponInfo>;
}

let textureIndex: Map<number, WeaponInfo> | null = null;
let loadPromise: Promise<void> | null = null;

async function ensureLoaded() {
  if (textureIndex) return;
  if (!loadPromise) {
    loadPromise = fetch("/paint_index_map.json")
      .then((r) => r.json())
      .then((data: Record<string, CollectionData>) => {
        textureIndex = new Map();
        for (const col of Object.values(data)) {
          for (const info of Object.values(col.weapons)) {
            if (info.paint_index != null) {
              textureIndex.set(info.paint_index, info);
            }
          }
        }
      });
  }
  return loadPromise;
}

export async function hasTexture(paintIndex: number): Promise<boolean> {
  await ensureLoaded();
  return textureIndex?.has(paintIndex) ?? false;
}

export interface TexturePaths {
  albedo: string;
  materialMask?: string;
  normal?: string;
}

export async function getTexturePaths(paintIndex: number): Promise<TexturePaths | null> {
  await ensureLoaded();
  const info = textureIndex?.get(paintIndex);
  if (!info) return null;
  return {
    albedo: `${TEXTURE_BASE}/${info.albedo}`,
    materialMask: info.material_mask ? `${TEXTURE_BASE}/${info.material_mask}` : undefined,
    normal: info.normal ? `${TEXTURE_BASE}/${info.normal}` : undefined,
  };
}
