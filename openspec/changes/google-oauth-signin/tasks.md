## 1. Cấu hình Google Cloud Console

- [ ] 1.1 Truy cập [Google Cloud Console](https://console.cloud.google.com), tạo project mới (hoặc dùng project có sẵn)
- [ ] 1.2 Vào **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client IDs**
- [ ] 1.3 Chọn Application type: **Web application**
- [ ] 1.4 Thêm **Authorised JavaScript origins**: `http://localhost:5173` và `https://wacat-finance-manager.vercel.app`
- [ ] 1.5 Thêm **Authorised redirect URIs**: `https://hxmyhvdevipcwunxiycg.supabase.co/auth/v1/callback`
- [ ] 1.6 Lưu lại **Client ID** và **Client Secret**

## 2. Cấu hình Supabase Dashboard

- [ ] 2.1 Vào [Supabase Dashboard](https://app.supabase.com) → Project → **Authentication → Providers**
- [ ] 2.2 Tìm **Google**, bật toggle **Enable Sign in with Google**
- [ ] 2.3 Dán **Client ID** và **Client Secret** vừa lấy từ Google Cloud Console vào
- [ ] 2.4 Lưu lại
- [ ] 2.5 Vào **Authentication → URL Configuration**
- [ ] 2.6 Cập nhật **Site URL**: `https://wacat-finance-manager.vercel.app`
- [ ] 2.7 Thêm vào **Additional Redirect URLs**: `http://localhost:5173` và `https://wacat-finance-manager.vercel.app`
- [ ] 2.8 Lưu lại

## 3. Cập nhật `signin.tsx`

- [ ] 3.1 Thêm state `isGoogleLoading` riêng để track trạng thái loading của Google button
- [ ] 3.2 Cập nhật handler của Google button: set `isGoogleLoading = true`, bọc trong try/catch, set error nếu thất bại
- [ ] 3.3 Cập nhật `redirectTo` dùng `window.location.origin` (đã đúng — xác nhận lại không hardcode URL)
- [ ] 3.4 Cập nhật giao diện Google button: hiện spinner khi `isGoogleLoading = true`, disable button khi đang loading
- [ ] 3.5 Kiểm tra import `supabase` và các state đúng chuẩn

## 4. Kiểm thử

- [ ] 4.1 Test đăng nhập Google trên **localhost** (`npm run dev`) — xác nhận redirect đúng về `localhost:5173`
- [ ] 4.2 Test đăng nhập Google trên **Vercel production** — xác nhận redirect đúng về domain production
- [ ] 4.3 Test với tài khoản Google **mới chưa có trong hệ thống** — xác nhận tài khoản tự động được tạo và vào dashboard
- [ ] 4.4 Test với tài khoản Google **đã tồn tại** — xác nhận đăng nhập thành công bình thường
- [ ] 4.5 Test **cancel** trang xác thực Google giữa chừng — xác nhận loading state reset, hiện thông báo lỗi phù hợp
