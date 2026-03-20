'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const HeroAnimation = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Bridge
    const bridgeMaterial = new THREE.MeshStandardMaterial({ color: 0x2E8B57, roughness: 0.5 });
    const bridgeGroup = new THREE.Group();

    const road = new THREE.Mesh(new THREE.BoxGeometry(8, 0.2, 2), bridgeMaterial);
    bridgeGroup.add(road);

    for (let i = -3; i <= 3; i += 2) {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2, 0.3), bridgeMaterial);
      pillar.position.set(i, -1.1, 0.8);
      bridgeGroup.add(pillar);
      const pillar2 = pillar.clone();
      pillar2.position.z = -0.8;
      bridgeGroup.add(pillar2);
    }
    bridgeGroup.rotation.x = 0.2;
    bridgeGroup.rotation.y = -0.3;
    scene.add(bridgeGroup);

    // Recyclables
    const recyclables: THREE.Mesh[] = [];
    const recyclableShapes = [
      new THREE.BoxGeometry(0.3, 0.3, 0.3),
      new THREE.SphereGeometry(0.2, 16, 16),
      new THREE.CylinderGeometry(0.1, 0.1, 0.4, 16),
    ];
    const recyclableColors = [0x0B66C3, 0xFFFFFF, 0xCCCCCC];

    for (let i = 0; i < 50; i++) {
      const geometry = recyclableShapes[Math.floor(Math.random() * recyclableShapes.length)];
      const material = new THREE.MeshStandardMaterial({
        color: recyclableColors[Math.floor(Math.random() * recyclableColors.length)],
        roughness: 0.6,
        metalness: 0.1,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 5
      );
      mesh.userData.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.005,
        (Math.random() - 0.5) * 0.005,
        (Math.random() - 0.5) * 0.005
      );
      recyclables.push(mesh);
      scene.add(mesh);
    }
    
    // Handle Resize
    const handleResize = () => {
      if (!currentMount) return;
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      bridgeGroup.rotation.y += 0.0005;

      recyclables.forEach(r => {
        r.position.add(r.userData.velocity);
        r.rotation.x += r.userData.velocity.y * 0.5;
        r.rotation.y += r.userData.velocity.x * 0.5;

        if (r.position.x > 5 || r.position.x < -5) r.userData.velocity.x *= -1;
        if (r.position.y > 2.5 || r.position.y < -2.5) r.userData.velocity.y *= -1;
        if (r.position.z > 2.5 || r.position.z < -2.5) r.userData.velocity.z *= -1;
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if(currentMount) {
        currentMount.removeChild(renderer.domElement);
      }
      // Dispose Three.js objects to free memory
      scene.traverse(object => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 z-0" />;
};

export default HeroAnimation;
