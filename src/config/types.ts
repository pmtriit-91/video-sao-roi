export type StarColorTheme =
  | "silverDiamond"
  | "champagneGold"
  | "midnightSapphire"
  | "roseGold";

export interface ColorPalette {
  primary: string;       // Màu sao chính (ví dụ #FFFFFF hoặc #FFF2C2)
  secondary: string;     // Màu ánh nhẹ (ví dụ #E8F0FE hoặc #F9E5B7)
  flare: string;         // Màu tia lóe sáng (Diamond flare)
  textGlow: string;      // Màu bóng tỏa hào quang chữ
  beamColor: string;     // Màu cột sáng sân khấu
  floorGlow: string;     // Màu quầng sáng bệ đỡ trung tâm
  backdropBase: string;  // Màu nền tối
}

export interface FallingStarSpec {
  id: number;
  initialX: number;
  initialY: number;
  size: number;
  speed: number;
  swayAmp: number;
  swayFreq: number;
  phase: number;
  isDiamondCross: boolean;
  opacityBase: number;
}

export interface CanopyStarSpec {
  id: number;
  x: number;
  y: number;
  size: number;
  twinkleSpeed: number;
  phase: number;
  opacityBase: number;
}

export interface FloorSparkleSpec {
  id: number;
  x: number;
  y: number;
  size: number;
  depth: number; // 0 (xa nhất) đến 1 (sát mép dưới)
  twinkleSpeed: number;
  phase: number;
}

export interface WeddingStarConfig {
  // Thông tin định danh lễ cưới
  groomName: string;
  brideName: string;
  weddingDate: string;
  monogramText: string;
  monogramSvgPath?: string;

  // Bảng màu & chủ đề
  theme: StarColorTheme;
  customPalette?: Partial<ColorPalette>;

  // Cấu hình thời lượng & chuyển động
  loopDurationFrames: number; // Mặc định 900 frames (15s @ 60fps) hoặc 1200 frames (20s @ 60fps)

  // Mật độ hạt
  canopyCount: number;
  fallingCount: number;
  floorCount: number;
  beamCount: number;

  // Vùng an toàn chữ (giảm mật độ hạt bay đè lên chữ)
  safeZoneWidth: number;
  safeZoneHeight: number;
}
