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

  // 1. Dựng hình học 3D của các cột sáng kết nối trần vòm và sàn sân khấu
  // Ánh sáng KHÔNG chiếu thẳng đứng 90 độ, mà tỏa quạt (fan-out) theo không gian 3D
  // nhìn từ góc khán giả lên sân khấu: đỉnh trần hẹp hơn, chân sàn mở rộng hơn.
  const { geometry } = useMemo(() => {
    // Đỉnh cắm sâu vào trong lòng vòm sao trần để ẩn mối nối
    const yTop = 660;
    // Chân cắm sâu xuống dưới mặt phẳng sàn để tan biến mượt mà vào lớp kim tuyến
    const yBot = -540;

    // Phân bổ 6 cột sáng chính theo tỷ lệ chuẩn của video gốc (frame_2s):
    // Trung tâm để khoảng trống vừa vặn cho Logo Monogram & Tên Dâu Rể
    const beams: BeamConfig[] = [
      // 1. Cột xa biên trái: nghiêng mạnh ra mép trái
      { xTop: -780, xBot: -1060, zTop: -230, zBot: -210, wTop: 140, wBot: 390, opacity: 0.28, speed: 1, phase: 0.4 },
      // 2. Cột trung trái: dải sáng mềm mại bên cánh trái
      { xTop: -480, xBot: -660,  zTop: -200, zBot: -180, wTop: 160, wBot: 430, opacity: 0.45, speed: 2, phase: 1.2 },
      // 3. Cột trong trái: dải sáng phông nền sau chữ
      { xTop: -240, xBot: -340,  zTop: -180, zBot: -160, wTop: 170, wBot: 450, opacity: 0.32, speed: 1, phase: 2.5 },
      // 4. Cột trong phải: dải sáng phông nền sau chữ
      { xTop: 240,  xBot: 340,   zTop: -180, zBot: -160, wTop: 170, wBot: 450, opacity: 0.35, speed: 2, phase: 3.8 },
      // 5. Cột trung phải: CỘT SÁNG NỔI BẬT NHẤT (điểm nhấn thị giác mạnh như trong video gốc)
      { xTop: 480,  xBot: 670,   zTop: -200, zBot: -180, wTop: 180, wBot: 480, opacity: 0.58, speed: 1, phase: 4.6 },
      // 6. Cột xa biên phải: nghiêng mạnh ra mép phải
      { xTop: 780,  xBot: 1060,  zTop: -230, zBot: -210, wTop: 140, wBot: 390, opacity: 0.28, speed: 2, phase: 5.4 },
      // 7. Dải sáng phụ mềm xa biên trái
      { xTop: -980, xBot: -1250, zTop: -250, zBot: -230, wTop: 120, wBot: 350, opacity: 0.16, speed: 1, phase: 0.8 },
      // 8. Dải sáng phụ mềm xa biên phải
      { xTop: 980,  xBot: 1250,  zTop: -250, zBot: -230, wTop: 120, wBot: 350, opacity: 0.16, speed: 2, phase: 5.8 },
    ];

    const positions: number[] = [];
    const uvs: number[] = [];
    const beamData: number[] = [];
    const indices: number[] = [];

    let vertexOffset = 0;

    beams.forEach((b) => {
      // Các dải sáng hướng trực diện về phía camera khán giả
      // giúp phân bố ánh sáng Gauss hoàn toàn mịn màng, không có sọc nén góc nghiêng
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

    // Tone màu băng tuyết / xanh ngọc nhạt sang trọng
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

          // Chuyển động lắc lư quét nhẹ theo góc pha nguyên Seamless Loop 100%
          float sway = sin(uLoopAngle * speedMult + phase) * 14.0;
          // Nhịp thở quang thông êm ái
          float breath = 0.86 + 0.14 * sin(uLoopAngle * speedMult + phase * 1.3);
          vBeamOpacity = opacityBase * breath;

          vec3 pos = position;
          // Lắc nhẹ ở phần chân tiếp xúc sàn, đỉnh neo ổn định ở trần
          float heightNorm = clamp((pos.y - (-540.0)) / (660.0 - (-540.0)), 0.0, 1.0);
          pos.x += sway * (1.0 - heightNorm * 0.7);

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

          // 1. Phân bố ngang theo hàm Gauss cực kỳ mềm mại
          float lateral = exp(-pow((u - 0.5) / 0.24, 2.0));
          // Làm mượt triệt để 2 mép biên
          float edgeFade = smoothstep(0.0, 0.20, u) * smoothstep(1.0, 0.80, u);
          float totalLateral = lateral * edgeFade;

          // 2. Phân bố dọc kết nối Trần - Sàn:
          // Đầu trên (Trần): Tan mờ êm dịu sâu trong vòm sao
          float topFade = smoothstep(1.0, 0.65, v);
          // Đầu dưới (Sàn): Tan mờ êm dịu sâu dưới mặt phẳng sàn
          float botFade = smoothstep(0.0, 0.18, v);
          // Tăng nhẹ cường độ ở đoạn thân và phần phản chiếu sàn
          float bodyGlow = 0.85 + 0.35 * smoothstep(0.35, 0.10, v);

          float vertProfile = topFade * botFade * bodyGlow;

          float alpha = totalLateral * vertProfile * vBeamOpacity;
          if (alpha < 0.001) discard;

          // Ánh sáng kim cương phát quang
          gl_FragColor = vec4(uColor * alpha * 1.15, alpha);
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
        zIndex: 1, // Nằm sau vòm sao & sàn sao để cộng sáng tự nhiên
      }}
    />
  );
};
