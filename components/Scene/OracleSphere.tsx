
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';

const Group = 'group' as any;
const Mesh = 'mesh' as any;
const TorusGeometry = 'torusGeometry' as any;
const MeshBasicMaterial = 'meshBasicMaterial' as any;

export function OracleSphere() {
  const sphereRef = useRef<any>(null);

  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <Group>
      {/* Core Sphere */}
      <Sphere ref={sphereRef} args={[2.5, 64, 64]}>
        <MeshDistortMaterial
          color="#833ab4"
          envMapIntensity={1}
          clearcoat={1}
          clearcoatRoughness={0}
          metalness={0.5}
          distort={0.4}
          speed={2}
        />
      </Sphere>
      
      {/* Outer Glow Ring */}
      <Mesh rotation={[Math.PI / 2, 0, 0]}>
        <TorusGeometry args={[4, 0.05, 16, 100]} />
        <MeshBasicMaterial color="#00f0ff" transparent opacity={0.5} />
      </Mesh>
      <Mesh rotation={[Math.PI / 2.2, 0, 0]}>
        <TorusGeometry args={[4.5, 0.02, 16, 100]} />
        <MeshBasicMaterial color="#ff00aa" transparent opacity={0.5} />
      </Mesh>
    </Group>
  );
}
