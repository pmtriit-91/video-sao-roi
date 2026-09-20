import React from "react";
import { useVideoConfig } from "remotion";
import { CenterTypography } from "./components/CenterTypography";
import { FallingStars } from "./components/FallingStars";
import { FontLoader } from "./components/FontLoader";
import { StageBackdrop } from "./components/StageBackdrop";
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

      {/* Layer 1: Nền nhung đen (Tạm tắt cột sáng sân khấu để tập trung trần & sàn) */}
      <StageBackdrop
        palette={palette}
        width={width}
        height={height}
        loopDurationFrames={config.loopDurationFrames}
        showBeams={false}
      />

      {/* Layer 2: Trần sao 3D (Đã hoàn thiện xuất sắc theo Ảnh 1 & 3) */}
      <StarCanopy
        palette={palette}
        width={width}
        height={height}
        count={config.canopyCount}
        loopDurationFrames={config.loopDurationFrames}
      />

      {/* Layer 3: Cơn mưa sao rơi tự do (Tạm tắt để tránh nhiễu theo chỉ thị) */}
      {/* <FallingStars
        palette={palette}
        width={width}
        height={height}
        count={config.fallingCount}
        loopDurationFrames={config.loopDurationFrames}
        safeZoneWidth={config.safeZoneWidth * (width / 2560)}
        safeZoneHeight={config.safeZoneHeight * (height / 1440)}
      /> */}

      {/* Layer 4: Sàn sao 3D Three.js WebGL (Đang tập trung xử lý và tinh chỉnh chuẩn theo ảnh 1 và ảnh 3) */}
      <StageFloor
        palette={palette}
        width={width}
        height={height}
        count={config.floorCount}
        loopDurationFrames={config.loopDurationFrames}
      />

      {/* Layer 5: Định danh trung tâm (Tạm tắt để tránh nhiễu theo chỉ thị) */}
      {/* <CenterTypography
        config={config}
        palette={palette}
        width={width}
        height={height}
        loopDurationFrames={config.loopDurationFrames}
      /> */}
    </div>
  );
};
