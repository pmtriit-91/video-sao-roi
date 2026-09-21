import React from "react";
import { useVideoConfig } from "remotion";
import { CenterTypography } from "./components/CenterTypography";
import { FallingStars } from "./components/FallingStars";
import { FloatingAmbientStarsThree } from "./components/FloatingAmbientStarsThree";
import { FontLoader } from "./components/FontLoader";
import { StageBackdrop } from "./components/StageBackdrop";
import { StageBeamsThree } from "./components/StageBeamsThree";
import { StageFloorThree as StageFloor } from "./components/StageFloorThree";
import { StarCanopyThree as StarCanopy } from "./components/StarCanopyThree";
import { getActivePalette, starConfig } from "./config/starConfig";
import { WeddingStarConfig } from "./config/types";

interface MainVideoProps {
  config?: WeddingStarConfig;
}

export const MainVideo: React.FC<MainVideoProps> = ({
  config = starConfig,
}) => {
  const { width, height } = useVideoConfig();
  const palette = getActivePalette(config);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        backgroundColor: palette.backdropBase,
        overflow: "hidden",
      }}
    >
      {/* Nạp font thư pháp & serif cao cấp */}
      <FontLoader />

      {/* Layer 1: Nền nhung đen (Đã tắt hẳn theo yêu cầu) */}
      {/* <StageBackdrop
        palette={palette}
        width={width}
        height={height}
        loopDurationFrames={config.loopDurationFrames}
        showBeams={false}
      /> */}

      {/* Layer 1.5: Cột sáng thể tích 3D kết nối trần vòm - sàn (Phối cảnh tỏa quạt Three.js WebGL) */}
      <StageBeamsThree
        palette={palette}
        width={width}
        height={height}
        loopDurationFrames={config.loopDurationFrames}
      />

      {/* Layer 2: Trần sao 3D (Đã hoàn thiện xuất sắc theo Ảnh 1 & 3) */}
      <StarCanopy
        palette={palette}
        width={width}
        height={height}
        count={config.canopyCount}
        loopDurationFrames={config.loopDurationFrames}
      />

      {/* Layer 3: Các hạt sáng đơn lẻ bay ngược chiều & tự do trong không gian 3D */}
      <FloatingAmbientStarsThree
        palette={palette}
        width={width}
        height={height}
        count={60}
        loopDurationFrames={config.loopDurationFrames}
      />

      {/* Layer 4: Sàn sao 3D Three.js WebGL (Đang tập trung xử lý và tinh chỉnh chuẩn theo ảnh 1 và ảnh 3) */}
      <StageFloor
        palette={palette}
        width={width}
        height={height}
        count={config.floorCount}
        loopDurationFrames={config.loopDurationFrames}
      />

      {/* Layer 5: Định danh trung tâm (Monogram, Tên dâu rể, Ngày cưới) */}
      <CenterTypography
        config={config}
        palette={palette}
        width={width}
        height={height}
        loopDurationFrames={config.loopDurationFrames}
      />
    </div>
  );
};
