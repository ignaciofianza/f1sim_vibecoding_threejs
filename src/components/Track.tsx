import { useTexture } from "@react-three/drei";
import * as THREE from "three";

export default function Track() {
  // 🔥 Asfalto PBR
  const asphalt = useTexture({
    map: "/textures/asphalt/Asphalt025C_2K-JPG_Color.jpg",
    normalMap: "/textures/asphalt/Asphalt025C_2K-JPG_NormalGL.jpg",
    roughnessMap: "/textures/asphalt/Asphalt025C_2K-JPG_Roughness.jpg",
    aoMap: "/textures/asphalt/Asphalt025C_2K-JPG_AmbientOcclusion.jpg",
  });

  // 🌱 Césped
  const grass = useTexture({
    map: "/textures/grass/color.jpg",
  });

  // Repetición de asfalto (textura se repite a lo largo)
  Object.values(asphalt).forEach((t) => {
    if (t instanceof THREE.Texture) {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(4, 400); // más repetición para 2000 de largo
    }
  });

  // Césped repetido
  grass.map.wrapS = grass.map.wrapT = THREE.RepeatWrapping;
  grass.map.repeat.set(80, 400);

  // 🎨 Material de líneas (para no repetir)
  const lineMat = new THREE.MeshStandardMaterial({
    color: "white",
    roughness: 0.9,
    metalness: 0,
    polygonOffset: true,
    polygonOffsetFactor: -1,
  });

  return (
    <group>
      {/* Césped global */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.05, 0]}
        receiveShadow
      >
        <planeGeometry args={[200, 2000]} /> {/* muy ancho y largo */}
        <meshStandardMaterial {...grass} />
      </mesh>

      {/* Asfalto MUY largo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 2000, 200, 200]} />
        <meshStandardMaterial {...asphalt} metalness={0.5} roughness={1} />
      </mesh>

      {/* Líneas laterales */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-13, 0.01, 0]}>
        <planeGeometry args={[0.3, 2000]} />
        <primitive object={lineMat} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[13, 0.01, 0]}>
        <planeGeometry args={[0.3, 2000]} />
        <primitive object={lineMat} />
      </mesh>

      {/* Parrilla de largada (queda al inicio nomás) */}
      {Array.from({ length: 10 }).map((_, i) => (
        <group key={i}>
          <GridSlot position={[6, 0.01, -(i * 18 - 74)]} lineMat={lineMat} />
          <GridSlot position={[-6, 0.01, -(i * 18 - 80)]} lineMat={lineMat} />
        </group>
      ))}
    </group>
  );
}

// 📦 Slot de parrilla
function GridSlot({
  position,
  lineMat,
}: {
  position: [number, number, number];
  lineMat: THREE.Material;
}) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 6.5]}>
        <planeGeometry args={[5, 0.2]} />
        <primitive object={lineMat} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2.5, 0, 4.6]}>
        <planeGeometry args={[0.2, 4]} />
        <primitive object={lineMat} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.5, 0, 4.6]}>
        <planeGeometry args={[0.2, 4]} />
        <primitive object={lineMat} />
      </mesh>
    </group>
  );
}
