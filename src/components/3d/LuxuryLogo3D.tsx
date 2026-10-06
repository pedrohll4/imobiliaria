"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import cinzelFontData from "./cinzelFont.json";

interface GlyphData {
  ha: number;
  x_min: number;
  x_max: number;
  o: string;
}

interface FontDataStructure {
  resolution: number;
  glyphs: Record<string, GlyphData>;
}

// Converte texto em THREE.Shape[] vetoriais precisos com espaçamento configurável (tracking)
function createTextShapes(
  fontData: FontDataStructure,
  text: string,
  size: number,
  tracking = 0
) {
  const chars = Array.from(text);
  const scale = size / fontData.resolution;
  const shapes: THREE.Shape[] = [];
  let offsetX = 0;

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const glyph = fontData.glyphs[char] || fontData.glyphs["?"];
    if (!glyph) {
      if (char === " ") {
        offsetX += 300 * scale + tracking;
      }
      continue;
    }

    if (glyph.o && glyph.o.trim().length > 0) {
      const outline = glyph.o.trim().split(/\s+/);
      const shapePath = new THREE.ShapePath();
      let x = 0;
      let y = 0;
      let cpx = 0;
      let cpy = 0;
      let cpx1 = 0;
      let cpy1 = 0;
      let cpx2 = 0;
      let cpy2 = 0;

      for (let j = 0; j < outline.length; ) {
        const action = outline[j++];
        switch (action) {
          case "m":
            x = parseFloat(outline[j++]) * scale + offsetX;
            y = parseFloat(outline[j++]) * scale;
            shapePath.moveTo(x, y);
            break;
          case "l":
            x = parseFloat(outline[j++]) * scale + offsetX;
            y = parseFloat(outline[j++]) * scale;
            shapePath.lineTo(x, y);
            break;
          case "q":
            cpx = parseFloat(outline[j++]) * scale + offsetX;
            cpy = parseFloat(outline[j++]) * scale;
            cpx1 = parseFloat(outline[j++]) * scale + offsetX;
            cpy1 = parseFloat(outline[j++]) * scale;
            shapePath.quadraticCurveTo(cpx1, cpy1, cpx, cpy);
            break;
          case "b":
            cpx = parseFloat(outline[j++]) * scale + offsetX;
            cpy = parseFloat(outline[j++]) * scale;
            cpx1 = parseFloat(outline[j++]) * scale + offsetX;
            cpy1 = parseFloat(outline[j++]) * scale;
            cpx2 = parseFloat(outline[j++]) * scale + offsetX;
            cpy2 = parseFloat(outline[j++]) * scale;
            shapePath.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, cpx, cpy);
            break;
        }
      }
      shapes.push(...shapePath.toShapes());
    }

    offsetX += (glyph.ha !== undefined ? glyph.ha * scale : 300 * scale) + tracking;
  }

  return { shapes, width: offsetX - tracking };
}

