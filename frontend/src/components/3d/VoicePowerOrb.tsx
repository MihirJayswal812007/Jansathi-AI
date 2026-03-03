// ===== JanSathi AI — Voice Power Orb (Three.js) =====
// Isolated 3D component. Wraps user-provided animation code.
// Activates ONLY when isActive === true (voice mode on).
// Always SSR-disabled via dynamic import in parent.

"use client";

import React, { useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

// ── Internal scene components (user-provided logic, untouched) ──

const LiquidBackground = () => {
    const meshRef = useRef<THREE.Mesh>(null);
    const { viewport } = useThree();
    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uMouse: { value: new THREE.Vector2(0, 0) },
        }),
        []
    );

    useFrame((state) => {
        const { clock, mouse } = state;
        if (meshRef.current) {
            (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value =
                clock.getElapsedTime();
            (meshRef.current.material as THREE.ShaderMaterial).uniforms.uMouse.value.lerp(
                mouse,
                0.05
            );
        }
    });

    return (
        <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
            <planeGeometry args={[1, 1]} />
            <shaderMaterial
                transparent
                uniforms={uniforms}
                vertexShader={`varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`}
                fragmentShader={`
          uniform float uTime; uniform vec2 uMouse; varying vec2 vUv;
          void main() {
            vec2 uv = vUv; float t = uTime * 0.15;
            vec2 m = uMouse * 0.1;
            float color = smoothstep(0.0, 1.0, (sin(uv.x * 8.0 + t + m.x * 12.0) + sin(uv.y * 6.0 - t + m.y * 12.0)) * 0.5 + 0.5);
            gl_FragColor = vec4(mix(vec3(0.005), vec3(0.05), color), 1.0);
          }
        `}
            />
        </mesh>
    );
};

const Monolith = () => {
    const meshRef = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.25;
        }
    });
    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <mesh ref={meshRef}>
                <icosahedronGeometry args={[13, 1]} />
                <MeshDistortMaterial
                    color="#0a0a0a"
                    speed={4}
                    distort={0.4}
                    roughness={0.05}
                    metalness={1.0}
                />
            </mesh>
        </Float>
    );
};

// ── Public component — accepts isActive prop ─────────────────────
interface VoicePowerOrbProps {
    /** Orb is only visible and animated when isActive is true */
    isActive: boolean;
}

const VoicePowerOrbInner = React.memo(function VoicePowerOrbInner({
    isActive,
}: VoicePowerOrbProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Fade in/out on activation change via GSAP
    useEffect(() => {
        if (!containerRef.current) return;
        gsap.to(containerRef.current, {
            opacity: isActive ? 1 : 0,
            scale: isActive ? 1 : 0.85,
            duration: 0.6,
            ease: "power3.out",
        });
    }, [isActive]);

    return (
        <div
            ref={containerRef}
            style={{
                position: "absolute",
                inset: 0,
                opacity: 0,
                pointerEvents: "none",
                zIndex: 0,
                borderRadius: "inherit",
                overflow: "hidden",
            }}
            aria-hidden="true"
        >
            <Canvas camera={{ position: [0, 0, 60], fov: 35 }}>
                <ambientLight intensity={0.4} />
                <spotLight position={[50, 50, 50]} intensity={3} />
                <LiquidBackground />
                <Monolith />
            </Canvas>
        </div>
    );
});

export default VoicePowerOrbInner;
