const INDEX_URL = "/data/index.json";
const LIELXD_MANIFEST = "/data/lielxd_manifest.json";
const BASE = "/export";
const LIELXD = "/lielxd";

export const RARITY_COLORS: Record<string, string> = {
  "消费级": "#b0c3d9", "工业级": "#5e98d9",
  "军规级": "#4b69ff", "受限级": "#8847ff",
  "保密级": "#d32ce6", "隐秘级": "#eb4b4b",
  "非凡": "#eb4b4b", "违禁": "#e4ae39",
  "Consumer Grade": "#b0c3d9", "Industrial Grade": "#5e98d9",
  "Mil-Spec Grade": "#4b69ff", "Restricted": "#8847ff",
  "Classified": "#d32ce6", "Covert": "#eb4b4b",
};

export interface SkinInfo {
  paintkit_id: number; name: string; rarity: string; rarityColor: string; image?: string; hasTexture: boolean;
}

export interface WeaponInfo {
  id: string; name: string; skins: SkinInfo[];
}

interface CsgoSkin { name: string; weapon: { id: string; name: string }; paint_index: string; rarity: { name: string; color: string }; image: string; legacy_model?: boolean; }
interface IndexWeapon { id: string; name: string; model: string; skins: { paintkit_id: number; name: string; rarity: string; texture_webp?: string; texture_export?: string }[]; }

let modelMap = new Map<string, string>();
let texMap = new Map<string, [string, string | null][]>();
let legacyMap = new Map<string, boolean>();
let weaponList: WeaponInfo[] = [];
let initPromise: Promise<void> | null = null;
let currentLang = "zh";

const ALIAS: Record<string, string> = {
  "M4A1-S": "m4a1_silencer", "USP-S": "usp_silencer", "P2000": "hkp2000",
  "weapon_m4a1": "m4a4", "weapon_glock": "glock18",
  "weapon_knife_m9_bayonet": "knife_m9", "weapon_knife_survival_bowie": "knife_bowie",
  "weapon_bayonet": "bayonet",
  "weapon_knife_gypsy_jackknife": "knife_bowie",
  "weapon_knife_widowmaker": "knife_talon",
  "sfui_wpnhud_knife_butterfly": "knife_butterfly",
  "sfui_wpnhud_knife_canis": "knife_canis",
  "sfui_wpnhud_knife_cord": "knife_cord",
  "sfui_wpnhud_knife_falchion_advanced": "knife_falchion",
  "sfui_wpnhud_knife_gypsy_jackknife": "knife_bowie",
  "sfui_wpnhud_knife_kukri": "knife_kukri",
  "sfui_wpnhud_knife_outdoor": "knife_outdoor",
  "sfui_wpnhud_knife_push": "knife_push",
  "sfui_wpnhud_knife_skeleton": "knife_skeleton",
  "sfui_wpnhud_knife_stiletto": "knife_stiletto",
  "sfui_wpnhud_knife_survival_bowie": "knife_bowie",
  "sfui_wpnhud_knife_ursus": "knife_ursus",
  "sfui_wpnhud_knife_widowmaker": "knife_talon",
  "sfui_wpnhud_knifebayonet": "bayonet",
  "sfui_wpnhud_knifecss": "knife_css",
  "sfui_wpnhud_knifeflip": "knife_flip",
  "sfui_wpnhud_knifegut": "knife_gut",
  "sfui_wpnhud_knifekaram": "knife_karambit",
  "sfui_wpnhud_knifem9": "knife_m9",
  "sfui_wpnhud_knifetactical": "knife_tactical",
};

const ID_TO_LIELXD: Record<string, string> = {
  "glock18": "weapon_glock",
  "m4a4": "weapon_m4a1",
  "knife_m9": "weapon_knife_m9_bayonet",
  "knife_bowie": "weapon_knife_survival_bowie",
  "knife_talon": "weapon_knife_widowmaker",
};

const LIELXD_MANIFEST_ALIAS: Record<string, string> = {
  "knife_talon": "knife_widowmaker",
  "knife_m9": "knife_m9_bayonet",
};

function idToLielxd(id: string): string {
  return ID_TO_LIELXD[id] || "weapon_" + id;
}

function wid(raw: string): string {
  return ALIAS[raw] || raw.replace(/^weapon_/, "").toLowerCase().replace(/[^a-z0-9_]/g, "");
}

export function getLang(): string { return currentLang; }

