import React, { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createMonadShape } from './MonadLogo'

const COLOR_PALETTE = [
    '#6E54FF', // Purple
    '#836EF9', // Light Lavender
    '#0E091C', // Very Dark Blue/Black
    '#B9E3F9', // Black
    '#FFFFFF', // White
    '#85E6FF', // Cyan
    '#000000', // Pale Blue
    '#FF8EE4', // Pink
    '#FFAE45', // Orange
]

const Group = 'group' as any;
const Mesh = 'mesh' as any;

interface MonadLogoProps {
    position: [number, number, number]
    onClick: () => void
}

export function MonadLogoFill({ position, onClick }: MonadLogoProps) {
    const meshRef = useRef<THREE.Mesh>(null)
    const [hovered, setHover] = useState(false)

    // State for animation logic
    const [colorIndex, setColorIndex] = useState(0)
    const fillProgressRef = useRef(0)

    const geometry = useMemo(() => {
        const outer = createMonadShape(3.0, 0.9, Math.PI / 8)
        const inner = createMonadShape(1.8, 0.6, Math.PI / 6)
        outer.holes.push(inner)

        const geo = new THREE.ExtrudeGeometry(outer, {
            depth: 0.55,
            bevelEnabled: true,
            bevelSegments: 16,
            bevelSize: 0.12,
            bevelThickness: 0.12,
            curveSegments: 64,
        })

        geo.center()

        // Compute bounding box for the shader
        geo.computeBoundingBox()

        return geo
    }, [])

    const material = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uColorOld: { value: new THREE.Color(COLOR_PALETTE[0]) },
                uColorNew: { value: new THREE.Color(COLOR_PALETTE[1]) },
                uFillLevel: { value: 0 },
                uBoundsMin: { value: geometry.boundingBox?.min || new THREE.Vector3(0, -2, 0) },
                uBoundsMax: { value: geometry.boundingBox?.max || new THREE.Vector3(0, 2, 0) },
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vPosition;
                varying vec3 vNormal;
                
                void main() {
                    vUv = uv;
                    vPosition = position;
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float uTime;
                uniform vec3 uColorOld;
                uniform vec3 uColorNew;
                uniform float uFillLevel;
                uniform vec3 uBoundsMin;
                uniform vec3 uBoundsMax;
                
                varying vec2 vUv;
                varying vec3 vPosition;
                varying vec3 vNormal;
                
                void main() {
                    // Normalize Y position to 0-1 range based on bounding box
                    float height = uBoundsMax.y - uBoundsMin.y;
                    float normalizedY = (vPosition.y - uBoundsMin.y) / height;
                    
                    // Add a subtle wave to the fill line
                    float wave = sin(vPosition.x * 3.0 + uTime * 2.0) * 0.03;
                    float level = uFillLevel + wave;
                    
                    // Smooth transition edge
                    float edge = smoothstep(level - 0.01, level + 0.01, normalizedY);
                    
                    // Mix colors: 
                    vec3 baseColor = mix(uColorNew, uColorOld, edge);
                    
                    // Glowing fill line
                    float line = 1.0 - smoothstep(0.0, 0.05, abs(normalizedY - level));
                    vec3 lineColor = vec3(1.0) * line * 0.5;
                    
                    // Improved Lighting for Clarity
                    vec3 lightDir = normalize(vec3(0.5, 0.8, 1.0)); 
                    float NdotL = max(dot(vNormal, lightDir), 0.0);
                    
                    // High Ambient to keep colors true and clear
                    float ambient = 0.8;
                    float diffuse = NdotL * 0.3;
                    
                    // Specular Highlight for glossy texture
                    vec3 viewDir = vec3(0.0, 0.0, 1.0); // Approximate view direction
                    vec3 halfVector = normalize(lightDir + viewDir);
                    float NdotH = max(dot(vNormal, halfVector), 0.0);
                    float specular = pow(NdotH, 32.0) * 0.2;
                    
                    // Rim light for 3D definition, but subtle
                    float rim = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
                    rim = pow(rim, 3.0);
                    vec3 rimColor = vec3(1.0) * rim * 0.15;
                    
                    // Combine
                    vec3 finalColor = baseColor * (ambient + diffuse) + vec3(specular) + lineColor + rimColor;
                    
                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `,
            side: THREE.DoubleSide
        })
    }, [geometry])

    useFrame((state, delta) => {
        const t = state.clock.getElapsedTime()

        // Update uniforms
        if (material.uniforms) {
            material.uniforms.uTime.value = t

            // Animate fill level
            // Speed of fill
            const fillSpeed = 0.5
            fillProgressRef.current += delta * fillSpeed

            if (fillProgressRef.current >= 1.2) { // Go a bit past 1 to ensure full coverage
                // Reset and swap colors
                fillProgressRef.current = 0

                // Old New Color becomes the Old Color
                material.uniforms.uColorOld.value.copy(material.uniforms.uColorNew.value)

                // Pick next color
                const nextIndex = (colorIndex + 1) % COLOR_PALETTE.length
                setColorIndex(nextIndex)
                material.uniforms.uColorNew.value.set(COLOR_PALETTE[nextIndex])
            }

            material.uniforms.uFillLevel.value = Math.min(fillProgressRef.current, 1.0)
        }

        if (meshRef.current) {
            // Idle floating motion
            meshRef.current.position.y = Math.sin(t * 1.2) * 0.15

            // Rotation logic
            meshRef.current.rotation.y += delta * (hovered ? 1.2 : 0.65)
            meshRef.current.rotation.x = Math.sin(t * 0.4) * 0.25

            // Scale on hover (smaller scale as requested for RGB)
            const targetScale = hovered ? 0.6 : 0.5
            meshRef.current.scale.lerp(
                new THREE.Vector3(targetScale, targetScale, targetScale),
                0.08
            )
        }
    })

    return (
        <Group position={position}>
            <Mesh
                ref={meshRef}
                geometry={geometry}
                material={material}
                onClick={(e: any) => {
                    e.stopPropagation()
                    onClick()
                }}
                onPointerOver={() => {
                    document.body.style.cursor = 'pointer'
                    setHover(true)
                }}
                onPointerOut={() => {
                    document.body.style.cursor = 'default'
                    setHover(false)
                }}
            />
        </Group>
    )
}