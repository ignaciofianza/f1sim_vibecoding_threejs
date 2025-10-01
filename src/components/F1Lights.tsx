import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

type F1LightsProps = {
  active: number; // columnas encendidas (0-5)
};

export default function F1LightsPRO({ active }: F1LightsProps) {
  const textureOn = useTexture("/textures/lights/red_on.jpg");
  const textureOff = useTexture("/textures/lights/red_off.png");

  const lightsRef = useRef<THREE.Mesh[]>([]);
  const intensities = useRef<number[]>(Array(10).fill(0));
  const groundRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    intensities.current = intensities.current.map((val, idx) => {
      const col = Math.floor(idx / 2);
      const target = col < active ? 2 : 0; // intensidad deseada
      return THREE.MathUtils.lerp(val, target, delta * 5);
    });

    lightsRef.current.forEach((mesh, idx) => {
      if (mesh) {
        (mesh.material as THREE.MeshPhysicalMaterial).emissiveIntensity =
          intensities.current[idx] || 0;
      }
    });

    if (groundRef.current) {
      (groundRef.current.material as THREE.MeshStandardMaterial).opacity =
        Math.max(...intensities.current) * 0.15;
    }
  });

  return (
    <group position={[0, 8, 100]} rotation={[0, Math.PI, 0]}>
      {/* Poste vertical */}
      <mesh position={[15, -1, 0]}>
        <boxGeometry args={[0.5, 14, 0.5]} />
        <meshStandardMaterial color="#444" metalness={0.8} roughness={0.4} />
      </mesh>

      {/* Base del poste */}
      <mesh position={[15, -7.8 , 0]}>
        <boxGeometry args={[1, 0.5, 1]} />
        <meshStandardMaterial color="#222" metalness={0.6} roughness={0.5} />
      </mesh>

      {/* Poste horizontal */}
      <mesh position={[7.5, 5, 0]}>
        <boxGeometry args={[15, 0.5, 0.5]} />
        <meshStandardMaterial color="#555" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Barra negra */}
      <mesh position={[0, 5, 0]}>
        <boxGeometry args={[12, 1, 0.5]} />
        <meshStandardMaterial color="black" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Luces (5 columnas x 2 filas) */}
      {Array.from({ length: 5 }).map((_, col) =>
        [0.8, -0.8].map((row, i) => {
          const idx = col * 2 + i;
          return (
            <group key={`${col}-${i}`}>
              {/* Luz */}
              <mesh
                ref={(el) => (lightsRef.current[idx] = el!)}
                position={[-4.5 + col * 2.25, row + 5, 0.3]}
              >
                <circleGeometry args={[0.7, 32]} />
                <meshPhysicalMaterial
                  map={col < active ? textureOn : textureOff}
                  emissive="red"
                  emissiveIntensity={intensities.current[idx]}
                  roughness={0.2}
                  metalness={0.4}
                  transmission={0.6} // efecto vidrio/acrílico
                  thickness={0.15}
                />
              </mesh>

              {/* Bisel metálico */}
              <mesh position={[-4.5 + col * 2.25, row + 5, 0.31]}>
                <ringGeometry args={[0.75, 0.85, 32]} />
                <meshStandardMaterial
                  color="silver"
                  metalness={0.9}
                  roughness={0.2}
                />
              </mesh>
            </group>
          );
        })
      )}

      {/* Reflejo en el suelo */}
      <mesh
        ref={groundRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -8, 0]} // pegado al piso
      >
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial
          color="red"
          transparent
          opacity={0}
          emissive="red"
          emissiveIntensity={0.3}
          polygonOffset
          polygonOffsetFactor={-1}
        />
      </mesh>
    </group>
  );
}
