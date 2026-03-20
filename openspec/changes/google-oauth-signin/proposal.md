## Why

Trang Sign In hiện đã có giao diện button "Continue with Google" nhưng chức năng chưa được kích hoạt và cấu hình đầy đủ. Người dùng không thể đăng nhập bằng Google vì Supabase OAuth Provider chưa được thiết lập, URL redirect chưa đúng với môi trường production (Vercel), và không có xử lý trạng thái loading/error riêng cho OAuth. Tính năng này giúp giảm ma sát khi đăng ký/đăng nhập, cải thiện trải nghiệm người dùng và tăng tỷ lệ đăng ký tài khoản mới.

## What Changes

- **Cấu hình Supabase**: Kích hoạt Google OAuth Provider trên Supabase Dashboard, thêm Client ID/Secret từ Google Cloud Console, cấu hình Redirect URL phù hợp với cả môi trường local và Vercel production.
- **Cập nhật `signin.tsx`**: Thêm loading state riêng cho Google OAuth button, thêm error handling khi OAuth thất bại, cải thiện `redirectTo` để tự động phát hiện môi trường (localhost vs production).
- **Xử lý callback sau OAuth**: Đảm bảo `useAuth` hook (hoặc auth guard) bắt được session sau khi Supabase redirect về, dẫn người dùng vào dashboard (`/`) đúng cách.
- **Biến môi trường Vercel**: Không cần thêm biến mới — `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` đã đủ; chỉ cần cấu hình thêm Redirect URL trên Supabase dashboard.

## Capabilities

### New Capabilities
- `google-oauth`: Cho phép người dùng đăng nhập / đăng ký bằng tài khoản Google thông qua Supabase OAuth2, bao gồm loading state, error handling, và redirect đúng sau xác thực.

### Modified Capabilities
- (Không có thay đổi spec-level nào cho các capabilities hiện có)

## Impact

- **Affected files**:
  - `src/app/pages/signin.tsx` — cập nhật Google OAuth button handler
  - `src/hooks/useAuth.ts` (nếu có) — kiểm tra session handling sau OAuth redirect
- **External services**:
  - Supabase Dashboard: bật Google Provider, cấu hình Redirect URL
  - Google Cloud Console: tạo OAuth 2.0 Client ID & Secret
  - Vercel: không cần thay đổi nếu Supabase đã cấu hình đúng Redirect URL
- **Dependencies**: Không cần thêm package mới — `@supabase/supabase-js` đã hỗ trợ sẵn OAuth.
- **Data models**: Không thay đổi — Supabase tự động tạo user trong bảng `auth.users` khi OAuth thành công.
