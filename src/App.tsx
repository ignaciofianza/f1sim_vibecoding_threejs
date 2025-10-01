import { Canvas, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import Track from "./components/Track";
import F1Lights from "./components/F1Lights";
import Cars from "./components/Cars";
import { useEffect, useRef, useState } from "react";

export default function App() {
  function CameraFix() {
    const { camera } = useThree();
    useEffect(() => {
      camera.position.set(0, 15, -70);
      camera.lookAt(0, 0, 200); // 🔥 apunta a la pista
    }, [camera]);
    return null;
  }
  const [lights, setLights] = useState(0);
  const [racing, setRacing] = useState(false);
  const [reset, setReset] = useState(false);

  const beepRef = useRef<HTMLAudioElement | null>(null);
  const startRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    beepRef.current = new Audio("/sounds/beep.m4a");
    startRef.current = new Audio("/sounds/start.mp3");
  }, []);

  const startSequence = () => {
    if (beepRef.current) {
      beepRef.current.currentTime = 0;
      beepRef.current.play();
    }

    let step = 0;
    const interval = setInterval(() => {
      step++;
      setLights(step);
      if (step === 5) {
        setTimeout(() => {
          setLights(0);
          clearInterval(interval);
          setRacing(true);

          if (startRef.current) {
            startRef.current.currentTime = 0;
            startRef.current.play();
          }
        }, 1000);
      }
    }, 1000);
  };

  const resetRace = () => {
    setLights(0);
    setRacing(false);
    setReset(true);
    setTimeout(() => setReset(false), 100); // trigger para Cars
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-black via-zinc-900 to-black relative overflow-hidden">
      {/* 🔝 HUD */}
      <div
        className="absolute top-0 left-0 w-full h-16 
                   bg-black/40 backdrop-blur-lg border-b border-red-900/40
                   flex items-center justify-between px-8 text-white z-20 font-bold shadow-lg"
      >
        <span className="text-2xl font-mono tracking-widest text-red-500 drop-shadow-[0_0_8px_#ff0000]">
          F1<span className="text-white">SIM</span>
        </span>
        <button
          onClick={racing ? resetRace : startSequence}
          className={`px-8 py-2 rounded-xl font-bold tracking-widest transition transform hover:scale-105
            ${
              racing
                ? "bg-gradient-to-r from-green-500 to-emerald-700 shadow-lg shadow-green-500/40 hover:shadow-green-400/70"
                : "bg-gradient-to-r from-red-600 to-red-800 shadow-lg shadow-red-500/40 hover:shadow-red-400/70"
            }
          `}
        >
          {racing ? "RESET" : "START RACE"}
        </button>
      </div>

      {/* ⚡ Indicador */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 
                   bg-black/60 border border-white/10 rounded-2xl px-6 py-3 
                   backdrop-blur-md text-white font-mono text-sm flex items-center gap-4 shadow-xl"
      >
        <span className="uppercase tracking-widest text-gray-400">Status:</span>
        <span
          className={`font-bold ${
            racing
              ? "text-green-400 drop-shadow-[0_0_6px_#22c55e]"
              : "text-red-400 drop-shadow-[0_0_6px_#ef4444]"
          }`}
        >
          {racing ? "RACING" : "WAITING"}
        </span>
        <span className="ml-4 text-gray-500">Lights: {lights}</span>
      </div>

      {/* 🎥 Escena 3D */}
      <Canvas shadows camera={{ fov: 40 }}>
        <CameraFix />
        <ambientLight intensity={0.6} />
        <hemisphereLight
          args={["#ffffff", "#444444", 0.8]}
          position={[0, 50, 0]}
        />
        <directionalLight
          position={[50, 100, 50]}
          intensity={2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={200}
        />
        <Environment preset="sunset" />

        <Track />
        <Cars racing={racing} reset={reset} />
        <F1Lights active={lights} />
      </Canvas>

      {/* ✨ Decoración */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-32 h-32 bg-red-600/20 blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-emerald-500/20 blur-3xl rounded-full" />
      </div>
    </div>
  );
}
