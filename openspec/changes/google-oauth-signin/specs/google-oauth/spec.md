## ADDED Requirements

### Requirement: Google OAuth Login
Người dùng có thể nhấn "Continue with Google" để đăng nhập hoặc đăng ký bằng tài khoản Google, không cần nhập email/password thủ công.

#### Scenario: Đăng nhập Google thành công
- **WHEN** người dùng nhấn button "Continue with Google" và hoàn thành xác thực trên trang Google
- **THEN** Supabase xác nhận token, tạo/cập nhật session, và ứng dụng redirect về trang dashboard (`/`)

#### Scenario: Google OAuth loading state
- **WHEN** người dùng nhấn button "Continue with Google"
- **THEN** button hiển thị trạng thái loading (spinner) và bị vô hiệu hóa để tránh click nhiều lần trong khi chờ redirect

#### Scenario: Google OAuth thất bại
- **WHEN** xảy ra lỗi trong quá trình OAuth (người dùng cancel, lỗi mạng, cấu hình sai)
- **THEN** hiển thị thông báo lỗi thân thiện trong error banner hiện có của form

#### Scenario: Redirect đúng môi trường
- **WHEN** người dùng đăng nhập Google từ môi trường local development (`localhost:5173`) hoặc production (`vercel.app`)
- **THEN** sau khi xác thực, họ được redirect về đúng domain tương ứng mà không gặp lỗi `redirect_uri_mismatch`

#### Scenario: Người dùng mới đăng nhập lần đầu qua Google
- **WHEN** email Google chưa tồn tại trong hệ thống
- **THEN** Supabase tự động tạo tài khoản mới và người dùng vào được dashboard như thường (không hiện lỗi "user not found")
