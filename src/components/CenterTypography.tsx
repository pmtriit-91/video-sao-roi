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
  loopDurationFrames = 2400,
}) => {
  const frame = useCurrentFrame();
  const loopAngle = (frame / loopDurationFrames) * Math.PI * 2;

  // Nhịp thở phát quang tinh tế của chữ (Subtle luxury breathing)
  const glowBreath = Math.sin(loopAngle * 2.0) * 0.15 + 0.85;

  // Chu kỳ quét sáng chung: 240 frames (đúng 4.0 giây @ 60fps) - chia hết cho 2400 frames (10 chu kỳ hoàn hảo)
  const SHIMMER_CYCLE = 240;
  const cycleFrame = frame % SHIMMER_CYCLE;

  // 1. Quét sáng Monogram Logo: frames 0 -> 90 (~1.5 giây)
  const LOGO_SWEEP_DURATION = 90;
  const isLogoSweeping = cycleFrame < LOGO_SWEEP_DURATION;

  // 2. Quét sáng Tên Cô dâu & Chú rể: Thác ánh sáng tiếp nối mượt mà (frames 30 -> 125, ~1.6 giây)
  const NAME_SWEEP_START = 30;
  const NAME_SWEEP_DURATION = 95;
  const isNameSweeping =
    cycleFrame >= NAME_SWEEP_START &&
    cycleFrame < NAME_SWEEP_START + NAME_SWEEP_DURATION;
  const nameProgress = isNameSweeping
    ? (cycleFrame - NAME_SWEEP_START) / NAME_SWEEP_DURATION
    : 0;
  const nameEase = isNameSweeping
    ? 0.5 - 0.5 * Math.cos(nameProgress * Math.PI)
    : 0;

  // Vị trí quét từ -25% đến 125% chiều ngang dòng chữ
  const nameSweepPos = -25 + nameEase * 150;
  // Tọa độ điểm Glint chạy dọc theo vệt sáng
  const nameGlintX = 5 + nameEase * 90;
  const nameGlintIntensity = isNameSweeping
    ? Math.sin(nameProgress * Math.PI)
    : 0;

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
      {/* 1. Monogram Logo (H lồng T - Chuẩn Royal Typography Khối Dày, Sắc Nét, Không Nhòe) */}
      <div
        style={{
          marginBottom: height * 0.022,
          opacity: 1,
          filter: `drop-shadow(0 4px 14px rgba(0, 0, 0, 0.85)) drop-shadow(0 0 ${10 * glowBreath}px rgba(255, 255, 255, 0.25))`,
          willChange: "filter",
        }}
      >
        {config.monogramSvgPath ? (
          (() => {
            const logoProgress = isLogoSweeping ? cycleFrame / LOGO_SWEEP_DURATION : 0;
            const logoEase = isLogoSweeping ? 0.5 - 0.5 * Math.cos(logoProgress * Math.PI) : 0;
            const logoSweepPos = -25 + logoEase * 150;
            const logoGlintX = 10 + logoEase * 80;
            const logoGlintIntensity = isLogoSweeping ? Math.sin(logoProgress * Math.PI) : 0;

            return (
              <div
                style={{
                  position: "relative",
                  width: width * 0.092,
                  display: "inline-block",
                  filter: `drop-shadow(0 4px 14px rgba(0, 0, 0, 0.85)) drop-shadow(0 0 ${10 * glowBreath}px rgba(255, 255, 255, 0.25))`,
                }}
              >
                {/* Logo riêng của khách hàng */}
                <Img
                  src={staticFile(config.monogramSvgPath)}
                  style={{ width: "100%", height: "auto", display: "block" }}
                />

                {/* Hiệu ứng quét sáng phủ theo phom dáng logo khách */}
                {isLogoSweeping && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      pointerEvents: "none",
                      maskImage: `url(${staticFile(config.monogramSvgPath)})`,
                      WebkitMaskImage: `url(${staticFile(config.monogramSvgPath)})`,
                      maskSize: "contain",
                      WebkitMaskSize: "contain",
                      maskRepeat: "no-repeat",
                      WebkitMaskRepeat: "no-repeat",
                      maskPosition: "center",
                      WebkitMaskPosition: "center",
                      backgroundImage: `linear-gradient(
                        125deg,
                        transparent 0%,
                        transparent ${logoSweepPos - 18}%,
                        rgba(255, 255, 255, 0.4) ${logoSweepPos - 9}%,
                        #FFFFFF ${logoSweepPos}%,
                        rgba(255, 255, 255, 0.4) ${logoSweepPos + 9}%,
                        transparent ${logoSweepPos + 18}%,
                        transparent 100%
                      )`,
                      filter: "drop-shadow(0 0 10px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 22px rgba(255, 255, 255, 0.6))",
                    }}
                  />
                )}

                {/* Điểm sao kim cương lướt theo luồng sáng trên logo */}
                {isLogoSweeping && logoGlintIntensity > 0.05 && (
                  <div
                    style={{
                      position: "absolute",
                      left: `${logoGlintX}%`,
                      top: "50%",
                      transform: `translate(-50%, -50%) scale(${0.55 + 0.85 * logoGlintIntensity})`,
                      opacity: logoGlintIntensity,
                      pointerEvents: "none",
                    }}
                  >
                    <svg width="44" height="44" viewBox="-22 -22 44 44" fill="none">
                      <circle cx="0" cy="0" r="15" fill="rgba(255, 255, 255, 0.35)" />
                      <circle cx="0" cy="0" r="7.5" fill="rgba(255, 255, 255, 0.8)" />
                      <polygon points="-26,0 0,-1.8 26,0 0,1.8" fill="#FFFFFF" />
                      <polygon points="0,-26 -1.8,0 0,26 1.8,0" fill="#FFFFFF" />
                      <polygon points="-10,-10 0,-1.2 10,10 0,1.2" fill="rgba(255, 255, 255, 0.95)" />
                      <polygon points="-10,10 -1.2,0 10,-10 1.2,0" fill="rgba(255, 255, 255, 0.95)" />
                      <circle cx="0" cy="0" r="2.8" fill="#FFFFFF" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })()
        ) : (
          (() => {
            const isSweeping = isLogoSweeping;
            const sweepProgress = isSweeping ? cycleFrame / LOGO_SWEEP_DURATION : 0;

            // Easing mượt mà dạng Sine in-out chuẩn điện ảnh
            const sweepEase = isSweeping
              ? 0.5 - 0.5 * Math.cos(sweepProgress * Math.PI)
              : 0;

            // Quỹ đạo quét chéo 35 độ bao trọn toàn bộ logo từ đỉnh serif H xuống tận móc J và đuôi lụa chữ T
            const sweepBaseX = -850 + sweepEase * 1650;

            // --- GIẢI PHÁP 3: CÁC ĐIỂM LÓE SÁNG KIM CƯƠNG (GLINT HIGHLIGHTS) TẠI CÁC ĐẦU NÉT ---
            const makeGlint = (start: number, end: number) => {
              if (cycleFrame < start || cycleFrame > end) return { active: false, intensity: 0 };
              const t = (cycleFrame - start) / (end - start);
              return { active: true, intensity: Math.sin(t * Math.PI) };
            };

            // Đồng bộ 6 điểm Glint theo nhịp quét 90 frames:
            // 1. Chóp serif đỉnh chữ H trái (200, 80)
            const glint1 = makeGlint(20, 38);
            // 2. Vòng xoắn lụa mềm mại bên trái (80, 420)
            const glint2 = makeGlint(28, 46);
            // 3. Giao điểm hoàng gia trung tâm giữa H & T (520, 260)
            const glint3 = makeGlint(40, 60);
            // 4. Chân chữ H & móc J đáy chữ T (490, 630)
            const glint4 = makeGlint(52, 72);
            // 5. Chóp thanh ngang chữ T trên phải (860, 160)
            const glint5 = makeGlint(60, 78);
            // 6. Đuôi lượn chữ T góc dưới phải (760, 520)
            const glint6 = makeGlint(66, 84);

            // Kiểm tra chủ đề cưới
            const isGold = config.theme === "champagneGold";
            const isRose = config.theme === "roseGold";

            return (
              <svg
                width={width * 0.118}
                height={width * 0.118 * (718 / 907)}
                viewBox="0 0 907 718"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  {/* Gradient kim loại nền logo (GIỮ NGUYÊN TUYỆT ĐỐI THEO YÊU CẦU NGƯỜI DÙNG) */}
                  <linearGradient id="monogramMetallic" x1="0%" y1="0%" x2="20%" y2="100%">
                    {isGold ? (
                      <>
                        <stop offset="0%" stopColor="#FFF9E6" />
                        <stop offset="25%" stopColor="#F5DE98" />
                        <stop offset="55%" stopColor="#D4B05C" />
                        <stop offset="85%" stopColor="#A68235" />
                        <stop offset="100%" stopColor="#8C6A24" />
                      </>
                    ) : isRose ? (
                      <>
                        <stop offset="0%" stopColor="#FFF2F4" />
                        <stop offset="25%" stopColor="#F6CCD4" />
                        <stop offset="55%" stopColor="#D89AA7" />
                        <stop offset="85%" stopColor="#AC6D7B" />
                        <stop offset="100%" stopColor="#8E525F" />
                      </>
                    ) : (
                      /* Bạch kim / Bạc kim cương sáng trong (Bright Diamond Platinum) nguyên bản */
                      <>
                        <stop offset="0%" stopColor="#FFFFFF" />
                        <stop offset="25%" stopColor="#F7FAFD" />
                        <stop offset="55%" stopColor="#E1EAF4" />
                        <stop offset="85%" stopColor="#C2D5E6" />
                        <stop offset="100%" stopColor="#A4BCD3" />
                      </>
                    )}
                  </linearGradient>

                  {/* GIẢI PHÁP 1 - LAYER A: Dải hào quang mềm diện rộng TRẮNG TINH KHIẾT (Pure White Sheen) */}
                  <linearGradient id="monogramAuraSheen" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                    <stop offset="18%" stopColor="#FFFFFF" stopOpacity="0.45" />
                    <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.85" />
                    <stop offset="50%" stopColor="#FFFFFF" stopOpacity="1" />
                    <stop offset="65%" stopColor="#FFFFFF" stopOpacity="0.85" />
                    <stop offset="82%" stopColor="#FFFFFF" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                  </linearGradient>

                  {/* GIẢI PHÁP 1 - LAYER B: Lõi gờ kép siêu sáng TRẮNG TINH CHÓI LỌI (Pure White Specular Core) */}
                  <linearGradient id="monogramCoreSpecular" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                    <stop offset="15%" stopColor="#FFFFFF" stopOpacity="0.65" />
                    <stop offset="28%" stopColor="#FFFFFF" stopOpacity="1" />
                    <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.8" />
                    <stop offset="48%" stopColor="#FFFFFF" stopOpacity="1" />
                    <stop offset="52%" stopColor="#FFFFFF" stopOpacity="1" />
                    <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.8" />
                    <stop offset="72%" stopColor="#FFFFFF" stopOpacity="1" />
                    <stop offset="85%" stopColor="#FFFFFF" stopOpacity="0.65" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                  </linearGradient>

                  {/* Mặt nạ chuẩn 100% phom dáng H - T (2 thanh chữ H cân xứng hoàn hảo, dải lụa mượt mà) */}
                  <mask id="monogramMask">
                    <g transform="translate(-48.000000, 854.000000) scale(0.100000, -0.100000)" fill="#FFFFFF">
                      <path d="M2371 8333 c-273 -3 -273 -3 -269 -63 2 -33 7 -62 10 -65 3 -3 38 -12 79 -19 132 -24 236 -92 284 -186 53 -106 64 -312 75 -1415 4 -473 9 -899 9 -947 1 -88 1 -88 29 -88 63 0 305 -64 436 -116 77 -30 141 -52 144 -49 5 4 20 412 21 571 l1 71 408 5 c224 3 484 3 578 1 171 -6 171 -6 153 -67 -27 -87 -27 -370 0 -472 37 -145 105 -239 156 -216 32 15 42 83 24 160 -8 33 -12 97 -11 152 7 235 116 411 314 511 78 39 78 39 77 192 -1 83 -4 209 -8 279 l-6 126 -115 -111 c-64 -62 -146 -151 -184 -199 l-68 -88 -663 0 c-663 0 -663 0 -668 33 -9 53 11 1427 22 1492 15 85 55 199 86 239 50 66 144 111 268 131 35 6 37 8 37 44 0 21 -3 53 -6 70 -6 31 -6 31 -473 29 -256 -2 -589 -4 -740 -5z" />
                      <path d="M4836 8333 c-269 -3 -269 -3 -263 -64 3 -33 7 -63 10 -65 2 -3 22 -7 43 -10 102 -15 176 -47 235 -102 141 -130 138 -78 139 -2262 0 -1640 -1 -1710 -20 -1835 -23 -154 -57 -238 -124 -304 -39 -38 -53 -45 -132 -62 -49 -11 -97 -22 -106 -25 -19 -6 -22 -32 -12 -94 6 -36 6 -36 712 -35 l707 0 3 63 c3 72 1 75 -106 85 -127 13 -197 70 -251 205 -57 142 -56 122 -55 1962 1 1144 5 1717 13 1785 6 55 15 147 21 205 13 126 53 238 110 302 46 53 131 97 202 105 83 9 88 14 88 88 l0 65 -472 -2 c-260 -2 -594 -4 -742 -5z" />
                      <path d="M9244 7152 c-6 -4 -33 -49 -60 -100 -104 -198 -284 -318 -529 -353 -214 -30 -516 -19 -878 31 -78 11 -178 25 -222 31 -44 6 -255 42 -470 79 -537 94 -833 125 -1123 117 -117 -3 -217 -8 -220 -12 -9 -8 -9 -471 -1 -480 4 -3 78 -10 165 -16 188 -12 455 -44 539 -65 38 -9 70 -25 87 -42 27 -27 27 -27 39 -307 17 -417 5 -3335 -15 -3495 -26 -208 -103 -380 -231 -518 -89 -95 -133 -128 -254 -187 -102 -50 -302 -101 -432 -110 -124 -8 -247 16 -381 75 -157 70 -244 142 -347 285 -119 167 -125 193 -126 525 0 260 0 266 -24 310 -31 58 -82 105 -151 137 -51 23 -62 25 -145 19 -81 -6 -96 -11 -155 -46 -80 -49 -122 -110 -156 -224 -29 -98 -33 -267 -9 -369 54 -235 227 -476 453 -635 174 -122 347 -193 570 -233 134 -24 492 -27 617 -4 167 30 405 130 548 230 36 25 91 57 121 70 57 25 57 25 623 25 l566 0 -6 66 c-2 36 -7 68 -10 70 -3 3 -34 10 -69 14 -95 13 -132 27 -186 70 -113 89 -147 184 -161 460 -6 108 6 3650 12 3657 1 1 26 -5 55 -12 216 -56 834 -98 1140 -77 137 10 165 15 267 50 298 103 469 276 590 597 28 75 65 245 65 300 0 50 -60 92 -96 67z" />
                      <path d="M1960 5431 c-422 -71 -784 -294 -1014 -626 -100 -144 -144 -229 -189 -367 -64 -194 -77 -279 -77 -491 0 -259 44 -445 160 -678 87 -174 257 -382 425 -518 170 -138 414 -257 630 -307 165 -37 285 -47 500 -40 319 11 552 68 783 192 59 32 116 62 127 68 87 46 365 295 365 326 0 19 -54 90 -69 90 -7 0 -58 -39 -113 -87 -139 -123 -214 -174 -358 -247 -169 -86 -326 -140 -496 -170 -287 -52 -617 -24 -872 74 -264 101 -556 336 -704 565 -85 131 -138 257 -184 435 -36 138 -38 152 -37 290 3 352 99 612 321 862 216 245 404 354 702 408 257 47 600 19 895 -72 226 -70 444 -178 875 -431 341 -201 629 -345 817 -408 148 -49 319 -83 391 -77 37 3 37 3 40 75 3 72 3 72 -35 77 -91 14 -224 51 -327 93 -61 25 -115 49 -121 53 -5 4 -63 36 -128 70 -66 34 -185 108 -265 163 -218 149 -580 372 -722 444 -234 119 -431 189 -650 229 -136 24 -537 28 -670 5z" />
                      <path d="M2547 4568 c-3 -296 -10 -534 -16 -578 -16 -104 -57 -211 -98 -260 -41 -47 -128 -95 -193 -104 -105 -16 -100 -13 -100 -64 0 -26 3 -57 6 -69 6 -23 6 -23 459 -23 248 0 567 3 708 7 257 6 257 6 257 64 0 65 3 62 -96 78 -34 5 -82 19 -107 30 -57 26 -120 100 -147 171 -26 71 -49 321 -51 545 -1 94 -4 239 -8 324 l-6 154 -160 74 c-99 46 -208 88 -285 109 -69 19 -132 37 -141 40 -15 4 -17 -39 -22 -498z" />
                      <path d="M7320 4640 c-0 -60 3 -70 18 -71 174 -7 345 -22 456 -38 189 -29 498 -119 645 -188 62 -29 115 -53 117 -53 2 0 49 -30 106 -66 202 -131 370 -297 504 -497 57 -85 108 -137 137 -137 19 0 47 43 47 73 0 63 -21 104 -123 234 -252 322 -575 557 -932 679 -247 85 -544 134 -812 134 -163 0 -163 0 -163 -70z" />
                      <path d="M6286 4615 c-76 -13 -159 -30 -185 -38 -25 -8 -100 -32 -166 -52 -66 -21 -137 -46 -157 -57 -38 -18 -38 -18 -38 -99 0 -72 2 -80 18 -75 280 87 513 157 572 171 41 10 87 24 103 32 25 13 27 18 27 78 0 76 18 72 -174 40z" />
                    </g>
                  </mask>
                </defs>

                {/* Khối chữ lồng H - T chuẩn Royal với chất liệu Gradient Platinum / Gold sang trọng (GIỮ NGUYÊN TUYỆT ĐỐI) */}
                <g transform="translate(-48.000000, 854.000000) scale(0.100000, -0.100000)" fill="url(#monogramMetallic)">
                  <path d="M2371 8333 c-273 -3 -273 -3 -269 -63 2 -33 7 -62 10 -65 3 -3 38 -12 79 -19 132 -24 236 -92 284 -186 53 -106 64 -312 75 -1415 4 -473 9 -899 9 -947 1 -88 1 -88 29 -88 63 0 305 -64 436 -116 77 -30 141 -52 144 -49 5 4 20 412 21 571 l1 71 408 5 c224 3 484 3 578 1 171 -6 171 -6 153 -67 -27 -87 -27 -370 0 -472 37 -145 105 -239 156 -216 32 15 42 83 24 160 -8 33 -12 97 -11 152 7 235 116 411 314 511 78 39 78 39 77 192 -1 83 -4 209 -8 279 l-6 126 -115 -111 c-64 -62 -146 -151 -184 -199 l-68 -88 -663 0 c-663 0 -663 0 -668 33 -9 53 11 1427 22 1492 15 85 55 199 86 239 50 66 144 111 268 131 35 6 37 8 37 44 0 21 -3 53 -6 70 -6 31 -6 31 -473 29 -256 -2 -589 -4 -740 -5z" />
                  <path d="M4836 8333 c-269 -3 -269 -3 -263 -64 3 -33 7 -63 10 -65 2 -3 22 -7 43 -10 102 -15 176 -47 235 -102 141 -130 138 -78 139 -2262 0 -1640 -1 -1710 -20 -1835 -23 -154 -57 -238 -124 -304 -39 -38 -53 -45 -132 -62 -49 -11 -97 -22 -106 -25 -19 -6 -22 -32 -12 -94 6 -36 6 -36 712 -35 l707 0 3 63 c3 72 1 75 -106 85 -127 13 -197 70 -251 205 -57 142 -56 122 -55 1962 1 1144 5 1717 13 1785 6 55 15 147 21 205 13 126 53 238 110 302 46 53 131 97 202 105 83 9 88 14 88 88 l0 65 -472 -2 c-260 -2 -594 -4 -742 -5z" />
                  <path d="M9244 7152 c-6 -4 -33 -49 -60 -100 -104 -198 -284 -318 -529 -353 -214 -30 -516 -19 -878 31 -78 11 -178 25 -222 31 -44 6 -255 42 -470 79 -537 94 -833 125 -1123 117 -117 -3 -217 -8 -220 -12 -9 -8 -9 -471 -1 -480 4 -3 78 -10 165 -16 188 -12 455 -44 539 -65 38 -9 70 -25 87 -42 27 -27 27 -27 39 -307 17 -417 5 -3335 -15 -3495 -26 -208 -103 -380 -231 -518 -89 -95 -133 -128 -254 -187 -102 -50 -302 -101 -432 -110 -124 -8 -247 16 -381 75 -157 70 -244 142 -347 285 -119 167 -125 193 -126 525 0 260 0 266 -24 310 -31 58 -82 105 -151 137 -51 23 -62 25 -145 19 -81 -6 -96 -11 -155 -46 -80 -49 -122 -110 -156 -224 -29 -98 -33 -267 -9 -369 54 -235 227 -476 453 -635 174 -122 347 -193 570 -233 134 -24 492 -27 617 -4 167 30 405 130 548 230 36 25 91 57 121 70 57 25 57 25 623 25 l566 0 -6 66 c-2 36 -7 68 -10 70 -3 3 -34 10 -69 14 -95 13 -132 27 -186 70 -113 89 -147 184 -161 460 -6 108 6 3650 12 3657 1 1 26 -5 55 -12 216 -56 834 -98 1140 -77 137 10 165 15 267 50 298 103 469 276 590 597 28 75 65 245 65 300 0 50 -60 92 -96 67z" />
                  <path d="M1960 5431 c-422 -71 -784 -294 -1014 -626 -100 -144 -144 -229 -189 -367 -64 -194 -77 -279 -77 -491 0 -259 44 -445 160 -678 87 -174 257 -382 425 -518 170 -138 414 -257 630 -307 165 -37 285 -47 500 -40 319 11 552 68 783 192 59 32 116 62 127 68 87 46 365 295 365 326 0 19 -54 90 -69 90 -7 0 -58 -39 -113 -87 -139 -123 -214 -174 -358 -247 -169 -86 -326 -140 -496 -170 -287 -52 -617 -24 -872 74 -264 101 -556 336 -704 565 -85 131 -138 257 -184 435 -36 138 -38 152 -37 290 3 352 99 612 321 862 216 245 404 354 702 408 257 47 600 19 895 -72 226 -70 444 -178 875 -431 341 -201 629 -345 817 -408 148 -49 319 -83 391 -77 37 3 37 3 40 75 3 72 3 72 -35 77 -91 14 -224 51 -327 93 -61 25 -115 49 -121 53 -5 4 -63 36 -128 70 -66 34 -185 108 -265 163 -218 149 -580 372 -722 444 -234 119 -431 189 -650 229 -136 24 -537 28 -670 5z" />
                  <path d="M2547 4568 c-3 -296 -10 -534 -16 -578 -16 -104 -57 -211 -98 -260 -41 -47 -128 -95 -193 -104 -105 -16 -100 -13 -100 -64 0 -26 3 -57 6 -69 6 -23 6 -23 459 -23 248 0 567 3 708 7 257 6 257 6 257 64 0 65 3 62 -96 78 -34 5 -82 19 -107 30 -57 26 -120 100 -147 171 -26 71 -49 321 -51 545 -1 94 -4 239 -8 324 l-6 154 -160 74 c-99 46 -208 88 -285 109 -69 19 -132 37 -141 40 -15 4 -17 -39 -22 -498z" />
                  <path d="M7320 4640 c-0 -60 3 -70 18 -71 174 -7 345 -22 456 -38 189 -29 498 -119 645 -188 62 -29 115 -53 117 -53 2 0 49 -30 106 -66 202 -131 370 -297 504 -497 57 -85 108 -137 137 -137 19 0 47 43 47 73 0 63 -21 104 -123 234 -252 322 -575 557 -932 679 -247 85 -544 134 -812 134 -163 0 -163 0 -163 -70z" />
                  <path d="M6286 4615 c-76 -13 -159 -30 -185 -38 -25 -8 -100 -32 -166 -52 -66 -21 -137 -46 -157 -57 -38 -18 -38 -18 -38 -99 0 -72 2 -80 18 -75 280 87 513 157 572 171 41 10 87 24 103 32 25 13 27 18 27 78 0 76 18 72 -174 40z" />
                </g>

                {/* GIẢI PHÁP 1 & 2: DẢI SÁNG KÉP ĐA TẦNG TRẮNG TINH KHIẾT (PURE WHITE SWEEP) */}
                {isSweeping && (
                  <g mask="url(#monogramMask)">
                    {/* Layer 1: Hào quang màu trắng tinh rộng phủ trực tiếp lên nét chữ */}
                    <rect
                      x={sweepBaseX}
                      y={-600}
                      width={1050}
                      height={2000}
                      transform="rotate(35, 453.5, 359)"
                      fill="url(#monogramAuraSheen)"
                      opacity={0.92}
                    />
                    {/* Layer 2: Lõi gờ kép kim cương siêu sáng trắng tinh khiết */}
                    <rect
                      x={sweepBaseX + 225}
                      y={-600}
                      width={600}
                      height={2000}
                      transform="rotate(35, 453.5, 359)"
                      fill="url(#monogramCoreSpecular)"
                      opacity={1}
                    />
                  </g>
                )}

                {/* GIẢI PHÁP 3: 6 ĐIỂM LÓE SÁNG KIM CƯƠNG TRẮNG TINH (PURE WHITE GLINT HIGHLIGHTS) */}
                {/* 1. Chóp serif chữ H trái (200, 80) */}
                {glint1.active && (
                  <g
                    transform={`translate(200, 80) scale(${0.5 + 0.8 * glint1.intensity})`}
                    opacity={glint1.intensity * 1.0}
                    style={{ pointerEvents: "none" }}
                  >
                    <circle cx="0" cy="0" r="22" fill="rgba(255, 255, 255, 0.35)" />
                    <circle cx="0" cy="0" r="11" fill="rgba(255, 255, 255, 0.75)" />
                    <polygon points="-36,0 0,-2.2 36,0 0,2.2" fill="#FFFFFF" />
                    <polygon points="0,-36 -2.2,0 0,36 2.2,0" fill="#FFFFFF" />
                    <polygon points="-14,-14 0,-1.5 14,14 0,1.5" fill="rgba(255, 255, 255, 0.95)" />
                    <polygon points="-14,14 -1.5,0 14,-14 1.5,0" fill="rgba(255, 255, 255, 0.95)" />
                    <circle cx="0" cy="0" r="4" fill="#FFFFFF" />
                  </g>
                )}

                {/* 2. Vòng xoắn dải lụa mềm mại bên trái (80, 420) */}
                {glint2.active && (
                  <g
                    transform={`translate(80, 420) scale(${0.45 + 0.75 * glint2.intensity})`}
                    opacity={glint2.intensity * 0.95}
                    style={{ pointerEvents: "none" }}
                  >
                    <circle cx="0" cy="0" r="20" fill="rgba(255, 255, 255, 0.3)" />
                    <circle cx="0" cy="0" r="10" fill="rgba(255, 255, 255, 0.7)" />
                    <polygon points="-30,0 0,-1.8 30,0 0,1.8" fill="#FFFFFF" />
                    <polygon points="0,-30 -1.8,0 0,30 1.8,0" fill="#FFFFFF" />
                    <polygon points="-12,-12 0,-1.2 12,12 0,1.2" fill="rgba(255, 255, 255, 0.9)" />
                    <polygon points="-12,12 -1.2,0 12,-12 1.2,0" fill="rgba(255, 255, 255, 0.9)" />
                    <circle cx="0" cy="0" r="3.5" fill="#FFFFFF" />
                  </g>
                )}

                {/* 3. Giao điểm hoàng gia trung tâm giữa H & T (520, 260) */}
                {glint3.active && (
                  <g
                    transform={`translate(520, 260) scale(${0.6 + 1.0 * glint3.intensity})`}
                    opacity={glint3.intensity * 1.0}
                    style={{ pointerEvents: "none" }}
                  >
                    <circle cx="0" cy="0" r="28" fill="rgba(255, 255, 255, 0.45)" />
                    <circle cx="0" cy="0" r="15" fill="rgba(255, 255, 255, 0.85)" />
                    <polygon points="-48,0 0,-2.6 48,0 0,2.6" fill="#FFFFFF" />
                    <polygon points="0,-48 -2.6,0 0,48 2.6,0" fill="#FFFFFF" />
                    <polygon points="-19,-19 0,-2 19,19 0,2" fill="rgba(255, 255, 255, 0.95)" />
                    <polygon points="-19,19 -2,0 19,-19 2,0" fill="rgba(255, 255, 255, 0.95)" />
                    <circle cx="0" cy="0" r="5.5" fill="#FFFFFF" />
                  </g>
                )}

                {/* 4. Chân chữ H & móc J đáy chữ T (490, 630) */}
                {glint4.active && (
                  <g
                    transform={`translate(490, 630) scale(${0.5 + 0.85 * glint4.intensity})`}
                    opacity={glint4.intensity * 1.0}
                    style={{ pointerEvents: "none" }}
                  >
                    <circle cx="0" cy="0" r="22" fill="rgba(255, 255, 255, 0.35)" />
                    <circle cx="0" cy="0" r="11" fill="rgba(255, 255, 255, 0.75)" />
                    <polygon points="-36,0 0,-2 36,0 0,2" fill="#FFFFFF" />
                    <polygon points="0,-36 -2,0 0,36 2,0" fill="#FFFFFF" />
                    <polygon points="-14,-14 0,-1.5 14,14 0,1.5" fill="rgba(255, 255, 255, 0.95)" />
                    <polygon points="-14,14 -1.5,0 14,-14 1.5,0" fill="rgba(255, 255, 255, 0.95)" />
                    <circle cx="0" cy="0" r="4" fill="#FFFFFF" />
                  </g>
                )}

                {/* 5. Chóp thanh ngang chữ T đỉnh phải (860, 160) */}
                {glint5.active && (
                  <g
                    transform={`translate(860, 160) scale(${0.45 + 0.75 * glint5.intensity})`}
                    opacity={glint5.intensity * 0.95}
                    style={{ pointerEvents: "none" }}
                  >
                    <circle cx="0" cy="0" r="20" fill="rgba(255, 255, 255, 0.3)" />
                    <circle cx="0" cy="0" r="10" fill="rgba(255, 255, 255, 0.7)" />
                    <polygon points="-32,0 0,-1.8 32,0 0,1.8" fill="#FFFFFF" />
                    <polygon points="0,-32 -1.8,0 0,32 1.8,0" fill="#FFFFFF" />
                    <polygon points="-13,-13 0,-1.3 13,13 0,1.3" fill="rgba(255, 255, 255, 0.9)" />
                    <polygon points="-13,13 -1.3,0 13,-13 1.3,0" fill="rgba(255, 255, 255, 0.9)" />
                    <circle cx="0" cy="0" r="3.5" fill="#FFFFFF" />
                  </g>
                )}

                {/* 6. Đuôi lượn chữ T góc dưới phải (760, 520) */}
                {glint6.active && (
                  <g
                    transform={`translate(760, 520) scale(${0.5 + 0.85 * glint6.intensity})`}
                    opacity={glint6.intensity * 1.0}
                    style={{ pointerEvents: "none" }}
                  >
                    <circle cx="0" cy="0" r="22" fill="rgba(255, 255, 255, 0.35)" />
                    <circle cx="0" cy="0" r="11" fill="rgba(255, 255, 255, 0.75)" />
                    <polygon points="-36,0 0,-2 36,0 0,2" fill="#FFFFFF" />
                    <polygon points="0,-36 -2,0 0,36 2,0" fill="#FFFFFF" />
                    <polygon points="-14,-14 0,-1.5 14,14 0,1.5" fill="rgba(255, 255, 255, 0.95)" />
                    <polygon points="-14,14 -1.5,0 14,-14 1.5,0" fill="rgba(255, 255, 255, 0.95)" />
                    <circle cx="0" cy="0" r="4" fill="#FFFFFF" />
                  </g>
                )}
              </svg>
            );
          })()
        )}
      </div>

      {/* 2. Tên Cô dâu & Chú rể (Calligraphy Wedding Script - Nét chữ tinh xảo, sắc nét kèm hiệu ứng loáng sáng trắng tinh khôi) */}
      <div
        style={{
          position: "relative",
          display: "inline-block",
          textAlign: "center",
        }}
      >
        {/* Layer 1: Nét chữ gốc - sắc nét 100%, không bị nhòe blur, tương phản nổi bật */}
        <div
          style={{
            fontFamily: "'Great Vibes', 'Alex Brush', cursive",
            fontSize: width * 0.052, // Tự động co giãn theo 2K (133px) hoặc 4K (200px)
            color: "#FFFFFF",
            letterSpacing: "0.02em",
            lineHeight: 1.25,
            textAlign: "center",
            textShadow: `
              0 2px 6px rgba(0, 0, 0, 0.85),
              0 4px 16px rgba(0, 0, 0, 0.7),
              0 0 16px rgba(255, 255, 255, 0.25)
            `,
            opacity: 1,
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
            textRendering: "optimizeLegibility",
          }}
        >
          {config.brideName} & {config.groomName}
        </div>

        {/* Layer 2: Lớp loáng sáng trắng tinh khôi quét mượt mà qua các con chữ */}
        {isNameSweeping && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              fontFamily: "'Great Vibes', 'Alex Brush', cursive",
              fontSize: width * 0.052,
              letterSpacing: "0.02em",
              lineHeight: 1.25,
              textAlign: "center",
              backgroundImage: `linear-gradient(
                115deg,
                transparent 0%,
                transparent ${nameSweepPos - 18}%,
                rgba(255, 255, 255, 0.35) ${nameSweepPos - 9}%,
                #FFFFFF ${nameSweepPos}%,
                rgba(255, 255, 255, 0.35) ${nameSweepPos + 9}%,
                transparent ${nameSweepPos + 18}%,
                transparent 100%
              )`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: `drop-shadow(0 0 10px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 22px rgba(255, 255, 255, 0.6))`,
              pointerEvents: "none",
              WebkitFontSmoothing: "antialiased",
              MozOsxFontSmoothing: "grayscale",
              textRendering: "optimizeLegibility",
            }}
          >
            {config.brideName} & {config.groomName}
          </div>
        )}

        {/* Layer 3: Điểm sao kim cương (Diamond Glint) lướt nhẹ cùng luồng sáng trên dòng chữ */}
        {isNameSweeping && nameGlintIntensity > 0.05 && (
          <div
            style={{
              position: "absolute",
              left: `${nameGlintX}%`,
              top: "42%",
              transform: `translate(-50%, -50%) scale(${0.55 + 0.85 * nameGlintIntensity})`,
              opacity: nameGlintIntensity,
              pointerEvents: "none",
            }}
          >
            <svg width="44" height="44" viewBox="-22 -22 44 44" fill="none">
              <circle cx="0" cy="0" r="15" fill="rgba(255, 255, 255, 0.35)" />
              <circle cx="0" cy="0" r="7.5" fill="rgba(255, 255, 255, 0.8)" />
              <polygon points="-26,0 0,-1.8 26,0 0,1.8" fill="#FFFFFF" />
              <polygon points="0,-26 -1.8,0 0,26 1.8,0" fill="#FFFFFF" />
              <polygon points="-10,-10 0,-1.2 10,10 0,1.2" fill="rgba(255, 255, 255, 0.95)" />
              <polygon points="-10,10 -1.2,0 10,-10 1.2,0" fill="rgba(255, 255, 255, 0.95)" />
              <circle cx="0" cy="0" r="2.8" fill="#FFFFFF" />
            </svg>
          </div>
        )}
      </div>

      {/* 3. Ngày cưới (Trang trọng, font Serif cổ điển - Rõ ràng, nổi bật) */}
      <div
        style={{
          marginTop: height * 0.024,
          fontFamily: "'Cormorant Garamond', 'Cinzel', 'Playfair Display', serif",
          fontSize: width * 0.022, // Tăng kích thước: ~56px ở 2K, ~90px ở 4K rõ ràng, trang trọng
          fontWeight: 600,
          color: "#FFFFFF",
          letterSpacing: "0.22em",
          textAlign: "center",
          textShadow: `
            0 2px 6px rgba(0, 0, 0, 0.85),
            0 0 12px rgba(255, 255, 255, 0.25)
          `,
          opacity: 0.96 * glowBreath,
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          textRendering: "optimizeLegibility",
        }}
      >
        {config.weddingDate}
      </div>
    </div>
  );
};
