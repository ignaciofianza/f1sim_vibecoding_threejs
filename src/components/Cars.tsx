import { useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import AutoF1 from "./AutoF1";

type CarsProps = {
  racing: boolean;
  reset: boolean;
};

type CarData = {
  maxSpeed: number; // velocidad máxima individual
  acceleration: number; // tiempo para llegar a maxSpeed
  lane: number; // carril actual (-6 o 6)
  targetLane: number; // carril deseado
};

export default function Cars({ racing, reset }: CarsProps) {
  // refs de autos (20 slots pre-creados, inicializados en null)
  const carsRef = useRef<Array<THREE.Group | null>>(Array(20).fill(null));

  // Config inicial de los autos
  const carsData = useMemo<CarData[]>(
    () =>
      Array.from({ length: 20 }).map((_, i) => ({
        maxSpeed: 200 + Math.random() * 40, // ⚡ velocidad más realista (200–240)
        acceleration: 0.8 + Math.random() * 0.7, // ⚡ llegan a vmax en 0.8–1.5s
        lane: i % 2 === 0 ? 6 : -6,
        targetLane: i % 2 === 0 ? 6 : -6,
      })),
    []
  );

  // Velocidades dinámicas
  const currentSpeeds = useRef<number[]>(Array(20).fill(0));

  useFrame((_, delta) => {
    if (!racing) return;

    const minGap = 15;
    const laneOffset = 6;

    carsRef.current.forEach((car, i) => {
      if (!car) return;
      const data = carsData[i];

      // 🚀 Aceleración progresiva más lenta
      currentSpeeds.current[i] = THREE.MathUtils.lerp(
        currentSpeeds.current[i],
        data.maxSpeed,
        (delta / data.acceleration) * 0.3
      );

      let newZ = car.position.z + currentSpeeds.current[i] * delta;

      // 🚗 Buscar auto más cercano adelante en mismo carril
      let closestAhead: THREE.Group | null = null;
      let minDistance = Infinity;

      carsRef.current.forEach((other, j) => {
        if (!other || j === i) return;
        if (Math.abs(other.position.x - data.lane) < 0.5) {
          const dz = other.position.z - car.position.z;
          if (dz > 0 && dz < minDistance) {
            closestAhead = other;
            minDistance = dz;
          }
        }
      });

      if (closestAhead) {
        const dz = closestAhead.position.z - newZ;
        if (dz < minGap) {
          // 🚧 Intentar adelantar al otro carril
          const otherLane = data.lane === laneOffset ? -laneOffset : laneOffset;
          const laneFree = !carsRef.current.some(
            (other, j) =>
              other &&
              j !== i &&
              Math.abs(other.position.x - otherLane) < 0.5 &&
              Math.abs(other.position.z - newZ) < minGap
          );

          if (laneFree) {
            data.targetLane = otherLane; // cambia de carril
          } else {
            // frena un poco si no puede adelantar
            newZ = closestAhead.position.z - minGap;
            currentSpeeds.current[i] *= 0.9;
          }
        }
      }

      // 🎯 Interpolación lateral suave pero rápida
      car.position.x = THREE.MathUtils.lerp(
        car.position.x,
        data.targetLane,
        delta * 3
      );

      // 📏 límite de pista (muy larga)
      if (newZ > 900) newZ = 900;

      car.position.z = newZ;
    });
  });

  // 🔄 Reset de posiciones y velocidades
  if (reset) {
    currentSpeeds.current = Array(20).fill(0);
    carsRef.current.forEach((car, i) => {
      if (!car) return;
      const row = Math.floor(i / 2);
      const side = i % 2 === 0 ? 6 : -6;
      const z = side > 0 ? -(row * 18 - 74) : -(row * 18 - 80);

      carsData[i].lane = side;
      carsData[i].targetLane = side;

      car.position.set(side, 0, z);
    });
  }

  return (
    <>
      {Array.from({ length: 20 }).map((_, i) => {
        const row = Math.floor(i / 2);
        const side = i % 2 === 0 ? 6 : -6;
        const z = side > 0 ? -(row * 18 - 74) : -(row * 18 - 80);
        return (
          <group
            key={i}
            ref={(el) => {
              carsRef.current[i] = el;
            }}
            position={[side, 0, z]}
          >
            <AutoF1 scale={0.9} isRacing={racing} />
          </group>
        );
      })}
    </>
  );
}
