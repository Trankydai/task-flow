# Bảng phủ kỹ thuật để đưa vào báo cáo

Bảng này bám theo yêu cầu 3 tầng trong tài liệu môn học. Khi nộp chính thức, nhóm nên bổ sung ảnh, log chạy local và commit cụ thể.

| TT | Nội dung | Tầng | Vị trí trong sản phẩm | File minh chứng | Trạng thái |
| --- | --- | --- | --- | --- | --- |
| 1 | App Router, route theo thư mục, layout dùng chung | Tầng 1A | Route `/dashboard`, `/tasks/[id]`, route group auth/workspace | `src/app/(workspace)/layout.tsx`, `src/app/(workspace)/dashboard/page.tsx`, `src/app/(workspace)/tasks/[id]/page.tsx` | Đã có |
| 2 | Phân biệt Server Component và Client Component | Tầng 1A | Dashboard là Server Component; Kanban là Client Component vì cần kéo thả/state | `src/app/(workspace)/dashboard/page.tsx`, `src/components/task-board.tsx` | Đã có |
| 3 | Lấy dữ liệu phía server trong Server Component | Tầng 1A | Dashboard đọc task theo user bằng `getTasksCached(user.id)` | `src/lib/task-store.ts`, `src/app/(workspace)/dashboard/page.tsx` | Đã có |
| 4 | Luồng render chính | Tầng 1A | Request `/dashboard` -> proxy -> layout -> Server Component đọc data -> Client Component hydrate phần Kanban | `src/proxy.ts`, `src/app/(workspace)/dashboard/page.tsx`, `src/components/task-board.tsx` | Cần chụp ảnh |
| 5 | Dynamic route + not-found | Tầng 1B | Trang chi tiết `/tasks/[id]`, id sai hoặc không thuộc user hiện tại gọi `notFound()` | `src/app/(workspace)/tasks/[id]/page.tsx`, `src/app/(workspace)/tasks/[id]/not-found.tsx` | Đã có |
| 6 | Loading/error boundary | Tầng 1B | Dashboard và task detail đều có trạng thái loading/error; task detail có thêm not-found cho id sai | `src/app/(workspace)/dashboard/loading.tsx`, `src/app/(workspace)/dashboard/error.tsx`, `src/app/(workspace)/tasks/[id]/loading.tsx`, `src/app/(workspace)/tasks/[id]/error.tsx`, `src/app/(workspace)/tasks/[id]/not-found.tsx` | Đã có |
| 7 | Server Action cho mutation | Tầng 1B | Đăng nhập, đăng ký, thêm task, xóa task, đổi trạng thái, cập nhật task | `src/app/actions.ts`, `src/components/create-task-form.tsx`, `src/components/task-board.tsx` | Đã có |
| 8 | Caching và revalidation | Tầng 1B | Cache danh sách task 60 giây; mutation gọi `updateTag`/`revalidatePath` | `src/lib/task-store.ts`, `src/app/actions.ts` | Đã có |
| 9 | Route Handler | Tầng 1B | `/api/health` kiểm tra server, `/api/tasks` trả JSON task của user đang đăng nhập | `src/app/api/health/route.ts`, `src/app/api/tasks/route.ts` | Đã có |
| 10 | Proxy | Tầng 1B | Bảo vệ `/dashboard` và `/tasks`, xác minh token phiên rồi redirect tới `/login` nếu phiên thiếu hoặc sai | `src/proxy.ts`, `src/lib/session.ts`, `src/app/(auth)/login/page.tsx` | Đã có |
| 11 | Suspense/streaming | Tầng 1B | `TaskInsights` được bọc bởi `Suspense` để có fallback khi dashboard tải tổng quan | `src/app/(workspace)/dashboard/page.tsx`, `src/components/task-insights.tsx` | Đã có |
| 12 | Quản lý phiên bản | Tầng 2 | Dùng Git, commit đều, không dồn cuối kỳ | Git log/Insights | Cần nhóm thực hiện |
| 13 | Khả năng chạy lại | Tầng 2 | README, package scripts, `.env.example`, dữ liệu JSON mẫu | `README.md`, `.env.example`, `data/users.json`, `data/tasks.json` | Đã có |
| 14 | Quản lý bí mật | Tầng 2 | Không commit `.env`, chỉ có `.env.example` | `.gitignore`, `.env.example` | Đã có |
| 15 | Kiểm thử/health check | Tầng 2 | Route `/api/health`, có thể bổ sung test sau | `src/app/api/health/route.ts` | Đã có |
| 16 | Bảo mật cơ bản | Tầng 2 | Cookie phiên ký HMAC/HttpOnly; proxy kiểm tra token và Server Action kiểm tra user trước mutation | `src/proxy.ts`, `src/lib/session.ts`, `src/app/actions.ts`, `src/lib/auth.ts` | Đã có |
| 17 | Tầng dữ liệu | Tầng 2 | JSON file có `userId` để tách task theo từng tài khoản | `data/users.json`, `data/tasks.json`, `src/lib/task-store.ts`, `src/lib/auth.ts` | Đã có |
| 18 | Kéo thả Kanban | Tầng 3 | Dùng `dnd-kit`, PointerSensor/KeyboardSensor, lưu thứ tự qua Server Action | `src/components/task-board.tsx` | Đã có |
| 19 | Optimistic UI | Tầng 3 | UI đổi trước, Server Action lưu sau, có trạng thái pending | `src/components/task-board.tsx` | Đã có |

## Câu hỏi tự kiểm Next.js

1. Cái gì trong đồ án này là Next.js mà React SPA bình thường không làm giống vậy?
   - Data ban đầu được lấy trong Server Component `dashboard/page.tsx`.
   - Mutation dùng Server Actions trong cùng codebase, không phải client fetch thủ công mọi thứ.
   - Route động, layout, loading/error/not-found do App Router xử lý theo file convention.
   - Proxy chạy trước route để bảo vệ khu vực dashboard.

2. Nếu bỏ `"use client"` ở `TaskBoard` thì chuyện gì xảy ra?
   - Component không được dùng hook `useState`, `useTransition` và không xử lý được kéo thả trong trình duyệt.
   - Đây là ranh giới rõ giữa phần render server và phần cần tương tác client.

3. Dữ liệu nào nên cache, dữ liệu nào cần tươi?
   - Danh sách task có thể cache ngắn để minh chứng `unstable_cache`.
   - Sau mutation phải gọi `updateTag("tasks")` và `revalidatePath()` để tránh giao diện cũ.

## Chủ đề hands-on lab đề xuất

**Server Action và revalidation trong Next.js**

Mục tiêu: người học thêm một trường `priority` hoặc một form tạo task, sau đó chứng minh dashboard cập nhật nhờ `revalidatePath`/`updateTag`.

Bài tập nhỏ:

1. Tạo task mới từ form.
2. Sửa Server Action để validate title không được dưới 5 ký tự.
3. Chụp ảnh trước/sau khi revalidation hoạt động.
