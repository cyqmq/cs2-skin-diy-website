import { Suspense, useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, useTexture, Environment } from "@react-three/drei";
import * as THREE from "three";
import { getModelUrl, getTextureUrl, getRarityColor } from "../lib/api";

interface ViewerProps { weaponId: string; paintkitId: number; skinName: string; rarityName: string; }

function SkinnedModel({ modelUrl, texUrl, showSkin, showModel }: {
  modelUrl: string; texUrl: string | null; showSkin: boolean; showModel: boolean;
}) {
  const { scene } = useGLTF(modelUrl);
  const tex = texUrl ? useTexture(texUrl) as THREE.Texture : null;

  if (tex) {
    tex.flipY = false;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
  }

  const cloned = useMemo(() => {
    const c = scene.clone(true);
    hideMesh(c, "hd");

    c.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;

      // uv2 → uv
      const geo = child.geometry as THREE.BufferGeometry;
      const uv2 = geo.getAttribute("uv2") as THREE.BufferAttribute | undefined;
      if (uv2) {
        const g2 = geo.clone();
        g2.setAttribute("uv", uv2.clone());
        child.geometry = g2;
      }

      const mats = Array.isArray(child.material) ? child.material : [child.material];
      for (const mat of mats) {
        if (!(mat instanceof THREE.MeshStandardMaterial)) continue;
        if (showSkin && tex) {
          mat.map = tex;
          mat.color.set(0xffffff);
          mat.metalnessMap = null;
          mat.roughnessMap = null;
          mat.normalMap = null;
          mat.aoMap = null;
        }
        mat.needsUpdate = true;
      }
    });
    return c;
  }, [scene, tex, showSkin]);

  return <primitive object={cloned} visible={showModel} />;
}

function hideMesh(group: THREE.Group, keyword: string) {
  group.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      if (child.name.toLowerCase().includes(keyword)) child.visible = false;
    }
  });
}

export function Weapon3DViewer({ weaponId, paintkitId, skinName, rarityName }: ViewerProps) {
  const [showSkin, setShowSkin] = useState(true);
  const [showModel, setShowModel] = useState(true);
  const modelUrl = getModelUrl(weaponId) ?? "";
  const texUrl = getTextureUrl(weaponId, paintkitId);
  if (!modelUrl) return <div className="flex items-center justify-center h-full text-white/30">No model</div>;

  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [2, 1.5, 3], fov: 45 }} gl={{ antialias: true }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 5]} intensity={2} />
        <directionalLight position={[-5, 3, -2]} intensity={1} />
        <Suspense fallback={null}>
          <Environment files="/environment.hdr" environmentIntensity={1.2} />
          <SkinnedModel key={`${modelUrl}:${texUrl}:${showSkin}:${showModel}`} modelUrl={modelUrl} texUrl={texUrl} showSkin={showSkin} showModel={showModel} />
        </Suspense>
        <OrbitControls enableDamping dampingFactor={0.1} minDistance={0.3} maxDistance={4} target={[0, 0.3, 0]} />
      </Canvas>
      <div className="absolute bottom-4 left-4 pointer-events-none bg-black/50 backdrop-blur rounded-lg px-3 py-2 z-10">
        <div className="text-sm font-medium text-white/95">{skinName}</div>
        <div className="text-xs mt-0.5" style={{ color: getRarityColor(rarityName) }}>{rarityName}</div>
      </div>
      <div className="absolute top-4 right-4 pointer-events-auto flex gap-1.5 z-10">
        <button onClick={() => setShowSkin(!showSkin)} className={`text-[10px] px-2 py-1 rounded ${showSkin ? "bg-white/20 text-white" : "bg-black/40 text-white/40"}`}>Skin</button>
        <button onClick={() => setShowModel(!showModel)} className={`text-[10px] px-2 py-1 rounded ${showModel ? "bg-white/20 text-white" : "bg-black/40 text-white/40"}`}>Model</button>
      </div>
    </div>
  );
}
