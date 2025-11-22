
import React, { useRef, useEffect } from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';

const Mesh = 'mesh' as any;
const CylinderGeometry = 'cylinderGeometry' as any;
const MeshStandardMaterial = 'meshStandardMaterial' as any;

interface HyperTunnelProps {
    length: number;
}

export function HyperTunnel({ length }: HyperTunnelProps) {
  const tunnelRef = useRef<THREE.Mesh>(null);
  
  // Use useLoader to properly load and cache the texture
  const texture = useLoader(THREE.TextureLoader, 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/grid.png');
  
  // Configure texture settings only when texture changes
  useEffect(() => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    // Repeat texture along the length to maintain aspect ratio
    texture.repeat.set(20, length / 10);
    texture.needsUpdate = true;
  }, [texture, length]);

  return (
    <Mesh ref={tunnelRef} position={[0, 0, -length / 2]} rotation={[Math.PI / 2, 0, 0]}>
      <CylinderGeometry args={[15, 15, length, 32, 1, true]} />
      <MeshStandardMaterial 
        map={texture} 
        side={THREE.BackSide} 
        color="#200052"
        emissive="#4c1d95"
        emissiveIntensity={0.5}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </Mesh>
  );
}
