import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { Avatar } from '../types';

// Helper function to normalize measurements for scaling and morphing
const normalize = (value: number, min: number, max: number, scaleMin = 0, scaleMax = 1) => {
    const clamped = Math.max(min, Math.min(max, value));
    return scaleMin + ((clamped - min) / (max - min)) * (scaleMax - scaleMin);
};

// Helper to create joint spheres
const createJoint = (radius: number, material: THREE.Material) => {
    const joint = new THREE.Mesh(new THREE.SphereGeometry(radius, 16, 16), material);
    joint.castShadow = true;
    return joint;
};

const RealisticAvatar: React.FC<{ avatar: Partial<Avatar> }> = ({ avatar }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const avatarGroupRef = useRef<THREE.Group | null>(null);

    useEffect(() => {
        if (!mountRef.current) return;

        const currentMount = mountRef.current;

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf1f5f9); // Corresponds to bg-gray-100
        sceneRef.current = scene;

        // Camera
        const camera = new THREE.PerspectiveCamera(50, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        camera.position.set(0, 1.2, 4.5);

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        currentMount.appendChild(renderer.domElement);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
        directionalLight.position.set(5, 10, 7.5);
        directionalLight.castShadow = true;
        scene.add(directionalLight);
        
        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 1, 0);
        controls.update();

        // Build Avatar
        const avatarGroup = new THREE.Group();
        avatarGroup.name = 'avatarGroup';
        avatarGroupRef.current = avatarGroup;

        const skinMaterial = new THREE.MeshStandardMaterial({ roughness: 0.7, metalness: 0.1 });
        const hairMaterial = new THREE.MeshStandardMaterial({ roughness: 0.8 });
        const eyeMaterial = new THREE.MeshStandardMaterial({ roughness: 0.2, color: '#4169e1' });
        const mouthMaterial = new THREE.MeshStandardMaterial({ roughness: 0.8, color: '#9c6a4c' });
        
        // --- HEAD & FACE ---
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 32), skinMaterial);
        head.name = 'head';
        head.castShadow = true;
        
        const nose = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 0.05), skinMaterial);
        nose.position.set(0, -0.02, 0.19);
        head.add(nose);
        
        const createEye = () => new THREE.Mesh(new THREE.SphereGeometry(0.025, 16, 16), eyeMaterial);
        const leftEye = createEye();
        leftEye.name = 'leftEye';
        leftEye.position.set(-0.07, 0.05, 0.18);
        head.add(leftEye);
        const rightEye = createEye();
        rightEye.name = 'rightEye';
        rightEye.position.set(0.07, 0.05, 0.18);
        head.add(rightEye);
        
        const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.015, 0.01), mouthMaterial);
        mouth.name = 'mouth';
        mouth.position.set(0, -0.1, 0.18);
        head.add(mouth);

        const createEar = () => {
            const ear = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 8), skinMaterial);
            ear.scale.set(0.5, 1, 1);
            return ear;
        };
        const leftEar = createEar(); leftEar.name = 'leftEar'; leftEar.position.set(-0.2, 0.02, 0.03);
        const rightEar = createEar(); rightEar.name = 'rightEar'; rightEar.position.set(0.2, 0.02, 0.03);
        head.add(leftEar, rightEar);

        // --- HAIR ---
        const hairGroup = new THREE.Group();
        hairGroup.name = 'hairGroup';
        head.add(hairGroup);
        // Hair styles are created here and visibility is toggled in the update effect
        const hairShort = new THREE.Mesh(new THREE.SphereGeometry(0.21, 32, 32), hairMaterial);
        hairShort.name = 'hair_short';
        hairShort.scale.set(1.05, 1.05, 0.9);
        hairShort.position.set(0, 0.02, -0.04);
        hairGroup.add(hairShort);
        
        const hairLongGroup = new THREE.Group();
        hairLongGroup.name = 'hair_long';
        const hairLongTop = new THREE.Mesh(new THREE.SphereGeometry(0.21, 32, 32), hairMaterial); 
        hairLongTop.scale.set(1.05, 1.05, 0.9);
        hairLongTop.position.set(0, 0.02, -0.04);
        const hairLongBack = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.5, 0.15), hairMaterial); hairLongBack.position.set(0, -0.3, -0.1);
        hairLongGroup.add(hairLongTop, hairLongBack);
        hairGroup.add(hairLongGroup);
        
        const hairBunGroup = new THREE.Group();
        hairBunGroup.name = 'hair_bun';
        const hairBunTop = new THREE.Mesh(new THREE.SphereGeometry(0.21, 32, 32), hairMaterial); 
        hairBunTop.scale.set(1.05, 1.05, 0.9);
        hairBunTop.position.set(0, 0.02, -0.04);
        const hairBun = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), hairMaterial); hairBun.position.set(0, 0.05, -0.22);
        hairBunGroup.add(hairBunTop, hairBun);
        hairGroup.add(hairBunGroup);
        
        // --- FACIAL HAIR ---
        const facialHairGroup = new THREE.Group();
        facialHairGroup.name = 'facialHairGroup';
        head.add(facialHairGroup);
        // Facial hair styles created here
        const mustache = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.02), hairMaterial); mustache.name = 'mustache'; mustache.position.set(0, -0.08, 0.19);
        const goatee = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.02, 0.1, 8), hairMaterial); goatee.name = 'goatee'; goatee.position.set(0, -0.15, 0.17);
        const beardShape = new THREE.Shape(); beardShape.moveTo(-0.1, -0.12); beardShape.lineTo(-0.12, -0.25); beardShape.lineTo(0.12, -0.25); beardShape.lineTo(0.1, -0.12); beardShape.closePath();
        const beard = new THREE.Mesh(new THREE.ShapeGeometry(beardShape), hairMaterial); beard.name = 'beard'; beard.position.z = 0.16;
        facialHairGroup.add(mustache, goatee, beard);

        // --- BODY ---
        const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.15, 16), skinMaterial);
        neck.name = 'neck';
        neck.castShadow = true;
        
        // Placeholder torso geometry, generated dynamically in the update effect
        const torso = new THREE.Mesh(new THREE.BufferGeometry(), skinMaterial);
        torso.name = 'torso';
        torso.castShadow = true;
        torso.receiveShadow = true;

        // --- LIMBS with joints, hands, and feet ---
        const createLimb = (isArm: boolean) => {
            const upperRadius = isArm ? 0.06 : 0.08;
            const lowerRadius = isArm ? 0.05 : 0.07;
            const jointRadius = isArm ? 0.055 : 0.075;
            
            const upper = new THREE.Mesh(new THREE.CapsuleGeometry(upperRadius, 0.4, 4, 16), skinMaterial); upper.name = 'upper';
            const joint = createJoint(jointRadius, skinMaterial); joint.name = 'joint';
            const lower = new THREE.Mesh(new THREE.CapsuleGeometry(lowerRadius, 0.4, 4, 16), skinMaterial); lower.name = 'lower';
            
            let extremity;
            if (isArm) {
                extremity = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 16), skinMaterial);
                extremity.name = 'hand';
                extremity.scale.set(1, 0.5, 1.2); // Flattened sphere for hand
            } else {
                extremity = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.18), skinMaterial);
                extremity.name = 'foot';
            }

            [upper, lower, extremity].forEach(m => m.castShadow = true);
            const limbGroup = new THREE.Group();
            limbGroup.add(upper, joint, lower, extremity);
            return limbGroup;
        };

        const leftArm = createLimb(true); leftArm.name = 'leftArm';
        const rightArm = createLimb(true); rightArm.name = 'rightArm';
        const leftLeg = createLimb(false); leftLeg.name = 'leftLeg';
        const rightLeg = createLimb(false); rightLeg.name = 'rightLeg';

        // Shoulders
        const leftShoulder = createJoint(0.07, skinMaterial); leftShoulder.name = 'leftShoulder';
        const rightShoulder = createJoint(0.07, skinMaterial); rightShoulder.name = 'rightShoulder';

        avatarGroup.add(head, neck, torso, leftShoulder, rightShoulder, leftArm, rightArm, leftLeg, rightLeg);
        scene.add(avatarGroup);
        
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        const resizeObserver = new ResizeObserver(entries => {
            const entry = entries[0];
            if (entry) {
                const { width, height } = entry.contentRect;
                if (width > 0 && height > 0) {
                    camera.aspect = width / height;
                    camera.updateProjectionMatrix();
                    renderer.setSize(width, height);
                }
            }
        });
        resizeObserver.observe(currentMount);

        return () => {
            resizeObserver.disconnect();
            if (currentMount?.contains(renderer.domElement)) {
                currentMount.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);

    // Effect to update avatar based on props
    useEffect(() => {
        const {
            bodyShape = 'masculine', skinTone = '#f2d0b1', hairColor = '#090806',
            hairStyle = 'short', facialHair = 'none', faceShape = 'oval',
            eyeColor = '#8c5a3c', height = 170, weight = 70,
            chest = 100, waist = 85, hips = 95,
        } = avatar;

        if (!avatarGroupRef.current) return;
        const group = avatarGroupRef.current;
        const head = group.getObjectByName('head') as THREE.Mesh;
        if (!head) return;

        // --- Material Updates ---
        const skinMaterial = head.material as THREE.MeshStandardMaterial;
        skinMaterial.color.set(skinTone);

        const mouth = head.getObjectByName('mouth') as THREE.Mesh;
        if (mouth) {
            const mouthColor = new THREE.Color(skinTone).multiplyScalar(0.7);
            (mouth.material as THREE.MeshStandardMaterial).color.set(mouthColor);
        }

        const hairAndEyeMaterials = (objName: string, color: string) => {
             group.getObjectByName(objName)?.traverse(c => {
                if (c instanceof THREE.Mesh) (c.material as THREE.MeshStandardMaterial).color.set(color);
            });
        };
        hairAndEyeMaterials('hairGroup', hairColor);
        hairAndEyeMaterials('facialHairGroup', hairColor);
        
        const leftEye = head.getObjectByName('leftEye') as THREE.Mesh;
        const rightEye = head.getObjectByName('rightEye') as THREE.Mesh;
        if (leftEye && rightEye && !Array.isArray(leftEye.material)) {
            const newEyeMaterial = leftEye.material.clone();
            (newEyeMaterial as THREE.MeshStandardMaterial).color.set(eyeColor);
            leftEye.material = newEyeMaterial;
            rightEye.material = newEyeMaterial;
        }

        // --- Visibility Updates ---
        const setVisible = (groupName: string, visibleName: string) => {
            const g = head.getObjectByName(groupName);
            g?.children.forEach(c => c.visible = c.name === visibleName);
        };
        setVisible('hairGroup', `hair_${hairStyle}`);
        head.getObjectByName('facialHairGroup')!.visible = bodyShape !== 'feminine';
        if (bodyShape !== 'feminine') {
            setVisible('facialHairGroup', facialHair);
        }

        // --- Shape & Proportion Updates ---
        // Start with a base oblong head shape
        head.scale.set(1, 1.1, 1); 
        // Then apply face shape modifications
        if (faceShape === 'oval') head.scale.multiply(new THREE.Vector3(0.95, 1.0, 0.98));
        else if (faceShape === 'square') head.scale.multiply(new THREE.Vector3(1.02, 0.95, 1));
        else if (faceShape === 'round') head.scale.multiply(new THREE.Vector3(1.05, 0.95, 1.02));

        // --- Dynamic Torso Generation ---
        const getTorsoPoints = (shape: Avatar['bodyShape']): THREE.Vector2[] => {
            if (shape === 'feminine') return [new THREE.Vector2(0.01, 0.00), new THREE.Vector2(0.25, 0.02), new THREE.Vector2(0.28, 0.15), new THREE.Vector2(0.18, 0.40), new THREE.Vector2(0.22, 0.60), new THREE.Vector2(0.26, 0.70), new THREE.Vector2(0.24, 0.85), new THREE.Vector2(0.18, 0.90)];
            if (shape === 'masculine') return [new THREE.Vector2(0.01, 0.00), new THREE.Vector2(0.22, 0.02), new THREE.Vector2(0.24, 0.15), new THREE.Vector2(0.23, 0.40), new THREE.Vector2(0.28, 0.70), new THREE.Vector2(0.32, 0.85), new THREE.Vector2(0.22, 0.90)];
            return [new THREE.Vector2(0.01, 0.00), new THREE.Vector2(0.24, 0.02), new THREE.Vector2(0.26, 0.15), new THREE.Vector2(0.21, 0.40), new THREE.Vector2(0.24, 0.70), new THREE.Vector2(0.28, 0.85), new THREE.Vector2(0.20, 0.90)];
        };
        const basePoints = getTorsoPoints(bodyShape);
        const chestScale = normalize(chest, 70, 130, 0.85, 1.15);
        const waistScale = normalize(waist, 70, 130, 0.85, 1.15);
        const hipsScale = normalize(hips, 70, 130, 0.85, 1.15);
        const hipIndices = [1, 2], waistIndices = [3], chestIndices = bodyShape === 'feminine' ? [4, 5] : [4, 5];
        const morphedPoints = basePoints.map((p, i) => {
            let scale = 1.0;
            if (hipIndices.includes(i)) scale = hipsScale; else if (waistIndices.includes(i)) scale = waistScale; else if (chestIndices.includes(i)) scale = chestScale;
            return new THREE.Vector2(p.x * scale, p.y);
        });

        const torso = group.getObjectByName('torso') as THREE.Mesh;
        const oldGeometry = torso.geometry;
        torso.geometry = new THREE.LatheGeometry(morphedPoints, 24);
        if (oldGeometry) oldGeometry.dispose();

        // --- Positioning & Scaling based on new anatomy ---
        const heightScale = normalize(height, 140, 210, 0.9, 1.1);
        const massFactor = normalize(weight, 40, 150, 0.85, 1.15);

        const torsoHeight = 0.9, finalTorsoHeight = torsoHeight * heightScale;
        torso.scale.y = heightScale;
        torso.position.y = 1.05; // Base of torso is at this height

        const neckHeight = 0.15;
        const neckMesh = group.getObjectByName('neck') as THREE.Mesh;
        const torsoTopY = torso.position.y + finalTorsoHeight;
        neckMesh.position.y = torsoTopY + (neckHeight / 2);
        
        const headRadius = 0.2; // Base radius of the head sphere
        const neckTopY = neckMesh.position.y + (neckHeight / 2);
        head.position.y = neckTopY + (headRadius * head.scale.y); // Position head on top of neck

        const shoulderY = torso.position.y + (finalTorsoHeight * 0.88);
        const shoulderX = morphedPoints.slice(-2)[0].x * massFactor;
        (group.getObjectByName('leftShoulder') as THREE.Mesh).position.set(-shoulderX, shoulderY, 0);
        (group.getObjectByName('rightShoulder') as THREE.Mesh).position.set(shoulderX, shoulderY, 0);

        const legLength = 1.0 * heightScale, armLength = 0.85 * heightScale;
        const limbThickness = 1.0 * massFactor;

        const positionLimb = (limbGroup: THREE.Group, isArm: boolean, isLeft: boolean) => {
            const upper = limbGroup.getObjectByName('upper') as THREE.Mesh;
            const joint = limbGroup.getObjectByName('joint') as THREE.Mesh;
            const lower = limbGroup.getObjectByName('lower') as THREE.Mesh;
            const extremity = limbGroup.getObjectByName(isArm ? 'hand' : 'foot') as THREE.Mesh;

            const limbLen = isArm ? armLength : legLength;
            const upperLen = 0.5 * limbLen, lowerLen = 0.5 * limbLen;

            upper.scale.y = upperLen / 0.4; // 0.4 is base capsule length
            lower.scale.y = lowerLen / 0.4;

            upper.position.y = -upperLen / 2;
            joint.position.y = -upperLen;
            lower.position.y = -upperLen - (lowerLen / 2);
            extremity.position.y = -limbLen - (isArm ? 0.03 : 0.04);
            if (!isArm) extremity.position.z = 0.05;
            
            limbGroup.scale.set(limbThickness, 1, limbThickness);

            if (isArm) {
                limbGroup.position.set(isLeft ? -shoulderX : shoulderX, shoulderY, 0);
            } else {
                const hipX = morphedPoints[2].x * massFactor * 0.7;
                const hipY = torso.position.y + (finalTorsoHeight * 0.02);
                limbGroup.position.set(isLeft ? -hipX : hipX, hipY, 0);
            }
        };

        positionLimb(group.getObjectByName('leftArm') as THREE.Group, true, true);
        positionLimb(group.getObjectByName('rightArm') as THREE.Group, true, false);
        positionLimb(group.getObjectByName('leftLeg') as THREE.Group, false, true);
        positionLimb(group.getObjectByName('rightLeg') as THREE.Group, false, false);

    }, [avatar]);

    return <div ref={mountRef} className="absolute inset-0" />;
};

export default RealisticAvatar;
