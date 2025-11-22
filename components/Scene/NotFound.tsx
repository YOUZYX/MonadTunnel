
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

export function PurpleStarField() {
  const groupRef = useRef<any>(null);
  
  // Create stable particles - only once
  const positions = useMemo(() => {
    const count = 6000; // Increased count
    const pos = new Float32Array(count * 3);
    for(let i=0; i<count; i++) {
       // Distribute in a sphere volume
       const r = 100 * Math.cbrt(Math.random()); 
       const theta = Math.random() * 2 * Math.PI;
       const phi = Math.acos(2 * Math.random() - 1);
       
       pos[i*3] = r * Math.sin(phi) * Math.cos(theta);
       pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
       pos[i*3+2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
      if(groupRef.current) {
          // Slow rotation for "space" feel
          groupRef.current.rotation.y += delta * 0.05;
          // Gentle bobbing
          groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.5;
      }
  })

  return (
      <group ref={groupRef}>
          <points>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={positions.length / 3}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial 
                color="#a855f7" 
                size={0.4} 
                transparent 
                opacity={0.9} 
                sizeAttenuation={true} 
                depthWrite={false} 
                blending={THREE.AdditiveBlending}
            />
          </points>
      </group>
  )
}

export function TypewriterText({ text }: { text: string }) {
    const [displayed, setDisplayed] = useState("");
    const meshRef = useRef<any>(null);
    
    useEffect(() => {
        setDisplayed(""); 
        let index = 0;
        const timer = setInterval(() => {
            index++;
            setDisplayed(text.substring(0, index));
            if (index >= text.length) clearInterval(timer);
        }, 50); // Typing speed
        return () => clearInterval(timer);
    }, [text]);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.quaternion.copy(state.camera.quaternion);
        }
    });

    return (
        <group ref={meshRef} position={[0, 0, 0]}>
             <Text
                fontSize={1.5}
                color="white"
                // Use a standard font fallback to ensure visibility
                font="https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxM.woff" 
                textAlign="center"
                anchorX="center"
                anchorY="middle"
                maxWidth={30}
                outlineWidth={0.05}
                outlineColor="#833ab4"
                characters="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!? "
            >
                {displayed}
                <meshBasicMaterial color="white" toneMapped={false} />
            </Text>
        </group>
    )
}

export function NotFoundEffect() {
    return (
        <group>
            <PurpleStarField />
            <group position={[0, 0, 25]}>
                {/* Push text closer to camera (camera is at z=35 in SpaceVoid) */}
                <TypewriterText text="Scan complete. No DApps match your Search." />
            </group>
        </group>
    );
}
