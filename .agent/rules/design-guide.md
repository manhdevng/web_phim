---
trigger: always_on
---

# Design Guide: Lumière Cinema (Apple-Liquid-Glass Style)

## 1. Core Visual Principles
- **Aesthetic:** High-end, dark cinematic atmosphere combined with Apple-style frosted glass.
- **Glassmorphism:** Use `backdrop-blur-xl` + `bg-white/10` + `border border-white/20`.
- **Shapes:** Use "Pill" shapes (`rounded-full`) for navigation and primary action buttons.

## 2. Layout Standards
- **Container:** Main content width should be expansive (`max-w-[90vw]`) to frame the movie experience.
- **Background:** Use `/img/brick.jpg` with a warm top-down spotlight effect (`radial-gradient`).
- **Navbar:** Must be a floating pill, centered via `grid-cols-[1fr_auto_1fr]` to ensure perfect symmetry of the central menu items.

## 3. Typography & Spacing
- **Titles:** `font-playfair` (Serif) for a classic theater feel.
- **Body/UI:** `font-inter` (Sans-serif) for modern legibility.
- **No Wrap:** Navigation labels must include `whitespace-nowrap` to prevent messy line breaks.

## 4. Components
- **Buttons:** Always add `transition-all duration-300` and subtle hover glows.
- **Modals:** Use `framer-motion` for entry/exit animations with a heavy dark backdrop blur.

## 5. Business Logic & Luồng nghiệp vụ thực tế (Lumière Cinema)

### Stack
- Framework: Next.js (App Router)
- Database & Auth: Supabase
- API phim: TMDB API
- Style: Apple Liquid Glass, Glassmorphism, dark cinematic

---

### Luồng 1 — Xác thực ✅ HOÀN THIỆN
- Đăng ký / đăng nhập qua Supabase Auth
- Hỗ trợ OAuth (Google, Facebook) + email/password
- Sau login: redirect về trang trước đó
- Session lưu qua Supabase JWT

---

### Luồng 2 — Duyệt phim ✅ HOÀN THIỆN
- Trang chủ: Hero banner (backdrop TMDB) + các section ngang
- Các section hiện có: Xu hướng, Phim Việt Nam đặc sắc,
  Tình cảm lãng mạn, Phim hoạt hình, Đánh giá từ khán giả
- Navbar: Trang chủ | Thể loại | Phim hot | Tìm kiếm | Avatar
- Card phim: poster + tên + năm + thể loại + badge (VIP/Free/Đoạt giải)

---

### Luồng 3 — Xem phim ⚠️ CẦN HOÀN THIỆN
Thứ tự bắt buộc:
1. Click vào card phim → Trang chi tiết phim
   - Hiển thị: backdrop, poster, tên, mô tả, cast, trailer
   - Nếu overview TMDB là tiếng Anh → dùng tiếng Anh (KHÔNG để "Chưa có mô tả")
2. Kiểm tra quyền trước khi phát:
   - Chưa đăng nhập → Redirect /login
   - Đã login + phim FREE → Phát luôn
   - Đã login + phim VIP + user có Premium → Phát luôn
   - Đã login + phim VIP + user KHÔNG có Premium → Hiện popup "Nâng cấp Premium"
3. Player: YouTube embed (/embed/KEY từ TMDB /videos)
   - Có nút: Play/Pause, fullscreen, âm lượng, phụ đề
   - Tự động lưu vào Lịch sử xem (Supabase) khi bắt đầu xem

---

### Luồng 4 — Tìm kiếm ⚠️ CẦN HOÀN THIỆN
- Thanh tìm kiếm trên navbar → mở trang /search
- Debounce 300ms khi gõ → gọi TMDB search API
- Hiển thị gợi ý realtime (dropdown)
- Trang kết quả: grid phim + bộ lọc (thể loại, năm, sort)

---

### Luồng 5 — Subscription ⚠️ CẦN HOÀN THIỆN
- Trang /pricing: hiển thị các gói (Tháng / Năm / Ưu đãi)
- Thanh toán: VNPay hoặc Momo
- Sau thanh toán thành công:
  - Cập nhật trường premium_expires_at trong Supabase
  - Redirect về trang phim đang xem (nếu có)
- Sidebar profile đã có: hiển thị "Lumière Premium" + ngày hết hạn ✅
- Nút "Gia hạn ngay" → dẫn đến /pricing ✅

---

### Luồng 6 — Tài khoản ✅ HOÀN THIỆN
Route: /profile (3 tab)
- Thông tin cá nhân: avatar, tên, SĐT, email (readonly), đổi mật khẩu
- Lịch sử xem (/profile/history): grid phim đã xem
  ⚠️ FIX: ảnh đang bị vỡ → cần ghép đúng TMDB image URL
- Phim yêu thích (/profile/watchlist): grid phim đã lưu
  ⚠️ FIX: bỏ badge "Get Tickets" → đổi thành "Xem ngay"

---

### TMDB Image Rules (BẮT BUỘC)
- Poster:   https://image.tmdb.org/t/p/w500   + poster_path
- Backdrop: https://image.tmdb.org/t/p/original + backdrop_path
- Fallback: nếu poster_path null → hiện div màu xám + tên phim
- Mô tả: nếu overview rỗng → dùng "No description available"
  KHÔNG dùng "Chưa có mô tả tiếng Việt cho phim này"

### Video Player Rules
- Lấy trailer: GET /movie/{id}/videos?api_key=KEY
- Lọc: site === 'YouTube' && type === 'Trailer'
- Embed URL: https://www.youtube.com/embed/{key}
- KHÔNG dùng watch?v=

### Kiểm tra quyền (middleware)
- Lưu trạng thái Premium trong Supabase: bảng profiles
  Field: is_premium (boolean), premium_expires_at (timestamp)
- Kiểm tra mỗi lần vào trang xem phim
- Phim có tag 'LUMIÈRE VIP' → bắt buộc kiểm tra quyền