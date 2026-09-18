import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { CanopyStarSpec, ColorPalette } from "../config/types";

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
  count = 220,
  loopDurationFrames = 1200,
}) => {
  const frame = useCurrentFrame();
  const loopAngle = (frame / loopDurationFrames) * Math.PI * 2;

  // Khởi tạo vị trí ngẫu nhiên giả lập (deterministic pseudo-random) cho vòm sao
  const stars: CanopyStarSpec[] = useMemo(() => {
    const list: CanopyStarSpec[] = [];
    for (let i = 0; i < count; i++) {
      const randX = (Math.sin(i * 927.7) * 0.5 + 0.5); // 0 -> 1
      const randY = (Math.cos(i * 353.3) * 0.5 + 0.5); // 0 -> 1
      const randSize = (Math.sin(i * 123.4) * 0.5 + 0.5);

      // Định hình vòm cong ôm phía trên: mép 2 bên dày hơn, vùng giữa thoai thoải
      const archCurve = Math.pow(Math.abs(randX - 0.5) * 2, 1.4) * 0.12; // cong sâu ở 2 bên
      const yMaxPercent = 0.22 + archCurve; // tối đa 22% - 34% chiều cao

      list.push({
        id: i,
        x: randX * width,
        y: randY * yMaxPercent * height,
        size: 2.2 + randSize * 4.5,
        twinkleSpeed: 2 + (i % 6), // Số chu kỳ lặp hoàn chỉnh trong loopDurationFrames
        phase: (i * 0.37) % (Math.PI * 2),
        opacityBase: 0.35 + randSize * 0.6,
      });
    }
    return list;
  }, [count, width, height]);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: height * 0.45,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 2,
      }}
    >
      {/* Lớp sương mù ánh sao nền (Stardust Nebula Glow) ở mép trên cùng */}
      <div
        style={{
          position: "absolute",
          top: -80,
          left: 0,
          right: 0,
          height: height * 0.28,
          background: `radial-gradient(
            ellipse at 50% 0%,
            ${palette.floorGlow} 0%,
            rgba(200, 225, 255, 0.05) 50%,
            transparent 100%
          )`,
          opacity: 0.7,
        }}
      />

      {/* Dải hạt sao vòm đỉnh */}
      {stars.map((star) => {
        // Nhịp nhấp nháy tuần hoàn theo hàm Sin đảm bảo Seamless Loop
        const twinkle = Math.sin(loopAngle * star.twinkleSpeed + star.phase);
        const opacity = Math.max(0.1, star.opacityBase * (0.55 + twinkle * 0.45));
        const scale = 0.85 + twinkle * 0.3;

        return (
          <div
            key={star.id}
            style={{
              position: "absolute",
              left: star.x,
              top: star.y,
              width: star.size,
              height: star.size,
              borderRadius: "50%",
              backgroundColor: palette.primary,
              boxShadow: `0 0 ${star.size * 2}px ${star.size * 0.5}px ${palette.secondary}`,
              opacity,
              transform: `translate(-50%, -50%) scale(${scale})`,
              willChange: "transform, opacity",
            }}
          />
        );
      })}
    </div>
  );
};
