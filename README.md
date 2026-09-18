# 💍 Video Sao Rơi Màn Hình LED Tiệc Cưới 2K/4K

Dự án tạo video nền visual **Sao Rơi Sân Khấu (Starfall & Diamond Dust Stage Backdrop)** chuẩn **2K QHD (2560x1440)** và **4K UHD (3840x2160)** @ **60fps** chạy lặp **Seamless Loop 100%** bằng công nghệ **Remotion (React + TypeScript)**.

---

## ✨ Tính Năng Nổi Bật

- **Độ phân giải siêu cao:** Tùy chọn xuất bản **2K** (`2560x1440`) hoặc **4K** (`3840x2160`) với tốc độ **60 fps** siêu mượt mà.
- **Vòng lặp vĩnh cửu (Seamless Loop 100%):** Frame cuối tiếp nối chính xác vào frame đầu, có thể phát lặp liên tục suốt buổi tiệc mà không có gợn gián đoạn.
- **Bóc tách 5 Layers hoàn chỉnh:**
  1. `StageBackdrop`: Phông rèm nhung đen sâu + Cột ánh sáng sân khấu (Volumetric Light Beams).
  2. `StarCanopy`: Vòm mây ngàn sao lấp lánh (Twinkle) đỉnh màn hình.
  3. `FallingStars`: Mưa sao rơi tự do, hạt sao 4 cánh kim cương (Diamond Glints) + Vùng an toàn chữ (Center Safe Zone).
  4. `StageFloor`: Thảm sao phản chiếu chiều sâu phối cảnh 3D mặt sàn + Tâm sáng sân khấu (Stage Spotlight Glow).
  5. `CenterTypography`: Monogram Logo (H lồng T) + Tên Dâu Rể Calligraphy + Ngày cưới Serif phát quang lộng lẫy.
- **Dễ dàng Tùy biến:** Quản lý tập trung toàn bộ tên Dâu Rể, ngày cưới, theme màu, số lượng hạt tại `src/config/starConfig.ts`.
- **Đa dạng Theme màu cưới:**
  - `silverDiamond`: Trắng Bạc Kim Cương (Mặc định).
  - `champagneGold`: Vàng Ánh Kim Hoàng Gia.
  - `midnightSapphire`: Xanh Lam Huyền Ảo.
  - `roseGold`: Hồng Vàng Ngọt Ngào.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy

### 1. Cài đặt thư viện
```bash
npm install
```

### 2. Xem trước trực tiếp trên Trình duyệt (Remotion Studio)
```bash
npm start
```
Trình duyệt sẽ tự động mở `http://localhost:3000`. Bạn có thể:
- Xem trước chuyển động thời gian thực.
- Kéo thanh trượt thời gian để soi từng frame.
- Chỉnh sửa tên, đổi màu trong `src/config/starConfig.ts` và thấy cập nhật tức thì.

### 3. Xuất video chất lượng cao (Render MP4)

- **Xuất video bản 2K QHD (2560x1440 @ 60fps):**
  ```bash
  npm run render:2k
  ```
  File video xuất ra tại: `out/sao-roi-2k.mp4`

- **Xuất video bản 4K UHD (3840x2160 @ 60fps):**
  ```bash
  npm run render:4k
  ```
  File video xuất ra tại: `out/sao-roi-4k.mp4`

---

## 📁 Cấu Trúc Thư Mục

```
project-video-sao-roi/
├── docs/                        # Thư mục lưu trữ tài liệu, audit, plans (.md)
│   ├── audit-sao-roi.md         # Báo cáo phân tích & bóc tách kỹ thuật chi tiết
│   └── implementation-plan.md   # Kế hoạch kiến trúc dự án
├── public/                      # Chứa assets tĩnh (logos, fonts...)
├── src/
│   ├── config/
│   │   ├── starConfig.ts        # File cấu hình trung tâm (Tên, Ngày, Màu, Hạt)
│   │   └── types.ts             # Định nghĩa Type TypeScript
│   ├── components/              # 5 Lớp đồ họa visual bóc tách
│   │   ├── StageBackdrop.tsx    # Layer 1
│   │   ├── StarCanopy.tsx       # Layer 2
│   │   ├── FallingStars.tsx     # Layer 3
│   │   ├── StageFloor.tsx       # Layer 4
│   │   ├── CenterTypography.tsx # Layer 5
│   │   └── FontLoader.tsx       # Tải font Google Fonts
│   ├── MainVideo.tsx            # Composition tổng thể
│   ├── Root.tsx                 # Khai báo StarFall2K và StarFall4K
│   └── index.ts                 # Entry point
├── remotion.config.ts           # Cấu hình H.264, CRF 18, yuv420p
├── tsconfig.json
├── package.json
└── README.md
```