// Cria a geometria de barra divisora 3D estilizada com pontas arredondadas e chanfro suave
function createDividerGeometry(width: number, height: number, depth: number) {
  const shape = new THREE.Shape();
  const hw = width / 2;
  const hh = height / 2;
  const r = hh; // extremidades curvas em cápsula
  shape.moveTo(-hw + r, -hh);
  shape.lineTo(hw - r, -hh);
  shape.absarc(hw - r, 0, r, -Math.PI / 2, Math.PI / 2, false);
  shape.lineTo(-hw + r, hh);
  shape.absarc(-hw + r, 0, r, Math.PI / 2, (3 * Math.PI) / 2, false);

  return new THREE.ExtrudeGeometry(shape, {
    depth: depth,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.008,
    bevelSegments: 2,
    curveSegments: 8,
  });
}

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

    let width = container.clientWidth || 520;
    let height = container.clientHeight || 480;

    // 2. Cena & Câmera com amplo enquadramento e perspectiva nobre
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.set(0, 0, 10.2);
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
    renderer.toneMappingExposure = 1.25;
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // 4. MAPA DE ILUMINAÇÃO DE AMBIENTE (Estúdio de Alta Joalheria Dourada)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    const envScene = new THREE.Scene();
    const envGeo = new THREE.SphereGeometry(15, 32, 16);
    const envCanvas = document.createElement("canvas");
    envCanvas.width = 512;
    envCanvas.height = 256;
    const envCtx = envCanvas.getContext("2d")!;

    const envGrad = envCtx.createLinearGradient(0, 0, 512, 256);
    envGrad.addColorStop(0.0, "#0a0c10");
    envGrad.addColorStop(0.25, "#2a1f12");
    envGrad.addColorStop(0.48, "#fff5dd"); // Brilho especular dourado alto
    envGrad.addColorStop(0.55, "#d4af37"); // Tom rico ouro 18k
    envGrad.addColorStop(0.75, "#1e1811");
    envGrad.addColorStop(1.0, "#080a0e");
    envCtx.fillStyle = envGrad;
    envCtx.fillRect(0, 0, 512, 256);

    envCtx.fillStyle = "rgba(255, 250, 235, 0.92)";
    envCtx.beginPath();
    envCtx.arc(256, 75, 65, 0, Math.PI * 2);
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

    // 5. GRUPO PRINCIPAL DO LOGO 3D COMPLETO
    const logoGroup = new THREE.Group();
    // Escala calibrada com margem de segurança perfeita para nunca cortar em resoluções mobile/desktop
    logoGroup.scale.set(0.66, 0.66, 0.66);
    scene.add(logoGroup);

    // Subgrupo flutuante para a movimentação física suave
    const floatingGroup = new THREE.Group();
    logoGroup.add(floatingGroup);

    // Grupo de composição interna com centro de massa nivelado em (0,0,0)
    const compositionGroup = new THREE.Group();
    floatingGroup.add(compositionGroup);

    // ==========================================
    // MATERIAIS LUXUOSOS ULTRA REFINADOS
    // ==========================================
    // Ouro 18K com alto brilho, verniz e reflexo especular vívido
    const goldMaterialPrimary = new THREE.MeshPhysicalMaterial({
      color: 0xebc46a,
      emissive: 0x221603,
      metalness: 0.95,
      roughness: 0.15,
      clearcoat: 0.65,
      clearcoatRoughness: 0.1,
      reflectivity: 1.0,
      envMapIntensity: 2.7,
    });

    // Ouro 18K levemente contrastado para relevo escultural
    const goldMaterialSecondary = new THREE.MeshPhysicalMaterial({
      color: 0xdfb455,
      emissive: 0x1d1302,
      metalness: 0.93,
      roughness: 0.17,
      clearcoat: 0.55,
      clearcoatRoughness: 0.12,
      reflectivity: 0.95,
      envMapIntensity: 2.5,
    });

    // Platina / Ouro Branco para "YURI ALMEIDA" (máxima legibilidade + elegância nobre)
    const platinumMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xfcfcfd,
      emissive: 0x121215,
      metalness: 0.82,
      roughness: 0.16,
      clearcoat: 0.75,
      clearcoatRoughness: 0.08,
      reflectivity: 1.0,
      envMapIntensity: 2.4,
    });

    // ==========================================
    // 1. GEOMETRIA 3D DO EMBLEMA MONOGRAMA YA
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

    // Shape da letra A com vazamento interno
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

    // Extrusão facetada de alta definição
    const yaExtrudeSettings = {
      depth: 0.35,
      bevelEnabled: true,
      bevelThickness: 0.075,
      bevelSize: 0.045,
      bevelSegments: 4,
      curveSegments: 14,
    };

    const geoY = new THREE.ExtrudeGeometry(shapeY, yaExtrudeSettings);
    const geoA = new THREE.ExtrudeGeometry(shapeA, yaExtrudeSettings);
    geoY.center();
    geoA.center();

    const meshY = new THREE.Mesh(geoY, goldMaterialPrimary);
    const meshA = new THREE.Mesh(geoA, goldMaterialSecondary);
    meshY.castShadow = true;
    meshY.receiveShadow = true;
    meshA.castShadow = true;
    meshA.receiveShadow = true;

    // Y ligeiramente à frente de A para profundidade escultural
    meshY.position.set(-0.82, 0.05, 0.06);
    meshA.position.set(0.72, -0.05, -0.06);

    const yaGroup = new THREE.Group();
    yaGroup.add(meshY);
    yaGroup.add(meshA);
    yaGroup.scale.set(0.84, 0.84, 0.84);
    yaGroup.position.set(0, 1.05, 0);
    compositionGroup.add(yaGroup);

    // ==========================================
    // 2. GEOMETRIA 3D DA TIPOGRAFIA "YURI ALMEIDA"
    // ==========================================
    const fontData = cinzelFontData as unknown as FontDataStructure;
    const yuriData = createTextShapes(fontData, "YURI ALMEIDA", 0.51, 0.055);
    const geoYuri = new THREE.ExtrudeGeometry(yuriData.shapes, {
      depth: 0.12,
      bevelEnabled: true,
      bevelThickness: 0.024,
      bevelSize: 0.015,
      bevelSegments: 2,
      curveSegments: 3,
    });
    geoYuri.center();
    const meshYuri = new THREE.Mesh(geoYuri, platinumMaterial);
    meshYuri.castShadow = true;
    meshYuri.receiveShadow = true;
    meshYuri.position.set(0, -1.25, 0.02);
    compositionGroup.add(meshYuri);

    // ==========================================
    // 3. GEOMETRIA 3D DE "IMÓVEIS"
    // ==========================================
    const imoveisData = createTextShapes(fontData, "IMÓVEIS", 0.23, 0.11);
    const geoImoveis = new THREE.ExtrudeGeometry(imoveisData.shapes, {
      depth: 0.10,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.012,
      bevelSegments: 2,
      curveSegments: 3,
    });
    geoImoveis.center();
    const meshImoveis = new THREE.Mesh(geoImoveis, goldMaterialPrimary);
    meshImoveis.castShadow = true;
    meshImoveis.receiveShadow = true;
    meshImoveis.position.set(0, -1.95, 0.02);
    compositionGroup.add(meshImoveis);

    // ==========================================
    // 4. LINHAS DIVISÓRIAS DOURADAS 3D LATERAIS
    // ==========================================
    const lineHeight = 0.024;
    const lineDepth = 0.06;
    const lineWidth = 1.35;

    const geoLineLeft = createDividerGeometry(lineWidth, lineHeight, lineDepth);
    geoLineLeft.center();
    const meshLineLeft = new THREE.Mesh(geoLineLeft, goldMaterialPrimary);
    meshLineLeft.castShadow = true;
    meshLineLeft.receiveShadow = true;
    meshLineLeft.position.set(-2.05, -1.95, 0.02);
    compositionGroup.add(meshLineLeft);

    const geoLineRight = createDividerGeometry(lineWidth, lineHeight, lineDepth);
    geoLineRight.center();
    const meshLineRight = new THREE.Mesh(geoLineRight, goldMaterialPrimary);
    meshLineRight.castShadow = true;
    meshLineRight.receiveShadow = true;
    meshLineRight.position.set(2.05, -1.95, 0.02);
    compositionGroup.add(meshLineRight);

    // ==========================================
    // CENTRALIZAÇÃO PERFEITA DO CENTRO DE MASSA
    // ==========================================
    // O centro de massa geométrico fica perfeitamente alinhado em Y = 0
    compositionGroup.position.set(0, -0.44, 0);

    // ==========================================
    // PARTÍCULAS DOURADAS ULTRA DISCRETAS NO ESPAÇO
    // ==========================================
    const particleCount = 35;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3 + 0] = (Math.random() - 0.5) * 5.5;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 5.0;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 3.5;
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
    radGrad.addColorStop(0, "rgba(255, 248, 220, 1)");
    radGrad.addColorStop(0.3, "rgba(224, 185, 91, 0.7)");
    radGrad.addColorStop(0.7, "rgba(190, 138, 40, 0.15)");
    radGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    sCtx.fillStyle = radGrad;
    sCtx.fillRect(0, 0, 64, 64);
    const sparkTexture = new THREE.CanvasTexture(sparkCanvas);

    const particleMat = new THREE.PointsMaterial({
      size: 0.08,
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
    const ambientLight = new THREE.AmbientLight(0xfff5e6, 0.95);
    scene.add(ambientLight);

    // Luz principal frontal/superior destacando a leitura e os chanfros dourados
    const keyLight = new THREE.DirectionalLight(0xffeed1, 3.5);
    keyLight.position.set(3, 4, 7);
    scene.add(keyLight);

    // Rim light para destacar o contorno lateral 3D
    const rimLight = new THREE.DirectionalLight(0xa5c4ff, 1.6);
    rimLight.position.set(-4, 2, -3);
    scene.add(rimLight);

    // Luz frontal suave iluminando as faces e a tipografia
    const frontFill = new THREE.DirectionalLight(0xfff7e8, 1.3);
    frontFill.position.set(0, -1, 6);
    scene.add(frontFill);

    // Glint Light 1: Cintilação suave nos chanfros do emblema YA
    const glintLightEmblem = new THREE.PointLight(0xffffff, 2.6, 5.0);
    glintLightEmblem.position.set(0, 1.05, 2.5);
    scene.add(glintLightEmblem);

    // Glint Light 2: Cintilação suave percorrendo a tipografia inferior
    const glintLightText = new THREE.PointLight(0xfff4d6, 2.2, 5.0);
    glintLightText.position.set(0, -1.5, 2.5);
    scene.add(glintLightText);

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
    const baseRotationY = -0.09;
    const baseRotationX = 0.035;

    // ==========================================
    // LOOP DE ANIMAÇÃO ELEGANTE (SEM ROTAÇÃO 360)
    // ==========================================
    const startTime = performance.now();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = (performance.now() - startTime) * 0.001;

      // Interpolação suave do mouse
      const targetTiltY = mouseHoverX * 0.11; // Máximo ±6.3 graus
      const targetTiltX = -mouseHoverY * 0.07; // Máximo ±4 graus

      currentTiltY += (targetTiltY - currentTiltY) * 0.05;
      currentTiltX += (targetTiltX - currentTiltX) * 0.05;

      // Movimento 1: Flutuação Harmônica suave no ar (Zero-Gravity Breathing)
      const floatY = Math.sin(elapsedTime * 1.25) * 0.07;
      floatingGroup.position.y = floatY;

      // Movimento 2: Micro-respiração angular sutil (Nobreza escultural viva)
      const organicWobbleY = Math.sin(elapsedTime * 0.7) * 0.028;
      const organicWobbleX = Math.cos(elapsedTime * 0.85) * 0.018;
      const organicWobbleZ = Math.sin(elapsedTime * 0.55) * 0.012;

      floatingGroup.rotation.y = baseRotationY + currentTiltY + organicWobbleY;
      floatingGroup.rotation.x = baseRotationX + currentTiltX + organicWobbleX;
      floatingGroup.rotation.z = organicWobbleZ;

      // Movimento 3: O ponto de luz desliza nobremente pelos chanfros do emblema
      glintLightEmblem.position.x = Math.sin(elapsedTime * 1.1) * 2.2;
      glintLightEmblem.position.y = 0.61 + floatY + Math.cos(elapsedTime * 1.3) * 0.6;
      glintLightEmblem.position.z = 2.4 + Math.sin(elapsedTime * 0.8) * 0.3;

      // Movimento 4: Segundo ponto de luz desliza suavemente sobre "YURI ALMEIDA" e "IMÓVEIS"
      glintLightText.position.x = Math.sin(elapsedTime * 1.3 + 1.8) * 2.6;
      glintLightText.position.y = -1.85 + floatY + Math.cos(elapsedTime * 1.1) * 0.4;
      glintLightText.position.z = 2.4 + Math.cos(elapsedTime * 0.9) * 0.3;

      // Partículas flutuam suavemente
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
      geoYuri.dispose();
      geoImoveis.dispose();
      geoLineLeft.dispose();
      geoLineRight.dispose();
      goldMaterialPrimary.dispose();
      goldMaterialSecondary.dispose();
      platinumMaterial.dispose();
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
    <div className="relative w-full h-[360px] sm:h-[420px] lg:h-[450px] flex items-center justify-center select-none overflow-visible">
      {/* Halo de brilho ambiental dourado 100% difuso (sem bordas retangulares) */}
      <div className="absolute inset-4 bg-radial from-[#D4AF37]/18 via-[#D4AF37]/5 to-transparent blur-3xl rounded-full pointer-events-none" />

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
            className="w-64 max-w-full drop-shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
