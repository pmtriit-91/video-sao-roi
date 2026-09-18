import React, { useEffect, useMemo, useRef } from "react";
import { useCurrentFrame } from "remotion";
import { ColorPalette } from "../config/types";

interface CanopyParticle {
  id: number;
  x: number;
  y: number;
  radius: number;
  baseOpacity: number;
  twinkleCycles: number;
  phase: number;
  driftCycles: number;
  driftAmp: number;
  isGlint: boolean;
  colorType: "white" | "cyan" | "secondary";
}

interface StarCanopyProps {
  palette: ColorPalette;
  width?: number;
  height?: number;
  count?: number;
  loopDurationFrames?: number;
}

export const StarCanopy: React.FC<StarCanopyProps> = ({
  palette,
  width = 2560,
  height = 1440,
  count = 4200,
  loopDurationFrames = 1200,
}) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Góc pha chuẩn hóa (0 -> 2π) đảm bảo 100% Seamless Loop
  const loopAngle = (frame / loopDurationFrames) * Math.PI * 2;

  // 1. Tạo ngẫu nhiên giả lập (deterministic pseudo-random) cho hàng ngàn hạt bụi kim cương
  const particles: CanopyParticle[] = useMemo(() => {
    const list: CanopyParticle[] = [];

    for (let i = 0; i < count; i++) {
      const rand1 = Math.sin(i * 927.71) * 0.5 + 0.5;
      const rand2 = Math.cos(i * 353.33) * 0.5 + 0.5;
      const rand3 = Math.sin(i * 123.45) * 0.5 + 0.5;
      const rand4 = Math.cos(i * 789.12) * 0.5 + 0.5;
      const rand5 = Math.sin(i * 456.78) * 0.5 + 0.5;

      const normX = rand1; // 0 -> 1 trên bề ngang màn hình
      const distFromCenter = Math.abs(normX - 0.5) * 2; // 0 ở tâm, 1 ở 2 mép biên

      // Đường cong vòm ôm: 2 mép biên rủ sâu xuống (~38% chiều cao), vùng giữa rủ thoai thoải (~23%)
      const archDepth = height * (0.22 + Math.pow(distFromCenter, 1.3) * 0.17);

      // Phân bổ hạt theo hàm lũy thừa: tập trung cực kỳ dày đặc ở sát mép trên (y=0) và tản dần xuống dưới
      const normY = Math.pow(rand2, 2.35);
      const y = normY * archDepth;

      // Phân loại kích thước hạt:
      // - 78% hạt micro-stardust siêu nhỏ (0.5px - 1.3px)
      // - 17% hạt trung bình phát sáng (1.4px - 2.5px)
      // - 5% hạt kim cương lóe sáng có hào quang (2.8px - 4.5px)
      let radius: number;
      let isGlint = false;

      if (rand3 < 0.78) {
        radius = 0.5 + rand4 * 0.8;
      } else if (rand3 < 0.95) {
        radius = 1.4 + rand4 * 1.1;
      } else {
        radius = 2.6 + rand4 * 1.9;
        isGlint = true;
      }

      let colorType: "white" | "cyan" | "secondary" = "white";
      if (rand5 < 0.2) colorType = "cyan";
      else if (rand5 < 0.35) colorType = "secondary";

      list.push({
        id: i,
        x: normX * width,
        y,
        radius,
        baseOpacity: isGlint ? 0.8 + rand4 * 0.2 : 0.25 + rand4 * 0.7,
        twinkleCycles: 2 + (i % 9), // Chu kỳ nhấp nháy hoàn chỉnh
        phase: (i * 1.618) % (Math.PI * 2),
        driftCycles: 1 + (i % 3),
        driftAmp: 0.6 + rand3 * 1.8,
        isGlint,
        colorType,
      });
    }

    return list;
  }, [count, width, height]);

  // 2. Vẽ trực tiếp lên HTML5 Canvas với Additive Blending ('lighter')
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Xóa khung hình trước
    ctx.clearRect(0, 0, width, height);

    // Kích hoạt chế độ cộng dồn ánh sáng quang học (Additive Blending)
    ctx.globalCompositeOperation = "lighter";

    // A. Lớp quầng sáng vòm đỉnh phát quang cực mạnh ở mép trên cùng (Top Edge Incandescent Glow)
    const topEdgeGrad = ctx.createLinearGradient(0, 0, 0, height * 0.2);
    topEdgeGrad.addColorStop(0, "rgba(225, 245, 255, 0.35)");
    topEdgeGrad.addColorStop(0.3, "rgba(200, 235, 255, 0.15)");
    topEdgeGrad.addColorStop(0.7, "rgba(180, 215, 255, 0.04)");
    topEdgeGrad.addColorStop(1, "transparent");

    ctx.fillStyle = topEdgeGrad;
    ctx.fillRect(0, 0, width, height * 0.25);

    // B. Lớp sương mù ánh sao hình vòm (Arch Nebula Cloud)
    const centerNebula = ctx.createRadialGradient(
      width * 0.5,
      -height * 0.08,
      width * 0.04,
      width * 0.5,
      0,
      height * 0.35
    );
    centerNebula.addColorStop(0, "rgba(230, 248, 255, 0.25)");
    centerNebula.addColorStop(0.4, "rgba(195, 225, 255, 0.1)");
    centerNebula.addColorStop(0.8, "rgba(165, 205, 245, 0.02)");
    centerNebula.addColorStop(1, "transparent");

    ctx.fillStyle = centerNebula;
    ctx.fillRect(0, 0, width, height * 0.45);

    // C. Hai quầng sáng phụ ở hai góc đỉnh trái & phải
    const leftNebula = ctx.createRadialGradient(0, 0, 10, 0, 0, width * 0.4);
    leftNebula.addColorStop(0, "rgba(215, 240, 255, 0.2)");
    leftNebula.addColorStop(1, "transparent");
    ctx.fillStyle = leftNebula;
    ctx.fillRect(0, 0, width * 0.5, height * 0.48);

    const rightNebula = ctx.createRadialGradient(width, 0, 10, width, 0, width * 0.4);
    rightNebula.addColorStop(0, "rgba(215, 240, 255, 0.2)");
    rightNebula.addColorStop(1, "transparent");
    ctx.fillStyle = rightNebula;
    ctx.fillRect(width * 0.5, 0, width * 0.5, height * 0.48);

    // D. Vẽ hàng ngàn hạt bụi kim cương (Micro Stardust)
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Nhịp nhấp nháy tuần hoàn theo hàm Sin
      const twinkle = Math.sin(loopAngle * p.twinkleCycles + p.phase);
      const opacity = Math.max(0.04, p.baseOpacity * (0.45 + 0.55 * twinkle));

      // Lắc lư bồng bềnh siêu nhẹ
      const curX = p.x + Math.sin(loopAngle * p.driftCycles + p.phase) * p.driftAmp;
      const curY = p.y + Math.cos(loopAngle * p.driftCycles + p.phase) * (p.driftAmp * 0.6);

      let color = `rgba(255, 255, 255, ${opacity.toFixed(3)})`;
      if (p.colorType === "cyan") {
        color = `rgba(215, 245, 255, ${opacity.toFixed(3)})`;
      } else if (p.colorType === "secondary") {
        color = `rgba(200, 230, 255, ${opacity.toFixed(3)})`;
      }

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(curX, curY, p.radius, 0, Math.PI * 2);
      ctx.fill();

      // Nếu là hạt kim cương lóe sáng (Glint), vẽ thêm vòng hào quang mềm
      if (p.isGlint && opacity > 0.4) {
        ctx.save();
        const haloGrad = ctx.createRadialGradient(
          curX,
          curY,
          0,
          curX,
          curY,
          p.radius * 3.6
        );
        haloGrad.addColorStop(0, `rgba(255, 255, 255, ${(opacity * 0.7).toFixed(3)})`);
        haloGrad.addColorStop(0.45, `rgba(210, 240, 255, ${(opacity * 0.3).toFixed(3)})`);
        haloGrad.addColorStop(1, "transparent");

        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(curX, curY, p.radius * 3.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }, [frame, loopAngle, particles, width, height, palette]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
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
