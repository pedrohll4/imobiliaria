"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export function ArchitecturalPavilion() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);

  useEffect(() => {
    // 1. Verificação WebGL
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

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    // 2. Cena & Câmera em Perspectiva Editorial (3/4 Eye-Level Arquitetônico)
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    camera.position.set(13.2, 7.8, 13.2);
    camera.lookAt(0, 0.7, 0);

    // 3. Renderer com Sombras Suaves e Tratamento de Cor de Cinema
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
    renderer.toneMappingExposure = 1.15;
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // 4. MAPA DE ILUMINAÇÃO DE AMBIENTE (IBL / Environment Map Procedural)
    // Isso é o segredo do hiper-realismo: reflete céu crepuscular no vidro, bronze e piscina
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    const envScene = new THREE.Scene();
    const envGeo = new THREE.SphereGeometry(15, 32, 16);
    const envCanvas = document.createElement("canvas");
    envCanvas.width = 512;
    envCanvas.height = 256;
    const envCtx = envCanvas.getContext("2d")!;
    // Gradiente de Crepúsculo Dourado (Golden Hour / Twilight)
    const envGrad = envCtx.createLinearGradient(0, 0, 0, 256);
    envGrad.addColorStop(0, "#0d131f"); // Topo do céu azul noturno
    envGrad.addColorStop(0.55, "#2a2228"); // Transição violeta
    envGrad.addColorStop(0.75, "#c59860"); // Horizonte pôr do sol dourado
    envGrad.addColorStop(0.85, "#f5dfbb"); // Brilho do sol poente
    envGrad.addColorStop(1, "#18191d"); // Chão
    envCtx.fillStyle = envGrad;
    envCtx.fillRect(0, 0, 512, 256);

    const envTexture = new THREE.CanvasTexture(envCanvas);
    envTexture.mapping = THREE.EquirectangularReflectionMapping;
    const envMat = new THREE.MeshBasicMaterial({
      map: envTexture,
      side: THREE.BackSide,
    });
    envScene.add(new THREE.Mesh(envGeo, envMat));

    const generatedEnvMap = pmremGenerator.fromScene(envScene).texture;
    scene.environment = generatedEnvMap;

    // Grupo Geral da Mansão
    const mansionGroup = new THREE.Group();
    mansionGroup.scale.set(0.95, 0.95, 0.95);
    scene.add(mansionGroup);

    // ==========================================
    // TEXTURAS PBR PROCEDURAIS DE ALTA RESOLUÇÃO
    // ==========================================
    // A) Concreto Ripado (Board-formed concrete)
    const concreteCanvas = document.createElement("canvas");
    concreteCanvas.width = 512;
    concreteCanvas.height = 512;
    const cCtx = concreteCanvas.getContext("2d")!;
    cCtx.fillStyle = "#dcd8ce";
    cCtx.fillRect(0, 0, 512, 512);
    // Linhas de tábuas de concreto com micro-ranhuras
    for (let y = 0; y < 512; y += 32) {
      cCtx.fillStyle = "rgba(0,0,0,0.06)";
      cCtx.fillRect(0, y, 512, 2);
      cCtx.fillStyle = "rgba(255,255,255,0.08)";
      cCtx.fillRect(0, y + 2, 512, 1);
    }
    // Grãos de pedra sutil
    for (let i = 0; i < 4000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const shade = Math.random() > 0.5 ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.05)";
      cCtx.fillStyle = shade;
      cCtx.fillRect(x, y, 2, 2);
    }
    const concreteTex = new THREE.CanvasTexture(concreteCanvas);
    concreteTex.wrapS = THREE.RepeatWrapping;
    concreteTex.wrapT = THREE.RepeatWrapping;
    concreteTex.repeat.set(2, 2);

    // B) Madeira Nobre Cumaru / Teca para o Deck e Brises
    const woodCanvas = document.createElement("canvas");
    woodCanvas.width = 512;
    woodCanvas.height = 512;
    const wCtx = woodCanvas.getContext("2d")!;
    wCtx.fillStyle = "#8a5836";
    wCtx.fillRect(0, 0, 512, 512);
    for (let y = 0; y < 512; y += 24) {
      wCtx.fillStyle = "rgba(30,15,5,0.25)";
      wCtx.fillRect(0, y, 512, 2);
      wCtx.fillStyle = "rgba(255,200,150,0.1)";
      wCtx.fillRect(0, y + 2, 512, 1);
    }
    const woodTex = new THREE.CanvasTexture(woodCanvas);
    woodTex.wrapS = THREE.RepeatWrapping;
    woodTex.wrapT = THREE.RepeatWrapping;
    woodTex.repeat.set(3, 3);

    // C) Textura de Água Suave / Caustics da Piscina
    const waterCanvas = document.createElement("canvas");
    waterCanvas.width = 256;
    waterCanvas.height = 256;
    const wtCtx = waterCanvas.getContext("2d")!;
    wtCtx.fillStyle = "#0d9488";
    wtCtx.fillRect(0, 0, 256, 256);
    // Linhas de reflexo d'água
    for (let i = 0; i < 200; i++) {
      wtCtx.beginPath();
      wtCtx.arc(Math.random() * 256, Math.random() * 256, Math.random() * 14 + 4, 0, Math.PI * 2);
      wtCtx.strokeStyle = "rgba(94, 234, 212, 0.18)";
      wtCtx.lineWidth = 2;
      wtCtx.stroke();
    }
    const waterTex = new THREE.CanvasTexture(waterCanvas);

    // ==========================================
    // MATERIAIS DE LUXO COM PROPRIEDADES FÍSICAS (PBR)
    // ==========================================
    const concreteWallMat = new THREE.MeshStandardMaterial({
      map: concreteTex,
      roughness: 0.7,
      metalness: 0.05,
    });

    const smoothPlasterWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xf6f5f0,
      roughness: 0.35,
      metalness: 0.02,
    });

    const darkCharredWoodMat = new THREE.MeshStandardMaterial({
      color: 0x1f2329,
      roughness: 0.45,
      metalness: 0.15,
    });

    const warmWoodDeckMat = new THREE.MeshStandardMaterial({
      map: woodTex,
      roughness: 0.4,
      metalness: 0.05,
    });

    const bronzeMetalMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.25,
      metalness: 0.85,
    });

    const blackSteelMat = new THREE.MeshStandardMaterial({
      color: 0x111317,
      roughness: 0.2,
      metalness: 0.9,
    });

    // Vidro ultra-nobre com espelhamento do pôr do sol
    const luxuryGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.45,
      roughness: 0.02,
      metalness: 0.1,
      transmission: 0.9,
      ior: 1.52,
      reflectivity: 0.9,
    });

    // Água da piscina com refração cristalina
    const luxuryWaterMat = new THREE.MeshPhysicalMaterial({
      map: waterTex,
      color: 0x14b8a6,
      transparent: true,
      opacity: 0.85,
      roughness: 0.05,
      metalness: 0.1,
      transmission: 0.6,
      ior: 1.33,
    });

    // Fita de LED oculta brilhante (Emissive architectural warm glow)
    const ledStripMat = new THREE.MeshBasicMaterial({
      color: 0xffd599,
    });

    // Fogo da lareira externa
    const fireMat = new THREE.MeshBasicMaterial({
      color: 0xff7722,
    });

    // Grama aparada estilo campo de golfe
    const lawnMat = new THREE.MeshStandardMaterial({
      color: 0x273528,
      roughness: 0.85,
      metalness: 0.0,
    });

    // ==========================================
    // ESTRUTURA ARQUITETÔNICA DA RESIDÊNCIA
    // ==========================================

    // 1. Platô Base Flutuante em Pedra Grafite (Podium contemporâneo)
    const podiumGeo = new THREE.BoxGeometry(8.2, 0.25, 6.4);
    const podiumMesh = new THREE.Mesh(podiumGeo, new THREE.MeshStandardMaterial({ color: 0x14171d, roughness: 0.5 }));
    podiumMesh.position.y = -0.12;
    podiumMesh.receiveShadow = true;
    mansionGroup.add(podiumMesh);

    // Fita de LED sob o platô base (faz a casa parecer levitar suavemente)
    const underLedGeo = new THREE.BoxGeometry(8.0, 0.02, 6.2);
    const underLed = new THREE.Mesh(underLedGeo, ledStripMat);
    underLed.position.y = -0.22;
    mansionGroup.add(underLed);

    // Gramado paisagístico esculpido
    const lawnGeo = new THREE.BoxGeometry(2.8, 0.06, 5.2);
    const lawnMesh = new THREE.Mesh(lawnGeo, lawnMat);
    lawnMesh.position.set(-2.4, 0.03, 0.4);
    lawnMesh.receiveShadow = true;
    mansionGroup.add(lawnMesh);

    // 2. Piscina de Borda Infinita com Prainha & Espelho d'Água
    const deckGeo = new THREE.BoxGeometry(4.2, 0.08, 3.2);
    const deckMesh = new THREE.Mesh(deckGeo, warmWoodDeckMat);
    deckMesh.position.set(1.6, 0.04, 1.4);
    deckMesh.receiveShadow = true;
    mansionGroup.add(deckMesh);

    // Bacia da piscina
    const poolGeo = new THREE.BoxGeometry(3.3, 0.08, 1.8);
    const poolMesh = new THREE.Mesh(poolGeo, luxuryWaterMat);
    poolMesh.position.set(1.8, 0.06, 1.6);
    mansionGroup.add(poolMesh);

    // Prainha rasa com espreguiçadeiras estilizadas
    const shallowWaterGeo = new THREE.BoxGeometry(0.8, 0.09, 1.8);
    const shallowWater = new THREE.Mesh(shallowWaterGeo, luxuryWaterMat);
    shallowWater.position.set(0.2, 0.06, 1.6);
    mansionGroup.add(shallowWater);

    // Duas espreguiçadeiras de design no deck
    const loungerGeo = new THREE.BoxGeometry(0.45, 0.06, 1.1);
    const loungerMat = new THREE.MeshStandardMaterial({ color: 0xf5f3ee, roughness: 0.3 });
    const lounger1 = new THREE.Mesh(loungerGeo, loungerMat);
    lounger1.position.set(1.2, 0.12, 2.75);
    lounger1.rotation.y = 0.1;
    lounger1.castShadow = true;
    mansionGroup.add(lounger1);

    const lounger2 = new THREE.Mesh(loungerGeo, loungerMat);
    lounger2.position.set(2.0, 0.12, 2.75);
    lounger2.rotation.y = 0.1;
    lounger2.castShadow = true;
    mansionGroup.add(lounger2);

    // 3. Lounge Rebaixado com Lareira Ecológica (Sunken Fire Pit)
    const firePitRimGeo = new THREE.BoxGeometry(0.9, 0.06, 0.9);
    const firePitRim = new THREE.Mesh(firePitRimGeo, darkCharredWoodMat);
    firePitRim.position.set(3.2, 0.08, 0.3);
    mansionGroup.add(firePitRim);

    const flameGeo = new THREE.BoxGeometry(0.4, 0.08, 0.4);
    const flame = new THREE.Mesh(flameGeo, fireMat);
    flame.position.set(3.2, 0.14, 0.3);
    mansionGroup.add(flame);

    const fireGlow = new THREE.PointLight(0xff7722, 2.0, 3.5);
    fireGlow.position.set(3.2, 0.35, 0.3);
    mansionGroup.add(fireGlow);

    // 4. Pavimento Térreo (Living Monumental com Pé-Direito Duplo)
    const groundSlabGeo = new THREE.BoxGeometry(4.4, 0.12, 3.8);
    const groundSlab = new THREE.Mesh(groundSlabGeo, smoothPlasterWhiteMat);
    groundSlab.position.set(0.3, 0.06, -0.6);
    groundSlab.receiveShadow = true;
    mansionGroup.add(groundSlab);

    // Parede imponente em concreto ripado com lareira central
    const concreteWallGeo = new THREE.BoxGeometry(0.6, 2.2, 1.8);
    const concreteWall = new THREE.Mesh(concreteWallGeo, concreteWallMat);
    concreteWall.position.set(-1.4, 1.1, -0.7);
    concreteWall.castShadow = true;
    concreteWall.receiveShadow = true;
    mansionGroup.add(concreteWall);

    // Cortina de Vidro Panorâmica (Grandes panos de vidro do living)
    const mainGlassGeo = new THREE.BoxGeometry(3.6, 1.9, 2.8);
    const mainGlass = new THREE.Mesh(mainGlassGeo, luxuryGlassMat);
    mainGlass.position.set(0.7, 1.05, -0.5);
    mansionGroup.add(mainGlass);

    // Esquadrias pretas minimalistas de piso a teto
    const glassMullions = new THREE.LineSegments(
      new THREE.EdgesGeometry(mainGlassGeo),
      new THREE.LineBasicMaterial({ color: 0x111317, transparent: true, opacity: 0.8 })
    );
    glassMullions.position.copy(mainGlass.position);
    mansionGroup.add(glassMullions);

    // Mobiliário interno silhueta (Sofá curvo italiano e mesa de centro visíveis através do vidro)
    const sofaGeo = new THREE.BoxGeometry(1.6, 0.35, 0.7);
    const sofaMat = new THREE.MeshStandardMaterial({ color: 0xded8ce, roughness: 0.7 });
    const sofa = new THREE.Mesh(sofaGeo, sofaMat);
    sofa.position.set(0.4, 0.3, -0.6);
    sofa.castShadow = true;
    mansionGroup.add(sofa);

    // Escada escultural flutuante interior
    for (let s = 0; s < 7; s++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.05, 0.22), warmWoodDeckMat);
      step.position.set(-0.8, 0.2 + s * 0.22, -1.3 + s * 0.14);
      mansionGroup.add(step);
    }

    // 5. Pavimento Superior em Balanço (Master Suite Cantilever de 4.8 metros)
    const upperCantileverGeo = new THREE.BoxGeometry(4.8, 1.5, 2.8);
    const upperCantilever = new THREE.Mesh(upperCantileverGeo, darkCharredWoodMat);
    upperCantilever.position.set(-0.3, 2.65, -0.2);
    upperCantilever.castShadow = true;
    upperCantilever.receiveShadow = true;
    mansionGroup.add(upperCantilever);

    // Laje intermediária com fita de LED embutida na face inferior
    const cantileverLedGeo = new THREE.BoxGeometry(4.6, 0.03, 2.6);
    const cantileverLed = new THREE.Mesh(cantileverLedGeo, ledStripMat);
    cantileverLed.position.set(-0.3, 1.88, -0.2);
    mansionGroup.add(cantileverLed);

    // Brises verticais de madeira ripada no volume superior (painéis pivotantes)
    for (let b = 0; b < 12; b++) {
      const brise = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.35, 0.12), bronzeMetalMat);
      brise.position.set(-0.6 + b * 0.22, 2.65, 1.25);
      brise.castShadow = true;
      mansionGroup.add(brise);
    }

    // Janela panorâmica da suíte master
    const masterGlassGeo = new THREE.BoxGeometry(1.9, 1.2, 0.08);
    const masterGlass = new THREE.Mesh(masterGlassGeo, luxuryGlassMat);
    masterGlass.position.set(-1.4, 2.65, 1.22);
    mansionGroup.add(masterGlass);

    // Varanda privativa da suíte com guarda-corpo de vidro sem moldura
    const railingGeo = new THREE.BoxGeometry(2.0, 0.5, 0.03);
    const railingMesh = new THREE.Mesh(railingGeo, luxuryGlassMat);
    railingMesh.position.set(-1.4, 2.15, 1.5);
    mansionGroup.add(railingMesh);

    // Cobertura / Platibanda com laje em concreto branco
    const roofGeo = new THREE.BoxGeometry(5.2, 0.12, 3.2);
    const roofMesh = new THREE.Mesh(roofGeo, smoothPlasterWhiteMat);
    roofMesh.position.set(-0.3, 3.45, -0.2);
    roofMesh.castShadow = true;
    mansionGroup.add(roofMesh);

    // 6. Pergolado em Aço Corten & Passarela de Acesso
    for (let p = 0; p < 6; p++) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.06, 0.06), bronzeMetalMat);
      beam.position.set(2.6, 1.9, -0.6 + p * 0.38);
      beam.castShadow = true;
      mansionGroup.add(beam);
    }

    // Pisadas de pedra flutuantes sobre a grama
    for (let st = 0; st < 5; st++) {
      const pathStep = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.04, 0.5), smoothPlasterWhiteMat);
      pathStep.position.set(-2.2, 0.09, -1.5 + st * 0.85);
      pathStep.receiveShadow = true;
      mansionGroup.add(pathStep);
    }

    // 7. Paisagismo Escultórico (Pinheiro Japonês / Ciprestes de Alta Arquitetura)
    const createLuxuryTree = (x: number, z: number, scale: number) => {
      const tree = new THREE.Group();
      // Tronco escultural em curva sutil
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.8 });
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.07, 1.2, 8), trunkMat);
      trunk.position.y = 0.6;
      trunk.castShadow = true;
      tree.add(trunk);

      // Copas arredondadas e densas (Nuvem de folhagem)
      const cloudMat = new THREE.MeshStandardMaterial({ color: 0x1f2e20, roughness: 0.7 });
      const c1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35, 1), cloudMat);
      c1.position.set(0, 1.2, 0);
      c1.scale.set(1.2, 0.6, 1.1);
      c1.castShadow = true;
      tree.add(c1);

      const c2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.28, 1), cloudMat);
      c2.position.set(0.2, 1.5, -0.1);
      c2.scale.set(1.1, 0.5, 0.9);
      c2.castShadow = true;
      tree.add(c2);

      // Spot de iluminação de paisagismo na base da árvore (uplight)
      const upLight = new THREE.PointLight(0xffe2b3, 1.2, 2.5);
      upLight.position.set(0, 0.1, 0);
      tree.add(upLight);

      tree.position.set(x, 0.05, z);
      tree.scale.set(scale, scale, scale);
      return tree;
    };

    mansionGroup.add(createLuxuryTree(-3.0, -1.2, 1.1));
    mansionGroup.add(createLuxuryTree(-3.2, 1.8, 0.9));
    mansionGroup.add(createLuxuryTree(3.2, -1.8, 1.0));

    // ==========================================
    // SISTEMA DE ILUMINAÇÃO DE PRESTÍGIO (DUSK / CREPÚSCULO)
    // ==========================================
    // Luz ambiente suave do céu noturno
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.55);
    scene.add(ambientLight);

    // Sol crepuscular quente dourado que gera sombras rasantes
    const goldenSun = new THREE.DirectionalLight(0xffe4ba, 2.4);
    goldenSun.position.set(12, 15, 9);
    goldenSun.castShadow = true;
    goldenSun.shadow.mapSize.width = 1024;
    goldenSun.shadow.mapSize.height = 1024;
    goldenSun.shadow.camera.near = 1;
    goldenSun.shadow.camera.far = 40;
    goldenSun.shadow.bias = -0.0008;
    scene.add(goldenSun);

    // Luz de preenchimento azulada (reflexo da abóbada celeste)
    const skyFill = new THREE.DirectionalLight(0x38bdf8, 0.8);
    skyFill.position.set(-10, 8, -8);
    scene.add(skyFill);

    // Luzes internas da residência (Warm Interior Glow que acende por dentro)
    const livingInteriorLight = new THREE.PointLight(0xffb74d, 3.2, 6.0);
    livingInteriorLight.position.set(0.6, 1.0, -0.5);
    mansionGroup.add(livingInteriorLight);

    const masterSuiteLight = new THREE.PointLight(0xffcc80, 2.5, 4.5);
    masterSuiteLight.position.set(-0.8, 2.6, 0.2);
    mansionGroup.add(masterSuiteLight);

    // Iluminação subaquática da piscina (luz ciano suave)
    const poolLight = new THREE.PointLight(0x2dd4bf, 1.8, 3.0);
    poolLight.position.set(1.8, 0.02, 1.6);
    mansionGroup.add(poolLight);

    // ==========================================
    // CONTROLES DE INTERATIVIDADE & ORBITAÇÃO SUAVE
    // ==========================================
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let autoRotate = true;
    let idleTimer: NodeJS.Timeout;

    let targetRotY = 0;
    let targetRotX = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      autoRotate = false;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      clearTimeout(idleTimer);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        targetRotY += deltaX * 0.008;
        targetRotX = Math.max(-0.25, Math.min(0.4, targetRotX + deltaY * 0.005));
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      }
    };

    const onMouseUp = () => {
      isDragging = false;
      // Retoma rotação automática suave após 3 segundos de inatividade
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        autoRotate = true;
      }, 3000);
    };

    const dom = renderer.domElement;
    dom.style.cursor = "grab";
    dom.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // Animação Contínua 60fps
    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      if (autoRotate) {
        targetRotY += delta * 0.15;
      }

      // Amortecimento suave (damping)
      mansionGroup.rotation.y += (targetRotY - mansionGroup.rotation.y) * 0.05;
      mansionGroup.rotation.x += (targetRotX - mansionGroup.rotation.x) * 0.05;

      // Leve oscilação de brasa da lareira
      flame.scale.y = 0.8 + Math.sin(elapsed * 12) * 0.25;

      // Posição vertical equilibrada
      mansionGroup.position.y = Math.sin(elapsed * 0.7) * 0.03 + 0.05;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      clearTimeout(idleTimer);
      dom.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("resize", handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      pmremGenerator.dispose();
      renderer.dispose();
    };
  }, []);

  if (hasWebGL === false) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <svg
          viewBox="0 0 200 200"
          className="w-48 h-48 text-[#D4AF37]/50 stroke-current fill-none stroke-[1.2]"
        >
          <polygon points="100,30 180,75 180,145 100,190 20,145 20,75" />
          <line x1="100" y1="30" x2="100" y2="190" />
          <line x1="20" y1="75" x2="180" y2="75" />
          <line x1="20" y1="145" x2="180" y2="145" />
        </svg>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[480px] sm:h-[560px] lg:h-[620px] flex flex-col items-center justify-center select-none group">
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
      />
      
      {/* Badge Editorial de Interação 360° */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B0D12]/90 backdrop-blur-md border border-[#D4AF37]/30 shadow-2xl whitespace-nowrap">
          <span className="flex h-1.5 w-1.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#D4AF37]" />
          </span>
          <span className="text-[10px] tracking-[0.2em] uppercase text-[#FBF9F5] font-mono">
            Visão 360° <span className="text-[#D4AF37] mx-0.5">•</span> Arraste para Girar
          </span>
        </div>
      </div>
    </div>
  );
}
