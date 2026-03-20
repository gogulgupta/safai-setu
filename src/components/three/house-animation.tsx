
'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface HouseAnimationProps {
    length: number;
    breadth: number;
    height: number;
}

const HouseAnimation = ({ length, breadth, height }: HouseAnimationProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const houseRef = useRef<THREE.Group | null>(null);

  // Normalize dimensions for display
  const scaleFactor = 10 / Math.max(length, breadth, height, 10);
  const displayLength = length * scaleFactor;
  const displayBreadth = breadth * scaleFactor;
  const displayHeight = height * scaleFactor;

  useEffect(() => {
    if (!mountRef.current) return;
    const currentMount = mountRef.current;

    // Initialize scene, camera, renderer if they don't exist
    if (!sceneRef.current) {
        const scene = new THREE.Scene();
        sceneRef.current = scene;
        scene.background = new THREE.Color(0xe0e0e0);

        const camera = new THREE.PerspectiveCamera(50, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        camera.position.set(displayLength * 1.5, displayHeight * 1.5, displayBreadth * 1.5);
        scene.userData.camera = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        currentMount.appendChild(renderer.domElement);
        scene.userData.renderer = renderer;

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        scene.userData.controls = controls;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 15, 5);
        scene.add(directionalLight);

        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();
        
        const handleResize = () => {
            if (!currentMount) return;
            camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        scene.userData.cleanup = () => {
            window.removeEventListener('resize', handleResize);
            if (currentMount) {
                currentMount.removeChild(renderer.domElement);
            }
        };
    }
    
    // Update or create house model
    const scene = sceneRef.current;
    if (houseRef.current) {
        scene.remove(houseRef.current);
    }

    const house = new THREE.Group();
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xcc7755, roughness: 0.8 });
    
    // Create walls
    const wallGeometry = new THREE.BoxGeometry(displayLength, displayHeight, 0.2);
    
    const frontWall = new THREE.Mesh(wallGeometry, wallMaterial);
    frontWall.position.set(0, displayHeight / 2, displayBreadth / 2);
    house.add(frontWall);

    const backWall = frontWall.clone();
    backWall.position.z = -displayBreadth / 2;
    house.add(backWall);

    const sideWallGeometry = new THREE.BoxGeometry(displayBreadth, displayHeight, 0.2);
    const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-displayLength/2, displayHeight / 2, 0);
    house.add(leftWall);

    const rightWall = leftWall.clone();
    rightWall.position.x = displayLength / 2;
    house.add(rightWall);

    // Create roof
    const roofGeometry = new THREE.BufferGeometry();
    const roofHeight = displayHeight * 0.5;
    const roofVertices = new Float32Array([
        // Front face
        -displayLength / 2, displayHeight, displayBreadth / 2,
        displayLength / 2, displayHeight, displayBreadth / 2,
        0, displayHeight + roofHeight, 0,

        // Back face
        -displayLength / 2, displayHeight, -displayBreadth / 2,
         0, displayHeight + roofHeight, 0,
        displayLength / 2, displayHeight, -displayBreadth / 2,
        
        // Left side
        -displayLength / 2, displayHeight, displayBreadth / 2,
        0, displayHeight + roofHeight, 0,
        -displayLength / 2, displayHeight, -displayBreadth / 2,
        
        // Right side
        displayLength / 2, displayHeight, displayBreadth / 2,
        displayLength / 2, displayHeight, -displayBreadth / 2,
        0, displayHeight + roofHeight, 0,
    ]);
    roofGeometry.setAttribute('position', new THREE.BufferAttribute(roofVertices, 3));
    roofGeometry.computeVertexNormals();

    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, side: THREE.DoubleSide });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    house.add(roof);

    // Floor
    const floorGeometry = new THREE.BoxGeometry(displayLength, 0.1, displayBreadth);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    house.add(floor);


    houseRef.current = house;
    scene.add(house);
    
    // Adjust camera to fit the new model
    const camera = scene.userData.camera;
    camera.position.set(displayLength * 1.5, displayHeight * 1.5, displayBreadth * 1.5);
    camera.lookAt(scene.position);


    // Cleanup on component unmount
    return () => {
        // Only run the main cleanup if the component is truly unmounting
    };

  }, [displayLength, displayBreadth, displayHeight]);

   useEffect(() => {
    const scene = sceneRef.current;
    return () => {
        if(scene && scene.userData.cleanup) {
            scene.userData.cleanup();
            sceneRef.current = null;
        }
    }
   }, []);

  return <div ref={mountRef} className="h-full w-full" />;
};

export default HouseAnimation;
