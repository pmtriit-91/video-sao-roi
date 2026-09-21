import React, { useEffect, useMemo, useRef } from "react";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";
import { ColorPalette } from "../config/types";

interface StageBeamsThreeProps {
  palette: ColorPalette;
  width?: number;
  height?: number;
  loopDurationFrames?: number;
}

interface BeamConfig {
  xTop: number;
  xBot: number;
  zTop: number;
  zBot: number;
  wTop: number;
  wBot: number;
  opacity: number;
  speed: number;
  phase: number;
}

export const StageBeamsThree: React.FC<StageBeamsThreeProps> = ({
  palette,
  width = 2560,
  height = 1440,
  loopDurationFrames = 2400,
}) => {
  const frame = useCurrentFrame();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);

  const loopAngle = (frame / loopDurationFrames) * Math.PI * 2;

  // 1. Dựng hình học 3D của các cột sáng:
  // - Tia sáng THẲNG TẮP 100%, không uốn khúc, không gãy khúc
  // - Độ lan tỏa và blur rộng mềm mại
  const { geometry } = useMemo(() => {
    const yTop = 650;
    const yBot = -530;

    // Cường độ vừa vặn: ở đỉnh sáng nhất không bị chói gắt, nhưng vẫn rõ ràng và mờ ảo
    // Tần số speed (4 - 7) và góc pha phase phân bố so le để các chùm sáng KHÔNG cùng sáng / cùng tối đồng thời
    const beams: BeamConfig[] = [
      // 1. Cột xa biên trái: thẳng tắp theo góc nghiêng phối cảnh, loe đuôi mềm mại
      { xTop: -750, xBot: -890, zTop: -220, zBot: -200, wTop: 100, wBot: 260, opacity: 0.28, speed: 6, phase: 0.785 },
      // 2. Cột trung trái: dải sáng lan tỏa mềm mại
      { xTop: -460, xBot: -550, zTop: -190, zBot: -170, wTop: 120, wBot: 300, opacity: 0.40, speed: 5, phase: 1.571 },
      // 3. Cột trong trái: dải sáng phông nền êm dịu
      { xTop: -230, xBot: -280, zTop: -170, zBot: -150, wTop: 130, wBot: 310, opacity: 0.35, speed: 7, phase: 0.000 },
      // 4. Cột trong phải: dải sáng phông nền êm dịu (lệch pha nửa chu kỳ so với cột trong trái)
      { xTop: 230,  xBot: 280,  zTop: -170, zBot: -150, wTop: 130, wBot: 310, opacity: 0.36, speed: 5, phase: 3.142 },
      // 5. Cột trung phải: điểm nhấn sáng chính (êm ái, thanh thoát)
      { xTop: 460,  xBot: 550,  zTop: -190, zBot: -170, wTop: 130, wBot: 330, opacity: 0.48, speed: 6, phase: 4.712 },
      // 6. Cột xa biên phải
      { xTop: 750,  xBot: 890,  zTop: -220, zBot: -200, wTop: 100, wBot: 260, opacity: 0.28, speed: 7, phase: 3.927 },
      // 7. Dải phụ xa biên trái
      { xTop: -950, xBot: -1100, zTop: -240, zBot: -220, wTop: 90,  wBot: 230, opacity: 0.22, speed: 4, phase: 2.356 },
      // 8. Dải phụ xa biên phải
      { xTop: 950,  xBot: 1100,  zTop: -240, zBot: -220, wTop: 90,  wBot: 230, opacity: 0.22, speed: 4, phase: 5.498 },
    ];

    const NUM_SEGMENTS = 32;
    const positions: number[] = [];
    const uvs: number[] = [];
    const uvqs: number[] = [];
    const beamData: number[] = [];
    const indices: number[] = [];

    let vertexOffset = 0;

    beams.forEach((b) => {
      const beamStartVertex = vertexOffset;

      // Phân chia cột sáng thành 32 phân đoạn dọc mịn màng
      for (let s = 0; s <= NUM_SEGMENTS; s++) {
        const t = s / NUM_SEGMENTS; // 0.0 = Sàn (yBot), 1.0 = Trần (yTop)
        const y = yBot + t * (yTop - yBot);
        const xCenter = b.xBot + t * (b.xTop - b.xBot);
        const z = b.zBot + t * (b.zTop - b.zBot);
        const w = b.wBot + t * (b.wTop - b.wBot);
        const halfW = w / 2;

        // Đỉnh bên trái của lát cắt (u = 0.0)
        positions.push(xCenter - halfW, y, z);
        uvs.push(0.0, t);
        uvqs.push(0.0, t * w, w);
        beamData.push(b.opacity, b.speed, b.phase, 0);

        // Đỉnh bên phải của lát cắt (u = 1.0)
        positions.push(xCenter + halfW, y, z);
        uvs.push(1.0, t);
        uvqs.push(1.0 * w, t * w, w);
        beamData.push(b.opacity, b.speed, b.phase, 0);

        vertexOffset += 2;
      }

      // Kết nối các mặt tam giác cho từng phân đoạn:
      for (let s = 0; s < NUM_SEGMENTS; s++) {
        const rowCurrent = beamStartVertex + s * 2;
        const rowNext = beamStartVertex + (s + 1) * 2;

        const bl = rowCurrent;
        const br = rowCurrent + 1;
        const tl = rowNext;
        const tr = rowNext + 1;

        indices.push(bl, tl, br);
        indices.push(br, tl, tr);
      }
    });

    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geom.setAttribute("aUvQ", new THREE.Float32BufferAttribute(uvqs, 3));
    geom.setAttribute("aBeamData", new THREE.Float32BufferAttribute(beamData, 4));
    geom.setIndex(indices);

    return { geometry: geom };
  }, []);

  // 2. Khởi tạo Three.js
  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(54, width / height, 1, 4000);
    camera.position.set(0, 0, 1350);
    camera.lookAt(0, 25, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(1);
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;

    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(renderer.domElement);

    const beamBaseColor = new THREE.Color(0.86, 0.93, 1.0);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uLoopAngle: { value: 0 },
        uColor: { value: beamBaseColor },
      },
      vertexShader: `
        uniform float uLoopAngle;
        attribute vec4 aBeamData;
        attribute vec3 aUvQ;
        varying vec2 vUv;
        varying vec3 vUvQ;
        varying float vBeamOpacity;
        varying float vPhase;

        void main() {
          vUv = uv;
          vUvQ = aUvQ;

          float opacityBase = aBeamData.x;
          float speedMult = aBeamData.y;
          float phase = aBeamData.z;
          vPhase = phase;

          // 1. Chuyển động quét góc nghệ thuật (Pivot Spotlight):
          // Neo cố định ở trần vòm sao (uv.y = 1.0 -> 0), thân và đuôi quét con lắc êm dịu (uv.y = 0.0 -> max)
          // Đảm bảo toán học: tia sáng vẫn giữ THẲNG TẮP 100% từ điểm neo trần xuống sàn
          float swayAmount = sin(uLoopAngle * 3.2 + phase) * 16.0;
          float sway = swayAmount * (1.0 - uv.y);

          // 2. Nhịp thở quang thông hữu cơ, bồng bềnh (nhân đôi tần số cho video 40s):
          float slowWave = sin(uLoopAngle * (speedMult * 2.0) + phase);
          float secondWave = sin(uLoopAngle * (speedMult * 4.0) + phase * 1.7) * 0.25;
          float normMod = clamp(0.5 + 0.5 * (slowWave * 0.80 + secondWave), 0.0, 1.0);

          float dynamicBreath = mix(0.22, 1.25, normMod);
          vBeamOpacity = opacityBase * dynamicBreath;

          vec3 pos = position;
          pos.x += sway;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying vec2 vUv;
        varying vec3 vUvQ;
        varying float vBeamOpacity;
        varying float vPhase;

        void main() {
          // Khôi phục tọa độ ngang u chính xác 100% bằng phép chia projective (không gãy khúc, không méo)
          float u = clamp(vUvQ.x / vUvQ.z, 0.0, 1.0);
          float v = vUv.y; // 0.0 = Sàn, 1.0 = Trần

          // Độ loe quang học mở rộng dần về phía sàn (v -> 0.0):
          // Đỉnh chụm tập trung (sigma = 0.32), càng xuống sàn càng loe nhẹ mềm mại (sigma = 0.44)
          float sigmaHalo = mix(0.44, 0.32, v);
          float sigmaCore = mix(0.18, 0.14, v);

          // 1. Cấu trúc 2 lớp quang học điện ảnh: Lõi sáng tinh tế (Core) + Quầng sương mờ (Halo)
          float core = exp(-pow((u - 0.5) / sigmaCore, 2.0));
          float halo = exp(-pow((u - 0.5) / sigmaHalo, 2.0));

          // Loe nhẹ thêm một quầng sáng khuếch tán sương khói ở phần đuôi tiếp giáp mặt sàn (v <= 0.38)
          float bottomFlare = exp(-pow((u - 0.5) / 0.46, 2.0)) * (1.0 - smoothstep(0.0, 0.38, v)) * 0.35;
          float lateralBase = halo * 0.60 + core * 0.50 + bottomFlare;

          // 2. Viền cạnh mềm mại, tan biến không gắt
          float edgeFade = smoothstep(0.0, 0.10, u) * (1.0 - smoothstep(0.90, 1.0, u));

          // 3. Các sợi tơ ánh sáng li ti (Light Striations / Micro-rays) chạy THẲNG TẮP dọc thân tia:
          // Tạo cảm giác ánh sáng chiếu qua làn khói sương sân khấu lung linh, sống động, phá tan sự phẳng lì
          float striation1 = sin(u * 42.0 + vPhase * 2.0) * 0.07;
          float striation2 = sin(u * 88.0 + vPhase * 4.0) * 0.04;
          float rayDetail = 1.0 + (striation1 + striation2) * smoothstep(0.15, 0.5, 1.0 - abs(u - 0.5) * 2.0);

          float totalLateral = lateralBase * edgeFade * rayDetail;

          // 4. Phân bố dọc tự nhiên: Đậm đà hơn ở nguồn phát vòm sao, tan mờ êm ái khi chạm sàn
          float topFade = 1.0 - smoothstep(0.70, 0.98, v);
          float botFade = smoothstep(0.02, 0.26, v);
          float vertProfile = topFade * botFade * mix(0.85, 1.15, v);

          float alpha = totalLateral * vertProfile * vBeamOpacity;
          if (alpha < 0.001) discard;

          // 5. Điểm nhấn màu sắc: Lõi sáng hơi ửng sáng trắng kim cương tinh khôi
          vec3 coreHighlight = mix(uColor, vec3(0.98, 0.99, 1.0), core * 0.32);
          gl_FragColor = vec4(coreHighlight * alpha * 1.30, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    materialRef.current = material;

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    return () => {
      renderer.forceContextLoss();
      renderer.dispose();
      material.dispose();
    };
  }, [width, height, geometry]);

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
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
      }}
    />
  );
};
