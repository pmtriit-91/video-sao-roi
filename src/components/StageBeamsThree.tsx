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
  loopDurationFrames = 1200,
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
      // 1. Cột xa biên trái: thẳng tắp theo góc nghiêng phối cảnh
      { xTop: -750, xBot: -890, zTop: -220, zBot: -200, wTop: 110, wBot: 200, opacity: 0.28, speed: 6, phase: 0.785 },
      // 2. Cột trung trái: dải sáng lan tỏa mềm mại
      { xTop: -460, xBot: -550, zTop: -190, zBot: -170, wTop: 130, wBot: 230, opacity: 0.40, speed: 5, phase: 1.571 },
      // 3. Cột trong trái: dải sáng phông nền êm dịu
      { xTop: -230, xBot: -280, zTop: -170, zBot: -150, wTop: 140, wBot: 240, opacity: 0.35, speed: 7, phase: 0.000 },
      // 4. Cột trong phải: dải sáng phông nền êm dịu (lệch pha nửa chu kỳ so với cột trong trái)
      { xTop: 230,  xBot: 280,  zTop: -170, zBot: -150, wTop: 140, wBot: 240, opacity: 0.36, speed: 5, phase: 3.142 },
      // 5. Cột trung phải: điểm nhấn sáng chính (êm ái, thanh thoát)
      { xTop: 460,  xBot: 550,  zTop: -190, zBot: -170, wTop: 140, wBot: 250, opacity: 0.48, speed: 6, phase: 4.712 },
      // 6. Cột xa biên phải
      { xTop: 750,  xBot: 890,  zTop: -220, zBot: -200, wTop: 110, wBot: 200, opacity: 0.28, speed: 7, phase: 3.927 },
      // 7. Dải phụ xa biên trái
      { xTop: -950, xBot: -1100, zTop: -240, zBot: -220, wTop: 100, wBot: 180, opacity: 0.22, speed: 4, phase: 2.356 },
      // 8. Dải phụ xa biên phải
      { xTop: 950,  xBot: 1100,  zTop: -240, zBot: -220, wTop: 100, wBot: 180, opacity: 0.22, speed: 4, phase: 5.498 },
    ];

    const positions: number[] = [];
    const uvs: number[] = [];
    const beamData: number[] = [];
    const indices: number[] = [];

    let vertexOffset = 0;

    beams.forEach((b) => {
      const halfWTop = b.wTop / 2;
      const halfWBot = b.wBot / 2;

      // Đỉnh 0: Top-Left
      positions.push(b.xTop - halfWTop, yTop, b.zTop);
      uvs.push(0.0, 1.0);
      beamData.push(b.opacity, b.speed, b.phase, 0);

      // Đỉnh 1: Top-Right
      positions.push(b.xTop + halfWTop, yTop, b.zTop);
      uvs.push(1.0, 1.0);
      beamData.push(b.opacity, b.speed, b.phase, 0);

      // Đỉnh 2: Bottom-Left
      positions.push(b.xBot - halfWBot, yBot, b.zBot);
      uvs.push(0.0, 0.0);
      beamData.push(b.opacity, b.speed, b.phase, 0);

      // Đỉnh 3: Bottom-Right
      positions.push(b.xBot + halfWBot, yBot, b.zBot);
      uvs.push(1.0, 0.0);
      beamData.push(b.opacity, b.speed, b.phase, 0);

      indices.push(
        vertexOffset + 0,
        vertexOffset + 2,
        vertexOffset + 1,
        vertexOffset + 1,
        vertexOffset + 2,
        vertexOffset + 3
      );

      vertexOffset += 4;
    });

    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
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
        varying vec2 vUv;
        varying float vBeamOpacity;

        void main() {
          vUv = uv;

          float opacityBase = aBeamData.x;
          float speedMult = aBeamData.y;
          float phase = aBeamData.z;

          // Chuyển động lắc nhẹ đồng bộ toàn thân để giữ tia luôn THẲNG TẮP (dao động chậm rãi êm dịu)
          float sway = sin(uLoopAngle * 2.0 + phase) * 5.0;

          // Nhịp thở quang thông sống động (sáng và chìm tối nhanh hơn, tương phản rõ nét):
          float slowWave = sin(uLoopAngle * speedMult + phase);
          float secondWave = sin(uLoopAngle * (speedMult * 2.0) + phase * 1.7) * 0.25;
          float normMod = clamp(0.5 + 0.5 * (slowWave * 0.80 + secondWave), 0.0, 1.0);

          // Chìm tối xuống 0.20 và tăng nhẹ đỉnh sáng nhất từ 1.0 lên 1.22:
          float dynamicBreath = mix(0.20, 1.22, normMod);
          vBeamOpacity = opacityBase * dynamicBreath;

          vec3 pos = position;
          // Dịch chuyển thẳng đều toàn bộ thân tia
          pos.x += sway;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying vec2 vUv;
        varying float vBeamOpacity;

        void main() {
          float u = vUv.x;
          float v = vUv.y; // 0.0 = Sàn, 1.0 = Trần

          // 1. Phân bố ngang: Tăng tối đa độ lan tỏa và độ blur (Gauss sigma = 0.32)
          // Toàn bộ chùm sáng mờ ảo, lan tỏa đều, không có lõi sắc nhọn
          float lateral = exp(-pow((u - 0.5) / 0.32, 2.0));
          float edgeFade = smoothstep(0.0, 0.10, u) * smoothstep(1.0, 0.90, u);
          float totalLateral = lateral * edgeFade;

          // 2. Phân bố dọc THẲNG TẮP, liên tục, KHÔNG khúc gãy, KHÔNG gợn sóng:
          float topFade = smoothstep(1.0, 0.72, v);
          float botFade = smoothstep(0.0, 0.22, v);
          float vertProfile = topFade * botFade;

          float alpha = totalLateral * vertProfile * vBeamOpacity;
          if (alpha < 0.001) discard;

          gl_FragColor = vec4(uColor * alpha * 1.25, alpha);
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
