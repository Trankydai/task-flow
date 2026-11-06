# TaskFlow Next

Khung sản phẩm cho đề tài **Tìm hiểu và ứng dụng Next.js - xây dựng hệ thống quản lý công việc**.

Ứng dụng tập trung thể hiện công nghệ Next.js qua một hệ thống quản lý công việc cá nhân:

- App Router với route group, nested layout và dynamic route `/tasks/[id]`.
- Server Component lấy dữ liệu phía server từ file JSON.
- Client Component cho bảng Kanban kéo thả bằng `dnd-kit`.
- Server Actions cho đăng nhập, đăng ký, thêm task, cập nhật task, xóa task, đổi trạng thái và sắp xếp.
- Cache/revalidation qua `unstable_cache`, `updateTag`, `revalidatePath`.
- Route Handlers tại `/api/health` và `/api/tasks`.
- Proxy bảo vệ `/dashboard` và `/tasks`.
- `loading.tsx`, `error.tsx`, `not-found.tsx`, Suspense/streaming.

## Yêu cầu

- Node.js 20.9 trở lên, khuyến nghị Node 22.
- PowerShell trên Windows đôi khi chặn `npm.ps1`; nếu gặp lỗi, dùng `npm.cmd`.

## Chạy dự án

```powershell
cd "D:\Các Công nghệ lập trình hiện đại\taskflow-nextjs"
npm.cmd install
Copy-Item .env.example .env.local
npm.cmd run dev
```

Trước khi chạy, đổi `SESSION_SECRET` trong `.env.local` thành một chuỗi ngẫu
nhiên dài ít nhất 32 ký tự. Biến này được dùng để ký cookie phiên đăng nhập.

Mở `http://localhost:3000`.

Tài khoản mẫu:

```text
dai@taskflow.local    / 123456
hoang@taskflow.local  / 123456
loc@taskflow.local    / 123456
```

Bạn cũng có thể đăng ký tài khoản mới trên `/register`; mỗi tài khoản sẽ có danh sách công việc riêng.

## Kiểm thử end-to-end bằng Playwright

Bộ kiểm thử dùng Chromium và chạy ứng dụng riêng tại `http://127.0.0.1:3100`.
Dữ liệu được sao chép vào `.playwright-data`, vì vậy không làm thay đổi dữ liệu
trình diễn trong `data/`.

Lần đầu trên máy mới, cài trình duyệt kiểm thử rồi chạy test:

```powershell
npm.cmd exec playwright install chromium
npm.cmd run test:e2e
```

Các kịch bản hiện có kiểm tra chuyển hướng khi chưa đăng nhập, API trả `401`,
đăng nhập sai, vòng đời tạo - chuyển trạng thái - tải lại - cập nhật - xóa công
việc, và ngăn tài khoản này đọc công việc của tài khoản khác. Báo cáo HTML được
tạo tại `playwright-report/`; mở lại bằng `npm.cmd run test:e2e:report`.

## CI/CD bằng GitHub Actions

Workflow `.github/workflows/ci-cd.yml` chạy trên mọi lần push, pull request vào
`main`, hoặc khi kích hoạt thủ công. Job CI thực hiện `npm ci`, audit dependency
production, typecheck, lint, build và toàn bộ Playwright E2E; báo cáo test được
lưu thành artifact khi lần chạy kết thúc.

Sau khi CI thành công trên một lần push vào `main`, job CD có thể triển khai
production lên Vercel. Repository cần cấu hình ba GitHub Actions secrets:
`VERCEL_TOKEN`, `VERCEL_ORG_ID` và `VERCEL_PROJECT_ID`. Nếu thiếu, job ghi notice
và bỏ qua triển khai an toàn, không in giá trị bí mật. Hướng dẫn chi tiết nằm ở
`docs/CI_CD.md`.

## Lưu trữ dữ liệu

Dự án dùng **JSON file** để phù hợp với phạm vi môn học:

- `data/users.json`: lưu tài khoản mẫu và tài khoản đăng ký mới.
- `data/tasks.json`: lưu công việc, trạng thái, thứ tự kéo thả, tag và `userId`.
- Cookie `taskflow_session`: chỉ lưu token phiên đã ký HMAC, `HttpOnly`, hết hạn
  sau 7 ngày; server xác minh chữ ký rồi mới đọc dữ liệu của người dùng.
- Cách này dễ chạy local, dễ mở file để chụp minh chứng, và đủ thể hiện Server Component/Server Action của Next.js.

Khi phản biện, có thể nói JSON là lựa chọn cho đồ án học tập/local demo. Nếu mở rộng thành sản phẩm thật thì thay tầng lưu trữ bằng PostgreSQL/Supabase/Neon, thêm bcrypt hoặc Argon2 cho mật khẩu, và bổ sung phân quyền chi tiết hơn.

## Cấu trúc quan trọng

```text
data/users.json                             Dữ liệu tài khoản
data/tasks.json                             Dữ liệu công việc theo user
src/lib/auth.ts                             Đọc/ghi user JSON và phiên đăng nhập
src/lib/session.ts                          Tạo/xác minh token phiên HMAC
src/lib/task-store.ts                       Đọc/ghi task JSON phía server
src/app/actions.ts                          Server Actions và revalidation
src/proxy.ts                                Bảo vệ route bằng cookie
src/app/(auth)/login/page.tsx               Đăng nhập
src/app/(auth)/register/page.tsx            Đăng ký
src/app/(workspace)/dashboard/page.tsx      Dashboard công việc
src/components/task-board.tsx               Client Component, dnd-kit, optimistic UI
src/app/(workspace)/tasks/[id]/page.tsx     Dynamic route + notFound
src/app/api/health/route.ts                 Route Handler kiểm tra server
src/app/api/tasks/route.ts                  Route Handler trả danh sách task của user
docs/PLAN.md                                Kế hoạch chia việc tuần 5-7
docs/TECHNICAL_COVERAGE.md                  Bảng phủ kỹ thuật 3 tầng
.github/workflows/ci-cd.yml                 Pipeline CI và triển khai Vercel
playwright.config.ts                        Cấu hình kiểm thử E2E
tests/e2e/                                  Kịch bản Playwright
tests/fixtures/                             Dữ liệu kiểm thử tách biệt
```

## Ghi chú báo cáo

Ứng dụng không cố làm nghiệp vụ quá phức tạp. Phần quan trọng là chứng minh Next.js: server-side data fetching, ranh giới Server/Client Component, Server Action, route động, Route Handler, proxy, caching và revalidation.
