import React, { useEffect, useMemo, useRef } from 'react';
import { useCurrentFrame } from 'remotion';
import * as THREE from 'three';
import { ColorPalette } from '../config/types';

interface StageFloorThreeProps {
    palette: ColorPalette;
    width?: number;
    height?: number;
    count?: number;
    loopDurationFrames?: number;
}

// Tạo sprite hạt sao phản chiếu sàn kim cương phát quang chuẩn quang học
function createFloorStarSprite(): THREE.Texture {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        const center = size / 2;
        const grad = ctx.createRadialGradient(center, center, 0, center, center, center);
        grad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
        grad.addColorStop(0.16, 'rgba(255, 255, 255, 0.95)');
        grad.addColorStop(0.38, 'rgba(230, 245, 255, 0.60)');
        grad.addColorStop(0.68, 'rgba(180, 220, 255, 0.18)');
        grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

export const StageFloorThree: React.FC<StageFloorThreeProps> = ({
    palette,
    width = 2560,
    height = 1440,
    count = 35000,
    loopDurationFrames = 1200,
}) => {
    const frame = useCurrentFrame();
    const containerRef = useRef<HTMLDivElement | null>(null);

    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const materialRef = useRef<THREE.ShaderMaterial | null>(null);

    const loopAngle = (frame / loopDurationFrames) * Math.PI * 2;

    // 1. Phối cảnh 3D Đĩa Sàn Sao Ngang (Horizontal Perspective Floor Disc) đối xứng với Trần sao
    const { positions, randomData, colors, sparkles } = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const rnd = new Float32Array(count * 4); // [twinkleSpeed, phase, baseSize, driftAmp]
        const col = new Float32Array(count * 3);
        const sparkles = new Float32Array(count); // Tần số chớp của hạt lấp lánh mạnh (0: bình thường, 3..8: chớp lóe)

        // Kích thước hình học đĩa sàn 3D:
        // Thu nhỏ vừa phải (scale = 0.72) để sàn rộng hơn vòm trần, tạo bệ đỡ ánh sáng vững chãi
        const scale = 0.68;
        const floorY = -465; // Nâng nhẹ độ cao sàn để viền chân trời sàn đạt tỷ lệ chuẩn xác
        const thicknessY = 50; // Độ dày mỏng phẳng phiu của mặt sàn phản chiếu
        const centerZ = -80; // Tâm đĩa sàn
        const radiusX = 1800 * scale; // Bán kính ngang (1224)
        const radiusZ = 900 * scale; // Bán kính sâu (578)

        for (let i = 0; i < count; i++) {
            // Hàm băm giả ngẫu nhiên xác định (deterministic PRNG)
            const h1 = (((Math.sin(i * 15.7891 + 43.123) * 43758.5453) % 1) + 1) % 1;
            const h2 = (((Math.sin(i * 87.2341 + 12.987) * 24634.6345) % 1) + 1) % 1;
            const h3 = (((Math.sin(i * 39.4567 + 91.345) * 58392.1234) % 1) + 1) % 1;
            const h4 = (((Math.sin(i * 61.1234 + 55.678) * 39182.8765) % 1) + 1) % 1;
            const h5 = (((Math.sin(i * 28.9876 + 73.219) * 51829.4123) % 1) + 1) % 1;

            const theta = h1 * Math.PI * 2;
            const isFlow = i % 2 === 0; // 50% hạt nền tĩnh êm ả làm bệ đỡ thị giác, 50% hạt trôi thong thả

            let r: number;
            let flowSpeed: number;

            if (!isFlow) {
                // Hạt vùng lõi & trung tâm: phân bố lũy thừa tạo đĩa sáng tâm rực rỡ
                r = Math.pow(h2, 1.25);
                flowSpeed = 1; // 100% hạt đều tham gia vào dòng chảy lan tỏa
            } else {
                // Hạt vươn rộng ra toàn sàn
                r = 0.2 + 0.85 * Math.pow(h2, 0.95);
                flowSpeed = i % 4 === 0 ? 2 : 1;
            }

            // Trục hoành X và trục sâu Z của đích đến lan tỏa:
            const x = Math.cos(theta) * r * radiusX;
            const z = centerZ + Math.sin(theta) * r * radiusZ;
            const normX = Math.abs(x) / radiusX;

            // Độ cao Y (Mặt phẳng sàn phẳng phiu, các hạt dao động cực nhẹ):
            let y = floorY + (h4 - 0.5) * thicknessY;

            // Tán xạ nhẹ bốc lên khỏi mặt sàn ở vùng trung tâm (hiệu ứng sương phản quang):
            const isCenterArea = normX < 0.42 && r < 0.65;
            if (isCenterArea && h3 > 0.7) {
                y += Math.pow(h5, 1.6) * 45;
            }

            pos[i * 3 + 0] = x;
            pos[i * 3 + 1] = y;
            pos[i * 3 + 2] = z;

            // Kích thước quang học 2K/4K:
            const sizeRand = (((Math.sin(i * 317.11 + 61.4) * 43758.54) % 1) + 1) % 1;
            let baseSize = 2.4 + sizeRand * 2.8;

            if (!isFlow) {
                baseSize *= 1.1; // Hạt nền ổn định, sáng rõ
            }

            // Hạt sao kim cương lóe sáng trên sàn
            if (sizeRand > 0.8 && sizeRand <= 0.95) {
                baseSize = 6.5 + (sizeRand - 0.8) * 16.0;
            } else if (sizeRand > 0.95) {
                baseSize = 18.0 + (sizeRand - 0.95) * 65.0; // Tinh thể lóa sáng
            }

            // Điểm xuyết ~2% hạt lấp lánh mạnh (mật độ thưa, ngẫu nhiên khắp sàn)
            const isSparkle = i % 45 === 0;
            let sparkleSpeed = 0;
            if (isSparkle) {
                sparkleSpeed = 3 + (i % 6); // Chu kỳ chớp số nguyên (3..8) để Seamless Loop 100%
                baseSize = Math.max(baseSize, 6.0 + sizeRand * 5.0);
            }
            sparkles[i] = sparkleSpeed;

            const flowPhase = (((h3 + i / count) % 1) + 1) % 1;
            const twinklePhase = (i * 2.399) % (Math.PI * 2);

            rnd[i * 4 + 0] = flowSpeed;
            rnd[i * 4 + 1] = flowPhase;
            rnd[i * 4 + 2] = baseSize;
            rnd[i * 4 + 3] = twinklePhase;

            // Tông màu & Quang thông:
            const edgeFade = Math.max(0.12, Math.cos(normX * (Math.PI * 0.46)));
            const brightness = 1.15 * edgeFade;

            const colRand = (((Math.sin(i * 723.1 + 84.2) * 19283.4) % 1) + 1) % 1;
            if (colRand > 0.7) {
                col[i * 3 + 0] = 0.9 * brightness;
                col[i * 3 + 1] = 0.96 * brightness;
                col[i * 3 + 2] = 1.0 * brightness;
            } else {
                col[i * 3 + 0] = 1.0 * brightness;
                col[i * 3 + 1] = 1.0 * brightness;
                col[i * 3 + 2] = 1.0 * brightness;
            }
        }

        return { positions: pos, randomData: rnd, colors: col, sparkles };
    }, [count]);

    // 2. Khởi tạo Three.js
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

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('randomData', new THREE.BufferAttribute(randomData, 4));
        geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('sparkle', new THREE.BufferAttribute(sparkles, 1));

        const starTexture = createFloorStarSprite();

        const material = new THREE.ShaderMaterial({
            uniforms: {
                uLoopAngle: { value: 0 },
                uPointTexture: { value: starTexture },
                uCenter: { value: new THREE.Vector3(0, -465, -80) },
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

          // 1. Dòng chảy lan tỏa 100% từ tâm ra ngoài (Pure Radial Outward Flow), Seamless Loop 100%
          float progress = fract(flowPhase + (uLoopAngle / 6.283185307) * flowSpeed);
          float rNorm = pow(progress, 0.95);

          vec3 pos = mix(uCenter, position, rNorm);

          // Nhịp nhấp nháy êm dịu, không giật chớp loạn mắt
          float twinkleFreq = 1.0 + mod(twinklePhase, 2.0);
          float twinkle = sin(uLoopAngle * twinkleFreq + twinklePhase);
          float alphaNorm = 0.70 + 0.30 * twinkle;

          // Fade-in mềm ở tâm và Fade-out mượt ở rìa ngoài
          float fadeCenter = smoothstep(0.0, 0.05, progress);
          float fadeEdge = smoothstep(1.0, 0.82, progress);
          float alphaMult = fadeCenter * fadeEdge;
          float sizeGrowth = smoothstep(0.0, 0.08, progress) * (0.85 + 0.25 * twinkle);

          // Nở Bokeh khi tia bắn tràn về gần camera (Z > 50)
          float frontScale = clamp((pos.z - 50.0) / 450.0, 0.0, 1.0);
          sizeGrowth *= (1.0 + frontScale * 0.85);

          // Tăng nhẹ độ sáng ở vùng tâm
          float distNorm = length(pos.xz - uCenter.xz) / 1224.0;
          float coreGlow = 1.0 + 0.55 * exp(-pow(distNorm / 0.35, 2.0));
          vec3 starColor = customColor * coreGlow;

          // Điểm xuyết hạt sáng lấp lánh mạnh (~2% mật độ)
          if (sparkle > 0.5) {
            float flash = pow(max(0.0, sin(uLoopAngle * sparkle + twinklePhase * 2.0)), 6.0);
            sizeGrowth *= (1.0 + flash * 1.5);
            alphaMult = min(1.0, alphaMult + flash * 0.4);
            alphaNorm = min(1.0, alphaNorm + flash * 0.5);
            starColor = mix(starColor, vec3(2.2, 2.2, 2.5), flash * 0.9);
          }

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
          gl_FragColor = vec4(vColor * texColor.rgb * 1.3, texColor.a * vAlpha);
        }
      `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
        materialRef.current = material;

        const points = new THREE.Points(geometry, material);
        scene.add(points);

        return () => {
            renderer.dispose();
            geometry.dispose();
            material.dispose();
        };
    }, [width, height, positions, randomData, colors, sparkles]);

    useEffect(() => {
        if (materialRef.current) {
            materialRef.current.uniforms.uLoopAngle.value = loopAngle;
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
                zIndex: 2,
            }}
        />
    );
};