export async function initData(lang?: string): Promise<void> {
  const targetLang = lang || currentLang;
  const csgoUrl = targetLang === "zh" ? "/data/csgoapi_zh.json" : "/data/csgoapi.json";
  if (ready && targetLang === currentLang) return;
  initPromise = (async () => {
    const [csgoRes, idxRes, manifestRes] = await Promise.all([
      fetch(csgoUrl), fetch(INDEX_URL), fetch(LIELXD_MANIFEST)
    ]);
    const csgo: CsgoSkin[] = await csgoRes.json();
    const idx: { weapons: IndexWeapon[] } = await idxRes.json();
    const lielxd: Record<string, number[]> = await manifestRes.json();

    modelMap.clear();
    texMap.clear();
    legacyMap.clear();
    weaponList = [];

    for (const w of idx.weapons) {
      modelMap.set(w.id, `${BASE}/${w.model}`);

      const lielxdKey = LIELXD_MANIFEST_ALIAS[w.id] || w.id;
      const lielxdPids = lielxd[lielxdKey] || [];
      for (const pid of lielxdPids) {
        const k = `${w.id}:${pid}`;
        const existing = texMap.get(k) || [];
        const dir = `${LIELXD}/${idToLielxd(w.id)}`;
        existing.push([`${dir}/${pid}.png`, `${dir}/${pid}_metal.png`]);
        existing.push([`${dir}/${pid}.webp`, `${dir}/${pid}_metal.webp`]);
        texMap.set(k, existing);
      }

      for (const s of (w.skins || [])) {
        const k = `${w.id}:${s.paintkit_id}`;
        const pairs: [string, string | null][] = [];
        if (s.texture_webp) pairs.push([s.texture_webp.startsWith("/") ? s.texture_webp : `/webp/${s.texture_webp}`, null]);
        if (s.texture_export) pairs.push([`${BASE}/${s.texture_export}`, null]);
        const existing = texMap.get(k) || [];
        if (pairs.length > 0 || existing.length > 0) texMap.set(k, [...existing, ...pairs]);
      }
    }

    for (const s of csgo) {
      const id = wid(s.weapon.id);
      if (!modelMap.has(id)) continue;
      const pid = parseInt(s.paint_index);
      if (!isNaN(pid)) legacyMap.set(`${id}:${pid}`, s.legacy_model ?? true);
    }

    const byWeapon = new Map<string, { name: string; skins: SkinInfo[] }>();
    for (const s of csgo) {
      const id = wid(s.weapon.id);
      if (!modelMap.has(id)) continue;
      const pid = parseInt(s.paint_index);
      if (!byWeapon.has(id)) byWeapon.set(id, { name: s.weapon.name, skins: [] });
      byWeapon.get(id)!.skins.push({
        paintkit_id: pid,
        name: s.name.replace(s.weapon.name + " | ", ""),
        rarity: s.rarity.name,
        rarityColor: s.rarity.color,
        image: s.image,
        hasTexture: isNaN(pid) || (texMap.get(`${id}:${pid}`)?.length ?? 0) > 0,
      });
    }
    for (const w of idx.weapons) {
      const entry = byWeapon.get(w.id);
      if (entry) {
        if (!w.id.includes("knife") && !w.id.includes("bayonet")) {
          entry.skins.unshift({
            paintkit_id: 0,
            name: currentLang === "zh" ? "原皮" : "Factory New",
            rarity: "Base Grade",
            rarityColor: "#888888",
            image: "",
            hasTexture: true,
          });
        }
        weaponList.push({ id: w.id, name: entry.name, skins: entry.skins });
      }
    }
    currentLang = targetLang;
    ready = true;
  })();
  return initPromise;
}

let ready = false;

export function setLanguage(lang: string): Promise<void> {
  ready = false;
  initPromise = null;
  return initData(lang);
}

export function getWeaponList(): WeaponInfo[] { return weaponList; }
export function getModelUrl(weaponId: string): string | null { return modelMap.get(weaponId) ?? null; }

export function getTextureUrls(weaponId: string, paintkitId: number): [string, string | null][] {
  return texMap.get(`${weaponId}:${paintkitId}`) ?? [];
}

export function getLegacyModel(weaponId: string, paintkitId: number): boolean {
  return legacyMap.get(`${weaponId}:${paintkitId}`) ?? true;
}

export function getRarityColor(name: string): string { return RARITY_COLORS[name] ?? "#888888"; }
