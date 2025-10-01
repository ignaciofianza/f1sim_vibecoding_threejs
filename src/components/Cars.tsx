import { useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import AutoF1 from "./AutoF1";

type CarsProps = {
  racing: boolean;
  reset: boolean;
};

type CarData = {
  maxSpeed: number;
  acceleration: number;
  lane: number;
  targetLane: number;
};

export default function Cars({ racing, reset }: CarsProps) {
  const carsRef = useRef<(THREE.Group | null)[]>(Array(20).fill(null));

  const carsData = useMemo<CarData[]>(
    () =>
      Array.from({ length: 20 }).map((_, i) => ({
        maxSpeed: 200 + Math.random() * 40,
        acceleration: 0.8 + Math.random() * 0.7,
        lane: i % 2 === 0 ? 6 : -6,
        targetLane: i % 2 === 0 ? 6 : -6,
      })),
    []
  );

  const currentSpeeds = useRef<number[]>(Array(20).fill(0));

  useFrame((_, delta) => {
    if (!racing) return;

    const minGap = 15;
    const laneOffset = 6;

    // ✅ Usamos un for clásico: TS no pierde el tipo
    for (let i = 0; i < carsRef.current.length; i++) {
      const car = carsRef.current[i];
      if (!car) continue;

      const data = carsData[i];

      currentSpeeds.current[i] = THREE.MathUtils.lerp(
        currentSpeeds.current[i],
        data.maxSpeed,
        (delta / data.acceleration) * 0.3
      );

      let newZ = car.position.z + currentSpeeds.current[i] * delta;

      let closestAhead: THREE.Group | null = null;
      let minDistance = Infinity;

      // 🔁 Bucle interno también con for
      for (let j = 0; j < carsRef.current.length; j++) {
        if (j === i) continue;
        const other = carsRef.current[j];
        if (!other) continue;

        if (Math.abs(other.position.x - data.lane) < 0.5) {
          const dz = other.position.z - car.position.z;
          if (dz > 0 && dz < minDistance) {
            closestAhead = other;
            minDistance = dz;
          }
        }
      }

      if (closestAhead) {
        const dz = closestAhead.position.z - newZ;
        if (dz < minGap) {
          const otherLane = data.lane === laneOffset ? -laneOffset : laneOffset;

          let laneFree = true;
          for (let j = 0; j < carsRef.current.length; j++) {
            if (j === i) continue;
            const other = carsRef.current[j];
            if (
              other &&
              Math.abs(other.position.x - otherLane) < 0.5 &&
              Math.abs(other.position.z - newZ) < minGap
            ) {
              laneFree = false;
              break;
            }
          }

          if (laneFree) {
            data.targetLane = otherLane;
          } else {
            newZ = closestAhead.position.z - minGap;
            currentSpeeds.current[i] *= 0.9;
          }
        }
      }

      car.position.x = THREE.MathUtils.lerp(
        car.position.x,
        data.targetLane,
        delta * 3
      );

      if (newZ > 900) newZ = 900;
      car.position.z = newZ;
    }
  });

  // 🔄 Reset
  if (reset) {
    currentSpeeds.current = Array(20).fill(0);
    for (let i = 0; i < carsRef.current.length; i++) {
      const car = carsRef.current[i];
      if (!car) continue;

      const row = Math.floor(i / 2);
      const side = i % 2 === 0 ? 6 : -6;
      const z = side > 0 ? -(row * 18 - 74) : -(row * 18 - 80);

      carsData[i].lane = side;
      carsData[i].targetLane = side;

      car.position.set(side, 0, z);
    }
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
