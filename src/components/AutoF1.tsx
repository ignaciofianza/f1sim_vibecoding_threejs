import { useGLTF } from "@react-three/drei";
import type { ComponentProps } from "react";
import { useMemo } from "react";

export default function AutoF1(props: Omit<ComponentProps<"primitive">, "object">) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { scene } = useGLTF("/models/f1/scene.gltf") as any;

  // clonamos el modelo para que cada instancia sea única
  const clone = useMemo(() => scene.clone(), [scene]);

  return <primitive object={clone} {...props} />;
}
