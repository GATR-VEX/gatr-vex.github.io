import * as THREE from "three";

type OcctMesh = {
  name?: string;
  color?: number[];
  attributes: {
    position: { array: number[] | Float32Array };
    normal?: { array: number[] | Float32Array };
  };
  index: { array: number[] | Uint32Array };
};

type OcctResult = {
  success?: boolean;
  meshes?: OcctMesh[];
};

type OcctModule = {
  ReadStepFile: (
    content: Uint8Array,
    params: Record<string, unknown> | null,
  ) => OcctResult;
};

type OcctFactory = (options?: {
  locateFile?: (path: string, scriptDirectory: string) => string;
}) => Promise<OcctModule>;

let occtPromise: Promise<OcctModule> | null = null;

async function getOcct(): Promise<OcctModule> {
  if (!occtPromise) {
    occtPromise = (async () => {
      const mod = (await import("occt-import-js")) as
        | OcctFactory
        | { default: OcctFactory };
      const factory = typeof mod === "function" ? mod : mod.default;
      return factory({
        locateFile: (file) =>
          file.endsWith(".wasm") ? "/occt-import-js.wasm" : file,
      });
    })();
  }
  return occtPromise;
}

export async function loadStepAsGroup(url: string): Promise<THREE.Group> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Could not download STEP file.");
  }

  const fileBuffer = new Uint8Array(await res.arrayBuffer());
  const occt = await getOcct();
  const result = occt.ReadStepFile(fileBuffer, null);

  if (!result?.meshes?.length) {
    throw new Error("Could not parse STEP file.");
  }

  const group = new THREE.Group();
  for (const resultMesh of result.meshes) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        resultMesh.attributes.position.array,
        3,
      ),
    );

    if (resultMesh.attributes.normal?.array?.length) {
      geometry.setAttribute(
        "normal",
        new THREE.Float32BufferAttribute(
          resultMesh.attributes.normal.array,
          3,
        ),
      );
    } else {
      geometry.computeVertexNormals();
    }

    const index = Uint32Array.from(resultMesh.index.array);
    geometry.setIndex(new THREE.BufferAttribute(index, 1));

    const color =
      resultMesh.color && resultMesh.color.length >= 3
        ? new THREE.Color(
            resultMesh.color[0],
            resultMesh.color[1],
            resultMesh.color[2],
          )
        : new THREE.Color("#3f3f46");

    const mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({
        color,
        metalness: 0.15,
        roughness: 0.55,
      }),
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    if (resultMesh.name) mesh.name = resultMesh.name;
    group.add(mesh);
  }

  if (group.children.length === 0) {
    throw new Error("STEP file had no visible geometry.");
  }

  return group;
}
