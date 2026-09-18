# Kế Hoạch Thiết Lập Khung Cấu Trúc Dự Án Sao Rơi 2K/4K (Remotion)

Dựa trên dự án cũ [`video-slide-damcuoi`](file:///Users/phamminhtri/Desktop/train/video-slide-damcuoi) và báo cáo bóc tách [`audit-sao-roi.md`](file:///Users/phamminhtri/Desktop/project/wedding/project-video-sao-roi/audit-sao-roi.md), chúng ta sẽ dựng lại một khung sườn dự án sạch sẽ, chuẩn chỉ, module hóa cao cho dự án mới tại `/Users/phamminhtri/Desktop/project/wedding/project-video-sao-roi`.

---

## 1. Kiến Trúc Cấu Trúc Thư Mục Dự Án (Project Tree)

Dự án sẽ được tổ chức tinh gọn theo cấu trúc chuyên nghiệp của Remotion:

```
project-video-sao-roi/
├── docs/                        # Thư mục lưu trữ tài liệu, audit, plans, guides (.md)
│   ├── audit-sao-roi.md         # Báo cáo phân tích & bóc tách kỹ thuật
│   └── implementation-plan.md   # Kế hoạch chi tiết kiến trúc & triển khai
├── public/
│   ├── fonts/                   # Font chữ cưới (nếu cần font local)
│   └── logos/                   # File SVG/PNG Monogram Logo (H T lồng nhau)
├── src/
│   ├── config/
│   │   ├── starConfig.ts        # File cấu hình trung tâm (Tên Dâu Rể, ngày, mật độ hạt, theme màu)
│   │   └── types.ts             # Định nghĩa Type TypeScript cho hạt, theme, cấu hình
│   ├── components/
│   │   ├── StageBackdrop.tsx    # Layer 1: Nền nhung đen + Cột sáng sân khấu quét chậm (Volumetric Beams)
│   │   ├── StarCanopy.tsx       # Layer 2: Vòm mây ngàn sao lấp lánh đỉnh màn hình
│   │   ├── FallingStars.tsx     # Layer 3: Cơn mưa sao rơi tự do + Hạt sao 4 cánh lóe sáng + Safe Zone
│   │   ├── StageFloor.tsx       # Layer 4: Thảm sao phản chiếu phối cảnh 3D mặt sàn + Center Stage Glow
│   │   ├── CenterTypography.tsx # Layer 5: Monogram Logo + Tên Dâu Rể Calligraphy + Ngày cưới Serif
│   │   └── FontLoader.tsx       # Tải font Google Fonts tối ưu cho tiệc cưới (Alex Brush, Great Vibes, Cormorant)
│   ├── MainVideo.tsx            # Composition chính ráp nối 5 Layer & điều phối Seamless Loop
│   ├── Root.tsx                 # Khai báo Compositions (Hỗ trợ cả 2K 2560x1440 và 4K 3840x2160 @ 60fps)
│   └── index.ts                 # Điểm khởi động Remotion (registerRoot)
├── remotion.config.ts           # Cấu hình render H.264, CRF 18, yuv420p, --gl=angle
├── tsconfig.json                # TypeScript compiler config chuẩn Remotion
├── package.json                 # Scripts: start, build, render:2k, render:4k, dependencies
├── .gitignore                   # Bỏ qua node_modules, out/, .DS_Store
└── README.md                    # Hướng dẫn chạy và xuất video dự án
```

---

## 2. Kế Hoạch Thay Đổi & Tạo Từng File (Proposed Changes)

### Thư mục Tài liệu & Báo cáo (`docs/`)
#### [NEW] [`docs/audit-sao-roi.md`](file:///Users/phamminhtri/Desktop/project/wedding/project-video-sao-roi/docs/audit-sao-roi.md)
- Di chuyển/lưu trữ toàn bộ bản phân tích bóc tách 5 layers kỹ thuật vào đây để quản lý tập trung.

#### [NEW] [`docs/implementation-plan.md`](file:///Users/phamminhtri/Desktop/project/wedding/project-video-sao-roi/docs/implementation-plan.md)
- Lưu trữ tài liệu kế hoạch kiến trúc và lộ trình triển khai video sao rơi 2K/4K.

---

### Cấu hình gốc & Môi trường thực thi
#### [NEW] [package.json](file:///Users/phamminhtri/Desktop/project/wedding/project-video-sao-roi/package.json)
- Khai báo các gói: `remotion`, `@remotion/cli`, `@remotion/google-fonts`, `@remotion/effects`, `react`, `react-dom`, `typescript`.
- Khai báo scripts:
  - `"start"`: `remotion studio` (xem trực tiếp trên trình duyệt `localhost:3000`).
  - `"render:2k"`: `remotion render StarFall2K out/sao-roi-2k.mp4 --concurrency=100% --crf=18 --gl=angle`
  - `"render:4k"`: `remotion render StarFall4K out/sao-roi-4k.mp4 --concurrency=100% --crf=18 --gl=angle`

#### [NEW] [remotion.config.ts](file:///Users/phamminhtri/Desktop/project/wedding/project-video-sao-roi/remotion.config.ts)
- Thiết lập: H.264, CRF 18 (visually lossless), yuv420p (tương thích mọi màn LED), JPEG image format, 100% concurrency.

#### [NEW] [tsconfig.json](file:///Users/phamminhtri/Desktop/project/wedding/project-video-sao-roi/tsconfig.json) & [NEW] [.gitignore](file:///Users/phamminhtri/Desktop/project/wedding/project-video-sao-roi/.gitignore)
- Thiết lập biên dịch TypeScript và loại trừ file rác/build.

---

### Module Cấu hình & Định kiểu dữ liệu (`src/config/`)
#### [NEW] [`types.ts`](file:///Users/phamminhtri/Desktop/project/wedding/project-video-sao-roi/src/config/types.ts)
- Định nghĩa type cho:
  - `StarParticle`: Tọa độ X/Y, kích thước, độ sáng, vận tốc rơi, độ lắc lư ngang, pha nhấp nháy, kiểu hạt (tròn phát quang hoặc sao 4 cánh diamond).
  - `ThemeColorConfig`: Bảng màu (`primary`, `secondary`, `glow`, `backdrop`).
  - `WeddingStarConfig`: Toàn bộ cấu hình có thể tùy biến.

#### [NEW] [`starConfig.ts`](file:///Users/phamminhtri/Desktop/project/wedding/project-video-sao-roi/src/config/starConfig.ts)
- Quản lý tập trung:
  - Thông tin dâu rể: `brideName: "CẨM HƯƠNG"`, `groomName: "MINH TRÍ"`, `date: "27/9/2026"`.
  - Monogram text/logo: `"H T"`.
  - Mật độ hạt: Số lượng hạt vòm trên, hạt mưa rơi, hạt thảm sàn.
  - Vòng lặp: Thời lượng mặc định (ví dụ 15s hoặc 20s @ 60fps).
  - Theme màu tùy chọn: `silverDiamond` (mặc định như clip mẫu), `champagneGold`, `midnightSapphire`.

---

### Module Các Lớp Đồ Họa 5 Layers (`src/components/`)
#### [NEW] [`StageBackdrop.tsx`](file:///Users/phamminhtri/Desktop/project/wedding/project-video-sao-roi/src/components/StageBackdrop.tsx) *(Layer 1)*
- Rèm nhung màu than chì/đen sâu với hiệu ứng xếp nếp đứng tinh tế.
- Các cột sáng quét dọc (Volumetric light beams) chuyển động lắc lư mềm mại tạo không gian sân khấu 3D.
- Không sử dụng `backdrop-filter` để đảm bảo 100% không bị giật sọc.

#### [NEW] [`StarCanopy.tsx`](file:///Users/phamminhtri/Desktop/project/wedding/project-video-sao-roi/src/components/StarCanopy.tsx) *(Layer 2)*
- Vòm mây ngàn sao đỉnh màn hình với đường cong ôm tự nhiên.
- Hàng ngàn hạt micro-star nhấp nháy êm dịu (twinkle) theo chu kỳ hàm Sin.

#### [NEW] [`FallingStars.tsx`](file:///Users/phamminhtri/Desktop/project/wedding/project-video-sao-roi/src/components/FallingStars.tsx) *(Layer 3)*
- Thuật toán rơi tự do kết hợp lắc lư ngang mượt mà.
- Vòng lặp Modulo đảm bảo Seamless Loop (frame cuối tiếp nối frame đầu không vết nối).
- Các ngôi sao 4 cánh kim cương (Diamond cross glints) lóe sáng điểm xuyết.
- Center Safe Zone: Giảm mật độ hạt rơi ở khu vực chữ giữa màn hình.

#### [NEW] [`StageFloor.tsx`](file:///Users/phamminhtri/Desktop/project/wedding/project-video-sao-roi/src/components/StageFloor.tsx) *(Layer 4)*
- Thảm hạt kim tuyến phản chiếu mặt sàn với phối cảnh 3D (Perspective).
- Quầng sáng tụ trung tâm (Center stage spotlight highlight).

#### [NEW] [`CenterTypography.tsx`](file:///Users/phamminhtri/Desktop/project/wedding/project-video-sao-roi/src/components/CenterTypography.tsx) *(Layer 5)*
- Logo Monogram H T thanh thoát, sắc nét.
- Tên Dâu Rể "Cẩm Hương & Minh Trí" phong cách Calligraphy uốn lượn.
- Ngày cưới "27/9/2026" font cổ điển Serif.
- Hiệu ứng Soft Glow nhiều tầng nổi bật trên nền tối.

#### [NEW] [`FontLoader.tsx`](file:///Users/phamminhtri/Desktop/project/wedding/project-video-sao-roi/src/components/FontLoader.tsx)
- Nạp font từ Google Fonts hoặc local: `Alex Brush` / `Great Vibes` (Script) và `Cormorant Garamond` / `Cinzel` (Serif).

---

### Module Khởi Tạo & Xuất Video
#### [NEW] [`MainVideo.tsx`](file:///Users/phamminhtri/Desktop/project/wedding/project-video-sao-roi/src/MainVideo.tsx)
- Ráp nối 5 layer theo đúng thứ tự chiều sâu `zIndex`.
- Đồng bộ thời gian và nhịp thở của ánh sáng toàn khung hình.

#### [NEW] [`Root.tsx`](file:///Users/phamminhtri/Desktop/project/wedding/project-video-sao-roi/src/Root.tsx)
- Đăng ký 2 Compositions:
  - `StarFall2K`: `width: 2560, height: 1440, fps: 60`
  - `StarFall4K`: `width: 3840, height: 2160, fps: 60`

#### [NEW] [`index.ts`](file:///Users/phamminhtri/Desktop/project/wedding/project-video-sao-roi/src/index.ts)
- Khởi chạy Remotion bằng `registerRoot(RemotionRoot)`.

---

## 3. Kế Hoạch Kiểm Tra & Xác Nhận (Verification Plan)

### Kiểm tra tự động & Cài đặt
1. Khởi tạo `npm install` để kéo đầy đủ các dependencies cần thiết.
2. Kiểm tra TypeScript build (`npx tsc --noEmit`) để chắc chắn 100% không có lỗi type hay import.

### Kiểm tra giao diện & Chuyển động
1. Chạy `npm start` (`remotion studio`) kiểm tra giao diện xem trước trên browser:
   - Kiểm tra độ mượt của hạt sao rơi.
   - Kiểm tra tính Seamless Loop (khi tua từ frame cuối về frame đầu không bị khựng).
   - Kiểm tra độ sắc nét của chữ và logo.
