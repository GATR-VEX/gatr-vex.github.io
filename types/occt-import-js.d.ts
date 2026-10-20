declare module "occt-import-js" {
  type OcctFactory = (options?: {
    locateFile?: (path: string, scriptDirectory: string) => string;
  }) => Promise<{
    ReadStepFile: (
      content: Uint8Array,
      params: Record<string, unknown> | null,
    ) => {
      success?: boolean;
      meshes?: Array<{
        name?: string;
        color?: number[];
        attributes: {
          position: { array: number[] | Float32Array };
          normal?: { array: number[] | Float32Array };
        };
        index: { array: number[] | Uint32Array };
      }>;
    };
  }>;

  const occtimportjs: OcctFactory;
  export default occtimportjs;
}
