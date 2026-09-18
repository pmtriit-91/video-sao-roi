import React from "react";
import { useVideoConfig } from "remotion";
import { CenterTypography } from "./components/CenterTypography";
import { FallingStars } from "./components/FallingStars";
import { FontLoader } from "./components/FontLoader";
import { StageBackdrop } from "./components/StageBackdrop";
import { StageFloor } from "./components/StageFloor";
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

      {/* Layer 1: Nền nhung đen & Cột ánh sáng sân khấu */}
      <StageBackdrop
        palette={palette}
        width={width}
        height={height}
        loopDurationFrames={config.loopDurationFrames}
      />

      {/* Layer 2: Vòm mây sao lấp lánh đỉnh màn hình */}
      <StarCanopy
        palette={palette}
        width={width}
        height={height}
        count={config.canopyCount}
        loopDurationFrames={config.loopDurationFrames}
      />

      {/* Layer 3: Cơn mưa sao rơi tự do & Hạt kim cương lóe sáng */}
      <FallingStars
        palette={palette}
        width={width}
        height={height}
        count={config.fallingCount}
        loopDurationFrames={config.loopDurationFrames}
        safeZoneWidth={config.safeZoneWidth * (width / 2560)}
        safeZoneHeight={config.safeZoneHeight * (height / 1440)}
      />

      {/* Layer 4: Thảm kim tuyến phản chiếu phối cảnh 3D mặt sàn */}
      <StageFloor
        palette={palette}
        width={width}
        height={height}
        count={config.floorCount}
        loopDurationFrames={config.loopDurationFrames}
      />

      {/* Layer 5: Định danh trung tâm (Monogram Logo + Tên Dâu Rể + Ngày cưới) */}
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
