/**
 * Cấu hình Remotion xuất video chất lượng cao 2K/4K cho màn hình LED tiệc cưới
 * Chuẩn H.264, yuv420p, CRF 18 (visually lossless), đa luồng 100% CPU
 */
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setCodec("h264");
Config.setPixelFormat("yuv420p");
Config.setCrf(18);
Config.setAudioCodec("aac");
Config.setAudioBitrate("320k");
Config.setChromiumOpenGlRenderer("angle"); // Kích hoạt ANGLE GPU phần cứng cho Three.js WebGL (tránh lỗi crash WebGL context)
Config.setConcurrency(4); // Mức đa luồng an toàn cho 4 WebGL canvas 4K cùng lúc
