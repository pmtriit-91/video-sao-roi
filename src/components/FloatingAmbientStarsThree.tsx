import React, { useEffect, useMemo, useRef } from "react";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";
import { ColorPalette } from "../config/types";

interface FloatingAmbientStarsThreeProps {
  palette: ColorPalette;
  width?: number;
  height?: number;
  count?: number;
  loopDurationFrames?: number;
}

// Sprite hạt sao lấp lánh quang học mềm mại
function createFloatingStarTexture(): THREE.Texture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const center = size / 2;
    // Lớp quầng hào quang tỏa rộng
    const gradGlow = ctx.createRadialGradient(center, center, 0, center, center, center);
    gradGlow.addColorStop(0.0, "rgba(255, 255, 255, 1.0)");
    gradGlow.addColorStop(0.12, "rgba(255, 255, 255, 0.95)");
    gradGlow.addColorStop(0.28, "rgba(235, 245, 255, 0.65)");
    gradGlow.addColorStop(0.55, "rgba(195, 225, 255, 0.22)");
    gradGlow.addColorStop(1.0, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = gradGlow;
    ctx.fillRect(0, 0, size, size);

    // Tia sáng chéo 4 cánh nhẹ nhàng ở tâm
    ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(center, center - 28);
    ctx.lineTo(center, center + 28);
    ctx.moveTo(center - 28, center);
    ctx.lineTo(center + 28, center);
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export const FloatingAmbientStarsThree: React.FC<FloatingAmbientStarsThreeProps> = ({
  palette,
  width = 2560,
  height = 1440,
  count = 60,
  loopDurationFrames = 1200,
}) => {
  const frame = useCurrentFrame();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);

  const loopAngle = (frame / loopDurationFrames) * Math.PI * 2;

  // 1. Khởi tạo quỹ đạo chuyển động 3D cho các hạt sáng đơn lẻ bay ngược chiều & tự do
  const { startPositions, endPositions, swayData, randomData, colors } = useMemo(() => {
    const startPos = new Float32Array(count * 3);
    const endPos = new Float32Array(count * 3);
    const sway = new Float32Array(count * 4); // [swayAmpX, swayAmpY, swayFreq, swayPhase]
    const rnd = new Float32Array(count * 4);  // [speedMult, phase, baseSize, sparkleSpeed]
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Deterministic PRNG
      const h1 = (((Math.sin(i * 17.123 + 51.456) * 43758.545) % 1) + 1) % 1;
      const h2 = (((Math.sin(i * 73.987 + 19.345) * 24634.634) % 1) + 1) % 1;
      const h3 = (((Math.sin(i * 39.456 + 82.123) * 58392.123) % 1) + 1) % 1;
      const h4 = (((Math.sin(i * 61.789 + 35.678) * 39182.876) % 1) + 1) % 1;
      const h5 = (((Math.sin(i * 28.321 + 94.219) * 51829.412) % 1) + 1) % 1;
      const h6 = (((Math.sin(i * 95.654 + 11.876) * 62819.321) % 1) + 1) % 1;

      let sx = 0, sy = 0, sz = 0;
      let ex = 0, ey = 0, ez = 0;

      const group = i % 3;

      if (group === 0) {
        // Nhóm 1 (Bay từ không gian tối bên ngoài ngược vào trung tâm sân khấu - Contra-flow Inward)
        const angle = h1 * Math.PI * 2;
        const radiusStart = 850 + h2 * 600;
        sx = Math.cos(angle) * radiusStart;
        sz = -180 + Math.sin(angle) * 400;
        sy = -280 + h3 * 620; // Khoảng tầng giữa sân khấu (-280 đến +340)

        const radiusEnd = 80 + h4 * 220; // Bay tụ vào gần tâm sân khấu
        ex = Math.cos(angle + (h5 - 0.5) * 0.8) * radiusEnd;
        ez = -120 + Math.sin(angle) * 180;
        ey = sy + (h6 - 0.5) * 160;
      } else if (group === 1) {
        // Nhóm 2 (Bay từ khoảng tối giữa sân khấu bay ngược lên vòm trên - Upward into Canopy)
        sx = (h1 - 0.5) * 1100;
        sy = -260 + h2 * 280; // Từ tầng dưới (-260 đến +20)
        sz = -160 + (h3 - 0.5) * 360;

        ex = sx * (1.15 + h4 * 0.35); // Tỏa nhẹ ra theo hướng vòm trần
        ey = 520 + h5 * 140;          // Bay nhập vào trần vòm (520 đến 660)
        ez = sz + (h6 - 0.5) * 120;
      } else {
        // Nhóm 3 (Bay từ khoảng tối giữa sân khấu bay ngược xuống sàn dưới - Downward into Floor)
        sx = (h1 - 0.5) * 1100;
        sy = 60 + h2 * 260;  // Từ tầng trên (60 đến 320)
        sz = -160 + (h3 - 0.5) * 360;

        ex = sx * (1.15 + h4 * 0.35); // Tỏa nhẹ theo thảm sàn
        ey = -430 - h5 * 90;          // Hạ xuống sàn (-430 đến -520)
        ez = sz + (h6 - 0.5) * 140;
      }

      startPos[i * 3 + 0] = sx;
      startPos[i * 3 + 1] = sy;
      startPos[i * 3 + 2] = sz;

      endPos[i * 3 + 0] = ex;
      endPos[i * 3 + 1] = ey;
      endPos[i * 3 + 2] = ez;

      // Độ lắc lư uốn lượn tự do (Wave Sway parameters):
      const swayAmpX = 25 + h3 * 55; // 25px đến 80px
      const swayAmpY = 18 + h4 * 38; // 18px đến 56px
      const swayFreq = 1 + (i % 3);  // Số nguyên 1, 2, 3 để 100% Seamless Loop
      const swayPhase = h5 * Math.PI * 2;

      sway[i * 4 + 0] = swayAmpX;
      sway[i * 4 + 1] = swayAmpY;
      sway[i * 4 + 2] = swayFreq;
      sway[i * 4 + 3] = swayPhase;

      // Chu kỳ và tốc độ chớp kim cương:
      const speedMult = (i % 5 === 0) ? 2 : 1; // Số nguyên 1 hoặc 2 chu trình hoàn chỉnh trong 20s
      const phase = h2;
      const baseSize = 14.0 + h4 * 22.0;       // Kích thước hạt từ 14px đến 36px (nổi bật, rõ nét)
      const sparkleSpeed = 3 + (i % 5);        // Tần số chớp số nguyên (3..7)

      rnd[i * 4 + 0] = speedMult;
      rnd[i * 4 + 1] = phase;
      rnd[i * 4 + 2] = baseSize;
      rnd[i * 4 + 3] = sparkleSpeed;

      // Sắc màu hạt phát quang kim cương sang trọng:
      if (h6 > 0.6) {
        col[i * 3 + 0] = 0.94;
        col[i * 3 + 1] = 0.97;
        col[i * 3 + 2] = 1.0;
      } else {
        col[i * 3 + 0] = 1.0;
        col[i * 3 + 1] = 1.0;
        col[i * 3 + 2] = 1.0;
      }
    }

    return {
      startPositions: startPos,
      endPositions: endPos,
      swayData: sway,
      randomData: rnd,
      colors: col,
    };
  }, [count]);

  // 2. Three.js Scene Setup
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

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("startPos", new THREE.BufferAttribute(startPositions, 3));
    geometry.setAttribute("endPos", new THREE.BufferAttribute(endPositions, 3));
    geometry.setAttribute("swayParams", new THREE.BufferAttribute(swayData, 4));
    geometry.setAttribute("randomData", new THREE.BufferAttribute(randomData, 4));
    geometry.setAttribute("customColor", new THREE.BufferAttribute(colors, 3));

    // Dùng position dummy để Three.js không cảnh báo bounds
    geometry.setAttribute("position", new THREE.BufferAttribute(startPositions, 3));

    const starTexture = createFloatingStarTexture();

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uLoopAngle: { value: 0 },
        uPointTexture: { value: starTexture },
      },
      vertexShader: `
        uniform float uLoopAngle;
        attribute vec3 startPos;
        attribute vec3 endPos;
        attribute vec4 swayParams;
        attribute vec4 randomData;
        attribute vec3 customColor;
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          float speedMult = randomData.x;
          float phase = randomData.y;
          float baseSize = randomData.z;
          float sparkleSpeed = randomData.w;

          float swayAmpX = swayParams.x;
          float swayAmpY = swayParams.y;
          float swayFreq = swayParams.z;
          float swayPhase = swayParams.w;

          // 1. Tiến trình di chuyển tự do 100% Seamless Loop
          float progress = fract(phase + (uLoopAngle / 6.283185307) * speedMult);

          // Quỹ đạo trôi êm ả từ startPos đến endPos
          vec3 pos = mix(startPos, endPos, progress);

          // Độ uốn lượn dập dềnh bồng bềnh tự do (Wave Sway) với tần số nguyên
          float swayAngle = uLoopAngle * swayFreq + swayPhase;
          pos.x += sin(swayAngle) * swayAmpX;
          pos.y += cos(swayAngle * 0.5) * swayAmpY;
          pos.z += sin(swayAngle * 1.0) * (swayAmpX * 0.35);

          // 2. Fade in mềm mại khi xuất hiện và Fade out êm khi chạm đích
          float fadeIn = smoothstep(0.0, 0.15, progress);
          float fadeOut = smoothstep(1.0, 0.85, progress);
          float travelAlpha = fadeIn * fadeOut;

          // 3. Hiệu ứng nhấp nháy lấp lánh kim cương (Diamond Sparkle Flash)
          float flash = pow(max(0.0, sin(uLoopAngle * sparkleSpeed + swayPhase)), 6.0);
          float sparkleSize = 1.0 + flash * 1.5;

          // Nhịp thở phát quang nền nhẹ nhàng
          float breathing = 0.65 + 0.35 * sin(uLoopAngle * 2.0 + swayPhase);

          // Tăng cường độ sáng trắng rực rỡ khi đạt đỉnh lóe sáng
          vec3 starColor = mix(customColor, vec3(2.4, 2.4, 2.8), flash * 0.85);

          vColor = starColor;
          vAlpha = travelAlpha * (breathing + flash * 0.5);

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = baseSize * sparkleSize * (1350.0 / -mvPosition.z);
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
          gl_FragColor = vec4(vColor * texColor.rgb * 1.4, texColor.a * vAlpha);
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
      renderer.forceContextLoss();
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [width, height, startPositions, endPositions, swayData, randomData, colors]);

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
        zIndex: 3,
      }}
    />
  );
};
