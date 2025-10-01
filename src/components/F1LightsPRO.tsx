import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";

type F1LightsProps = {
  active: number; // cuántas columnas encendidas
  playing: boolean; // si la secuencia está corriendo
};

export default function F1LightsPRO({ active, playing }: F1LightsProps) {
  const textureOn = useTexture("/textures/lights/red_on.jpg");
  const textureOff = useTexture("/textures/lights/red_off.png");

  const lightsRef = useRef<THREE.Mesh[]>([]);
  const [emissiveIntensities, setEmissiveIntensities] = useState<number[]>(
    Array(10).fill(0)
  );

  // refs para sonidos (se crean una vez)
  const beepRef = useRef<HTMLAudioElement | null>(null);
  const startRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    beepRef.current = new Audio("/sounds/beep.m4a");
    startRef.current = new Audio("/sounds/start.mp3");
  }, []);

  // Glow dinámico
  useFrame((_, delta) => {
    setEmissiveIntensities((prev) =>
      prev.map((val, idx) => {
        const col = Math.floor(idx / 2);
        return col < active
          ? Math.min(val + delta * 6, 2)
          : Math.max(val - delta * 6, 0);
      })
    );

    lightsRef.current.forEach((mesh, idx) => {
      if (mesh) {
        (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity =
          emissiveIntensities[idx] || 0;
      }
    });
  });

  // 🔊 Disparar sonidos sincronizados
  useEffect(() => {
    if (!playing) return;

    if (active > 0 && active <= 5) {
      beepRef.current?.currentTime = 0;
      beepRef.current?.play();
    }

    if (active === 0) {
      startRef.current?.currentTime = 0;
      startRef.current?.play();
    }
  }, [active, playing]);

  return (
    <group position={[0, 8, 100]} rotation={[0, Math.PI, 0]}>
      {/* Poste vertical */}
      <mesh position={[15, -5, 0]}>
        <boxGeometry args={[0.5, 20, 0.5]} />
        <meshStandardMaterial color="gray" />
      </mesh>

      {/* Poste horizontal */}
      <mesh position={[7.5, 5, 0]}>
        <boxGeometry args={[15, 0.5, 0.5]} />
        <meshStandardMaterial color="gray" />
      </mesh>

      {/* Barra negra */}
      <mesh position={[0, 5, 0]}>
        <boxGeometry args={[12, 1, 0.5]} />
        <meshStandardMaterial color="black" metalness={0.6} roughness={0.4} />
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
                <meshStandardMaterial
                  map={col < active ? textureOn : textureOff}
                  emissive="red"
                  emissiveIntensity={emissiveIntensities[idx]}
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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial
          color="red"
          transparent
          opacity={0.1}
          emissive="red"
          emissiveIntensity={active > 0 ? 0.5 : 0}
        />
      </mesh>
    </group>
  );
}
