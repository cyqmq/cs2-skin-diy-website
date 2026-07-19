const INDEX_URL = "/export/index.json";
const BASE = "/export";

export const RARITY_COLORS: Record<string, string> = {
  "Consumer Grade": "#b0c3d9", "Industrial Grade": "#5e98d9",
  "Mil-Spec Grade": "#4b69ff", "Restricted": "#8847ff",
  "Classified": "#d32ce6", "Covert": "#eb4b4b",
};

export interface SkinInfo {
  paintkit_id: number; name: string; rarity: string; hasTexture: boolean;
}

export interface WeaponInfo {
  id: string; name: string; skins: SkinInfo[];
}

interface IndexSkin { paintkit_id: number; name: string; rarity: string; texture: string; }
interface IndexWeapon { id: string; name: string; model: string; skins: IndexSkin[]; }
interface IndexData { weapons: IndexWeapon[]; }

let modelMap = new Map<string, string>();
let texMap = new Map<string, string>();
let weaponList: WeaponInfo[] = [];
let ready = false;

export async function initData(): Promise<void> {
  if (ready) return;
  const res = await fetch(INDEX_URL);
  const data: IndexData = await res.json();
  for (const w of data.weapons) {
    modelMap.set(w.id, `${BASE}/${w.model}`);
    const skins: SkinInfo[] = [];
    for (const s of w.skins) {
      const key = `${w.id}:${s.paintkit_id}`;
      texMap.set(key, `${BASE}/${s.texture}`);
      skins.push({ paintkit_id: s.paintkit_id, name: s.name, rarity: s.rarity, hasTexture: true });
    }
    weaponList.push({ id: w.id, name: w.name, skins });
  }
  ready = true;
}

export function getWeaponList(): WeaponInfo[] { return weaponList; }

export function getModelUrl(weaponId: string): string | null { return modelMap.get(weaponId) ?? null; }

export function getTextureUrl(weaponId: string, paintkitId: number): string | null {
  return texMap.get(`${weaponId}:${paintkitId}`) ?? null;
}

export function getRarityColor(name: string): string { return RARITY_COLORS[name] ?? "#888888"; }
