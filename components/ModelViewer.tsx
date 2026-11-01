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
    <section className="group relative h-[320px] w-full min-w-0 overflow-hidden rounded-b-2xl border border-t-0 shadow-[0_24px_80px_rgba(0,0,0,0.16)] sm:h-[380px] lg:h-[600px] [@media(orientation:landscape)_and_(max-height:800px)]:h-[360px]"
      style={{
        borderColor: "var(--border)",
        background: "var(--workspace-background)",
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 42%, rgba(129,123,180,0.15), transparent 48%), linear-gradient(180deg, rgba(120,130,160,0.08), transparent 60%, rgba(9,12,23,0.10))",
        }}
      />

      <div
        aria-hidden="true"
        className="form3d-grid pointer-events-none absolute inset-0 opacity-70 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 p-4 sm:p-5">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-base backdrop-blur-xl"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface)",
              color: "var(--accent)",
            }}
          >
            ◈
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium" style={{ color: "var(--fg)" }}>
              3D Workspace
            </p>
            <p className="mt-0.5 text-xs" style={{ color: "var(--dim)" }}>
              Interactive preview
            </p>
          </div>
        </div>

        <span
          className="flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs backdrop-blur-xl"
          style={{
            borderColor: "var(--border)",
            background: "var(--surface)",
            color: "var(--fg)",
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          GLB Viewer
        </span>
      </div>

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
        <directionalLight position={[5, 6, 5]} intensity={1.7} color="#e4e3ff" />
        <directionalLight position={[-4, 2, -3]} intensity={0.55} color="#a8b8e8" />

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

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-center justify-between gap-3 border-t px-4 py-3 backdrop-blur-[2px] sm:px-5"
        style={{
          borderColor: "var(--border)",
          background: "var(--surface)",
        }}
      >
        <p className="text-xs" style={{ color: "var(--dim)" }}>
          Drag to orbit <span className="mx-1.5 opacity-60">·</span> Scroll to zoom
        </p>
        <span className="text-xs tracking-wide" style={{ color: "var(--dim)" }}>
          X · Y · Z
        </span>
      </div>
    </section>
  );
}
