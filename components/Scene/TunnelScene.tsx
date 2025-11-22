
import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Environment, PerspectiveCamera } from '@react-three/drei';
import { HyperTunnel } from './HyperTunnel';
import { OrbitingTiles } from './OrbitingTiles'; 
import { MonadLogo } from './MonadLogo';
import { TimeTravelButton } from './TimeTravelButton';
import * as THREE from 'three';
import { audio } from '../../services/audioEngine';

interface TunnelSceneProps {
  data: any[];
  isMobile: boolean;
  onSelectDapp: (dapp: any) => void;
  highlightId: string | null;
  onLogoClick: () => void;
  warpActive: boolean;
  reverseWarp?: boolean;
  customTargetZ: number | null;
  onTimeTravelStart: () => void;
  onTimeTravelReset: () => void;
}

const Fog = 'fog' as any;
const AmbientLight = 'ambientLight' as any;
const PointLight = 'pointLight' as any;
const Group = 'group' as any;

function CameraController({ minZ, warpActive, reverseWarp, customTargetZ }: { minZ: number, warpActive: boolean, reverseWarp?: boolean, customTargetZ: number | null }) {
  const { camera } = useThree();
  // If reversing (returning to tunnel), start deep in the tunnel
  const startZ = reverseWarp ? -2000 : 0;
  
  const scrollPos = useRef(startZ);
  const targetScrollPos = useRef(startZ);
  const lastSoundTime = useRef(0);

  const playScrollSound = () => {
    const now = Date.now();
    // Throttle to every 150ms to avoid machine gun effect
    if (now - lastSoundTime.current > 150) {
      audio.playScroll();
      lastSoundTime.current = now;
    }
  };

  // Handle custom targets (Time Travel)
  useEffect(() => {
    if (customTargetZ !== null) {
        targetScrollPos.current = customTargetZ;
    }
  }, [customTargetZ]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
        if (warpActive) return; 
        // Wheel Down (positive delta) -> Move forward (negative Z)
        targetScrollPos.current -= e.deltaY * 0.05;
        if (Math.abs(e.deltaY) > 5) { // Only play for significant movements
            playScrollSound();
        }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (warpActive) return;
      const step = 50;
      if (e.key === 'ArrowUp') {
          targetScrollPos.current -= step;
          playScrollSound();
      }
      if (e.key === 'ArrowDown') {
          targetScrollPos.current += step;
          playScrollSound();
      }
    };

    // --- Touch Handling for Mobile ---
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
        if (e.touches.length === 1) {
            touchStartY = e.touches[0].clientY;
        }
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (warpActive || e.touches.length !== 1) return;
        
        const touchY = e.touches[0].clientY;
        const deltaY = touchY - touchStartY;
        touchStartY = touchY; // Reset for continuous tracking

        // Logic:
        // Swipe Up (finger moves up, Y decreases, deltaY negative) -> Move Forward (deeper, negative Z)
        // Swipe Down (finger moves down, Y increases, deltaY positive) -> Move Backward (start, positive Z)
        
        const sensitivity = 2.0; // Smooth mobile feel
        targetScrollPos.current += deltaY * sensitivity;

        if (Math.abs(deltaY) > 2) {
            playScrollSound();
        }
    };

    window.addEventListener('wheel', handleWheel);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [warpActive]);

  useFrame((state, delta) => {
    if (warpActive) {
        if (reverseWarp) {
            // Warp Speed Reverse (Returning to Start)
            // Move towards 0 from negative
            targetScrollPos.current += 1000 * delta; 
            if (targetScrollPos.current > 0) targetScrollPos.current = 0;
        } else {
            // Warp Speed Forward (Searching)
            targetScrollPos.current -= 500 * delta; 
        }
    } else {
        // Normal Clamp Logic
        const limitBuffer = 50; 
        if (targetScrollPos.current < minZ + limitBuffer) {
            targetScrollPos.current = minZ + limitBuffer;
        }
        if (targetScrollPos.current > 0) {
            targetScrollPos.current = 0;
        }
    }

    // Smooth move
    const dampFactor = warpActive ? 3 : 5;
    scrollPos.current = THREE.MathUtils.damp(scrollPos.current, targetScrollPos.current, dampFactor, delta);
    camera.position.z = scrollPos.current;
    
    // Visual Warp Effect: FOV distortion
    const speed = Math.abs(targetScrollPos.current - scrollPos.current);
    
    if (camera instanceof THREE.PerspectiveCamera) {
        const targetFov = (speed > 50 || warpActive) ? 110 : 70;
        camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, delta * 2);
        camera.updateProjectionMatrix();
    }
    
    // Shake effect
    if (speed > 1 || warpActive) {
       const shakeIntensity = (warpActive || speed > 50) ? 0.2 : 0.05;
       camera.position.x = (Math.random() - 0.5) * shakeIntensity;
       camera.position.y = (Math.random() - 0.5) * shakeIntensity;
    } else {
       camera.position.x = 0;
       camera.position.y = 0;
    }
  });

  return null;
}

