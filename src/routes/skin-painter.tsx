import { useState, useEffect } from "react";
import { initData, getWeaponList, setLanguage, getLang } from "../lib/api";
import type { WeaponInfo, SkinInfo } from "../lib/api";
import { Weapon3DViewer } from "../components/weapon-3d-viewer";
import { gradientStyle } from "../gradients";

const CATEGORY_MAP: Record<string, string> = {
  glock: "Pistols", glock18: "Pistols", hkp2000: "Pistols", usp_silencer: "Pistols", elite: "Pistols",
  p250: "Pistols", cz75a: "Pistols", fiveseven: "Pistols", tec9: "Pistols",
  deagle: "Pistols", revolver: "Pistols",
  nova: "Shotguns", xm1014: "Shotguns", mag7: "Shotguns", sawedoff: "Shotguns",
  mac10: "SMGs", mp9: "SMGs", mp7: "SMGs", mp5sd: "SMGs", ump45: "SMGs", p90: "SMGs", bizon: "SMGs",
  galilar: "Rifles", ak47: "Rifles", m4a1_silencer: "Rifles", m4a4: "Rifles", sg556: "Rifles", famas: "Rifles", aug: "Rifles",
  awp: "Sniper Rifles", ssg08: "Sniper Rifles", g3sg1: "Sniper Rifles", scar20: "Sniper Rifles",
  negev: "Heavy", m249: "Heavy",
  knife_karambit: "Knives", knife_m9: "Knives", knife_bayonet: "Knives", bayonet: "Knives",
  knife_butterfly: "Knives", knife_gut: "Knives", knife_flip: "Knives",
  knife_tactical: "Knives", knife_falchion: "Knives", knife_push: "Knives",
  knife_bowie: "Knives", knife_ursus: "Knives", knife_stiletto: "Knives",
  knife_outdoor: "Knives", knife_skeleton: "Knives", knife_canis: "Knives",
  knife_cord: "Knives", knife_css: "Knives",
  knife_kukri: "Knives", knife_navaja: "Knives", knife_talon: "Knives",
};
const CATS = ["Pistols", "SMGs", "Shotguns", "Rifles", "Sniper Rifles", "Heavy", "Knives", "Other"];

export default function SkinPainter() {
  const [categorized, setCategorized] = useState<Record<string, WeaponInfo[]>>({});
  const [selectedWeapon, setSelectedWeapon] = useState<WeaponInfo | null>(null);
  const [selectedSkin, setSelectedSkin] = useState<SkinInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    initData().then(() => {
      const weapons = getWeaponList();
      const map: Record<string, WeaponInfo[]> = {};
      for (const w of weapons) {
        const cat = CATEGORY_MAP[w.id] ?? "Other";
        if (!map[cat]) map[cat] = [];
        map[cat].push(w);
      }
      for (const k of Object.keys(map)) map[k].sort((a, b) => a.name.localeCompare(b.name));
      setCategorized(map);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex items-center justify-center h-full text-white/50">Loading...</div>;

  return (
    <div className="flex h-full">
      <aside className="w-56 shrink-0 border-r border-white/10 overflow-y-auto bg-zinc-950">
        <div className="p-3 flex items-center justify-between">
          <span className="text-sm text-white/40 uppercase tracking-wider">Weapons</span>
          <button onClick={async () => {
            const next = getLang() === "zh" ? "en" : "zh";
            await setLanguage(next);
            setLoading(true);
            initData().then(() => {
              const weapons = getWeaponList();
              const map: Record<string, WeaponInfo[]> = {};
              for (const w of weapons) {
                const cat = CATEGORY_MAP[w.id] ?? "Other";
                if (!map[cat]) map[cat] = [];
                map[cat].push(w);
              }
              for (const k of Object.keys(map)) map[k].sort((a, b) => a.name.localeCompare(b.name));
              setCategorized(map);
              setSelectedWeapon(null);
              setSelectedSkin(null);
              setLoading(false);
            });
          }} className="text-[10px] px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white/50">{getLang() === "zh" ? "EN" : "中"}</button>
        </div>
        {CATS.map((cat) => (
          <div key={cat}>
            <div className="px-3 py-1.5 text-xs text-white/25 uppercase">{cat}</div>
            {(categorized[cat] || []).map((w) => (
              <button key={w.id}
                onClick={() => { setSelectedWeapon(w); setSelectedSkin(null); }}
                className={`w-full text-left px-4 py-1.5 text-sm truncate ${selectedWeapon?.id === w.id ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/5"}`}
              >{w.name}</button>
            ))}
          </div>
        ))}
      </aside>

      <section className="flex-1 relative overflow-hidden" style={{ background: gradientStyle("pinkBlush") }}>
        {selectedSkin ? (
          <Weapon3DViewer weaponId={selectedWeapon!.id} paintkitId={selectedSkin.paintkit_id} skinName={selectedSkin.name} rarityName={selectedSkin.rarity} />
        ) : (
          <div className="flex items-center justify-center h-full text-white/30">Select a skin</div>
        )}
      </section>

      <aside className="w-72 shrink-0 border-l border-white/10 overflow-y-auto bg-zinc-950">
        {selectedWeapon ? (
          <>
            <div className="p-3 text-sm text-white/40 uppercase sticky top-0 bg-zinc-950 border-b border-white/10 flex items-center justify-between z-10">
              <span>{selectedWeapon.name} Skins</span>
              <button
                onClick={() => {
                  const text = selectedSkin?.name || "";
                  const ta = document.createElement("textarea");
                  ta.value = text; ta.style.cssText = "position:fixed;left:-9999px;top:-9999px";
                  document.body.appendChild(ta); ta.focus(); ta.select();
                  try { document.execCommand("copy"); } catch (_) {}
                  document.body.removeChild(ta);
                  setCopied(true); setTimeout(() => setCopied(false), 1500);
                }}
                className="text-[10px] px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white/50"
              >{copied ? "Copied!" : "Copy"}</button>
            </div>
            {selectedWeapon.skins.map((s) => (
              <button key={s.paintkit_id} onClick={() => setSelectedSkin(s)}
                className={`w-full text-left px-3 py-2 flex items-center gap-3 ${selectedSkin?.paintkit_id === s.paintkit_id ? "bg-white/10" : "hover:bg-white/5"}`}>
                {s.image && <img src={s.image} className="w-16 h-8 object-contain opacity-80" loading="lazy" alt="" />}
                <div className="flex-1 min-w-0">
                  <div className="text-xs truncate text-white/70">
                    {s.name}
                    {s.hasTexture && <span className="text-green-400 ml-1 text-[10px]">✓</span>}
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: s.rarityColor }}>{s.rarity}</div>
                </div>
              </button>
            ))}
          </>
        ) : (
          <div className="p-6 text-sm text-white/30 text-center">Pick a weapon</div>
        )}
      </aside>
    </div>
  );
}
