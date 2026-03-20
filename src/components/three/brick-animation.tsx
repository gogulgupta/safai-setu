
'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const BrickAnimation = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const currentMount = mountRef.current;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2.0;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);


    // Brick Geometry
    const brickWidth = 2.2;
    const brickHeight = 0.8;
    const brickDepth = 1.1;
    const brickGeometry = new THREE.BoxGeometry(brickWidth, brickHeight, brickDepth);
    
    // A simple color material for the plastic look
    const brickMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x55a630, // A green color for the brick
        roughness: 0.4,
        metalness: 0.2,
    });
    
    const brick = new THREE.Mesh(brickGeometry, brickMaterial);
    
    // Add studs on top to look like a lego brick
    const studRadius = 0.2;
    const studHeight = 0.2;
    const studGeometry = new THREE.CylinderGeometry(studRadius, studRadius, studHeight, 32);
    
    const studPositions = [
        { x: -0.7, z: -0.3 }, { x: 0, z: -0.3 }, { x: 0.7, z: -0.3 },
        { x: -0.7, z: 0.3 }, { x: 0, z: 0.3 }, { x: 0.7, z: 0.3 },
    ];
    
    studPositions.forEach(pos => {
        const stud = new THREE.Mesh(studGeometry, brickMaterial);
        stud.position.set(pos.x, brickHeight / 2 + studHeight / 2, pos.z);
        brick.add(stud);
    });

    scene.add(brick);


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
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (currentMount) {
        currentMount.removeChild(renderer.domElement);
      }
      scene.traverse(object => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if(Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, []);

  return <div ref={mountRef} className="h-full w-full rounded-lg overflow-hidden" />;
};

export default BrickAnimation;
