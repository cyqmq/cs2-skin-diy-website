export interface WeaponSkin {
  id: string;
  name: string;
  description: string;
  weapon: { id: string; weapon_id: number; name: string };
  category: { id: string; name: string };
  pattern: { id: string; name: string };
  min_float: number;
  max_float: number;
  rarity: { id: string; name: string; color: string };
  paint_index: string;
  wears: { id: string; name: string }[];
  collections: { id: string; name: string; image: string }[];
  crates: { id: string; name: string; image: string }[];
  team: { id: string; name: string };
  legacy_model: boolean;
  image: string;
}

export interface CSGOSkinsData {
  skins: WeaponSkin[];
  weapons: { id: string; weapon_id: number; name: string; skins: WeaponSkin[] }[];
}

export type Weapon = {
  id: string;
  weapon_id: number;
  name: string;
  category: string;
};

const CSGO_API_BASE = "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en";

let skinsCache: WeaponSkin[] | null = null;

export async function fetchSkins(): Promise<WeaponSkin[]> {
  if (skinsCache) return skinsCache;
  const res = await fetch(`${CSGO_API_BASE}/skins.json`);
  skinsCache = await res.json();
  return skinsCache!;
}

export async function getWeapons(): Promise<Weapon[]> {
  const skins = await fetchSkins();
  const map = new Map<number, Weapon>();
  for (const s of skins) {
    if (!map.has(s.weapon.weapon_id)) {
      map.set(s.weapon.weapon_id, {
        id: s.weapon.id,
        weapon_id: s.weapon.weapon_id,
        name: s.weapon.name,
        category: s.category.name,
      });
    }
  }
  return [...map.values()].sort((a, b) => a.weapon_id - b.weapon_id);
}

export function getSkinsForWeapon(skins: WeaponSkin[], weaponId: number): WeaponSkin[] {
  return skins.filter((s) => s.weapon.weapon_id === weaponId);
}
