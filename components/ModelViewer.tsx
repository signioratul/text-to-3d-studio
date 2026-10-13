"use client";

import { Suspense } from "react";

import { Canvas } from "@react-three/fiber";
import {
  Bounds,
  Center,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";

type ModelProps = {
  url: string;
};

function Model({ url }: ModelProps) {
  const { scene } = useGLTF(url);

  return (
    <Center>
      <primitive object={scene} />
    </Center>
  );
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color="#a5a4d4"
        wireframe
        transparent
        opacity={0.55}
      />
    </mesh>
  );
}

type ModelViewerProps = {
  url: string;
  autoRotate?: boolean;
  resetKey?: number;
};

export default function ModelViewer({
  url,
  autoRotate = false,
  resetKey = 0,
}: ModelViewerProps) {
  return (
    <section className="group relative h-[320px] w-full min-w-0 overflow-hidden rounded-2xl border border-white/[0.12] bg-[#101321]/80 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:h-[380px] lg:h-[600px] [@media(orientation:landscape)_and_(max-height:800px)]:h-[360px]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgba(129,123,180,0.13),transparent_48%),linear-gradient(180deg,rgba(36,42,65,0.20),transparent_60%,rgba(9,12,23,0.40)]"
      />

      {/* Fine workspace grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.13] [background-image:linear-gradient(rgba(174,180,214,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(174,180,214,0.14)_1px,transparent_1px)] [background-size:42px_42px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
      />

      {/* Viewer header */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 p-4 sm:p-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.10] bg-white/[0.045] text-base text-violet-200/90 backdrop-blur-xl">
            ◈
          </div>

          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-100">
              3D Workspace
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              Interactive preview
            </p>
          </div>
        </div>

        <span className="flex shrink-0 items-center gap-2 rounded-full border border-white/[0.10] bg-slate-950/40 px-3 py-1.5 text-xs text-slate-300 backdrop-blur-xl">
          <span className="h-1.5 w-1.5 rounded-full bg-[#a9c8b9]" />
          GLB Viewer
        </span>
      </div>

      {/* 3D scene */}
      <Canvas
        key={resetKey}
        camera={{ position: [3, 3, 3], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          touchAction: "none",
        }}
      >
        <ambientLight intensity={1.15} />

        <directionalLight
          position={[5, 6, 5]}
          intensity={1.7}
          color="#e4e3ff"
        />

        <directionalLight
          position={[-4, 2, -3]}
          intensity={0.55}
          color="#a8b8e8"
        />

        <Suspense fallback={<LoadingFallback />}>
          <Bounds fit clip margin={1.2}>
            <Model url={url} />
          </Bounds>
        </Suspense>

        <OrbitControls
          enableDamping
          enableZoom
          enablePan
          minDistance={1.5}
          maxDistance={10}
          autoRotate={autoRotate}
          autoRotateSpeed={1}
        />
      </Canvas>

      {/* Bottom viewer hint */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-center justify-between gap-3 border-t border-white/[0.07] bg-slate-950/20 px-4 py-3 backdrop-blur-[2px] sm:px-5">
        <p className="text-xs text-slate-400">
          Drag to orbit <span className="mx-1.5 text-slate-600">·</span>
          Scroll to zoom
        </p>

        <span className="text-xs tracking-wide text-slate-500">
          X · Y · Z
        </span>
      </div>
    </section>
  );
}