
import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';
import { createMonadShape } from '../Scene/MonadLogo';

interface AppLogoProps {
  onClick?: () => void;
}

const Mesh = 'mesh' as any;
const AmbientLight = 'ambientLight' as any;
const PointLight = 'pointLight' as any;

function LogoScene() {
  const meshRef = useRef<THREE.Mesh>(null);

  // Generate Geometry matching the TimeTravelButton style (inner core only)
  const geometry = useMemo(() => {
    const outer = createMonadShape(1.3, 0.3, 0);
    const inner = createMonadShape(0.65, 0.15, 0);
    outer.holes.push(inner);

    const geo = new THREE.ExtrudeGeometry(outer, {
      depth: 0.4,
      bevelEnabled: true,
      bevelSegments: 4,
      bevelSize: 0.1,
      bevelThickness: 0.1,
      curveSegments: 32,
    });
    geo.center();
    return geo;
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle rotation
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
      <Mesh ref={meshRef} geometry={geometry} scale={1.4}>
        <MeshDistortMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.8}
          roughness={0.1}
          metalness={0.8}
          distort={0.2}
          speed={3}
        />
      </Mesh>
    </Float>
  );
}

export function AppLogo({ onClick }: AppLogoProps) {
  return (
    <div 
      className="app-logo-container" 
      onClick={onClick}
      style={{ 
        position: 'absolute', 
        top: '10px', 
        left: '10px', 
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none'
      }}
    >
      {/* 3D Rendered Icon */}
      <div className="logo-icon-wrapper" style={{ width: '65px', height: '65px', position: 'relative' }}>
         {/* Background Glow */}
         <div style={{
             position: 'absolute',
             top: '50%', left: '50%',
             transform: 'translate(-50%, -50%)',
             width: '30px', height: '30px',
             background: 'rgba(131, 58, 180, 0.4)',
             borderRadius: '50%',
             filter: 'blur(10px)',
             zIndex: -1
         }} />
         
         <Canvas camera={{ position: [0, 0, 4], fov: 45 }} gl={{ alpha: true, antialias: true }}>
            <AmbientLight intensity={0.8} />
            <PointLight position={[10, 10, 10]} intensity={2} />
            <PointLight position={[-10, -10, -5]} intensity={1} color="#833ab4" />
            <LogoScene />
         </Canvas>
      </div>

      {/* Typography: Stacked */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', lineHeight: 0.85 }}>
        <span style={{ 
            fontFamily: 'inter, sans-serif', 
            fontSize: '1.8rem', 
            color: '#fff',
            textShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
            letterSpacing: '1px'
        }}>
            MONAD
        </span>
        <span style={{ 
            fontFamily: 'inter, sans-serif',
            fontSize: '1.1rem', 
            color: '#AA99BC',
            textShadow: '0 0 10px rgba(131, 58, 180, 0.6)',
            letterSpacing: '1px'
        }}>
            TUNNEL
        </span>
      </div>
    </div>
  );
}
