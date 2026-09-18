import React from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";
import { ColorPalette, WeddingStarConfig } from "../config/types";

interface CenterTypographyProps {
  config: WeddingStarConfig;
  palette: ColorPalette;
  width?: number;
  height?: number;
  loopDurationFrames?: number;
}

export const CenterTypography: React.FC<CenterTypographyProps> = ({
  config,
  palette,
  width = 2560,
  height = 1440,
  loopDurationFrames = 1200,
}) => {
  const frame = useCurrentFrame();
  const loopAngle = (frame / loopDurationFrames) * Math.PI * 2;

  // Nhịp thở phát quang tinh tế của chữ (Subtle luxury breathing)
  const glowBreath = Math.sin(loopAngle) * 0.15 + 0.85;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 5,
        pointerEvents: "none",
        transform: `translateY(${-height * 0.02}px)`, // Dịch nhẹ lên trên tâm hình học một chút
      }}
    >
      {/* 1. Monogram Logo (H lồng T) */}
      <div
        style={{
          marginBottom: height * 0.025,
          opacity: 0.96,
          filter: `drop-shadow(0 0 16px ${palette.textGlow}) drop-shadow(0 0 35px ${palette.secondary})`,
          willChange: "filter",
        }}
      >
        {config.monogramSvgPath ? (
          <Img
            src={staticFile(config.monogramSvgPath)}
            style={{ width: width * 0.09, height: "auto" }}
          />
        ) : (
          /* SVG Monogram H T lồng ghép thanh lịch chuẩn nghệ thuật cưới */
          <svg
            width={width * 0.085}
            height={width * 0.085 * 0.85}
            viewBox="0 0 200 170"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Chữ H cách điệu với nét uốn lượn */}
            <path
              d="M 45,25 L 45,145 M 105,25 L 105,145 M 45,85 L 105,85"
              stroke={palette.primary}
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Chữ T lồng qua chữ H */}
            <path
              d="M 85,45 L 165,45 M 125,45 L 125,145"
              stroke={palette.primary}
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Nét khuyên elip uốn ôm dưới chân logo */}
            <path
              d="M 35,110 C 25,155 175,165 165,120 C 160,95 125,85 105,95"
              stroke={palette.primary}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>

      {/* 2. Tên Cô dâu & Chú rể (Calligraphy Wedding Script) */}
      <div
        style={{
          fontFamily: "'Great Vibes', 'Alex Brush', cursive",
          fontSize: width * 0.052, // Tự động co giãn theo 2K (133px) hoặc 4K (200px)
          color: palette.primary,
          letterSpacing: "0.02em",
          lineHeight: 1.25,
          textAlign: "center",
          textShadow: `
            0 0 12px ${palette.textGlow},
            0 0 28px ${palette.textGlow},
            0 0 65px ${palette.secondary}
          `,
          opacity: 0.98,
          willChange: "text-shadow",
        }}
      >
        {config.brideName} & {config.groomName}
      </div>

      {/* 3. Ngày cưới (Trang trọng, font Serif cổ điển) */}
      <div
        style={{
          marginTop: height * 0.022,
          fontFamily: "'Cormorant Garamond', 'Cinzel', 'Playfair Display', serif",
          fontSize: width * 0.016, // 41px ở 2K, 61px ở 4K
          fontWeight: 600,
          color: palette.primary,
          letterSpacing: "0.18em",
          textAlign: "center",
          textShadow: `
            0 0 8px ${palette.textGlow},
            0 0 24px ${palette.secondary}
          `,
          opacity: 0.9 * glowBreath,
        }}
      >
        {config.weddingDate}
      </div>
    </div>
  );
};
