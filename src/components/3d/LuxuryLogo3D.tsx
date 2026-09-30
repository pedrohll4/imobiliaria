"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export function LuxuryLogo3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);

  useEffect(() => {
    // 1. Verificação de Suporte WebGL
    try {
      const testCanvas = document.createElement("canvas");
      const gl =
        testCanvas.getContext("webgl") ||
        testCanvas.getContext("experimental-webgl");
      if (!gl) {
        setHasWebGL(false);
        return;
      }
      setHasWebGL(true);
    } catch {
      setHasWebGL(false);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || 550;
    let height = container.clientHeight || 520;

    // 2. Cena & Câmera em Perspectiva Studio
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 7.8);
    camera.lookAt(0, 0, 0);

    // 3. Renderer com Suavização e Tratamento de Cor de Cinema
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // 4. MAPA DE ILUMINAÇÃO DE AMBIENTE (IBL / HDRI Procedural de Estúdio de Luxo)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    const envScene = new THREE.Scene();
    const envGeo = new THREE.SphereGeometry(15, 32, 16);
    const envCanvas = document.createElement("canvas");
    envCanvas.width = 512;
    envCanvas.height = 256;
    const envCtx = envCanvas.getContext("2d")!;

    // Gradiente de Iluminação de Joalheria (Luz quente dourada + reflexo de estúdio)
    const envGrad = envCtx.createLinearGradient(0, 0, 512, 256);
    envGrad.addColorStop(0.0, "#0b0d12");
    envGrad.addColorStop(0.25, "#2a2215");
    envGrad.addColorStop(0.48, "#fff1d0"); // Luz alta de reflexo
    envGrad.addColorStop(0.55, "#d4af37"); // Ouro rico
    envGrad.addColorStop(0.75, "#1e1a14");
    envGrad.addColorStop(1.0, "#05070a");
    envCtx.fillStyle = envGrad;
    envCtx.fillRect(0, 0, 512, 256);

    // Destaques de estúdio suaves
    envCtx.fillStyle = "rgba(255, 245, 220, 0.85)";
    envCtx.beginPath();
    envCtx.arc(256, 90, 70, 0, Math.PI * 2);
    envCtx.fill();

    const envTexture = new THREE.CanvasTexture(envCanvas);
    envTexture.mapping = THREE.EquirectangularReflectionMapping;
    const envMat = new THREE.MeshBasicMaterial({
      map: envTexture,
      side: THREE.BackSide,
    });
    envScene.add(new THREE.Mesh(envGeo, envMat));
    const generatedEnvMap = pmremGenerator.fromScene(envScene).texture;
    scene.environment = generatedEnvMap;

    // 5. GRUPO PRINCIPAL DO LOGO 3D
    const logoGroup = new THREE.Group();
    scene.add(logoGroup);

    // Subgrupo flutuante para animação independente
    const floatingGroup = new THREE.Group();
    logoGroup.add(floatingGroup);

    // ==========================================
    // GEOMETRIA VETORIAL PRECISA DO MONOGRAMA YA
    // ==========================================
    const yPtsRaw = [
      [6, 5],
      [33, 6],
      [74, 69],
      [116, 6],
      [142, 6],
      [41, 155],
      [18, 155],
      [62, 88],
    ];

    const aOuterRaw = [
      [148, 25],
      [216, 156],
      [194, 156],
      [176, 124],
      [108, 124],
      [88, 155],
      [65, 155],
    ];

    // Ordem invertida para garantir winding oposto para o furo (hole)
    const aHoleRaw = [
      [145, 63],
      [119, 106],
      [167, 106],
    ];

    // Normalização e centralização (Origem 0,0 no baricentro do logo)
    const scaleFactor = 1 / 34;
    const cx = 111;
    const cy = 80;
    const toThree = ([x, y]: number[]) =>
      new THREE.Vector2((x - cx) * scaleFactor, -(y - cy) * scaleFactor);

    // Shape da letra Y
    const shapeY = new THREE.Shape();
    const ptsY = yPtsRaw.map(toThree);
    shapeY.moveTo(ptsY[0].x, ptsY[0].y);
    for (let i = 1; i < ptsY.length; i++) {
      shapeY.lineTo(ptsY[i].x, ptsY[i].y);
    }
    shapeY.closePath();

    // Shape da letra A (com o furo interno triangular)
    const shapeA = new THREE.Shape();
    const ptsA = aOuterRaw.map(toThree);
    shapeA.moveTo(ptsA[0].x, ptsA[0].y);
    for (let i = 1; i < ptsA.length; i++) {
      shapeA.lineTo(ptsA[i].x, ptsA[i].y);
    }
    shapeA.closePath();

    const holeA = new THREE.Path();
    const ptsHole = aHoleRaw.map(toThree);
    holeA.moveTo(ptsHole[0].x, ptsHole[0].y);
    for (let i = 1; i < ptsHole.length; i++) {
      holeA.lineTo(ptsHole[i].x, ptsHole[i].y);
    }
    holeA.closePath();
    shapeA.holes.push(holeA);

    // Parâmetros de Extrusão Joalheira (Chanfro lapidado premium)
    const extrudeSettings = {
      depth: 0.32,
      bevelEnabled: true,
      bevelThickness: 0.07,
      bevelSize: 0.045,
      bevelSegments: 5,
      curveSegments: 16,
    };

    const geoY = new THREE.ExtrudeGeometry(shapeY, extrudeSettings);
    const geoA = new THREE.ExtrudeGeometry(shapeA, extrudeSettings);

    geoY.center();
    geoA.center();

    // MATERIAIS DE OURO 18K ULTRA REFINADO
    // Ouro frontal (letra Y com destaque de brilho)
    const goldMaterialY = new THREE.MeshPhysicalMaterial({
      color: 0xe8be5d,
      emissive: 0x241704,
      metalness: 0.94,
      roughness: 0.16,
      clearcoat: 0.6,
      clearcoatRoughness: 0.12,
      reflectivity: 1.0,
      envMapIntensity: 2.4,
    });

    // Ouro da letra A (ligeiramente mais quente e acetinado para contraste escultural)
    const goldMaterialA = new THREE.MeshPhysicalMaterial({
      color: 0xdfb04e,
      emissive: 0x1f1403,
      metalness: 0.92,
      roughness: 0.2,
      clearcoat: 0.5,
      clearcoatRoughness: 0.15,
      reflectivity: 0.95,
      envMapIntensity: 2.2,
    });

    const meshY = new THREE.Mesh(geoY, goldMaterialY);
    const meshA = new THREE.Mesh(geoA, goldMaterialA);

    meshY.castShadow = true;
    meshY.receiveShadow = true;
    meshA.castShadow = true;
    meshA.receiveShadow = true;

    // Posicionamento relativo fiel ao monograma original
    // 'Y' à esquerda e sutilmente sobreposto à frente
    meshY.position.set(-0.85, 0.05, 0.06);
    // 'A' à direita, harmoniosamente integrado
    meshA.position.set(0.72, -0.05, -0.06);

    floatingGroup.add(meshY);
    floatingGroup.add(meshA);

    // ==========================================
    // BASE ARQUITETÔNICA / PEDESTAL DE LUXO
    // ==========================================
    const pedestalGroup = new THREE.Group();
    pedestalGroup.position.set(0, -2.4, 0);
    logoGroup.add(pedestalGroup);

    // Disco de Mármore Negro / Granito com reflexo escuro
    const discGeo = new THREE.CylinderGeometry(2.8, 3.1, 0.12, 64);
    const discMat = new THREE.MeshPhysicalMaterial({
      color: 0x0c0e12,
      metalness: 0.3,
      roughness: 0.15,
      clearcoat: 0.9,
      clearcoatRoughness: 0.05,
      reflectivity: 0.9,
    });
    const discMesh = new THREE.Mesh(discGeo, discMat);
    discMesh.receiveShadow = true;
    pedestalGroup.add(discMesh);

    // Anel Dourado Chanfrado na borda do pedestal
    const ringGeo = new THREE.TorusGeometry(2.95, 0.035, 16, 96);
    ringGeo.rotateX(Math.PI / 2);
    const goldRingMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.9,
      roughness: 0.2,
      envMapIntensity: 2.0,
    });
    const ringMesh = new THREE.Mesh(ringGeo, goldRingMat);
    ringMesh.position.y = 0.06;
    pedestalGroup.add(ringMesh);

    // Anel de Luz Suave (Aura Dourada da Base)
    const innerLightRing = new THREE.TorusGeometry(1.6, 0.015, 12, 64);
    innerLightRing.rotateX(Math.PI / 2);
    const lightRingMat = new THREE.MeshBasicMaterial({
      color: 0xf6d688,
      transparent: true,
      opacity: 0.6,
    });
    const innerLightMesh = new THREE.Mesh(innerLightRing, lightRingMat);
    innerLightMesh.position.y = 0.07;
    pedestalGroup.add(innerLightMesh);

    // ==========================================
    // PARTÍCULAS DOURADAS CINTILANTES FLUTUANTES
    // ==========================================
    const particleCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleScales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3 + 0] = (Math.random() - 0.5) * 6.5;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 4.5;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 4.5;
      particleScales[i] = Math.random() * 0.8 + 0.2;
    }

    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );

    // Canvas de partícula com halo suave
    const sparkCanvas = document.createElement("canvas");
    sparkCanvas.width = 64;
    sparkCanvas.height = 64;
    const sCtx = sparkCanvas.getContext("2d")!;
    const radGrad = sCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    radGrad.addColorStop(0, "rgba(255, 245, 210, 1)");
    radGrad.addColorStop(0.3, "rgba(224, 185, 91, 0.8)");
    radGrad.addColorStop(0.7, "rgba(190, 138, 40, 0.2)");
    radGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    sCtx.fillStyle = radGrad;
    sCtx.fillRect(0, 0, 64, 64);
    const sparkTexture = new THREE.CanvasTexture(sparkCanvas);

    const particleMat = new THREE.PointsMaterial({
      size: 0.12,
      map: sparkTexture,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ==========================================
    // ILUMINAÇÃO DE ESTÚDIO CINEMATOGRÁFICA
    // ==========================================
    const ambientLight = new THREE.AmbientLight(0xfff5e6, 0.75);
    scene.add(ambientLight);

    // Luz principal dourada (Key light)
    const keyLight = new THREE.DirectionalLight(0xffeed1, 3.2);
    keyLight.position.set(4, 5, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.radius = 3;
    scene.add(keyLight);

    // Kicker / Rim light violeta/azulada de fundo (contraste arquitetônico)
    const rimLight = new THREE.DirectionalLight(0xaac4ff, 1.6);
    rimLight.position.set(-5, 3, -4);
    scene.add(rimLight);

    // Luz de baixo para cima aquecendo a base
    const underGlow = new THREE.PointLight(0xd4af37, 2.2, 7);
    underGlow.position.set(0, -1.8, 1);
    scene.add(underGlow);

    // Luz de brilho cintilante dinâmico que viaja pela frente do logo
    const glintLight = new THREE.PointLight(0xffffff, 2.5, 5);
    glintLight.position.set(0, 0, 3.2);
    scene.add(glintLight);

    // ==========================================
    // INTERAÇÃO DO USUÁRIO (MOUSE & TOUCH)
    // ==========================================
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotationY = 0;
    let targetRotationX = 0;
    let currentRotationY = 0;
    let currentRotationX = 0;
    let mouseHoverX = 0;
    let mouseHoverY = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseHoverX = normX;
      mouseHoverY = normY;

      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;

        targetRotationY += deltaX * 0.008;
        targetRotationX += deltaY * 0.005;
        // Limite angular no eixo vertical
        targetRotationX = Math.max(-0.4, Math.min(0.4, targetRotationX));
      }
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    container.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    // Redimensionamento responsivo
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    // ==========================================
    // LOOP DE ANIMAÇÃO COM MOVIMENTO CHIQUE
    // ==========================================
    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // 1. Rotação Contínua Elegante & Suave
      if (!isDragging) {
        // Velocidade moderada e aristocrática (~ 0.45 rad/s)
        targetRotationY += 0.0075;
      }

      // Interpolação suave (lerp amortecido)
      currentRotationY += (targetRotationY - currentRotationY) * 0.08;
      currentRotationX += (targetRotationX - currentRotationX) * 0.08;

      // 2. Movimento Chique: Flutuação Harmônica (Zero-Gravity Hover)
      const floatY = Math.sin(elapsedTime * 1.5) * 0.16;
      floatingGroup.position.y = floatY;

      // 3. Precessão Suave (Balanço angular tridimensional que expõe os chanfros dourados)
      const tiltWobbleX = Math.sin(elapsedTime * 0.8) * 0.06;
      const tiltWobbleZ = Math.cos(elapsedTime * 0.6) * 0.04;

      // Influência sutil do cursor (parallax de luxo)
      const hoverTiltX = -mouseHoverY * 0.12;
      const hoverTiltY = mouseHoverX * 0.15;

      floatingGroup.rotation.y = currentRotationY + hoverTiltY;
      floatingGroup.rotation.x = currentRotationX + tiltWobbleX + hoverTiltX;
      floatingGroup.rotation.z = tiltWobbleZ;

      // 4. Luz de Cintilação que corre pela superfície lapidada
      glintLight.position.x = Math.sin(elapsedTime * 1.2) * 2.8;
      glintLight.position.y = floatY + Math.cos(elapsedTime * 1.4) * 0.8;
      glintLight.position.z = 2.4 + Math.sin(elapsedTime * 0.9) * 0.6;

      // 5. Flutuação lenta das partículas de ouro
      particles.rotation.y = elapsedTime * 0.02;
      particles.position.y = Math.sin(elapsedTime * 0.5) * 0.1;

      // 6. Rotação sutil da aura do pedestal
      ringMesh.rotation.z = -elapsedTime * 0.08;
      innerLightMesh.rotation.z = elapsedTime * 0.12;

      renderer.render(scene, camera);
    };

    animate();

    // ==========================================
    // LIMPEZA COMPLETA AO DESMONTAR
    // ==========================================
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);

      // Desalocação de geometrias e materiais
      geoY.dispose();
      geoA.dispose();
      goldMaterialY.dispose();
      goldMaterialA.dispose();
      discGeo.dispose();
      discMat.dispose();
      ringGeo.dispose();
      goldRingMat.dispose();
      innerLightRing.dispose();
      lightRingMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      sparkTexture.dispose();
      envTexture.dispose();
      generatedEnvMap.dispose();
      pmremGenerator.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[460px] sm:h-[500px] flex items-center justify-center select-none">
      {/* Halo de iluminação de fundo ambiental */}
      <div className="absolute inset-0 bg-radial from-[#D4AF37]/18 via-[#D4AF37]/5 to-transparent blur-3xl rounded-full pointer-events-none" />

      {/* Contêiner Three.js interativo */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none z-10"
        title="Arraste para girar a logo em 3D"
      />

      {/* Fallback caso WebGL não esteja disponível no dispositivo */}
      {hasWebGL === false && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20">
          <img
            src="/images/logo-yuri-almeida.svg"
            alt="Yuri Almeida Imóveis"
            className="w-64 max-w-full drop-shadow-2xl animate-pulse"
          />
        </div>
      )}

      {/* Tag de prestígio discreta na base */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center gap-2 px-3 py-1 bg-[#0B0D12]/70 backdrop-blur-md border border-[#D4AF37]/25 rounded-full text-[10px] uppercase tracking-[0.25em] text-[#D4AF37]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-ping" />
        <span>Emblema 3D Interativo</span>
      </div>
    </div>
  );
}
