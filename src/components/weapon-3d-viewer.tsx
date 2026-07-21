import { Suspense, useState, useMemo, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, useProgress, Html } from "@react-three/drei";
import * as THREE from "three";
import { getModelUrl, getTextureUrls, getRarityColor, getLegacyModel } from "../lib/api";

interface ViewerProps { weaponId: string; paintkitId: number; skinName: string; rarityName: string; }

function useTextureWithFallback(pairs: [string, string | null][]): { color: THREE.Texture | null; metalness: THREE.Texture | null } {
  const colorRef = useRef<THREE.Texture | null>(null);
  const metalnessRef = useRef<THREE.Texture | null>(null);
  const [color, setColor] = useState<THREE.Texture | null>(null);
  const [metalness, setMetalness] = useState<THREE.Texture | null>(null);
  const depKey = pairs.map(p => `${p[0]}|${p[1] ?? ""}`).join(",");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);

    const loader = new THREE.TextureLoader();
    let cancelled = false;

    function tryNext(idx: number) {
      if (cancelled || idx >= pairs.length) {
        if (!cancelled) setLoaded(true);
        return;
      }
      const [colorUrl, metalnessUrl] = pairs[idx];

      loader.load(
        colorUrl,
        (tex) => {
          if (cancelled) return;
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
          tex.flipY = false;
          tex.generateMipmaps = false;
          tex.minFilter = THREE.LinearFilter;
          tex.needsUpdate = true;
          colorRef.current = tex;
          setColor(tex);
          setLoaded(true);

          if (metalnessUrl) {
            loader.load(
              metalnessUrl,
              (mTex) => {
                if (cancelled) return;
                mTex.wrapS = mTex.wrapT = THREE.RepeatWrapping;
                mTex.flipY = false;
                mTex.generateMipmaps = false;
                mTex.minFilter = THREE.LinearFilter;
                mTex.needsUpdate = true;
                metalnessRef.current = mTex;
                setMetalness(mTex);
              },
              undefined,
              () => { metalnessRef.current = null; setMetalness(null); }
            );
          } else {
            metalnessRef.current = null;
            setMetalness(null);
          }
        },
        undefined,
        () => { if (!cancelled) tryNext(idx + 1); }
      );
    }

    if (pairs.length > 0) {
      tryNext(0);
    } else {
      colorRef.current = null;
      metalnessRef.current = null;
      setLoaded(true);
    }

    return () => { cancelled = true; };
  }, [depKey]);

  return { color: loaded ? color : colorRef.current, metalness: loaded ? metalness : metalnessRef.current };
}

interface MatState {
  map: THREE.Texture | null;
  metalnessMap: THREE.Texture | null;
  color: THREE.Color;
  normalMap: THREE.Texture | null;
  aoMap: THREE.Texture | null;
  roughnessMap: THREE.Texture | null;
  roughness: number;
  metalness: number;
}

function SkinnedModel({ modelUrl, texPairs, showSkin, showModel, legacyModel }: {
  modelUrl: string; texPairs: [string, string | null][]; showSkin: boolean; showModel: boolean; legacyModel: boolean;
}) {
  const { scene } = useGLTF(modelUrl);
  const { color: tex, metalness: metalnessTex } = useTextureWithFallback(texPairs);
  // Show correct mesh (hd or legacy) + center (using all meshes as reference)
  useEffect(() => {
    // Reset position to compute fresh bounding box (setFromObject uses world space!)
    scene.position.set(0, 0, 0);
    scene.updateMatrixWorld(true);

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) child.visible = true;
    });

    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    scene.position.set(-center.x, -center.y, -center.z);

    // Check if HD mesh exists; only hide legacy when HD is available
    let hasHd = false;
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      if (child.name.toLowerCase().includes("hd")) hasHd = true;
    });

    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const name = child.name.toLowerCase();
      if (name.includes("hd")) child.visible = !legacyModel;
      if (name.includes("legacy")) child.visible = hasHd ? legacyModel : true;
    });
  }, [scene, legacyModel]);

  // Save original material states (all PBR props)
  const matStates = useMemo(() => {
    const map = new Map<THREE.MeshStandardMaterial, MatState>();
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      for (const m of arrMat(child)) {
        if (!(m instanceof THREE.MeshStandardMaterial)) continue;
        const mn = (m.name || "").toLowerCase();
        if (mn.includes("bare_arm") || mn.includes("scope")) continue;
        map.set(m, {
          map: m.map,
          metalnessMap: m.metalnessMap,
          color: m.color.clone(),
          normalMap: m.normalMap,
          aoMap: m.aoMap,
          roughnessMap: m.roughnessMap,
          roughness: m.roughness,
          metalness: m.metalness,
        });
      }
    });
    return map;
  }, [scene]);

  // Apply/restore skin: null interfering maps when skin on, restore all when off
  useEffect(() => {
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      for (const m of arrMat(child)) {
        if (!(m instanceof THREE.MeshStandardMaterial)) continue;
        const mn = (m.name || "").toLowerCase();
        if (mn.includes("bare_arm") || mn.includes("scope")) continue;

        if (showSkin && tex) {
          m.map = tex;
          m.color.set(0xffffff);
          m.normalMap = null;
          m.aoMap = null;
          m.roughnessMap = null;
          m.roughness = 0.4;
          m.metalnessMap = metalnessTex ?? null;
          m.metalness = metalnessTex ? 1.0 : 0.8;
        } else {
          const s = matStates.get(m);
          if (s) {
            m.map = s.map;
            m.color.copy(s.color);
            m.normalMap = s.normalMap;
            m.aoMap = s.aoMap;
            m.roughnessMap = s.roughnessMap;
            m.roughness = s.roughness;
            m.metalnessMap = s.metalnessMap;
            m.metalness = s.metalness;
          }
        }
        m.needsUpdate = true;
      }
    });
  }, [tex, metalnessTex, showSkin, matStates]);

  return <primitive object={scene} visible={showModel} />;
}

