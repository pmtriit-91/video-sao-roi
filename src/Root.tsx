import React from "react";
import { Composition } from "remotion";
import { starConfig } from "./config/starConfig";
import { MainVideo } from "./MainVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Composition 2K QHD (2560 x 1440 @ 60fps) - Chuẩn tối ưu cho màn LED hội trường */}
      <Composition
        id="StarFall2K"
        component={MainVideo}
        durationInFrames={starConfig.loopDurationFrames}
        fps={60}
        width={2560}
        height={1440}
        defaultProps={{
          config: starConfig,
        }}
      />

      {/* Composition 4K UHD (3840 x 2160 @ 60fps) - Dành cho màn hình LED siêu lớn hoặc TV 4K */}
      <Composition
        id="StarFall4K"
        component={MainVideo}
        durationInFrames={starConfig.loopDurationFrames}
        fps={60}
        width={3840}
        height={2160}
        defaultProps={{
          config: starConfig,
        }}
      />
    </>
  );
};
