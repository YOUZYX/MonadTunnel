
import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

const Mesh = 'mesh' as any;
const MeshStandardMaterial = 'meshStandardMaterial' as any;
const Group = 'group' as any;

interface MonadLogoProps {
  position: [number, number, number];
  onClick: () => void;
}

// Helper function to create the rounded diamond shape with rotation
export function createMonadShape(size: number, radius: number, rotation: number) {
  const s = size / 2;

  const pts = [
    new THREE.Vector2(0, -s - radius),
    new THREE.Vector2(s + radius, 0),
    new THREE.Vector2(0, s + radius),
    new THREE.Vector2(-s - radius, 0),
  ];

  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const rotatedPts = pts.map(p => new THREE.Vector2(
    p.x * cos - p.y * sin,
    p.x * sin + p.y * cos
  ));

  const curve = new THREE.CatmullRomCurve3(
    rotatedPts.map((p) => new THREE.Vector3(p.x, p.y, 0)),
    true,
    "centripetal"
  );

  const shape = new THREE.Shape();
  const sampled = curve.getPoints(100);

  shape.moveTo(sampled[0].x, sampled[0].y);
  sampled.forEach((p) => shape.lineTo(p.x, p.y));

  return shape;
}

export function MonadLogo({ position, onClick }: MonadLogoProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);

  const geometry = useMemo(() => {
    const outer = createMonadShape(3.0, 0.9, Math.PI / 8);
    const inner = createMonadShape(1.8, 0.6, Math.PI / 6);
    outer.holes.push(inner);

    const geo = new THREE.ExtrudeGeometry(outer, {
      depth: 0.55,
      bevelEnabled: true,
      bevelSegments: 16,
      bevelSize: 0.12,
      bevelThickness: 0.12,
      curveSegments: 64,
    });

    geo.center();
    return geo;
  }, []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.75;
      meshRef.current.rotation.x = Math.sin(Date.now() * 0.0005) * 0.15;
      
      // Pulse scale on hover
      const targetScale = hovered ? 2.2 : 2.0;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return (
    <Group position={position}>
        <Mesh 
            ref={meshRef} 
            geometry={geometry} 
            onClick={(e: any) => {
                e.stopPropagation();
                onClick();
            }}
            onPointerOver={() => {
                document.body.style.cursor = 'pointer';
                setHover(true);
            }}
            onPointerOut={() => {
                document.body.style.cursor = 'default';
                setHover(false);
            }}
        >
        <MeshStandardMaterial
            color={hovered ? "#a88aff" : "#7b5cff"}
            metalness={0.8}
            roughness={0.2}
            emissive="#4c1d95"
            emissiveIntensity={hovered ? 1.5 : 0.4}
        />
        </Mesh>
        
        {/* Call to action label */}
        {hovered && (
            <Text
                position={[0, -6, 0]}
                fontSize={1}
                color="#fff"
                anchorX="center"
                anchorY="top"
            >
                MONAD ORACLE
            </Text>
        )}
    </Group>
  );
}
