## Context

Dự án WaCat Finance là ứng dụng React + Vite với Supabase làm backend. Trang `signin.tsx` đã có giao diện neumorphic cho cả email/password lẫn button "Continue with Google", nhưng logic OAuth chưa hoạt động với cấu hình production. Codebase sử dụng `@supabase/supabase-js` để xử lý auth.

## Goals / Non-Goals

**Goals:**
- Kích hoạt đăng nhập/đăng ký bằng Google thông qua Supabase OAuth2
- Xử lý loading state riêng biệt cho Google OAuth button (không gây nhầm lẫn với form loading state)
- Xử lý lỗi OAuth và hiển thị thông báo thân thiện cho người dùng
- Đảm bảo redirect hoạt động đúng trên cả môi trường local và Vercel production
- Hướng dẫn thiết lập Supabase Dashboard + Google Cloud Console (quy trình cấu hình)

**Non-Goals:**
- Hỗ trợ thêm OAuth providers khác (GitHub, Facebook...) trong change này
- Thay đổi giao diện/UI của button Google (button đã đẹp, giữ nguyên)
- Xây dựng tính năng "Link account" (liên kết tài khoản email hiện có với Google)
- Thêm tính năng "Quên mật khẩu"

## Decisions

**1. Dùng `signInWithOAuth` của Supabase thay vì Google SDK trực tiếp**
- Supabase đã encapsulate toàn bộ OAuth flow, không cần cài thêm package
- Nhất quán với cách xử lý auth hiện tại trong codebase

**2. `redirectTo` động theo môi trường**
- Dùng `window.location.origin` để tự detect đúng domain (localhost:5173 hoặc wacat-finance-manager.vercel.app)
- Không hardcode URL → tránh lỗi khi deploy

**3. Loading state riêng cho Google button (`isGoogleLoading`)**
- Tránh trường hợp click Google xong bị disable form email/password trước khi redirect
- UX rõ ràng hơn

**4. Error state dùng chung `error` state đã có sẵn**
- Không tạo thêm state mới, hiển thị lỗi Google OAuth trong cùng error banner
- Giảm complexity

**5. Cấu hình Supabase Redirect URL**
- Thêm cả `http://localhost:5173` và `https://wacat-finance-manager.vercel.app` vào Supabase → Site URL + Additional Redirect URLs
- Đây là bước bắt buộc ngoài code

## Risks / Trade-offs

| Rủi ro | Mức độ | Phương án giảm thiểu |
|--------|--------|----------------------|
| Cấu hình sai Redirect URL → lỗi `redirect_uri_mismatch` | Cao | Checklist hướng dẫn từng bước trong tasks |
| Người dùng Google chưa có profile trong DB ứng dụng | Trung bình | Supabase tự tạo record trong `auth.users`; app dùng data từ auth session là đủ |
| OAuth popup bị block bởi browser | Thấp | Supabase dùng redirect flow (không popup), không bị ảnh hưởng |
| Session không persist sau redirect | Thấp | Supabase JS client tự xử lý session qua URL hash/query params |
