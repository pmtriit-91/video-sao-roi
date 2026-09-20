import React, { useEffect, useMemo, useRef } from "react";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";
import { ColorPalette } from "../config/types";

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
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const center = size / 2;
    const grad = ctx.createRadialGradient(center, center, 0, center, center, center);
    grad.addColorStop(0.0, "rgba(255, 255, 255, 1.0)");
    grad.addColorStop(0.16, "rgba(255, 255, 255, 0.95)");
    grad.addColorStop(0.38, "rgba(230, 245, 255, 0.60)");
    grad.addColorStop(0.68, "rgba(180, 220, 255, 0.18)");
    grad.addColorStop(1.0, "rgba(0, 0, 0, 0)");
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
  const { positions, randomData, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const rnd = new Float32Array(count * 4); // [twinkleSpeed, phase, baseSize, driftAmp]
    const col = new Float32Array(count * 3);

    // Kích thước hình học đĩa sàn 3D (đối xứng gương hoàn hảo với đĩa trần)
    const floorY = -465;       // Nâng nhẹ độ cao sàn để viền chân trời sàn đạt tỷ lệ 28% chuẩn xác
    const thicknessY = 50;     // Độ dày mỏng phẳng phiu của mặt sàn phản chiếu
    const centerZ = -180;      // Tâm đĩa sàn
    const radiusX = 1800;      // Bán kính ngang
    const radiusZ = 850;       // Bán kính sâu

    for (let i = 0; i < count; i++) {
      // Hàm băm giả ngẫu nhiên xác định (deterministic PRNG)
      const h1 = ((Math.sin(i * 15.7891 + 43.123) * 43758.5453) % 1 + 1) % 1;
      const h2 = ((Math.sin(i * 87.2341 + 12.987) * 24634.6345) % 1 + 1) % 1;
      const h3 = ((Math.sin(i * 39.4567 + 91.345) * 58392.1234) % 1 + 1) % 1;
      const h4 = ((Math.sin(i * 61.1234 + 55.678) * 39182.8765) % 1 + 1) % 1;
      const h5 = ((Math.sin(i * 28.9876 + 73.219) * 51829.4123) % 1 + 1) % 1;

      // Góc theta phân bố vòng quanh đĩa sàn:
      const theta = h1 * Math.PI * 2;

      // Bán kính r: Dồn hạt dày hơn ở vùng phản chiếu trung tâm và tràn đều ra viền
      let r: number;
      if (h2 < 0.58) {
        // 58% hạt dồn vào vũng sáng phản chiếu trung tâm (Hotspot)
        r = Math.pow(h3, 1.25) * 0.72;
      } else {
        // 42% hạt phủ đều ra toàn bộ mặt sàn đến sát tiền cảnh
        r = Math.pow(h3, 0.92);
      }

      // Trục hoành X và trục sâu Z:
      const x = Math.cos(theta) * r * radiusX;
      const z = centerZ + Math.sin(theta) * r * radiusZ;
      const normX = Math.abs(x) / radiusX;

      // Độ cao Y (Mặt phẳng sàn phẳng phiu, các hạt dao động cực nhẹ):
      let y = floorY + (h4 - 0.5) * thicknessY;

      // Tán xạ nhẹ bốc lên khỏi mặt sàn ở vùng trung tâm (hiệu ứng sương phản quang):
      const isCenterArea = normX < 0.42 && r < 0.65;
      if (isCenterArea && h3 > 0.70) {
        y += Math.pow(h5, 1.6) * 45;
      }

      pos[i * 3 + 0] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      // Kích thước quang học 2K/4K:
      const sizeRand = ((Math.sin(i * 317.11 + 61.4) * 43758.54) % 1 + 1) % 1;
      let baseSize = 2.4 + sizeRand * 2.8;

      // 1. Độ sáng trung tâm theo hàm Gauss mượt mà:
      const centerGlow = Math.exp(-Math.pow(normX / 0.44, 2.0));
      if (centerGlow > 0.30 && isCenterArea) {
        baseSize *= (1.0 + centerGlow * 0.50);
      }

      // 2. Hiệu ứng hạt Bokeh tiền cảnh (ở gần camera Z > 0, hạt to tròn mờ ảo):
      if (z > 50) {
        const frontScale = Math.min(1.0, (z - 50) / 600);
        baseSize *= (1.0 + frontScale * 0.85);
      }

      // Hạt sao kim cương lóe sáng trên sàn
      if (sizeRand > 0.80 && sizeRand <= 0.95) {
        baseSize = 6.5 + (sizeRand - 0.80) * 16.0;
      } else if (sizeRand > 0.95) {
        baseSize = 18.0 + (sizeRand - 0.95) * 65.0; // Tinh thể lóa sáng
      }

      rnd[i * 4 + 0] = 1.0 + (i % 8); // Tần số nguyên Seamless Loop 100%
      rnd[i * 4 + 1] = (i * 2.399) % (Math.PI * 2);
      rnd[i * 4 + 2] = baseSize;
      rnd[i * 4 + 3] = 0.35 + (i % 5) * 0.18;

      // Tông màu & Quang thông:
      // "Biên tối" 2 bên mép, "Vũng sáng phản chiếu" rực rỡ ở giữa
      const edgeFade = Math.max(0.1, Math.cos(normX * (Math.PI * 0.46)));
      const brightness = (0.78 + centerGlow * 0.85) * edgeFade;

      const colRand = ((Math.sin(i * 723.1 + 84.2) * 19283.4) % 1 + 1) % 1;
      if (colRand > 0.70) {
        col[i * 3 + 0] = 0.90 * brightness;
        col[i * 3 + 1] = 0.96 * brightness;
        col[i * 3 + 2] = 1.0 * brightness;
      } else {
        col[i * 3 + 0] = 1.0 * brightness;
        col[i * 3 + 1] = 1.0 * brightness;
        col[i * 3 + 2] = 1.0 * brightness;
      }
    }

    return { positions: pos, randomData: rnd, colors: col };
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
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(1);
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;

    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("randomData", new THREE.BufferAttribute(randomData, 4));
    geometry.setAttribute("customColor", new THREE.BufferAttribute(colors, 3));

    const starTexture = createFloorStarSprite();

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uLoopAngle: { value: 0 },
        uPointTexture: { value: starTexture },
      },
      vertexShader: `
        uniform float uLoopAngle;
        attribute vec4 randomData;
        attribute vec3 customColor;
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vColor = customColor;

          float freq = randomData.x;
          float phase = randomData.y;
          float baseSize = randomData.z;
          float driftAmp = randomData.w;

          float twinkle = sin(uLoopAngle * freq + phase);
          float alphaNorm = 0.50 + 0.50 * twinkle;
          vAlpha = alphaNorm;

          vec3 pos = position;
          pos.x += sin(uLoopAngle * 2.0 + phase) * driftAmp;
          pos.z += cos(uLoopAngle * 1.0 + phase) * (driftAmp * 0.8);

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

          gl_PointSize = baseSize * (1350.0 / -mvPosition.z) * (0.85 + 0.35 * twinkle);
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
  }, [width, height, positions, randomData, colors]);

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
        zIndex: 2,
      }}
    />
  );
};
