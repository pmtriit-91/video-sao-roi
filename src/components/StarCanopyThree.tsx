import React, { useEffect, useMemo, useRef } from 'react';
import { useCurrentFrame } from 'remotion';
import * as THREE from 'three';
import { ColorPalette } from '../config/types';

interface StarCanopyThreeProps {
    palette: ColorPalette;
    width?: number;
    height?: number;
    count?: number;
    loopDurationFrames?: number;
}

// 1. Sprite hạt bụi sao nền vòm trần mịn màng (Creamy Stardust Bokeh - 128px)
function createCanopyDustSprite(): THREE.Texture {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        const center = size / 2;
        ctx.clearRect(0, 0, size, size);
        const grad = ctx.createRadialGradient(center, center, 0, center, center, center * 0.88);
        grad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
        grad.addColorStop(0.15, 'rgba(255, 255, 255, 0.92)');
        grad.addColorStop(0.35, 'rgba(245, 248, 255, 0.55)');
        grad.addColorStop(0.65, 'rgba(215, 235, 255, 0.15)');
        grad.addColorStop(0.90, 'rgba(180, 210, 255, 0.02)');
        grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

// 2. Sprite điểm sáng tròn tỏa lấp lánh long lanh (Sparkling Circular Star Bloom - 256px HD)
function createCanopyStarFlareSprite(): THREE.Texture {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        const center = size / 2;
        ctx.clearRect(0, 0, size, size);

        // 1. Quầng tỏa sương phát quang mềm mại ngoài cùng (Outer Diffuse Shimmer Halo)
        const outerGrad = ctx.createRadialGradient(center, center, 0, center, center, center * 0.95);
        outerGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.45)');
        outerGrad.addColorStop(0.25, 'rgba(255, 248, 230, 0.28)');
        outerGrad.addColorStop(0.55, 'rgba(240, 225, 200, 0.10)');
        outerGrad.addColorStop(0.85, 'rgba(220, 210, 190, 0.02)');
        outerGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = outerGrad;
        ctx.fillRect(0, 0, size, size);

        // 2. Quầng hào quang pha lê tròn sáng rực (Luminous Crystal Bloom Halo)
        const bloomGrad = ctx.createRadialGradient(center, center, 0, center, center, center * 0.60);
        bloomGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.95)');
        bloomGrad.addColorStop(0.18, 'rgba(255, 252, 245, 0.82)');
        bloomGrad.addColorStop(0.40, 'rgba(255, 245, 220, 0.46)');
        bloomGrad.addColorStop(0.70, 'rgba(255, 235, 195, 0.15)');
        bloomGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = bloomGrad;
        ctx.fillRect(0, 0, size, size);

        // 3. Vành tán sắc ngọc trai / kim cương lấp lánh (Shimmering Prismatic Corona Ring)
        const ringGrad = ctx.createRadialGradient(center, center, center * 0.22, center, center, center * 0.38);
        ringGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0)');
        ringGrad.addColorStop(0.5, 'rgba(255, 250, 235, 0.42)');
        ringGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = ringGrad;
        ctx.beginPath();
        ctx.arc(center, center, center * 0.38, 0, Math.PI * 2);
        ctx.fill();

        // 4. Lớp ngọc sáng long lanh trung tâm (Glistening Diamond Core Halo)
        const innerGrad = ctx.createRadialGradient(center, center, 0, center, center, center * 0.22);
        innerGrad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
        innerGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.96)');
        innerGrad.addColorStop(0.70, 'rgba(255, 250, 240, 0.65)');
        innerGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = innerGrad;
        ctx.beginPath();
        ctx.arc(center, center, center * 0.22, 0, Math.PI * 2);
        ctx.fill();

        // 5. Lõi sáng kim cương rực rỡ trắng tinh ở tâm (Pure Specular Core)
        const coreGrad = ctx.createRadialGradient(center, center, 0, center, center, 11);
        coreGrad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
        coreGrad.addColorStop(0.65, 'rgba(255, 255, 255, 0.98)');
        coreGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(center, center, 11, 0, Math.PI * 2);
        ctx.fill();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

