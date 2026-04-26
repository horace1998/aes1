import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export default function ThreeBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Large slow blurry orbs
    const orbs = [];
    const orbConfigs = [
      { color: 0xb8a0fa, size: 2.8, x: -2.5, y: 1.5, z: -4 },
      { color: 0x7dd8cc, size: 2.4, x: 2.8, y: -1.2, z: -5 },
      { color: 0xd8a8f8, size: 3.2, x: 0.5, y: 2.5, z: -6 },
      { color: 0xa0c4fd, size: 2.0, x: -3.0, y: -2.0, z: -3 },
      { color: 0xe8c8ff, size: 1.8, x: 3.2, y: 1.8, z: -4 },
      { color: 0x9de8d8, size: 2.6, x: -0.5, y: -2.8, z: -5 },
    ];

    orbConfigs.forEach((cfg) => {
      const geometry = new THREE.SphereGeometry(cfg.size, 32, 32);
      const material = new THREE.MeshBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0.38,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(cfg.x, cfg.y, cfg.z);
      mesh.userData = {
        baseScale: 1.0,
        speed: 0.12 + Math.random() * 0.15,
        offset: Math.random() * Math.PI * 2,
        moveSpeed: 0.04 + Math.random() * 0.06,
        baseY: cfg.y,
        baseX: cfg.x,
      };
      scene.add(mesh);
      orbs.push(mesh);
    });

    camera.position.z = 5;

    let animationId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      orbs.forEach((orb) => {
        const { speed, offset, moveSpeed, baseY, baseX } = orb.userData;
        const pulse = 1 + 0.08 * Math.sin(t * speed + offset);
        orb.scale.setScalar(pulse);
        orb.position.y = baseY + Math.sin(t * moveSpeed + offset) * 0.8;
        orb.position.x = baseX + Math.cos(t * moveSpeed * 0.6 + offset) * 0.6;
        orb.material.opacity = 0.28 + 0.14 * Math.sin(t * speed * 0.4 + offset);
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{
        background: 'linear-gradient(145deg, #ece8f7 0%, #d8eeeb 30%, #ece6f7 60%, #dae6f8 100%)',
        filter: 'blur(0px)',
      }}
    >
      {/* CSS blur layer over the canvas for soft dreamy look */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)', zIndex: 1 }}
      />
    </div>
  );
}