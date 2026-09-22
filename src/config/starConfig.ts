import { weddingClientConfig } from "../weddingConfig";
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
 * CẤU HÌNH TỔNG THỂ HỆ THỐNG VIDEO SAO RƠI MÀN HÌNH LED
 * Thông tin tiệc cưới được đồng bộ trực tiếp từ file `src/weddingConfig.ts`
 */
export const starConfig: WeddingStarConfig = {
  // 1. Thông tin dâu rể, ngày cưới, logo & theme từ file cấu hình đám cưới
  brideName: weddingClientConfig.brideName,
  groomName: weddingClientConfig.groomName,
  weddingDate: weddingClientConfig.weddingDate,
  monogramText: "HT",
  logoType: weddingClientConfig.logoType,
  customLogoPath: weddingClientConfig.customLogoPath,
  monogramSvgPath:
    weddingClientConfig.logoType === "custom" && weddingClientConfig.customLogoPath
      ? weddingClientConfig.customLogoPath
      : undefined,
  theme: weddingClientConfig.theme,

  // 2. Thông số kỹ thuật hệ thống đồ họa 3D Three.js (Đã tối ưu chuẩn, không cần thay đổi)
  loopDurationFrames: 2400, // 40 giây @ 60fps
  canopyCount: 18000,  // 18,000 hạt sao vòm trần (mật độ thoáng, sang trọng, thanh thoát)
  fallingCount: 140,   // Hạt sao băng rơi bồng bềnh
  floorCount: 42000,   // 42,000 hạt thảm sàn sao 3D (tăng nhẹ mật độ để cân đối với vòm trên)
  beamCount: 6,        // Số cột ánh sáng sân khấu

  // Vùng an toàn chữ ở giữa màn hình
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
