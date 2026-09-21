import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { ColorPalette, FallingStarSpec } from "../config/types";

interface FallingStarsProps {
  palette: ColorPalette;
  width?: number;
  height?: number;
  count?: number;
  loopDurationFrames?: number;
  safeZoneWidth?: number;
  safeZoneHeight?: number;
}

export const FallingStars: React.FC<FallingStarsProps> = ({
  palette,
  width = 2560,
  height = 1440,
  count = 95,
  loopDurationFrames = 2400,
  safeZoneWidth = 1200,
  safeZoneHeight = 650,
}) => {
  const frame = useCurrentFrame();

  // Khởi tạo danh sách các hạt sao rơi
  const stars: FallingStarSpec[] = useMemo(() => {
    const list: FallingStarSpec[] = [];
    for (let i = 0; i < count; i++) {
      const rand1 = Math.sin(i * 811.3) * 0.5 + 0.5;
      const rand2 = Math.cos(i * 439.7) * 0.5 + 0.5;
      const rand3 = Math.sin(i * 263.1) * 0.5 + 0.5;
      const rand4 = Math.cos(i * 117.9) * 0.5 + 0.5;

      const isDiamondCross = i % 6 === 0;

      list.push({
        id: i,
        initialX: rand1 * width,
        initialY: rand2 * (height + 200) - 100,
        size: isDiamondCross ? 14 + rand3 * 16 : 3.5 + rand3 * 6.5,
        speed: 2, // Nhân đôi cho video 40s để giữ nguyên tốc độ rơi
        swayAmp: 18 + rand2 * 32,
        swayFreq: (2 + (i % 4)) * 2, // Số chu kỳ lắc lư trong 40s
        phase: rand4, // Pha thời gian bắt đầu
        isDiamondCross,
        opacityBase: 0.5 + rand1 * 0.45,
      });
    }
    return list;
  }, [count, width, height]);

  // Tọa độ vùng an toàn chữ (Center Safe Zone)
  const safeLeft = (width - safeZoneWidth) / 2;
  const safeRight = safeLeft + safeZoneWidth;
  const safeTop = (height - safeZoneHeight) / 2 - 40;
  const safeBottom = safeTop + safeZoneHeight;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 3,
      }}
    >
      {stars.map((star) => {
        // 1. Tính toán tiến trình rơi tuần hoàn 100% Seamless Loop
        // Mỗi hạt hoàn thành chính xác 1 chu trình rơi từ đỉnh xuống đáy
        const totalTravel = height + 300;
        const progress =
          ((frame + star.phase * loopDurationFrames) % loopDurationFrames) /
          loopDurationFrames;

        const curY = progress * totalTravel - 150;

        // 2. Chuyển động lắc lư ngang (Sway)
        const swayCycle = progress * Math.PI * 2 * star.swayFreq;
        const curX = star.initialX + Math.sin(swayCycle) * star.swayAmp;

        // 3. Hiệu ứng mờ dần khi chạm đỉnh / đáy (Edge Fading)
        const topFade = Math.min(1, Math.max(0, (curY + 100) / 150));
        const bottomFade = Math.min(1, Math.max(0, (height + 100 - curY) / 200));
        const edgeFade = topFade * bottomFade;

        // 4. Giảm bớt mật độ/độ chói khi hạt rơi qua vùng an toàn chữ
        const inSafeZone =
          curX >= safeLeft &&
          curX <= safeRight &&
          curY >= safeTop &&
          curY <= safeBottom;
        const safeZoneDamp = inSafeZone ? 0.35 : 1.0;

        // 5. Độ nhấp nháy êm ái
        const twinkle = Math.sin(progress * Math.PI * 2 * 6 + star.id) * 0.25 + 0.75;
        const opacity = star.opacityBase * edgeFade * safeZoneDamp * twinkle;

        if (star.isDiamondCross) {
          // Ngôi sao 4 cánh kim cương lóe sáng lơ lửng
          const rotation = progress * 360 * (star.id % 2 === 0 ? 1 : -1);
          return (
            <div
              key={star.id}
              style={{
                position: "absolute",
                left: curX,
                top: curY,
                width: star.size,
                height: star.size,
                transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                opacity,
                willChange: "transform, opacity",
              }}
            >
              {/* Tia dọc */}
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: 0,
                  width: 2,
                  height: "100%",
                  transform: "translateX(-50%)",
                  background: `linear-gradient(to bottom, transparent, ${palette.flare} 45%, ${palette.flare} 55%, transparent)`,
                  borderRadius: 1,
                  boxShadow: `0 0 8px 2px ${palette.secondary}`,
                }}
              />
              {/* Tia ngang */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: 0,
                  width: "100%",
                  height: 2,
                  transform: "translateY(-50%)",
                  background: `linear-gradient(to right, transparent, ${palette.flare} 45%, ${palette.flare} 55%, transparent)`,
                  borderRadius: 1,
                  boxShadow: `0 0 8px 2px ${palette.secondary}`,
                }}
              />
              {/* Tâm kim cương phát sáng */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: star.size * 0.32,
                  height: star.size * 0.32,
                  transform: "translate(-50%, -50%)",
                  borderRadius: "50%",
                  backgroundColor: palette.primary,
                  boxShadow: `0 0 10px 4px ${palette.flare}, 0 0 16px 8px ${palette.secondary}`,
                }}
              />
            </div>
          );
        }

        // Hạt đốm sáng tròn phát quang
        return (
          <div
            key={star.id}
            style={{
              position: "absolute",
              left: curX,
              top: curY,
              width: star.size,
              height: star.size,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${palette.primary} 0%, ${palette.secondary} 55%, transparent 100%)`,
              boxShadow: `0 0 ${star.size * 1.8}px ${star.size * 0.4}px ${palette.secondary}`,
              opacity,
              transform: "translate(-50%, -50%)",
              willChange: "transform, opacity",
            }}
          />
        );
      })}
    </div>
  );
};
