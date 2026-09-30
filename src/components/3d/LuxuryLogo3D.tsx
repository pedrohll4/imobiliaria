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

    let width = container.clientWidth || 500;
    let height = container.clientHeight || 450;

    // 2. Cena & Câmera (Com recuo amplo para NUNCA encostar ou cortar nas bordas)
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    // Câmera posicionada a 9.6 unidades garante muito respiro e zero clipping
    camera.position.set(0, 0, 9.6);
    camera.lookAt(0, 0, 0);

    // 3. Renderer com Fundo 100% Transparente e Antialias Suave
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
    renderer.toneMappingExposure = 1.2;
    renderer.setClearColor(0x000000, 0); // 100% transparente, sem qualquer quadrado ou caixa
    container.appendChild(renderer.domElement);

    // 4. MAPA DE ILUMINAÇÃO DE AMBIENTE (IBL de Estúdio de Joalheria)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    const envScene = new THREE.Scene();
    const envGeo = new THREE.SphereGeometry(15, 32, 16);
    const envCanvas = document.createElement("canvas");
    envCanvas.width = 512;
    envCanvas.height = 256;
    const envCtx = envCanvas.getContext("2d")!;

    // Gradiente de Estúdio Dourado Suave
    const envGrad = envCtx.createLinearGradient(0, 0, 512, 256);
    envGrad.addColorStop(0.0, "#0e1117");
    envGrad.addColorStop(0.3, "#2d2315");
    envGrad.addColorStop(0.5, "#fff2d6"); // Reflexo de luz alta
    envGrad.addColorStop(0.56, "#d4af37"); // Tom rico ouro
    envGrad.addColorStop(0.78, "#1f1a14");
    envGrad.addColorStop(1.0, "#080a0e");
    envCtx.fillStyle = envGrad;
    envCtx.fillRect(0, 0, 512, 256);

    // Pontos de reflexo suave
    envCtx.fillStyle = "rgba(255, 248, 230, 0.9)";
    envCtx.beginPath();
    envCtx.arc(256, 80, 60, 0, Math.PI * 2);
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

    // 5. GRUPO PRINCIPAL DO LOGO 3D (Escala equilibrada, sem encostar nas bordas)
    const logoGroup = new THREE.Group();
    // Escala calibrada para ficar perfeitamente enquadrado com margem de segurança
    logoGroup.scale.set(0.72, 0.72, 0.72);
    scene.add(logoGroup);

    // Subgrupo flutuante para o movimento sutil
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

    const aHoleRaw = [
      [145, 63],
      [119, 106],
      [167, 106],
    ];

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

    // Shape da letra A com furo interno
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

    // Extrusão lapidada de alta definição
    const extrudeSettings = {
      depth: 0.35,
      bevelEnabled: true,
      bevelThickness: 0.075,
      bevelSize: 0.045,
      bevelSegments: 5,
      curveSegments: 16,
    };

    const geoY = new THREE.ExtrudeGeometry(shapeY, extrudeSettings);
    const geoA = new THREE.ExtrudeGeometry(shapeA, extrudeSettings);

    geoY.center();
    geoA.center();

    // MATERIAIS DE OURO 18K ULTRA REFINADOS
    const goldMaterialY = new THREE.MeshPhysicalMaterial({
      color: 0xebc46a,
      emissive: 0x221603,
      metalness: 0.95,
      roughness: 0.15,
      clearcoat: 0.6,
      clearcoatRoughness: 0.1,
      reflectivity: 1.0,
      envMapIntensity: 2.6,
    });

    const goldMaterialA = new THREE.MeshPhysicalMaterial({
      color: 0xdfb455,
      emissive: 0x1d1302,
      metalness: 0.93,
      roughness: 0.18,
      clearcoat: 0.5,
      clearcoatRoughness: 0.12,
      reflectivity: 0.95,
      envMapIntensity: 2.4,
    });

    const meshY = new THREE.Mesh(geoY, goldMaterialY);
    const meshA = new THREE.Mesh(geoA, goldMaterialA);

    meshY.castShadow = true;
    meshY.receiveShadow = true;
    meshA.castShadow = true;
    meshA.receiveShadow = true;

    // Posicionamento harmônico (Y ligeiramente à frente, criando profundidade escultural)
    meshY.position.set(-0.82, 0.05, 0.06);
    meshA.position.set(0.72, -0.05, -0.06);

    floatingGroup.add(meshY);
    floatingGroup.add(meshA);

    // ==========================================
    // PARTÍCULAS DOURADAS ULTRA DISCRETAS (SEM BORDA)
    // ==========================================
    const particleCount = 30;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      // Concentradas perto do logo, sem espalhar até os cantos do canvas
      particlePositions[i * 3 + 0] = (Math.random() - 0.5) * 4.2;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 3.5;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 3.0;
    }

    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );

    const sparkCanvas = document.createElement("canvas");
    sparkCanvas.width = 64;
    sparkCanvas.height = 64;
    const sCtx = sparkCanvas.getContext("2d")!;
    const radGrad = sCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    radGrad.addColorStop(0, "rgba(255, 245, 210, 1)");
    radGrad.addColorStop(0.3, "rgba(224, 185, 91, 0.7)");
    radGrad.addColorStop(0.7, "rgba(190, 138, 40, 0.15)");
    radGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    sCtx.fillStyle = radGrad;
    sCtx.fillRect(0, 0, 64, 64);
    const sparkTexture = new THREE.CanvasTexture(sparkCanvas);

    const particleMat = new THREE.PointsMaterial({
      size: 0.09,
      map: sparkTexture,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ==========================================
    // ILUMINAÇÃO DE ESTÚDIO FRONT-FACING
    // ==========================================
    const ambientLight = new THREE.AmbientLight(0xfff5e6, 0.9);
    scene.add(ambientLight);

    // Luz principal frontal/superior destacando a leitura e os chanfros dourados
    const keyLight = new THREE.DirectionalLight(0xffeed1, 3.4);
    keyLight.position.set(3, 4, 7);
    scene.add(keyLight);

    // Rim light para destacar o contorno lateral 3D
    const rimLight = new THREE.DirectionalLight(0xa5c4ff, 1.8);
    rimLight.position.set(-4, 2, -3);
    scene.add(rimLight);

    // Luz frontal suave iluminando as faces
    const frontFill = new THREE.DirectionalLight(0xfff7e8, 1.2);
    frontFill.position.set(0, -1, 6);
    scene.add(frontFill);

    // Luz de cintilação que percorre suavemente as arestas de ouro
    const glintLight = new THREE.PointLight(0xffffff, 2.8, 4.5);
    glintLight.position.set(0, 0, 2.6);
    scene.add(glintLight);

    // ==========================================
    // PARALAXE SUAVE DE MOUSE (SEM GIRAR 360)
    // ==========================================
    let mouseHoverX = 0;
    let mouseHoverY = 0;
    let currentTiltX = 0;
    let currentTiltY = 0;

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      // Limitar a influência sutil para nunca girar demais
      mouseHoverX = Math.max(-1, Math.min(1, normX));
      mouseHoverY = Math.max(-1, Math.min(1, normY));
    };

    const onPointerLeave = () => {
      mouseHoverX = 0;
      mouseHoverY = 0;
    };

    window.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerleave", onPointerLeave);

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    // ÂNGULO BASE ELEGANTE (Frontal com leve perspectiva 3D para valorizar o relevo)
    const baseRotationY = -0.1; // ~ -5.7 graus: dá leitura perfeita do logo e mostra o chanfro 3D
    const baseRotationX = 0.04; // ~ 2.3 graus: suave perspectiva frontal

    // ==========================================
    // LOOP DE ANIMAÇÃO ELEGANTE (SEM ROTAÇÃO 360)
    // ==========================================
    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Interpolação suave do mouse (inclinação sutil que acompanha o cursor sem nunca rodar)
      const targetTiltY = mouseHoverX * 0.12; // Máximo de ±7 graus
      const targetTiltX = -mouseHoverY * 0.08; // Máximo de ±4.5 graus

      currentTiltY += (targetTiltY - currentTiltY) * 0.05;
      currentTiltX += (targetTiltX - currentTiltX) * 0.05;

      // Movimento 1: Flutuação Harmônica suave no ar (Zero-Gravity Breathing)
      const floatY = Math.sin(elapsedTime * 1.3) * 0.08;
      floatingGroup.position.y = floatY;

      // Movimento 2: Micro-respiração angular sutil (NÃO RODA 360, apenas balanço nobre)
      const organicWobbleY = Math.sin(elapsedTime * 0.7) * 0.035;
      const organicWobbleX = Math.cos(elapsedTime * 0.9) * 0.02;
      const organicWobbleZ = Math.sin(elapsedTime * 0.6) * 0.015;

      // Aplica a orientação frontal com movimento vivo
      floatingGroup.rotation.y = baseRotationY + currentTiltY + organicWobbleY;
      floatingGroup.rotation.x = baseRotationX + currentTiltX + organicWobbleX;
      floatingGroup.rotation.z = organicWobbleZ;

      // Movimento 3: O ponto de luz desliza suavemente pelos chanfros lapidados de ouro
      glintLight.position.x = Math.sin(elapsedTime * 1.1) * 2.2;
      glintLight.position.y = floatY + Math.cos(elapsedTime * 1.3) * 0.7;
      glintLight.position.z = 2.4 + Math.sin(elapsedTime * 0.8) * 0.4;

      // Partículas flutuam levemente
      particles.position.y = Math.sin(elapsedTime * 0.4) * 0.06;

      renderer.render(scene, camera);
    };

    animate();

    // ==========================================
    // LIMPEZA
    // ==========================================
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);

      geoY.dispose();
      geoA.dispose();
      goldMaterialY.dispose();
      goldMaterialA.dispose();
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
    <div className="relative w-full h-[400px] sm:h-[450px] flex items-center justify-center select-none overflow-visible">
      {/* Halo de brilho ambiental dourado 100% difuso (sem bordas retangulares) */}
      <div className="absolute inset-4 bg-radial from-[#D4AF37]/18 via-[#D4AF37]/4 to-transparent blur-3xl rounded-full pointer-events-none" />

      {/* Contêiner Three.js interativo (transparente e sem qualquer borda) */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-default z-10"
      />

      {/* Fallback caso WebGL não esteja disponível */}
      {hasWebGL === false && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20">
          <img
            src="/images/logo-yuri-almeida.svg"
            alt="Yuri Almeida Imóveis"
            className="w-56 max-w-full drop-shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
