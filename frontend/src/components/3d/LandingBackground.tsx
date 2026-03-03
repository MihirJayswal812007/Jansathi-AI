// ===== JanSathi AI — Landing Page 3D Background =====
// Full-screen Three.js background for the landing page.
// Uses user-provided LiquidBackground + Monolith (untouched).
// Always SSR-disabled (dynamic import with ssr:false in parent).
// Hidden when prefers-reduced-motion is set.

"use client";

import React, { useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

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

// ── Public full-screen background component ──────────────────────
const LandingBackground = React.memo(function LandingBackground() {
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Respect prefers-reduced-motion — hide the entire canvas
    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        const apply = () => {
            if (wrapperRef.current) {
                wrapperRef.current.style.display = mq.matches ? "none" : "block";
            }
        };
        apply();
        mq.addEventListener("change", apply);
        return () => mq.removeEventListener("change", apply);
    }, []);

    return (
        <div
            ref={wrapperRef}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 0,
                pointerEvents: "none",
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

export default LandingBackground;