function InfiniteStars() {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.z = state.camera.position.z;
      groupRef.current.rotation.z += 0.001;
    }
  });

  return (
    <Group ref={groupRef}>
      <Stars radius={80} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
    </Group>
  );
}

// HUD Component to place the Reverse Button in the Top Right corner of the screen
function ReverseButtonHud({ onClick, targetZ }: { onClick: () => void, targetZ: number }) {
  const { size } = useThree();
  const depth = 2; // Distance from camera
  const fov = 70;
  
  // Calculate visible dimensions at the fixed depth
  const vFOV = THREE.MathUtils.degToRad(fov);
  const visibleHeight = 2 * Math.tan(vFOV / 2) * depth;
  const visibleWidth = visibleHeight * (size.width / size.height);
  
  const isMobile = size.width < 768;
  const pixelPadding = isMobile ? 35 : 85; 
  
  const worldPaddingY = (pixelPadding / size.height) * visibleHeight;
  const worldPaddingX = (pixelPadding / size.width) * visibleWidth;

  const x = (visibleWidth / 2) - worldPaddingX;
  const y = (visibleHeight / 2) - worldPaddingY;

  return (
    <TimeTravelButton 
        position={[x, y, -depth]} 
        scale={isMobile ? 0.1 : 0.14}
        onClick={onClick} 
        type="reverse"
        targetZ={targetZ}
    />
  );
}

export function TunnelScene({ 
  data, 
  isMobile,
  onSelectDapp, 
  highlightId, 
  onLogoClick, 
  warpActive, 
  reverseWarp,
  customTargetZ, 
  onTimeTravelStart,
  onTimeTravelReset
}: TunnelSceneProps) {
  // Dynamic spacing to match OrbitingTiles mobile logic and prevent logo overlap
  const zSpacing = isMobile ? 22 : 15; 
  const itemsLength = data.length * zSpacing;
  const tunnelLength = Math.max(1000, itemsLength + 300);
  
  // Position logo safely after the last item
  const logoPosition: [number, number, number] = [0, 0, -itemsLength - 60];
  
  return (
    <Canvas 
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      style={{ background: '#050011' }}
    >
      <PerspectiveCamera makeDefault position={[0, 0, 0]} fov={70} near={0.1} far={1000}>
        {/* HUD Elements attached to Camera */}
        <ReverseButtonHud 
          onClick={onTimeTravelReset} 
          targetZ={logoPosition[2]}
        />
      </PerspectiveCamera>
      
      <CameraController 
        minZ={logoPosition[2]} 
        warpActive={warpActive} 
        reverseWarp={reverseWarp}
        customTargetZ={customTargetZ}
      />

      <Fog attach="fog" args={['#050011', 20, 150]} />
      <AmbientLight intensity={1.5} />
      <PointLight position={[0, 0, 0]} intensity={2} distance={50} decay={2} color="#ffffff" />

      <Suspense fallback={null}>
        <InfiniteStars />
        
        {/* Always render tunnel to allow visual warp effect */}
        <HyperTunnel length={tunnelLength} />

        <OrbitingTiles 
            data={data} 
            isMobile={isMobile} 
            onSelect={onSelectDapp} 
            highlightId={highlightId} 
        />
        
        {/* Start Time Travel Button (Forward) - World Space */}
        <TimeTravelButton 
            position={[0, -2.5, -8]} 
            onClick={onTimeTravelStart} 
            type="forward"
        />

        {/* Monad Logo at End */}
        <MonadLogo position={logoPosition} onClick={onLogoClick} />
        
        <Environment files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/shanghai_bund_1k.hdr" />
      </Suspense>
    </Canvas>
  );
}