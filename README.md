# TaskFlow Next

TaskFlow là ứng dụng quản lý công việc cá nhân được xây dựng bằng **Next.js 16**, **React 19** và **TypeScript**. Dự án dùng file JSON để lưu dữ liệu nên có thể chạy ngay sau khi clone mà không cần cài database, Docker hoặc dịch vụ bên ngoài.

## Tính năng chính

- Đăng nhập, đăng ký và quản lý phiên bằng cookie `HttpOnly`.
- Bảng Kanban kéo thả với các trạng thái công việc.
- Tạo, cập nhật, lưu trữ, khôi phục và xóa công việc.
- Trang chi tiết công việc, lịch sử thay đổi trạng thái và trang thống kê.
- App Router, Server Components, Client Components, Server Actions và Route Handlers.
- Cache/revalidation, route động, proxy bảo vệ route, loading/error/not-found UI.
- Kiểm thử end-to-end bằng Playwright và pipeline CI/CD bằng GitHub Actions.

## Yêu cầu hệ thống

- [Git](https://git-scm.com/).
- [Node.js](https://nodejs.org/) từ **20.9.0** trở lên; khuyến nghị Node.js 22.
- npm đi kèm Node.js.

Kiểm tra phiên bản đang cài:

```bash
node --version
npm --version
```

## Cài đặt và chạy local

### 1. Clone repository

```bash
git clone https://github.com/Trankydai/task-flow.git
cd task-flow
```

### 2. Cài dependency

Dùng `npm ci` để cài đúng phiên bản trong `package-lock.json`:

```bash
npm ci
```

### 3. Tạo file biến môi trường

Trên Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Trên macOS hoặc Linux:

```bash
cp .env.example .env.local
```

Tạo một chuỗi bí mật ngẫu nhiên:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Mở `.env.local` và thay giá trị mẫu của `SESSION_SECRET` bằng chuỗi vừa tạo:

```dotenv
APP_NAME="TaskFlow Next"
SESSION_SECRET="dan-chuoi-ngau-nhien-vua-tao-vao-day"
```

`SESSION_SECRET` phải dài ít nhất 32 ký tự và không được giữ nguyên giá trị trong `.env.example`. Không commit `.env.local` lên Git.

### 4. Khởi động ứng dụng

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt. Có thể kiểm tra server qua [http://localhost:3000/api/health](http://localhost:3000/api/health).

## Tài khoản mẫu

| Email | Mật khẩu | Vai trò |
| --- | --- | --- |
| `dai@taskflow.local` | `123456` | Leader |
| `hoang@taskflow.local` | `123456` | Member |
| `loc@taskflow.local` | `123456` | Member |

Bạn cũng có thể tạo tài khoản mới tại [http://localhost:3000/register](http://localhost:3000/register). Mỗi tài khoản có danh sách công việc riêng.

## Các lệnh thường dùng

| Lệnh | Chức năng |
| --- | --- |
| `npm run dev` | Chạy development server tại cổng 3000 |
| `npm run build` | Tạo production build |
| `npm run start` | Chạy production server sau khi build |
| `npm run typecheck` | Kiểm tra kiểu dữ liệu TypeScript |
| `npm run lint` | Kiểm tra mã nguồn bằng ESLint |
| `npm run test:e2e` | Chạy toàn bộ test Playwright |
| `npm run test:e2e:headed` | Chạy test và hiển thị trình duyệt |
| `npm run test:e2e:ui` | Mở giao diện Playwright UI |
| `npm run test:e2e:report` | Mở báo cáo HTML của lần test gần nhất |

## Chạy ở chế độ production

Sau khi đã cài dependency và cấu hình `.env.local`:

```bash
npm run build
npm run start
```

Production server mặc định chạy tại [http://localhost:3000](http://localhost:3000). `SESSION_SECRET` là bắt buộc trong môi trường production.

## Chạy kiểm thử end-to-end

Lần đầu chạy trên máy mới, cài Chromium cho Playwright:

```bash
npx playwright install chromium
```

Trên Linux, nếu thiếu thư viện hệ thống:

```bash
npx playwright install --with-deps chromium
```

Sau đó chạy test:

```bash
npm run test:e2e
```

Playwright tự khởi động một server riêng tại `http://127.0.0.1:3100` và dùng thư mục `.playwright-data`. Vì vậy test không thay đổi dữ liệu trình diễn trong `data/`.

## Lưu trữ dữ liệu

Dữ liệu local được lưu trong hai file:

- `data/users.json`: tài khoản mẫu và tài khoản đăng ký mới.
- `data/tasks.json`: công việc, tag, thứ tự, trạng thái và lịch sử thay đổi.

Ứng dụng cần quyền ghi vào thư mục `data/`. Cách lưu bằng JSON phù hợp cho học tập và demo local, nhưng không phù hợp với môi trường serverless hoặc hệ thống chạy nhiều instance. Khi triển khai sản phẩm thật, nên thay tầng lưu trữ bằng PostgreSQL, Supabase, Neon hoặc một dịch vụ lưu trữ bền vững.

## Cấu trúc thư mục chính

```text
data/                                      Dữ liệu JSON local
src/app/                                   Route và giao diện App Router
src/app/actions.ts                         Server Actions
src/app/api/                               Route Handlers
src/app/(auth)/                            Trang đăng nhập và đăng ký
src/app/(workspace)/                       Khu vực làm việc đã xác thực
src/components/                            Các component giao diện
src/lib/auth.ts                            Xác thực và đọc/ghi người dùng
src/lib/session.ts                         Tạo và xác minh phiên đăng nhập
src/lib/task-store.ts                      Đọc/ghi dữ liệu công việc
src/proxy.ts                               Bảo vệ route bằng cookie
tests/e2e/                                 Test Playwright
tests/fixtures/                            Dữ liệu riêng cho test
.github/workflows/ci-cd.yml                Pipeline CI/CD
```

## Xử lý lỗi thường gặp

### PowerShell chặn `npm.ps1`

Nếu Windows báo lỗi execution policy, dùng `npm.cmd` thay cho `npm`:

```powershell
npm.cmd ci
npm.cmd run dev
```

### Báo lỗi `SESSION_SECRET`

Kiểm tra `.env.local` nằm ở thư mục gốc của dự án, giá trị dài ít nhất 32 ký tự và khác giá trị mẫu trong `.env.example`. Sau khi sửa, dừng rồi chạy lại development server.

### Cổng 3000 đang được sử dụng

Chạy ứng dụng ở một cổng khác:

```bash
npm run dev -- --port 3001
```

Sau đó mở `http://localhost:3001`.

## Tài liệu bổ sung

- [Quy trình CI/CD](docs/CI_CD.md)
- [Kế hoạch thực hiện](docs/PLAN.md)
- [Phạm vi kỹ thuật](docs/TECHNICAL_COVERAGE.md)
