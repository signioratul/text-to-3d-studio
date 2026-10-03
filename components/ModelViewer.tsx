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
      <meshStandardMaterial wireframe />
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
    <div className="h-[420px] w-full min-w-0 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 sm:h-[500px] lg:h-[600px]">
      <Canvas
        key={resetKey}
        camera={{ position: [3, 3, 3], fov: 45 }}
        style={{ touchAction: "none" }}
      >
        <ambientLight intensity={1} />

        <directionalLight
          position={[5, 5, 5]}
          intensity={2}
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
    </div>
  );
}