export const StarCanopyThree: React.FC<StarCanopyThreeProps> = ({
    palette,
    width = 2560,
    height = 1440,
    count = 18000,
    loopDurationFrames = 2400,
}) => {
    const frame = useCurrentFrame();
    const containerRef = useRef<HTMLDivElement | null>(null);

    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

    const dustMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
    const glintMaterialRef = useRef<THREE.ShaderMaterial | null>(null);

    const loopAngle = (frame / loopDurationFrames) * Math.PI * 2;

    // Phân tầng hệ thống hạt:
    // - dustCount (90%): Thảm bụi sao vòm trần bồng bềnh, mượt mà
    // - glintCount (10%): Các ngôi sao tinh thể 4 cánh lóe sáng long lanh như video gốc
    const {
        dustPositions, dustRandomData, dustColors,
        glintPositions, glintRandomData, glintColors, glintSparkles
    } = useMemo(() => {
        const cPrimary = new THREE.Color(palette.primary);
        const cSecondary = new THREE.Color(palette.secondary);

        // Số lượng hạt sao lấp lánh tròn tỏa sáng chuẩn điện ảnh:
        // Khoảng 360 hạt trong toàn bộ vòm trần để tại mỗi khung hình có khoảng 20-30 điểm sáng tròn bừng nở long lanh
        const glintCount = Math.min(360, Math.max(200, Math.round(count * 0.02)));
        const dustCount = count - glintCount;

        const dPos = new Float32Array(dustCount * 3);
        const dRnd = new Float32Array(dustCount * 4);
        const dCol = new Float32Array(dustCount * 3);

        const gPos = new Float32Array(glintCount * 3);
        const gRnd = new Float32Array(glintCount * 4);
        const gCol = new Float32Array(glintCount * 3);
        const gSpk = new Float32Array(glintCount);

        const ceilingY = 580;
        const thicknessY = 80;
        const centerZ = -150;
        const radiusX = 1300;
        const radiusZ_rear = 370;
        const radiusZ_front = 560;

        let dIdx = 0;
        let gIdx = 0;

        for (let i = 0; i < count; i++) {
            const h1 = (((Math.sin(i * 12.9898 + 78.233) * 43758.5453) % 1) + 1) % 1;
            const h2 = (((Math.sin(i * 93.9898 + 67.345) * 24634.6345) % 1) + 1) % 1;
            const h3 = (((Math.sin(i * 45.1232 + 19.876) * 58392.1234) % 1) + 1) % 1;
            const h4 = (((Math.sin(i * 73.4561 + 31.241) * 39182.8765) % 1) + 1) % 1;
            const h5 = (((Math.sin(i * 37.8912 + 82.119) * 51829.4123) % 1) + 1) % 1;

            const theta = h1 * Math.PI * 2;
            const isFlow = i % 2 === 0;

            let r: number;
            let flowSpeed: number;

            if (!isFlow) {
                r = Math.pow(h2, 1.25);
                flowSpeed = 2;
            } else {
                r = 0.2 + 0.85 * Math.pow(h2, 0.95);
                flowSpeed = i % 4 === 0 ? 4 : 2;
            }

            const effRadiusZ = Math.sin(theta) > 0 ? radiusZ_front : radiusZ_rear;
            const x = Math.cos(theta) * r * radiusX;
            const z = centerZ + Math.sin(theta) * r * effRadiusZ;
            const normX = Math.abs(x) / radiusX;

            let y = ceilingY + (h4 - 0.5) * thicknessY;
            const isRear = Math.sin(theta) < -0.15;
            if (isRear && h3 > 0.62) {
                y -= Math.pow(h5, 1.6) * 130;
            }

            const sizeRand = (((Math.sin(i * 513.11 + 23.4) * 43758.54) % 1) + 1) % 1;
            const flowPhase = (((h3 + i / count) % 1) + 1) % 1;
            const twinklePhase = (i * 2.399) % (Math.PI * 2);

            const edgeFade = Math.max(0.12, Math.cos(normX * (Math.PI * 0.46)));
            const brightness = 1.15 * edgeFade;

            const colRand = (((Math.sin(i * 841.3 + 17.2) * 19283.4) % 1) + 1) % 1;
            let cr = 1.0, cg = 1.0, cb = 1.0;
            if (colRand > 0.55) {
                cr = cSecondary.r;
                cg = cSecondary.g;
                cb = cSecondary.b;
            } else if (colRand > 0.2) {
                cr = cPrimary.r;
                cg = cPrimary.g;
                cb = cPrimary.b;
            }

            const isGlint = (i % 10 === 0) && gIdx < glintCount;

            if (isGlint) {
                gPos[gIdx * 3 + 0] = x;
                gPos[gIdx * 3 + 1] = y;
                gPos[gIdx * 3 + 2] = z;

                const glintFreq = 2.0 + (gIdx % 7); // Freq 2..8
                gSpk[gIdx] = glintFreq;

                // Các điểm sáng tròn ở viền ngoài và rìa rủ xuống sân khấu: nở hoa thị to tròn long lanh
                const isFringe = r > 0.35 || isRear;
                let baseSize = 7.5 + sizeRand * 6.0;
                if (isFringe) {
                    baseSize = 10.5 + sizeRand * 8.5;
                }

                gRnd[gIdx * 4 + 0] = flowSpeed;
                gRnd[gIdx * 4 + 1] = flowPhase;
                gRnd[gIdx * 4 + 2] = baseSize;
                gRnd[gIdx * 4 + 3] = twinklePhase;

                gCol[gIdx * 3 + 0] = cr * brightness * 1.1;
                gCol[gIdx * 3 + 1] = cg * brightness * 1.1;
                gCol[gIdx * 3 + 2] = cb * brightness * 1.1;

                gIdx++;
            } else if (dIdx < dustCount) {
                dPos[dIdx * 3 + 0] = x;
                dPos[dIdx * 3 + 1] = y;
                dPos[dIdx * 3 + 2] = z;

                // Tăng kích thước điểm sao li ti ở vòm trên: đạt ~4.4px đến 9.0px, bằng hoặc lớn hơn sàn dưới
                let baseSize = 4.4 + sizeRand * 4.6;
                if (!isFlow) baseSize *= 1.18;

                dRnd[dIdx * 4 + 0] = flowSpeed;
                dRnd[dIdx * 4 + 1] = flowPhase;
                dRnd[dIdx * 4 + 2] = baseSize;
                dRnd[dIdx * 4 + 3] = twinklePhase;

                dCol[dIdx * 3 + 0] = cr * brightness;
                dCol[dIdx * 3 + 1] = cg * brightness;
                dCol[dIdx * 3 + 2] = cb * brightness;

                dIdx++;
            }
        }

        return {
            dustPositions: dPos,
            dustRandomData: dRnd,
            dustColors: dCol,
            glintPositions: gPos,
            glintRandomData: gRnd,
            glintColors: gCol,
            glintSparkles: gSpk,
        };
    }, [count, palette]);

    useEffect(() => {
        if (!containerRef.current) return;

        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(54, width / height, 1, 4000);
        camera.position.set(0, 0, 1350);
        camera.lookAt(0, 0, 0);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance',
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(1);
        renderer.setClearColor(0x000000, 0);
        rendererRef.current = renderer;

        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(renderer.domElement);

        // 1. LAYER BỤI SAO NỀN (Dust Points - 90%)
        const dustGeometry = new THREE.BufferGeometry();
        dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
        dustGeometry.setAttribute('randomData', new THREE.BufferAttribute(dustRandomData, 4));
        dustGeometry.setAttribute('customColor', new THREE.BufferAttribute(dustColors, 3));

        const dustTexture = createCanopyDustSprite();
        const dustMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uLoopAngle: { value: 0 },
                uPointTexture: { value: dustTexture },
                uCenter: { value: new THREE.Vector3(0, 580, -150) },
            },
            vertexShader: `
        uniform float uLoopAngle;
        uniform vec3 uCenter;
        attribute vec4 randomData;
        attribute vec3 customColor;
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          float flowSpeed = randomData.x;
          float flowPhase = randomData.y;
          float baseSize = randomData.z;
          float twinklePhase = randomData.w;

          float progress = fract(flowPhase + uLoopAngle * flowSpeed / (6.28318530718));
          float rNorm = sqrt(progress);

          vec3 pos = mix(uCenter, position, rNorm);

          float twinkleFreq = (1.0 + mod(twinklePhase, 2.0)) * 2.0;
          float twinkle = sin(uLoopAngle * twinkleFreq + twinklePhase);
          float alphaNorm = 0.60 + 0.40 * twinkle;

          float fadeCenter = smoothstep(0.0, 0.05, progress);
          float fadeEdge = smoothstep(1.0, 0.82, progress);
          float alphaMult = fadeCenter * fadeEdge;
          float sizeGrowth = smoothstep(0.0, 0.08, progress) * (0.80 + 0.28 * twinkle);

          float distNorm = length(pos.xz - uCenter.xz) / 1220.0;
          float coreGlow = 1.0 + 0.55 * exp(-pow(distNorm / 0.35, 2.0));
          vec3 starColor = customColor * coreGlow;

          float fringeScale = clamp((length(pos.xz - uCenter.xz) - 350.0) / 600.0, 0.0, 1.0);
          sizeGrowth *= (1.0 + fringeScale * 0.35);

          vColor = starColor;
          vAlpha = alphaMult * alphaNorm;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = baseSize * sizeGrowth * (1350.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
            fragmentShader: `
        uniform sampler2D uPointTexture;
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vec4 texColor = texture2D(uPointTexture, gl_PointCoord);
          if (texColor.a < 0.01) discard;
          gl_FragColor = vec4(vColor * texColor.rgb * 1.25, texColor.a * vAlpha);
        }
      `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
        dustMaterialRef.current = dustMaterial;
        const dustPoints = new THREE.Points(dustGeometry, dustMaterial);
        scene.add(dustPoints);

        // 2. LAYER ĐIỂM SÁNG TRÒN TỎA LẤP LÁNH LONG LANH (Circular Sparkling Star Points)
        const glintGeometry = new THREE.BufferGeometry();
        glintGeometry.setAttribute('position', new THREE.BufferAttribute(glintPositions, 3));
        glintGeometry.setAttribute('randomData', new THREE.BufferAttribute(glintRandomData, 4));
        glintGeometry.setAttribute('customColor', new THREE.BufferAttribute(glintColors, 3));
        glintGeometry.setAttribute('sparkle', new THREE.BufferAttribute(glintSparkles, 1));

        const flareTexture = createCanopyStarFlareSprite();
        const glintMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uLoopAngle: { value: 0 },
                uPointTexture: { value: flareTexture },
                uCenter: { value: new THREE.Vector3(0, 580, -150) },
            },
            vertexShader: `
        uniform float uLoopAngle;
        uniform vec3 uCenter;
        attribute vec4 randomData;
        attribute vec3 customColor;
        attribute float sparkle;
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          float flowSpeed = randomData.x;
          float flowPhase = randomData.y;
          float baseSize = randomData.z;
          float twinklePhase = randomData.w;

          float progress = fract(flowPhase + uLoopAngle * flowSpeed / (6.28318530718));
          float rNorm = sqrt(progress);

          vec3 pos = mix(uCenter, position, rNorm);

          float fadeCenter = smoothstep(0.0, 0.04, progress);
          float fadeEdge = smoothstep(1.0, 0.85, progress);
          float alphaMult = fadeCenter * fadeEdge;

          // Hiệu ứng chớp lóe điểm sáng tròn đa tần số chuẩn Seamless Loop 100%
          float glintFreq = sparkle;
          float wave = abs(sin(uLoopAngle * glintFreq + twinklePhase));
          float flash = pow(wave, 4.0);

          float sizeGrowth = 0.30 + flash * 2.8; // Khi nghỉ: điểm sáng nhỏ gọn, khi chớp: bung nở quầng sáng tròn long lanh
          float alphaNorm = 0.22 + flash * 2.6;

          vec3 starColor = mix(customColor * 1.15, vec3(3.8, 3.8, 4.2), flash * 0.95);

          vColor = starColor;
          vAlpha = alphaMult * alphaNorm;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          float calculatedSize = baseSize * sizeGrowth * (1350.0 / -mvPosition.z);
          gl_PointSize = min(calculatedSize, 95.0); // Khóa trần 95px cho điểm sáng tròn bung nở rực rỡ
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
            fragmentShader: `
        uniform sampler2D uPointTexture;
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vec4 texColor = texture2D(uPointTexture, gl_PointCoord);
          if (texColor.a < 0.01) discard;
          gl_FragColor = vec4(vColor * texColor.rgb * 1.35, texColor.a * vAlpha);
        }
      `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
        glintMaterialRef.current = glintMaterial;
        const glintPoints = new THREE.Points(glintGeometry, glintMaterial);
        scene.add(glintPoints);

        return () => {
            renderer.forceContextLoss();
            renderer.dispose();
            dustGeometry.dispose();
            dustMaterial.dispose();
            glintGeometry.dispose();
            glintMaterial.dispose();
        };
    }, [width, height, dustPositions, dustRandomData, dustColors, glintPositions, glintRandomData, glintColors, glintSparkles]);

    useEffect(() => {
        if (dustMaterialRef.current) {
            dustMaterialRef.current.uniforms.uLoopAngle.value = loopAngle;
        }
        if (glintMaterialRef.current) {
            glintMaterialRef.current.uniforms.uLoopAngle.value = loopAngle;
        }
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
            rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
    }, [frame, loopAngle]);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 1,
            }}
        />
    );
};
