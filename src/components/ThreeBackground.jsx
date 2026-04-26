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

    // Create pulsing orbs
    const orbs = [];
    const colors = [0xa78bfa, 0x60d3c4, 0xe8a7f6, 0x93c5fd];
    
    colors.forEach((color, i) => {
      const geometry = new THREE.SphereGeometry(0.8 + Math.random() * 0.6, 32, 32);
      const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.15,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4 - 3
      );
      mesh.userData = {
        baseScale: 0.8 + Math.random() * 0.4,
        speed: 0.3 + Math.random() * 0.5,
        offset: Math.random() * Math.PI * 2,
        moveSpeed: 0.1 + Math.random() * 0.2,
        baseY: mesh.position.y,
        baseX: mesh.position.x,
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
        const { baseScale, speed, offset, moveSpeed, baseY, baseX } = orb.userData;
        const pulse = 1 + 0.15 * Math.sin(t * speed + offset);
        orb.scale.setScalar(baseScale * pulse);
        orb.position.y = baseY + Math.sin(t * moveSpeed + offset) * 0.5;
        orb.position.x = baseX + Math.cos(t * moveSpeed * 0.7 + offset) * 0.3;
        orb.material.opacity = 0.1 + 0.08 * Math.sin(t * speed * 0.5 + offset);
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
      style={{ background: 'linear-gradient(135deg, #f0eef5 0%, #e8f4f2 50%, #f0eef5 100%)' }}
    />
  );
}