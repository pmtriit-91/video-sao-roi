import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { ColorPalette, FloorSparkleSpec } from "../config/types";

interface StageFloorProps {
  palette: ColorPalette;
  width?: number;
  height?: number;
  count?: number;
  loopDurationFrames?: number;
}

export const StageFloor: React.FC<StageFloorProps> = ({
  palette,
  width = 2560,
  height = 1440,
  count = 180,
  loopDurationFrames = 1200,
}) => {
  const frame = useCurrentFrame();
  const loopAngle = (frame / loopDurationFrames) * Math.PI * 2;

  // Khởi tạo các hạt kim tuyến mặt sàn với chiều sâu phối cảnh (Perspective Depth)
  const sparkles: FloorSparkleSpec[] = useMemo(() => {
    const list: FloorSparkleSpec[] = [];
    for (let i = 0; i < count; i++) {
      const randX = Math.sin(i * 733.1) * 0.5 + 0.5; // 0 -> 1
      const randDepth = Math.cos(i * 419.9) * 0.5 + 0.5; // 0 (xa/chân chữ) -> 1 (gần đáy)
      const randSize = Math.sin(i * 211.7) * 0.5 + 0.5;

      // Phối cảnh phi tuyến tính: hạt phân bổ nhiều hơn ở phía xa
      const nonLinearDepth = Math.pow(randDepth, 1.3);

      list.push({
        id: i,
        x: randX * width,
        y: height * 0.68 + nonLinearDepth * (height * 0.32),
        // Càng gần (depth lớn) kích thước hạt càng to
        size: (2.5 + randSize * 4) * (0.6 + nonLinearDepth * 1.6),
        depth: nonLinearDepth,
        twinkleSpeed: 2 + (i % 5),
        phase: (i * 0.43) % (Math.PI * 2),
      });
    }
    return list;
  }, [count, width, height]);

  // Nhịp thở của tâm sáng sàn sân khấu
  const stageBreath = Math.sin(loopAngle) * 0.15 + 0.85;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: height * 0.42,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 4,
      }}
    >
      {/* 1. Tâm sáng hội tụ mặt sàn sân khấu (Center Stage Floor Glow) */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: "-5%",
          width: width * 0.65,
          height: height * 0.35,
          transform: "translateX(-50%)",
          background: `radial-gradient(
            ellipse at 50% 75%,
            ${palette.floorGlow} 0%,
            rgba(200, 225, 255, 0.12) 40%,
            rgba(160, 195, 240, 0.04) 65%,
            transparent 85%
          )`,
          opacity: stageBreath,
          willChange: "opacity",
        }}
      />

      {/* 2. Dải sương mù phát quang chân sàn (Ambient Horizon Mist) */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: "35%",
          background: `linear-gradient(
            to bottom,
            transparent,
            rgba(220, 235, 255, 0.05) 50%,
            transparent 100%
          )`,
        }}
      />

      {/* 3. Dàn hạt kim tuyến phản chiếu mặt sàn */}
      {sparkles.map((sp) => {
        const twinkle = Math.sin(loopAngle * sp.twinkleSpeed + sp.phase);
        const opacity = (0.35 + sp.depth * 0.55) * (0.6 + twinkle * 0.4);
        const scale = 0.85 + twinkle * 0.25;

        return (
          <div
            key={sp.id}
            style={{
              position: "absolute",
              left: sp.x,
              top: sp.y - height * 0.58, // Điều chỉnh tương đối trong container sàn
              width: sp.size,
              height: sp.size * 0.65, // Hơi bẹt theo phối cảnh nằm trên sàn
              borderRadius: "50%",
              backgroundColor: palette.primary,
              boxShadow: `0 0 ${sp.size * 2}px ${sp.size * 0.5}px ${palette.secondary}`,
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
