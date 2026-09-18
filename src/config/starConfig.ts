import { ColorPalette, StarColorTheme, WeddingStarConfig } from "./types";

export const THEME_PALETTES: Record<StarColorTheme, ColorPalette> = {
  silverDiamond: {
    primary: "#FFFFFF",
    secondary: "#E2EEFF",
    flare: "#FFFFFF",
    textGlow: "rgba(255, 255, 255, 0.85)",
    beamColor: "rgba(215, 235, 255, 0.07)",
    floorGlow: "rgba(220, 240, 255, 0.38)",
    backdropBase: "#05060A",
  },
  champagneGold: {
    primary: "#FFF3CE",
    secondary: "#EED28B",
    flare: "#FFF9E6",
    textGlow: "rgba(255, 235, 175, 0.85)",
    beamColor: "rgba(245, 215, 140, 0.08)",
    floorGlow: "rgba(240, 210, 130, 0.35)",
    backdropBase: "#080603",
  },
  midnightSapphire: {
    primary: "#E0F2FE",
    secondary: "#93C5FD",
    flare: "#FFFFFF",
    textGlow: "rgba(186, 230, 253, 0.9)",
    beamColor: "rgba(96, 165, 250, 0.09)",
    floorGlow: "rgba(59, 130, 246, 0.32)",
    backdropBase: "#030712",
  },
  roseGold: {
    primary: "#FFF1F2",
    secondary: "#FECDD3",
    flare: "#FFFFFF",
    textGlow: "rgba(254, 205, 211, 0.85)",
    beamColor: "rgba(251, 113, 133, 0.08)",
    floorGlow: "rgba(244, 114, 182, 0.3)",
    backdropBase: "#0A0406",
  },
};

/**
 * CẤU HÌNH TRUNG TÂM VIDEO SAO RƠI MÀN HÌNH LED
 * Thay đổi thông tin tại đây để xuất video riêng cho từng cặp đôi
 */
export const starConfig: WeddingStarConfig = {
  // 1. Thông tin dâu rể (Dùng Title Case để font thư pháp chữ ký hiển thị đẹp và thanh thoát nhất)
  brideName: "Cẩm Hương",
  groomName: "Minh Trí",
  weddingDate: "27.09.2026",
  monogramText: "HT", // H lồng T (Hương & Trí)

  // 2. Chủ đề màu sắc ('silverDiamond' | 'champagneGold' | 'midnightSapphire' | 'roseGold')
  theme: "silverDiamond",

  // 3. Thời lượng vòng lặp lặp lại (1200 frames @ 60fps = 20 giây Seamless Loop)
  loopDurationFrames: 1200,

  // 4. Mật độ hạt sao dày đặc, lấp lánh như bụi kim cương trong clip mẫu
  canopyCount: 550,    // Hạt sao dày ở vòm đỉnh
  fallingCount: 140,   // Hạt sao mưa rơi bồng bềnh
  floorCount: 450,     // Hạt sao thảm sàn có chiều sâu phối cảnh
  beamCount: 6,        // Số cột ánh sáng sân khấu

  // 5. Kích thước vùng an toàn chữ ở giữa màn hình
  safeZoneWidth: 1200,
  safeZoneHeight: 650,
};

export function getActivePalette(config: WeddingStarConfig = starConfig): ColorPalette {
  const base = THEME_PALETTES[config.theme] || THEME_PALETTES.silverDiamond;
  return {
    ...base,
    ...(config.customPalette || {}),
  };
}
