import React, { useEffect, useMemo, useRef } from "react";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";
import { ColorPalette } from "../config/types";

interface StarCanopyThreeProps {
  palette: ColorPalette;
  width?: number;
  height?: number;
  count?: number;
  loopDurationFrames?: number;
}

// Tạo sprite hạt sao tròn mềm mại phát quang chuẩn quang học
// Tạo sprite hạt sao kim cương phát quang chuẩn quang học
function createStarSprite(): THREE.Texture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const center = size / 2;
    const grad = ctx.createRadialGradient(center, center, 0, center, center, center);
    grad.addColorStop(0.0, "rgba(255, 255, 255, 1.0)");
    grad.addColorStop(0.15, "rgba(255, 255, 255, 0.95)");
    grad.addColorStop(0.35, "rgba(235, 245, 255, 0.60)");
    grad.addColorStop(0.65, "rgba(185, 225, 255, 0.18)");
    grad.addColorStop(1.0, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export const StarCanopyThree: React.FC<StarCanopyThreeProps> = ({
  palette,
  width = 2560,
  height = 1440,
  count = 12000,
  loopDurationFrames = 1200,
}) => {
  const frame = useCurrentFrame();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);

  const loopAngle = (frame / loopDurationFrames) * Math.PI * 2;

  // 1. Phối cảnh 3D vòm trần cong hình chữ U (Smiling Arch) chuẩn video gốc
  const { positions, randomData, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const rnd = new Float32Array(count * 4); // [twinkleSpeed, phase, baseSize, driftAmp]
    const col = new Float32Array(count * 3);

    // Bề rộng vòm bao trùm toàn bộ màn hình 2560px
    const halfSpanX = 1450;

    for (let i = 0; i < count; i++) {
      // Hàm băm giả ngẫu nhiên xác định (deterministic PRNG)
      const h1 = ((Math.sin(i * 12.9898 + 78.233) * 43758.5453) % 1 + 1) % 1;
      const h2 = ((Math.sin(i * 93.9898 + 67.345) * 24634.6345) % 1 + 1) % 1;
      const h3 = ((Math.sin(i * 45.1232 + 19.876) * 58392.1234) % 1 + 1) % 1;
      const h4 = ((Math.sin(i * 73.4561 + 31.241) * 39182.8765) % 1 + 1) % 1;

      // Trục hoành X: trải dài đều từ góc trái sang góc phải
      const x = (h1 * 2.0 - 1.0) * halfSpanX;
      const normX = Math.abs(x) / halfSpanX;

      // Đường biên đáy vòm đỉnh U-Arch (Smiling Rim):
      // Ở trung tâm (x = 0): đáy vòm hạ xuống y = 330 (cách đỉnh Logo khoảng 40px)
      // Ở 2 bên biên (x = ±1450): uốn lượn cong vểnh lên y = 500
      const archBottomY = 330 + Math.pow(normX, 1.6) * 170;
      const skyTopY = 730; // Mép trên cùng của khung hình

      // Phân bố hạt: Phủ kín từ mép trên xuống đến đường biên vòm,
      // tập trung mật độ đậm đặc nhất ở viền đáy và trục giữa (hiệu ứng đèn rọi)
      let y: number;
      if (h2 < 0.60) {
        // Nhóm 1 (60%): Lớp mây trần phủ đều từ viền đáy lên đỉnh trời,
        // lũy thừa 1.7 giúp hạt dồn dày nhất ở viền phát sáng
        y = archBottomY + Math.pow(h3, 1.7) * (skyTopY - archBottomY);
      } else if (h2 < 0.88) {
        // Nhóm 2 (28%): Dải lõi kim cương đậm đặc ngay sát viền đáy vòm tạo đường nét rõ ràng
        y = archBottomY + (h3 - 0.5) * 80;
      } else {
        // Nhóm 3 (12%): Những hạt bụi sa xuống nhẹ nhàng mềm mại về phía logo
        y = archBottomY - Math.pow(h3, 2.0) * 130;
      }

      // Trục sâu Z: tạo thể tích 3D dày dặn
      const z = (h4 - 0.5) * 550;

      pos[i * 3 + 0] = x;
      pos[i * 3 + 1] = y + (z / 550) * -20; // Độ nghiêng phối cảnh
      pos[i * 3 + 2] = z;

      // Kích thước quang học chuẩn độ phân giải 2K/4K:
      // (1 pixel trên 2K = ~1.0 unit với hệ số tỉ lệ 1350/-mvPosition.z)
      // - 75% hạt micro mịn (3.0px - 5.5px) tạo dải ngân hà bụi kim cương óng ánh
      // - 20% hạt sao trung bình (6.5px - 11.0px) lấp lánh rõ nét
      // - 5% hạt tinh thể kim cương lớn (16.0px - 34.0px) lóa sáng nổi bật
      const sizeRand = ((Math.sin(i * 513.11 + 23.4) * 43758.54) % 1 + 1) % 1;
      let baseSize = 3.2 + sizeRand * 3.0;
      if (sizeRand > 0.75 && sizeRand <= 0.95) {
        baseSize = 7.0 + (sizeRand - 0.75) * 18.0;
      } else if (sizeRand > 0.95) {
        baseSize = 18.0 + (sizeRand - 0.95) * 60.0;
      }

      rnd[i * 4 + 0] = 1.0 + (i % 8); // Tần số chu kỳ nguyên (1..8) đảm bảo Seamless Loop 100%
      rnd[i * 4 + 1] = (i * 2.399) % (Math.PI * 2); // Pha ngẫu nhiên
      rnd[i * 4 + 2] = baseSize;
      rnd[i * 4 + 3] = 0.5 + (i % 5) * 0.2; // Biên độ trôi dạt nhẹ

      // Tông màu: Bụi bạc kim cương thuần khiết điểm xuyết ánh xanh ngọc băng
      const colRand = ((Math.sin(i * 841.3 + 17.2) * 19283.4) % 1 + 1) % 1;
      if (colRand > 0.72) {
        col[i * 3 + 0] = 0.90;
        col[i * 3 + 1] = 0.95;
        col[i * 3 + 2] = 1.0;
      } else {
        col[i * 3 + 0] = 1.0;
        col[i * 3 + 1] = 1.0;
        col[i * 3 + 2] = 1.0;
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
    camera.lookAt(0, 50, 0);
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

    const starTexture = createStarSprite();

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
          // Hệ số nguyên 2.0 và 1.0 giúp hạt trôi lơ lửng khép kín chu kỳ hoàn hảo
          pos.x += sin(uLoopAngle * 2.0 + phase) * driftAmp;
          pos.y += cos(uLoopAngle * 1.0 + phase) * (driftAmp * 0.6);

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
