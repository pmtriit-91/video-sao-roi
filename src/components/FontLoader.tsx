import React, { useEffect, useState } from "react";
import { continueRender, delayRender } from "remotion";
import { loadFont as loadGreatVibes } from "@remotion/google-fonts/GreatVibes";
import { loadFont as loadAlexBrush } from "@remotion/google-fonts/AlexBrush";
import { loadFont as loadCormorant } from "@remotion/google-fonts/CormorantGaramond";
import { loadFont as loadCinzel } from "@remotion/google-fonts/Cinzel";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadJakarta } from "@remotion/google-fonts/PlusJakartaSans";

// Tải các font chữ thư pháp và serif tiệc cưới cao cấp hỗ trợ tiếng Việt
const greatVibesFont = loadGreatVibes("normal", {
  weights: ["400"],
  subsets: ["vietnamese", "latin"],
});

const alexBrushFont = loadAlexBrush("normal", {
  weights: ["400"],
  subsets: ["latin"],
});

const cormorantFont = loadCormorant("normal", {
  weights: ["600", "700"],
  subsets: ["vietnamese", "latin"],
});

const cinzelFont = loadCinzel("normal", {
  weights: ["600", "700", "800"],
  subsets: ["latin"],
});

const playfairFont = loadPlayfair("normal", {
  weights: ["600", "700"],
  subsets: ["vietnamese", "latin"],
});

const jakartaFont = loadJakarta("normal", {
  weights: ["300", "400", "600"],
  subsets: ["vietnamese", "latin"],
});

export const FontLoader: React.FC = () => {
  const [handle] = useState(() =>
    delayRender("Loading wedding luxury fonts via @remotion/google-fonts")
  );

  useEffect(() => {
    Promise.all([
      greatVibesFont.waitUntilDone(),
      alexBrushFont.waitUntilDone(),
      cormorantFont.waitUntilDone(),
      cinzelFont.waitUntilDone(),
      playfairFont.waitUntilDone(),
      jakartaFont.waitUntilDone(),
      document.fonts.ready,
    ])
      .then(() => {
        continueRender(handle);
      })
      .catch((err) => {
        console.warn("Font loading note:", err);
        continueRender(handle);
      });
  }, [handle]);

  return (
    <style>
      {`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          -webkit-font-smoothing: antialiased;
        }
      `}
    </style>
  );
};
