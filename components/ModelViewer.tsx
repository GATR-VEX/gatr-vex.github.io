"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Bounds, OrbitControls } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { ThreeMFLoader } from "three/examples/jsm/loaders/3MFLoader.js";
import type { BufferGeometry, Group, Object3D } from "three";
import * as THREE from "three";
import {
  inspectThreeMf,
  revokePlateUrls,
  type ThreeMfPreview,
} from "@/lib/threemf-preview";
import { loadStepAsGroup } from "@/lib/step-preview";

type ModelViewerProps = {
  url: string;
  fileName: string;
  className?: string;
};

function extensionOf(fileName: string, url: string): string {
  const fromName = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (fromName) return fromName;
  return url.split(".").pop()?.toLowerCase() ?? "";
}

function applyFallbackMaterial(root: Object3D) {
  root.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      if (!mesh.material) {
        mesh.material = new THREE.MeshStandardMaterial({
          color: "#3f3f46",
          metalness: 0.15,
          roughness: 0.55,
        });
      }
    }
  });
}

function countMeshes(root: Object3D): number {
  let n = 0;
  root.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) n += 1;
  });
  return n;
}

function StlModel({ url }: { url: string }) {
  const [geometry, setGeometry] = useState<BufferGeometry | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loader = new STLLoader();
    loader.load(
      url,
      (geo) => {
        if (cancelled) return;
        geo.computeVertexNormals();
        setGeometry(geo);
      },
      undefined,
      () => {
        if (!cancelled) setGeometry(null);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (!geometry) return null;

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color="#3f3f46" metalness={0.15} roughness={0.55} />
    </mesh>
  );
}

function ObjModel({ url }: { url: string }) {
  const [object, setObject] = useState<Object3D | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loader = new OBJLoader();
    loader.load(
      url,
      (group: Group) => {
        if (cancelled) return;
        group.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.material = new THREE.MeshStandardMaterial({
              color: "#3f3f46",
              metalness: 0.15,
              roughness: 0.55,
            });
          }
        });
        setObject(group);
      },
      undefined,
      () => {
        if (!cancelled) setObject(null);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (!object) return null;
  return <primitive object={object} />;
}

function ThreeMfMesh({ buffer }: { buffer: ArrayBuffer }) {
  const [object, setObject] = useState<Object3D | null>(null);

  useEffect(() => {
    try {
      const loader = new ThreeMFLoader();
      const group = loader.parse(buffer);
      group.rotation.set(-Math.PI / 2, 0, 0);
      applyFallbackMaterial(group);
      if (countMeshes(group) === 0) {
        setObject(null);
        return;
      }
      setObject(group);
    } catch {
      setObject(null);
    }
  }, [buffer]);

  if (!object) return null;
  return <primitive object={object} />;
}

function MeshScene({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[6, 8, 4]} intensity={1.15} />
      <directionalLight position={[-4, 2, -3]} intensity={0.35} />
      <Bounds fit clip observe margin={1.35}>
        {children}
      </Bounds>
      <OrbitControls makeDefault enableDamping dampingFactor={0.08} />
    </>
  );
}

function PlatePreview({
  images,
  className,
}: {
  images: { name: string; url: string }[];
  className?: string;
}) {
  const current = images[0];
  if (!current) return null;

  return (
    <div className={`relative bg-zinc-50 ${className ?? ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={current.url}
        alt="Print plate preview"
        className="h-full w-full object-contain"
      />
    </div>
  );
}

function StepMesh({ object }: { object: Object3D }) {
  return <primitive object={object} />;
}

function StepViewer({
  url,
  className,
}: {
  url: string;
  className?: string;
}) {
  const [object, setObject] = useState<Object3D | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setObject(null);
    setError(null);

    loadStepAsGroup(url)
      .then((group) => {
        if (!cancelled) setObject(group);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not preview STEP.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-zinc-50 text-sm text-zinc-500 ${className ?? ""}`}
      >
        {error}
      </div>
    );
  }

  if (!object) {
    return (
      <div
        className={`flex items-center justify-center bg-zinc-50 text-sm text-zinc-400 ${className ?? ""}`}
      >
        Loading STEP…
      </div>
    );
  }

  return (
    <div className={`relative bg-zinc-50 ${className ?? ""}`}>
      <Canvas
        camera={{ position: [80, 60, 80], fov: 40, near: 0.1, far: 5000 }}
        gl={{ antialias: true }}
        className="h-full w-full"
      >
        <Suspense fallback={null}>
          <MeshScene>
            <StepMesh object={object} />
          </MeshScene>
        </Suspense>
      </Canvas>
    </div>
  );
}

function ThreeMfViewer({
  url,
  className,
}: {
  url: string;
  className?: string;
}) {
  const [preview, setPreview] = useState<ThreeMfPreview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let plateUrls: { url: string }[] = [];

    setPreview(null);
    setError(null);

    inspectThreeMf(url)
      .then((result) => {
        if (cancelled) {
          if (result.kind === "plates") revokePlateUrls(result.images);
          return;
        }
        if (result.kind === "plates") plateUrls = result.images;
        setPreview(result);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not preview 3MF.");
        }
      });

    return () => {
      cancelled = true;
      revokePlateUrls(plateUrls);
    };
  }, [url]);

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-zinc-50 text-sm text-zinc-500 ${className ?? ""}`}
      >
        {error}
      </div>
    );
  }

  if (!preview) {
    return (
      <div
        className={`flex items-center justify-center bg-zinc-50 text-sm text-zinc-400 ${className ?? ""}`}
      >
        Loading…
      </div>
    );
  }

  if (preview.kind === "plates") {
    return <PlatePreview images={preview.images} className={className} />;
  }

  return (
    <div className={`relative bg-zinc-50 ${className ?? ""}`}>
      <Canvas
        camera={{ position: [80, 60, 80], fov: 40, near: 0.1, far: 5000 }}
        gl={{ antialias: true }}
        className="h-full w-full"
      >
        <Suspense fallback={null}>
          <MeshScene>
            <ThreeMfMesh buffer={preview.buffer} />
          </MeshScene>
        </Suspense>
      </Canvas>
    </div>
  );
}

export function ModelViewer({ url, fileName, className }: ModelViewerProps) {
  const ext = extensionOf(fileName, url);

  if (ext === "3mf") {
    return <ThreeMfViewer url={url} className={className} />;
  }

  if (ext === "step" || ext === "stp") {
    return <StepViewer url={url} className={className} />;
  }

  if (ext !== "stl" && ext !== "obj") {
    return (
      <div
        className={`flex items-center justify-center bg-zinc-50 text-sm text-zinc-500 ${className ?? ""}`}
      >
        <a href={url} download={fileName} className="underline text-zinc-700">
          Download {fileName}
        </a>
      </div>
    );
  }

  return (
    <div className={`relative bg-zinc-50 ${className ?? ""}`}>
      <Canvas
        camera={{ position: [80, 60, 80], fov: 40, near: 0.1, far: 5000 }}
        gl={{ antialias: true }}
        className="h-full w-full"
      >
        <Suspense fallback={null}>
          <MeshScene>
            {ext === "stl" ? <StlModel url={url} /> : <ObjModel url={url} />}
          </MeshScene>
        </Suspense>
      </Canvas>
    </div>
  );
}
