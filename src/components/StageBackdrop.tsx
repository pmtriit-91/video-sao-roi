import React from "react";
import { useCurrentFrame } from "remotion";
import { ColorPalette } from "../config/types";

interface StageBackdropProps {
  palette: ColorPalette;
  width?: number;
  height?: number;
  loopDurationFrames?: number;
  showBeams?: boolean;
}

export const StageBackdrop: React.FC<StageBackdropProps> = ({
  palette,
  width = 2560,
  height = 1440,
  loopDurationFrames = 1200,
  showBeams = true,
}) => {
  const frame = useCurrentFrame();

  // Góc pha chuẩn hóa (0 -> 2π) để vòng lặp tuần hoàn 100% Seamless Loop
  const loopAngle = (frame / loopDurationFrames) * Math.PI * 2;

  // Cấu hình 6 cột ánh sáng sân khấu (Volumetric Beams)
  const beams = [
    { x: width * 0.18, widthPercent: 12, speedMult: 1, phase: 0, opacityBase: 0.8 },
    { x: width * 0.32, widthPercent: 15, speedMult: 2, phase: 1.2, opacityBase: 1.0 },
    { x: width * 0.46, widthPercent: 18, speedMult: 1, phase: 2.5, opacityBase: 1.2 },
    { x: width * 0.58, widthPercent: 16, speedMult: 2, phase: 3.8, opacityBase: 1.1 },
    { x: width * 0.72, widthPercent: 14, speedMult: 1, phase: 4.6, opacityBase: 0.9 },
    { x: width * 0.84, widthPercent: 13, speedMult: 2, phase: 5.4, opacityBase: 0.8 },
  ];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: palette.backdropBase,
        overflow: "hidden",
        zIndex: 1,
        pointerEvents: "none",
      }}
    >
      {/* 1. Lớp texture rèm nhung sân khấu (Vertical Velvet Folds) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `repeating-linear-gradient(
            90deg,
            rgba(0, 0, 0, 0.5) 0px,
            rgba(25, 30, 42, 0.15) 60px,
            rgba(0, 0, 0, 0.5) 120px,
            rgba(12, 16, 25, 0.08) 180px
          )`,
          opacity: 0.85,
        }}
      />

      {/* 2. Các cột ánh sáng sân khấu quét dọc chuyển động chậm (Volumetric Beams) */}
      {showBeams &&
        beams.map((b, i) => {
        // Dao động vị trí ngang và độ sáng theo hàm sin tuần hoàn hoàn hảo
        const sway = Math.sin(loopAngle * b.speedMult + b.phase) * 45;
        const breath = (Math.sin(loopAngle * b.speedMult + b.phase * 1.5) * 0.3 + 0.7) * b.opacityBase;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: -100,
              bottom: 0,
              left: b.x + sway,
              width: (width * b.widthPercent) / 100,
              transform: "translateX(-50%)",
              background: `linear-gradient(
                180deg,
                ${palette.beamColor} 0%,
                rgba(255, 255, 255, 0.03) 40%,
                rgba(255, 255, 255, 0.01) 75%,
                transparent 100%
              )`,
              opacity: breath,
              filter: "blur(25px)",
              willChange: "transform, opacity",
            }}
          />
        );
      })}

      {/* 3. Vầng sáng tụ dịu nhẹ ở trung tâm sân khấu (Center Stage Ambience) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(
            circle at 50% 52%,
            rgba(255, 255, 255, 0.04) 0%,
            rgba(180, 205, 240, 0.02) 45%,
            transparent 75%
          )`,
        }}
      />

      {/* 4. Lớp Vignette viền góc tạo chiều sâu điện ảnh */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(
            ellipse at 50% 50%,
            transparent 50%,
            rgba(0, 0, 0, 0.65) 95%,
            rgba(0, 0, 0, 0.9) 100%
          )`,
        }}
      />
    </div>
  );
};
