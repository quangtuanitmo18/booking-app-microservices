# Danh sách Công việc (Tickets) - Frontend & BFF

Dưới đây là breakdown các tasks chi tiết để thực thi dựa trên PRD và Blueprint.

## Sprint 1: Foundation & Authentication (BFF & Next.js)

### [TICKET-01] Khởi tạo dự án BFF (NestJS)
- **Mô tả:** Tạo project NestJS mới đóng vai trò API Gateway/BFF. Cấu hình Axios/HttpModule hoặc gRPC client để gọi tới `Identity Service`.
- **Nhiệm vụ:**
  - `nest new api-gateway` trong thư mục `src/`.
  - Cấu hình Global Exception Filter, Swagger (nếu cần) và `class-validator`.
  - Cấu hình kết nối tới nội bộ (Identity service: `http://identity:3000` hoặc qua docker DNS).

### [TICKET-01.5] Cấu hình Docker cho BFF & Frontend
- **Mô tả:** Đưa 2 service mới vào hệ sinh thái Docker Compose hiện tại để chuẩn môi trường Local/Dev.
- **Nhiệm vụ:**
  - Viết `Dockerfile` cho `src/api-gateway` và `src/frontend`.
  - Cập nhật `deployments/docker-compose/docker-compose.yaml` để khởi chạy cùng các backend services khác.

### [TICKET-02] Khởi tạo dự án Web (Next.js)
- **Mô tả:** Tạo project Next.js 14 (App Router) với Tailwind CSS.
- **Nhiệm vụ:**
  - `npx create-next-app@latest frontend` trong thư mục `src/`.
  - Cài đặt `shadcn/ui`, cấu hình font chữ (Inter/Roboto) và theme Dark/Light.
  - Cài đặt `zustand`, `@tanstack/react-query`, `axios`.

### [TICKET-03] Xây dựng API Login trên BFF
- **Mô tả:** Triển khai endpoint `/api/auth/login` trên BFF.
- **Nhiệm vụ:**
  - Viết logic nhận payload từ FE (username, password).
  - Gọi HTTP POST sang `Identity Service` để lấy JWT.
  - Xử lý Response: Set JWT vào `HttpOnly` cookie.

### [TICKET-04] Xây dựng giao diện Login/Register (Next.js)
- **Mô tả:** Tạo màn hình đăng nhập và đăng ký chuyên nghiệp.
- **Nhiệm vụ:**
  - Dùng `shadcn/ui` Form, Card, Input.
  - Dùng React Hook Form + Zod để validation.
  - Tích hợp gọi API tới BFF `/api/auth/login` và quản lý Auth State (Zustand).

## Sprint 2: Core Flight & Booking Features

### [TICKET-05] BFF: Tích hợp Flight Service (Tìm kiếm)
- **Mô tả:** Tạo endpoint trên BFF `/api/flights/search`. Forward logic tới `Flight Service`.

### [TICKET-06] Web: Giao diện Tìm kiếm Chuyến bay
- **Mô tả:** Xây dựng Hero section tìm kiếm trên Next.js. Hiển thị kết quả tìm kiếm dưới dạng list card đẹp mắt.

### [TICKET-07] BFF & Web: Seat Selection
- **Mô tả:** Gọi Flight Service để hiển thị sơ đồ ghế. Chọn ghế và Reserve.

### [TICKET-08] Web: Form Hành khách & Checkout
- **Mô tả:** Thu thập thông tin hành khách, gửi request đặt vé qua BFF (gọi Passenger + Booking service).

### [TICKET-09] Giao diện Dashboard (Quản lý Booking)
- **Mô tả:** Hiển thị danh sách vé người dùng đã đặt.
