import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Octahedron, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { createMonadShape } from './MonadLogo';
import { audio } from '../../services/audioEngine';

const Group = 'group' as any;
const Mesh = 'mesh' as any;
const MeshStandardMaterial = 'meshStandardMaterial' as any;
const MeshBasicMaterial = 'meshBasicMaterial' as any;
const RingGeometry = 'ringGeometry' as any;

interface TimeTravelButtonProps {
  position: [number, number, number];
  onClick: () => void;
  type?: 'forward' | 'reverse';
  targetZ?: number; // The Z position where the user should be for the button to appear (for reverse mode)
  scale?: number;
}

export function TimeTravelButton({ position, onClick, type = 'forward', targetZ, scale = 1 }: TimeTravelButtonProps) {
  const groupRef = useRef<THREE.Group>(null);
  const outerRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);

  // Colors
  const baseColor = "#ffffff";
  const activeColor = "#836EF9";
  const currentColor = hovered ? activeColor : baseColor;

  // Generate Monad Logo Geometry for the inner core
  const monadGeometry = useMemo(() => {
      const outer = createMonadShape(0.8, 0.2, 0);
      const inner = createMonadShape(0.4, 0.1, 0);
      outer.holes.push(inner);
  
      const geo = new THREE.ExtrudeGeometry(outer, {
        depth: 0.2,
        bevelEnabled: true,
        bevelSegments: 4,
        bevelSize: 0.05,
        bevelThickness: 0.05,
      });
      geo.center();
      return geo;
  }, []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Float animation
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      
      // Visibility Logic
      if (type === 'reverse') {
          // If targetZ is provided, check distance to that target
          const cameraZ = state.camera.position.z;
          const checkZ = targetZ !== undefined ? targetZ : position[2];
          
          const distToEnd = Math.abs(cameraZ - checkZ);
          // Show button when camera is close to the destination (within 200 units)
          groupRef.current.visible = distToEnd < 200;
      } else {
          groupRef.current.visible = true;
      }
    }
    if (outerRef.current) {
      outerRef.current.rotation.x += delta * 0.5;
      outerRef.current.rotation.y += delta * 0.8;
    }
    if (innerRef.current) {
      // Rotate the Monad logo
      innerRef.current.rotation.y -= delta * 1.5;
    }
  });

  return (
    <Group ref={groupRef} position={position} scale={scale}>
      <Group 
        onClick={(e: any) => {
          e.stopPropagation();
          audio.playClick();
          onClick();
        }}
        onPointerOver={() => {
            document.body.style.cursor = 'pointer';
            setHover(true);
            audio.playHover();
        }}
        onPointerOut={() => {
            document.body.style.cursor = 'default';
            setHover(false);
        }}
      >
        {/* Outer Crystal Shell */}
        <Octahedron ref={outerRef} args={[1.2, 0]}>
            <MeshStandardMaterial 
                color={currentColor} 
                wireframe 
                emissive={currentColor}
                emissiveIntensity={hovered ? 2 : 0.5}
                transparent
                opacity={0.8}
            />
        </Octahedron>

        {/* Inner Monad Logo Core */}
        <Mesh ref={innerRef} geometry={monadGeometry}>
            <MeshDistortMaterial
                color={currentColor}
                emissive={currentColor}
                emissiveIntensity={hovered ? 3 : 1}
                distort={0.2}
                speed={3}
            />
        </Mesh>

        {/* Platform effect */}
        <Mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <RingGeometry args={[1.5, 2, 32]} />
            <MeshBasicMaterial color={currentColor} transparent opacity={0.2} side={THREE.DoubleSide} />
        </Mesh>
      </Group>
    </Group>
  );
}