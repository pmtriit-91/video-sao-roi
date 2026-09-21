/**
 * ==============================================================================
 *  BẢNG ĐIỀU KHIỂN & CẤU HÌNH TIỆC CƯỚI (WEDDING BUSINESS CONTROL PANEL)
 * ==============================================================================
 * 
 *  File cấu hình trung tâm dành cho việc kinh doanh và sản xuất video màn hình LED tiệc cưới.
 *  Chỉ cần thay đổi thông tin tại đây, toàn bộ video (2K & 4K) sẽ tự động cập nhật ngay lập tức!
 * 
 *  --- HƯỚNG DẪN DÀNH CHO KỸ THUẬT VIÊN / CHỦ SHOP SẢN XUẤT VIDEO ---
 * 
 *  1. THAY ĐỔI TÊN DÂU RỂ:
 *     - Sửa `brideName` (Tên Cô Dâu) và `groomName` (Tên Chú Rể).
 *     - Viết hoa chữ cái đầu (Title Case) để phông chữ ký thư pháp uốn lượn đẹp nhất.
 * 
 *  2. THAY ĐỔI NGÀY CƯỚI:
 *     - Sửa `weddingDate` theo định dạng mong muốn (ví dụ: "27.09.2026" hoặc "27 · 09 · 2026").
 * 
 *  3. THAY ĐỔI LOGO ĐÍNH KÈM:
 *     - CÁCH 1: Dùng Logo Hoàng Gia mặc định (chữ lồng H - T chuẩn quý tộc có sẵn):
 *       Đặt `logoType: "builtInHT"`
 *     - CÁCH 2: Dùng Logo riêng của khách hàng (file ảnh .png nền trong suốt hoặc file vector .svg):
 *       Đặt `logoType: "custom"`
 *       Copy file logo vào thư mục `public/logos/` (ví dụ: `public/logos/logo-khach.png`)
 *       Điền đường dẫn vào `customLogoPath: "logos/logo-khach.png"`
 *       -> Hệ thống sẽ tự động tạo hiệu ứng quét sáng kim cương trắng tinh khôi lên logo của khách!
 * 
 *  4. THAY ĐỔI TÔNG MÀU SÂN KHẤU (THEME):
 *     - "silverDiamond": Kim Cương Bạch Kim (mặc định - thanh khiết, siêu sang trọng)
 *     - "champagneGold": Vàng Champagne Hoàng Gia (quý phái, ấm áp)
 *     - "roseGold": Vàng Hồng Ngọt Ngào (lãng mạn, nhẹ nhàng)
 *     - "midnightSapphire": Xanh Sapphire Dạ Yến (huyền bí, điện ảnh)
 * 
 *  5. XUẤT FILE VIDEO THÀNH PHẨM (RENDER MP4):
 *     - Bản 2K QHD (2560 x 1440 @ 60fps - Chuẩn nét căng cho hội trường tiệc cưới):
 *         npm run render:2k
 *     - Bản 4K UHD (3840 x 2160 @ 60fps - Chuẩn siêu nét cho màn LED P2 / P3 cỡ lớn):
 *         npm run render:4k
 *     Video xuất ra nằm ở thư mục `out/` sẵn sàng bàn giao cho khách hàng hoặc chép vào USB.
 * ==============================================================================
 */

export interface WeddingClientConfig {
  /** Tên Cô Dâu (viết hoa chữ cái đầu, ví dụ: "Cẩm Hương", "Thùy Linh", "Phương Thảo") */
  brideName: string;

  /** Tên Chú Rể (viết hoa chữ cái đầu, ví dụ: "Minh Trí", "Quang Minh", "Đức Anh") */
  groomName: string;

  /** Ngày cưới hiển thị (ví dụ: "27.09.2026", "27 · 09 · 2026") */
  weddingDate: string;

  /** Kiểu Logo: "builtInHT" (logo hoàng gia H-T có sẵn) hoặc "custom" (dùng file logo riêng của khách) */
  logoType: "builtInHT" | "custom";

  /** Đường dẫn file logo của khách trong thư mục public/ (chỉ cần khi logoType = "custom", ví dụ: "logos/my-logo.png") */
  customLogoPath?: string;

  /** Chủ đề màu sắc tiệc cưới */
  theme: "silverDiamond" | "champagneGold" | "roseGold" | "midnightSapphire";
}

/**
 * THÔNG TIN TIỆC CƯỚI CẦN XUẤT VIDEO (CHỈNH SỬA TRỰC TIẾP TẠI ĐÂY)
 */
export const weddingClientConfig: WeddingClientConfig = {
  // 1. Tên cặp đôi
  brideName: "Cẩm Hương",
  groomName: "Minh Trí",

  // 2. Ngày tổ chức hôn lễ
  weddingDate: "27.09.2026",

  // 3. Logo định danh
  // - Chọn "builtInHT" nếu muốn dùng logo monogram hoàng gia H - T có sẵn
  // - Chọn "custom" và điền customLogoPath nếu khách có file logo riêng
  logoType: "builtInHT",
  customLogoPath: "", // Ví dụ: "logos/logo-khach.png" (file đặt trong thư mục public/logos/)

  // 4. Tông màu chủ đạo
  theme: "silverDiamond",
};
