
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import { Text, shaderMaterial, Billboard, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { audio } from '../../services/audioEngine';

// R3F Component Definitions
const Group = 'group' as any;
const Mesh = 'mesh' as any;
const PlaneGeometry = 'planeGeometry' as any;
const MeshStandardMaterial = 'meshStandardMaterial' as any;
const MeshBasicMaterial = 'meshBasicMaterial' as any;

// Create a 1x1 transparent placeholder texture to prevent "no image data" warnings
const placeholderTexture = new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1, THREE.RGBAFormat);
placeholderTexture.needsUpdate = true;

// Extend Three.js with custom shader material
const PortalMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color(0.0, 0.0, 0.0),
    uTexture: placeholderTexture, // Initialize with valid data
    uHover: 0,
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform float uTime;
    uniform float uHover;
    uniform vec3 uColor;
    uniform sampler2D uTexture;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv;
      
      // Zoom towards center based on hover
      float zoom = 1.0 - (uHover * 0.15);
      vec2 center = vec2(0.5);
      uv = (uv - center) * zoom + center;

      // Subtle distortion
      float wave = sin(uv.y * 10.0 + uTime) * 0.005 * uHover;
      uv.x += wave;

      vec4 tex = texture2D(uTexture, uv);

      // Desaturate slightly if not hovered, boost color if hovered
      vec3 color = tex.rgb;
      
      // Add emissive tint from category color
      color = mix(color, uColor, 0.1 + (uHover * 0.2));

      // Inner edge glow (vignette style)
      float dist = distance(vUv, center);
      float glow = smoothstep(0.5, 0.35, dist);
      
      gl_FragColor = vec4(color, tex.a * glow);
    }
  `
);

extend({ PortalMaterial });

interface TunnelStationsProps {
  data: any[];
  isMobile: boolean;
  onSelect: (dapp: any) => void;
  highlightId: string | null;
}

const FALLBACK_LOGO = "https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/68b20be38a9f4a238e4ca802_monad-logo-400_400.webp";

export function OrbitingTiles({ data, isMobile, onSelect, highlightId }: TunnelStationsProps) {
  
  // Parameters for spiral layout - Synchronized with TunnelScene
  const radius = isMobile ? 3.5 : 8; 
  const zSpacing = isMobile ? 22 : 15; 
  const angleStep = isMobile ? 1.5 : 1.2; // Twist slightly more on mobile

  // Base scale factor: 20% smaller on mobile
  const baseScale = isMobile ? 0.8 : 1.0;

  return (
    <Group>
      {data.map((dapp, index) => {
        const angle = index * angleStep;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const z = -index * zSpacing - 20; 

        const isHighlighted = highlightId === dapp.id;

        return (
          <PortalStation 
            key={dapp.id || index}
            position={[x, y, z]}
            rotation={[0, 0, angle * 0.5]} // Initial twist
            scale={baseScale}
            dapp={dapp}
            onSelect={onSelect}
            isHighlighted={isHighlighted}
            isMobile={isMobile}
          />
        );
      })}
    </Group>
  );
}

function PortalStation({ position, rotation, scale, dapp, onSelect, isHighlighted, isMobile }: any) {
  const groupRef = useRef<THREE.Group>(null);
  const frameRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);
  const portalRef = useRef<THREE.Mesh>(null);
  
  const [hovered, setHover] = useState(false);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  // Load texture manually using useEffect (side effect)
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(
      dapp.logo || FALLBACK_LOGO,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        setTexture(tex);
      },
      undefined,
      () => {
        // Error fallback
        loader.load(FALLBACK_LOGO, (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            setTexture(tex);
        });
      }
    );
  }, [dapp.logo]);

  const randomPhase = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state, delta) => {
    if (!groupRef.current || !materialRef.current) return;

    const time = state.clock.elapsedTime;
    const cameraPos = state.camera.position;
    
    // Calculate LookAt Vector manually to allow dampening
    const targetLookAt = new THREE.Vector3().copy(cameraPos);
    
    // Smoothly rotate towards camera (Lazy LookAt) to reveal 3D depth
    const dummy = new THREE.Object3D();
    dummy.position.copy(groupRef.current.position);
    dummy.lookAt(targetLookAt);
    
    // Slerp current quaternion to target quaternion
    groupRef.current.quaternion.slerp(dummy.quaternion, delta * 2.0);

    // Floating Animation
    groupRef.current.position.y = position[1] + Math.sin(time * 2 + randomPhase) * 0.3;

    // Interaction Logic
    const dist = groupRef.current.position.distanceTo(cameraPos);
    const proximityRange = 25;
    const inRange = dist < proximityRange;
    const active = hovered || isHighlighted;
    const proximityFactor = inRange ? Math.max(0, (proximityRange - dist) / proximityRange) : 0;
    
    const targetHoverVal = active ? 1.0 : (proximityFactor * 0.6);

    // Update Shader Uniforms
    materialRef.current.uTime = time;
    materialRef.current.uHover = THREE.MathUtils.lerp(materialRef.current.uHover, targetHoverVal, delta * 5);
    
    if (texture && materialRef.current.uTexture !== texture) {
      materialRef.current.uTexture = texture;
    }

    // Portal Opening (Scale)
    const hoverScaleBonus = active ? 0.2 : (proximityFactor * 0.1);
    // Multiply base scale (from props) with the animation scale
    const currentScale = THREE.MathUtils.lerp(groupRef.current.scale.x, scale * (1 + hoverScaleBonus), delta * 3);
    groupRef.current.scale.setScalar(currentScale);

    // Emissive Pulse
    if (frameRef.current) {
        const mat = frameRef.current.material as THREE.MeshStandardMaterial;
        const targetEmissive = active ? 2.5 : (0.5 + proximityFactor * 1.0);
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, targetEmissive, delta * 5);
    }
  });

  const frameColor = new THREE.Color(dapp.color);

  return (
    <Group ref={groupRef} position={position}>
      {/* Volumetric Glow (Behind) */}
      <Billboard position={[0, 0, -1.0]}>
        <Mesh>
            <PlaneGeometry args={[5, 5]} />
            <MeshBasicMaterial 
                color={dapp.color} 
                transparent 
                opacity={0.1 + (hovered ? 0.15 : 0)} 
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            >
            </MeshBasicMaterial>
        </Mesh>
      </Billboard>

      {/* Interactive Container */}
      <Group
        onClick={(e: any) => {
            e.stopPropagation();
            onSelect(dapp);
        }}
        onPointerOver={() => {
            if (!isMobile) {
                setHover(true);
                audio.playHover();
            }
        }}
        onPointerOut={() => setHover(false)}
      >
          {/* 3D Frame (RoundedBox for 3D depth) */}
          <RoundedBox 
            ref={frameRef} 
            args={[3.4, 3.4, 0.4]} // Size
            radius={0.1} 
            smoothness={4}
          >
            <MeshStandardMaterial 
                color="#1a1a1a"
                emissive={dapp.color}
                emissiveIntensity={0.5}
                roughness={0.2}
                metalness={0.9}
            />
          </RoundedBox>

          {/* Portal Surface (Shader) */}
          <Mesh ref={portalRef} position={[0, 0, 0.21]}>
            <PlaneGeometry args={[3.1, 3.1]} />
            {/* @ts-ignore */}
            <portalMaterial 
                ref={materialRef} 
                transparent 
                uColor={frameColor}
                side={THREE.DoubleSide}
            />
          </Mesh>
      </Group>

      {/* Text Label (Floating below) */}
      <Group position={[0, -2.5, 0.2]}>
        <Text
            fontSize={isMobile ? 0.7 : 0.5}
            color="#fff"
            anchorX="center"
            anchorY="top"
            outlineWidth={isMobile ? 0.08 : 0.05}
            outlineColor={dapp.color}
        >
            {dapp.name}
        </Text>
        {!isMobile && (
            <Text
                fontSize={0.25}
                color="#ccc"
                anchorY="top"
                position={[0, -0.6, 0]}
            >
                {dapp.tags}
            </Text>
        )}
      </Group>
    </Group>
  );
}