function arrMat(child: THREE.Mesh): THREE.Material[] {
  return Array.isArray(child.material) ? child.material : [child.material];
}

export function Weapon3DViewer({ weaponId, paintkitId, skinName, rarityName }: ViewerProps) {
  const isBase = paintkitId === 0 || isNaN(paintkitId);
  const [showSkin, setShowSkin] = useState(!isBase);
  const [showModel, setShowModel] = useState(true);
  const modelUrl = getModelUrl(weaponId) ?? "";
  const texPairs = getTextureUrls(weaponId, paintkitId);

  useEffect(() => {
    setShowSkin(!isBase);
  }, [paintkitId]);

  useEffect(() => {
    if (modelUrl) useGLTF.preload(modelUrl);
  }, [modelUrl]);

  if (!modelUrl) return <div className="flex items-center justify-center h-full text-white/30">No model</div>;

  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [0.8, 0.5, 1.0], fov: 45 }} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} />
        <directionalLight position={[-5, 3, -2]} intensity={0.8} />
        <Suspense fallback={<LoadingFallback />}>
          <Environment files="/environment.hdr" environmentIntensity={0.4} />
          <SkinnedModel key={modelUrl} modelUrl={modelUrl} texPairs={texPairs} showSkin={showSkin} showModel={showModel} legacyModel={getLegacyModel(weaponId, paintkitId)} />
        </Suspense>
        <OrbitControls enableDamping dampingFactor={0.1} minDistance={0.2} maxDistance={1.5} target={[0, 0, 0]} />
      </Canvas>
      <div className="absolute top-4 left-4 pointer-events-none z-10 flex flex-col gap-1 max-w-[400px]">
        <div className="bg-black/50 backdrop-blur rounded-lg px-3 py-1.5">
          <div className="text-xs text-white/70">{skinName}</div>
          <div className="text-[10px] mt-0.5" style={{ color: getRarityColor(rarityName) }}>{rarityName}</div>
        </div>
        <div className="bg-black/50 backdrop-blur rounded-lg px-3 py-1.5 flex flex-col gap-0.5 text-[9px] leading-tight">
          <div className="text-white/50">模型: <span className="text-white/80">{modelUrl}</span></div>
          <div className="text-white/50">纹理: <span className="text-white/80">{isBase ? "原皮（无纹理）" : texPairs.length > 0 ? texPairs[0][0] : "无"}</span></div>
          <div className="text-white/50">状态: <span className={showSkin && texPairs.length > 0 ? "text-green-400" : "text-yellow-400"}>{isBase ? "原皮" : showSkin && texPairs.length > 0 ? "已加载" : "未加载"}</span> <span className="text-white/30">PID={paintkitId}</span></div>
        </div>
      </div>
      <div className="absolute top-4 right-4 pointer-events-auto flex gap-1.5 z-10">
        <button onClick={() => !isBase && setShowSkin(!showSkin)} className={`text-[10px] px-2 py-1 rounded ${!isBase && showSkin ? "bg-white/20 text-white" : "bg-black/40 text-white/40"}`}>Skin</button>
        <button onClick={() => setShowModel(!showModel)} className={`text-[10px] px-2 py-1 rounded ${showModel ? "bg-white/20 text-white" : "bg-black/40 text-white/40"}`}>Model</button>
      </div>
    </div>
  );
}

function LoadingFallback() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        <div className="text-xs text-white/40">{Math.round(progress)}%</div>
      </div>
    </Html>
  );
}
