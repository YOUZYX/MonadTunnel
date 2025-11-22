
import React, { useRef, useState, useEffect, useMemo, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, Text, OrbitControls, RoundedBox, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { NotFoundEffect } from './NotFound';

const Group = 'group' as any;
const Mesh = 'mesh' as any;
const PlaneGeometry = 'planeGeometry' as any;
const MeshBasicMaterial = 'meshBasicMaterial' as any;

interface SpaceVoidProps {
  data: any[];
  onSelectDapp: (dapp: any) => void;
  onBack: () => void;
}

// --- Explosion Component ---
function Explosion({ position, color, onComplete }: any) {
  const particleCount = 12;
  const [particles] = useState(() => {
    const temp = [];
    for(let i=0; i<particleCount; i++) {
       const velocity = new THREE.Vector3(
         (Math.random()-0.5)*2, 
         (Math.random()-0.5)*2, 
         (Math.random()-0.5)*2
       ).normalize().multiplyScalar(Math.random() * 0.4 + 0.1);
       
       temp.push({
         velocity,
         position: new THREE.Vector3(0,0,0),
         rotation: new THREE.Euler(Math.random()*Math.PI, Math.random()*Math.PI, 0),
         scale: Math.random() * 0.4 + 0.1
       })
    }
    return temp;
  });
  
  const groupRef = useRef<THREE.Group>(null);
  const [active, setActive] = useState(true);
  const meshesRef = useRef<THREE.Mesh[]>([]);

  useEffect(() => {
    return () => {
      meshesRef.current.forEach(mesh => {
        if (mesh?.geometry) mesh.geometry.dispose();
        if (mesh?.material && 'dispose' in mesh.material) {
          (mesh.material as THREE.Material).dispose();
        }
      });
    };
  }, []);

  useFrame((_, delta) => {
     if (!active || !groupRef.current) return;
     
     let aliveCount = 0;
     groupRef.current.children.forEach((mesh, i) => {
        const p = particles[i];
        mesh.position.add(p.velocity);
        mesh.rotation.x += delta * 5;
        mesh.rotation.y += delta * 5;
        mesh.scale.multiplyScalar(0.92); 
        
        if (mesh.scale.x > 0.01) aliveCount++;
     });
     
     if (aliveCount === 0) {
         setActive(false);
         if (onComplete) onComplete();
     }
  });

  if (!active) return null;

  return (
    <group ref={groupRef} position={position}>
       {particles.map((p, i) => (
          <mesh 
            key={i} 
            position={[0,0,0]} 
            rotation={p.rotation} 
            scale={p.scale}
            ref={(el) => { if (el) meshesRef.current[i] = el; }}
          >
             <octahedronGeometry args={[1, 0]} />
             <meshBasicMaterial color={color} transparent opacity={0.8} />
          </mesh>
       ))}
    </group>
  );
}

// --- Node Component ---
// MEMOIZED to prevent re-rendering on every keystroke
const ConstellationNode = memo(({ dapp, position, onSelect, isVisible }: any) => {
    const [hovered, setHover] = useState(false);
    const meshRef = useRef<THREE.Group>(null);
    const [texture, setTexture] = useState<THREE.Texture | null>(null);
    
    const [showMesh, setShowMesh] = useState(isVisible);
    const [exploding, setExploding] = useState(false);

    // Handle visibility changes with animation
    useEffect(() => {
        if (isVisible) {
            setShowMesh(true);
            setExploding(false);
        } else {
            if (showMesh) {
                setExploding(true);
                setShowMesh(false); 
            }
        }
    }, [isVisible]); // Intentionally minimal deps

    // Enhanced texture loading with cleanup
    useEffect(() => {
        if (!dapp.logo || !showMesh) return;
        
        const loader = new THREE.TextureLoader();
        let mounted = true;
        
        loader.load(
            dapp.logo, 
            (t) => {
                if (mounted) {
                    t.colorSpace = THREE.SRGBColorSpace;
                    setTexture(t);
                }
            },
            undefined,
            () => console.warn('Texture error', dapp.name)
        );

        return () => {
            mounted = false;
            if (texture) texture.dispose();
        }
    }, [dapp.logo, showMesh]);

    useFrame((state) => {
        if (meshRef.current && showMesh) {
            meshRef.current.lookAt(state.camera.position);
            if (meshRef.current.scale.x < 0.99) {
               meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
            }
        }
    });
    
    return (
        <>
            {exploding && (
                <Explosion 
                    position={position} 
                    color={dapp.color} 
                    onComplete={() => setExploding(false)} 
                />
            )}
            
            {showMesh && (
                <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                    <Group 
                        ref={meshRef}
                        position={position} 
                        onClick={(e: any) => { e.stopPropagation(); onSelect(dapp); }}
                        onPointerOver={() => { document.body.style.cursor = 'pointer'; setHover(true); }}
                        onPointerOut={() => { document.body.style.cursor = 'default'; setHover(false); }}
                        scale={[0.01, 0.01, 0.01]} 
                    >
                        <RoundedBox args={[2.5, 2.5, 0.2]} radius={0.1} smoothness={4}>
                            <meshStandardMaterial 
                                color="#111" 
                                emissive={dapp.color} 
                                emissiveIntensity={hovered ? 0.8 : 0.3}
                                metalness={0.8}
                                roughness={0.2}
                            />
                        </RoundedBox>

                        {texture && (
                            <Mesh position={[0, 0, 0.11]}>
                                <PlaneGeometry args={[2.2, 2.2]} />
                                <MeshBasicMaterial map={texture} transparent />
                            </Mesh>
                        )}
                        
                        <Mesh position={[0, 0, -0.2]}>
                            <PlaneGeometry args={[4, 4]} />
                            <MeshBasicMaterial color={dapp.color} transparent opacity={hovered ? 0.4 : 0.1} blending={THREE.AdditiveBlending} />
                        </Mesh>

                        <Text
                            position={[0, -1.8, 0]}
                            fontSize={0.3}
                            color={dapp.color}
                            anchorX="center"
                            anchorY="top"
                            outlineWidth={0.02}
                            outlineColor="black"
                        >
                            {dapp.name}
                        </Text>
                    </Group>
                </Float>
            )}
        </>
    )
});

export function SpaceVoid({ data, onSelectDapp, onBack }: SpaceVoidProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // 1. Process positions once (Stable reference)
  const processedNodes = useMemo(() => {
    const count = data.length || 1;
    return data.map((dapp, i) => {
        const phi = Math.acos(1 - 2 * (i + 0.5) / count);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        const radius = 20;
        const x = radius * Math.cos(theta) * Math.sin(phi);
        const y = radius * Math.sin(theta) * Math.sin(phi);
        const z = radius * Math.cos(phi);
        return { ...dapp, pos: [x, y, z] };
    });
  }, [data]);

  // 2. Calculate visible IDs Set instead of recreating objects (Performance Boost)
  const visibleIds = useMemo(() => {
      const ids = new Set();
      if (!searchQuery) {
          processedNodes.forEach(n => ids.add(n.id));
          return ids;
      }
      
      const lowerQ = searchQuery.toLowerCase();
      processedNodes.forEach(n => {
          const match = 
            n.name.toLowerCase().includes(lowerQ) ||
            (n["PJ TYPE"] || "").toLowerCase().includes(lowerQ) ||
            (n.description || "").toLowerCase().includes(lowerQ) ||
            (n.tags || []).some((t: string) => t.toLowerCase().includes(lowerQ));
          
          if (match) ids.add(n.id);
      });
      return ids;
  }, [processedNodes, searchQuery]);

  const hasMatches = visibleIds.size > 0;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        
        {/* Glassmorphism Search Input */}
        <div style={{ 
            position: 'absolute', 
            top: '100px', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            zIndex: 50,
            width: '400px',
            maxWidth: '90%' 
        }}>
            <input
                type="text"
                placeholder="Filter Void..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    padding: '16px 24px',
                    borderRadius: '30px',
                    color: 'white',
                    fontSize: '1.1rem',
                    outline: 'none',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5), inset 0 0 10px rgba(255,255,255,0.05)',
                    fontFamily: "'Inter', sans-serif",
                    transition: 'all 0.3s'
                }}
                onFocus={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.border = '1px solid rgba(131, 58, 180, 0.5)';
                    e.target.style.boxShadow = '0 0 20px rgba(131, 58, 180, 0.3)';
                }}
                onBlur={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.target.style.border = '1px solid rgba(255, 255, 255, 0.15)';
                    e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5), inset 0 0 10px rgba(255,255,255,0.05)';
                }}
            />
        </div>

        <Canvas style={{ background: '#000' }}>
            <PerspectiveCamera makeDefault position={[0, 0, 35]} fov={60} />
            
            {/* Conditionally render Environment to handle No Results state */}
            {hasMatches ? (
                <Stars radius={100} depth={50} count={7000} factor={4} saturation={1} fade speed={0.5} />
            ) : (
                <NotFoundEffect />
            )}

            <OrbitControls autoRotate={!searchQuery} autoRotateSpeed={0.5} enableZoom={true} minDistance={10} maxDistance={60} />
            
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />

            <Group>
                {processedNodes.map((node) => (
                    <ConstellationNode 
                        key={node.id} 
                        dapp={node} 
                        position={node.pos} 
                        onSelect={onSelectDapp}
                        isVisible={visibleIds.has(node.id)}
                    />
                ))}
            </Group>
        </Canvas>
    </div>
  );
}
