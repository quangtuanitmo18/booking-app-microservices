# Blueprint: Frontend & BFF Architecture

## 1. Cấu trúc Monorepo (Dự kiến)
Chúng ta sẽ giữ sự nhất quán với kiến trúc Polyrepo (trong Monorepo) hiện tại bằng cách khởi tạo các dự án mới trực tiếp bên trong thư mục `src/`, tương tự như các service backend hiện có (`booking`, `flight`, `identity`, `passenger`).
- `src/frontend`: Dự án Next.js 14+ (App Router).
- `src/api-gateway`: Dự án NestJS đóng vai trò BFF (Backend-For-Frontend).

## 2. Thiết kế BFF (Backend-For-Frontend)

### 2.1. Vai trò của BFF
- **Security:** Che giấu Access Token. BFF nhận JWT từ Identity Service và set vào `HttpOnly` Cookie.
- **Proxy/Aggregator:** Gọi các internal microservices (Booking, Flight, Passenger) qua Rest API nội bộ hoặc gRPC/RabbitMQ (dùng `booking.rest` như reference).
- **Format:** Chuẩn hóa dữ liệu trả về cho Frontend, ví dụ gộp `flight details` và `passenger profile` nếu cần.

### 2.2. Giao tiếp BFF <-> Internal Services
Dựa theo `booking.rest`, BFF có thể giao tiếp với các services qua HTTP bằng các host nội bộ (ví dụ trong Docker Compose):
- Identity Service: `http://identity:3000`
- Flight Service: `http://flight:3000`
- Passenger Service: `http://passenger:3000`
- Booking Service: `http://booking:3000`

## 3. Thiết kế Frontend (Next.js)

### 3.1. Thư mục (Directory Structure)
```
src/frontend/
├── src/
│   ├── app/                # App Router (Pages, Layouts)
│   │   ├── (auth)/         # Login, Register
│   │   ├── (dashboard)/    # Quản lý booking (Private)
│   │   ├── search/         # Kết quả tìm kiếm chuyến bay
│   │   └── booking/        # Flow đặt vé
│   ├── components/         # UI Components (shadcn/ui, Tailwind)
│   ├── features/           # Các domain logic (flight, passenger, auth)
│   ├── hooks/              # Custom hooks (React Query, Zustand)
│   ├── lib/                # Utils, axios instance, BFF fetcher
│   └── types/              # TypeScript interfaces
```

### 3.2. State Management
- **Server State:** `TanStack React Query` để fetch, cache, và synchronize dữ liệu chuyến bay, booking từ BFF.
- **Client State:** `Zustand` để lưu trữ các state cục bộ (ví dụ: giỏ hàng, vé đang chọn, filter tìm kiếm, form state).

### 3.3. Authentication Flow (Chi tiết)
1. User gọi API POST `/api/auth/login` tới **BFF**.
2. **BFF** forward request tới `Identity Service`.
3. `Identity Service` trả về `accessToken`.
4. **BFF** cấu hình `Set-Cookie: accessToken=...; HttpOnly; Secure; SameSite=Strict` và trả về `200 OK` cho Browser.
5. Từ đó, mỗi request từ trình duyệt (nhờ React Query hoặc SSR fetch) gửi tới BFF đều tự động kèm Cookie này. BFF sẽ parse Cookie, lấy `accessToken` và đính kèm vào header `Authorization: Bearer <token>` để gọi xuống các internal services.

## 4. Giao diện (UI/UX Guidelines)
- **Framework:** Tailwind CSS kết hợp `shadcn/ui`.
- **Typography:** Inter hoặc Roboto (Google Fonts).
- **Thẩm mỹ (Aesthetics):** 
  - Giao diện có Dark/Light mode toggle.
  - Sử dụng các thẻ (Cards) với hiệu ứng hover mượt mà (`transition-all duration-300`).
  - Loading State bằng Skeleton components.
- **Responsive:** Mobile-first, tối ưu cho Tablet và Desktop.

## 5. Kế hoạch triển khai (Tiếp theo)
- Khởi tạo thư mục `src/frontend` (Next.js) và `src/api-gateway` (NestJS).
- Thêm cấu hình Docker cho 2 dịch vụ mới vào `deployments/docker-compose/docker-compose.yaml` để có thể test toàn hệ thống ở local.
- Cấu hình BFF kết nối với `Identity Service` để test luồng Auth.
- Cấu hình Next.js (Tailwind, shadcn) và xây dựng trang Login/Register.
