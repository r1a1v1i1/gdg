"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { memo, useMemo, useRef } from "react";
import * as THREE from "three";
import type { StadiumProfile, ZoneState } from "@/lib/stadium-data";

type StadiumSceneProps = {
  zones: ZoneState[];
  stadium: StadiumProfile;
  hero?: boolean;
};

function StadiumBowl({ stadium }: { stadium: StadiumProfile }) {
  return (
    <group rotation={[0, 0, 0]}>
      <mesh receiveShadow position={[0, -0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.25, 3.35, 128]} />
        <meshStandardMaterial color="#0d1625" roughness={0.72} metalness={0.25} />
      </mesh>
      <mesh receiveShadow position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.62, 2.1, 128]} />
        <meshStandardMaterial color="#111d2f" roughness={0.66} metalness={0.18} />
      </mesh>
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.48, 96]} />
        <meshStandardMaterial color="#123320" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.44, 1.92]} />
        <meshStandardMaterial color="#b7a66a" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.02, 1.025, 96]} />
        <meshBasicMaterial color={stadium.accent} transparent opacity={0.42} />
      </mesh>
    </group>
  );
}

function Floodlights({ stadium }: { stadium: StadiumProfile }) {
  const positions: [number, number, number][] = [
    [-3.1, 2.3, -2.8],
    [3.1, 2.3, -2.8],
    [-3.1, 2.3, 2.8],
    [3.1, 2.3, 2.8]
  ];

  return (
    <>
      {positions.map((position, index) => (
        <group key={index} position={position}>
          <mesh>
            <cylinderGeometry args={[0.025, 0.025, 1.55, 12]} />
            <meshStandardMaterial color="#6b7280" metalness={0.8} roughness={0.24} />
          </mesh>
          <pointLight color={stadium.floodlight} intensity={index % 2 === 0 ? 2.8 : 2.25} distance={7} />
          <mesh position={[0, 0.86, 0]}>
            <sphereGeometry args={[0.11, 18, 18]} />
            <meshBasicMaterial color={stadium.floodlight} transparent opacity={0.92} />
          </mesh>
        </group>
      ))}
    </>
  );
}

function CrowdParticles({ zones, stadium }: { zones: ZoneState[]; stadium: StadiumProfile }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(() => {
    const list: { angle: number; radius: number; height: number; color: THREE.Color }[] = [];
    zones.forEach((zone, zoneIndex) => {
      const count = Math.round(10 + zone.density / 3);
      const centerAngle = (zoneIndex / zones.length) * Math.PI * 2;
      for (let index = 0; index < count; index++) {
        const angle = centerAngle + (Math.random() - 0.5) * 0.46;
        const radius = 1.78 + Math.random() * 1.18;
        const densityColor = zone.density > 82 ? "#ff3e6c" : zone.density > 64 ? "#ffcf5c" : stadium.accent;
        list.push({
          angle,
          radius,
          height: Math.random() * 0.32,
          color: new THREE.Color(densityColor)
        });
      }
    });
    return list.slice(0, 520);
  }, [zones, stadium.accent]);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const time = clock.getElapsedTime();
    particles.forEach((particle, index) => {
      const wave = Math.sin(time * 1.4 + index) * 0.018;
      dummy.position.set(
        Math.cos(particle.angle + time * 0.012) * (particle.radius + wave),
        0.12 + particle.height,
        Math.sin(particle.angle + time * 0.012) * (particle.radius + wave)
      );
      dummy.scale.setScalar(0.032 + Math.sin(time + index) * 0.004);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
      mesh.setColorAt(index, particle.color);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, particles.length]} castShadow>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}

function GateMarkers({ zones, stadium }: { zones: ZoneState[]; stadium: StadiumProfile }) {
  return (
    <group>
      {zones
        .filter((zone) => zone.type === "gate" || zone.type === "exit")
        .map((zone, index) => {
          const angle = (index / 6) * Math.PI * 2;
          const color = zone.density > 82 ? "#ff3e6c" : zone.density > 64 ? "#ffcf5c" : stadium.accent;
          return (
            <mesh key={zone.id} position={[Math.cos(angle) * 3.22, 0.2, Math.sin(angle) * 3.22]}>
              <boxGeometry args={[0.16, 0.24 + zone.density / 280, 0.16]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.65} roughness={0.4} />
            </mesh>
          );
        })}
    </group>
  );
}

function CameraRig({ hero }: { hero?: boolean }) {
  const rigRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!rigRef.current) return;
    const time = clock.getElapsedTime();
    rigRef.current.rotation.y = Math.sin(time * 0.12) * (hero ? 0.18 : 0.08);
  });
  return <group ref={rigRef} />;
}

export const StadiumScene = memo(function StadiumScene({ zones, stadium, hero }: StadiumSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.7]}
      camera={{ position: hero ? [0, 4.4, 5.2] : [0, 4.1, 4.4], fov: hero ? 42 : 48 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#02050a"]} />
      <fog attach="fog" args={["#02050a", 5, 10]} />
      <ambientLight intensity={0.62} />
      <directionalLight position={[0, 6, 4]} intensity={1.8} castShadow />
      <group rotation={[hero ? -0.12 : -0.05, 0, 0]}>
        <CameraRig hero={hero} />
        <StadiumBowl stadium={stadium} />
        <Floodlights stadium={stadium} />
        <CrowdParticles zones={zones} stadium={stadium} />
        <GateMarkers zones={zones} stadium={stadium} />
      </group>
    </Canvas>
  );
});
