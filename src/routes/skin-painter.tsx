import { useState, useEffect } from "react";
import { fetchSkins, getWeapons, getSkinsForWeapon, type Weapon, type WeaponSkin } from "../lib/api";
import { Weapon3DViewer } from "../components/weapon-3d-viewer";

export default function SkinPainter() {
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [skins, setSkins] = useState<WeaponSkin[]>([]);
  const [selectedWeapon, setSelectedWeapon] = useState<Weapon | null>(null);
  const [selectedSkin, setSelectedSkin] = useState<WeaponSkin | null>(null);
  const [loading, setLoading] = useState(true);
  const [textureSet, setTextureSet] = useState<Set<number>>(new Set());

  useEffect(() => {
    (async () => {
      const s = await fetchSkins();
      const w = await getWeapons();
      setSkins(s);
      setWeapons(w);
      // Load texture availability
      try {
        const data = await fetch("/paint_index_map.json").then((r) => r.json());
        const set = new Set<number>();
        for (const col of Object.values(data as Record<string, any>)) {
          for (const info of Object.values(col.weapons as Record<string, any>)) {
            if (info.paint_index != null) set.add(info.paint_index);
          }
        }
        setTextureSet(set);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const weaponSkins = selectedWeapon
    ? getSkinsForWeapon(skins, selectedWeapon.weapon_id)
    : [];

  const categories = [...new Set(weapons.map((w) => w.category))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-white/50">
        Loading CS2 data...
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Left: weapon list */}
      <aside className="w-64 shrink-0 border-r border-white/10 overflow-y-auto">
        <div className="p-3 text-sm text-white/40 uppercase tracking-wider">
          Weapons
        </div>
        {categories.map((cat) => (
          <div key={cat}>
            <div className="px-3 py-1.5 text-xs text-white/25 uppercase">
              {cat}
            </div>
            {weapons
              .filter((w) => w.category === cat)
              .map((w) => (
                <button
                  key={w.weapon_id}
                  onClick={() => {
                    setSelectedWeapon(w);
                    setSelectedSkin(null);
                  }}
                  className={`w-full text-left px-4 py-1.5 text-sm truncate transition-colors ${
                    selectedWeapon?.weapon_id === w.weapon_id
                      ? "bg-white/10 text-white"
                      : "text-white/50 hover:bg-white/5 hover:text-white/70"
                  }`}
                >
                  {w.name}
                </button>
              ))}
          </div>
        ))}
      </aside>

      {/* Center: 3D viewer */}
      <section className="flex-1 relative bg-[#0a0a10] overflow-hidden">
        {selectedSkin ? (
          <Weapon3DViewer skin={selectedSkin} />
        ) : selectedWeapon ? (
          <div className="flex items-center justify-center h-full text-white/30">
            Select a skin from the right panel
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-white/30">
            Select a weapon from the left panel
          </div>
        )}
      </section>

      {/* Right: skin list */}
      <aside className="w-72 shrink-0 border-l border-white/10 overflow-y-auto">
        {selectedWeapon ? (
          <>
            <div className="p-3 text-sm text-white/40 uppercase tracking-wider sticky top-0 bg-black/80 backdrop-blur">
              {selectedWeapon.name} Skins
            </div>
            {weaponSkins.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSkin(s)}
                className={`w-full text-left px-3 py-2 flex items-center gap-3 transition-colors ${
                  selectedSkin?.id === s.id
                    ? "bg-white/10"
                    : "hover:bg-white/5"
                }`}
              >
                <img
                  src={s.image}
                  alt={s.name}
                  className="w-16 h-8 object-contain opacity-80"
                  loading="lazy"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs truncate text-white/70">
                    {s.name}
                    {textureSet.has(parseInt(s.paint_index)) && (
                      <span className="text-green-400 ml-1" title="3D texture available">✓</span>
                    )}
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: s.rarity.color }}>
                    {s.rarity.name}
                  </div>
                </div>
              </button>
            ))}
          </>
        ) : (
          <div className="p-6 text-sm text-white/30 text-center">
            ← Pick a weapon first
          </div>
        )}
      </aside>
    </div>
  );
}
