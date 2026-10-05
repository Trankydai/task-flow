# Ke hoach chia viec 3 nguoi tu tuan 5 den tuan 7

Tinh hinh hien tai: dang o **tuan 5**, han nop bao cao vao **tuan 7**. Vì vậy kế hoạch ưu tiên hoàn thành phần chứng minh công nghệ Next.js trước, sau đó mới làm đẹp và bổ sung nghiệp vụ.

## Nguyen tac chung

- Công nghệ là trọng tâm chấm điểm; ứng dụng quản lý công việc chỉ là bối cảnh để chứng minh Next.js.
- Tầng 1A phải có trong sản phẩm: App Router, Server/Client Component boundary, server-side data fetching trong Server Component, giải thích được luồng render của đồ án.
- Tầng 1B chọn phần thật sự phù hợp: Server Actions, Route Handlers, dynamic/nested routes, loading/error/not-found, caching/revalidation, middleware, Suspense/streaming.
- Tầng 2 phải có minh chứng kỹ nghệ: Git, README chạy lại được, `.env.example`, kiểm thử/health check, bảo mật cơ bản, weekly log.
- Tầng 3 nên chọn ít nhưng làm sâu: Kanban kéo thả bằng `dnd-kit`, optimistic update/rollback nếu kịp, accessibility cơ bản bằng nút chuyển cột và bàn phím.

## Phan cong theo nguoi

### 1. Tran Ky Dai - Next.js core va bao cao cong nghe

Vai tro: lead kiến trúc Next.js và Chương 4.

Cong viec:

- Hoàn thiện App Router: `/dashboard`, `/tasks/[id]`, layout, loading, error, not-found.
- Viết/giải thích Server Component lấy dữ liệu server-side ở `dashboard/page.tsx`.
- Viết/giải thích Server Actions trong `src/app/actions.ts`.
- Viết Chương 4: App Router, Server Component vs Client Component, server-side data fetching.
- Chuẩn bị câu trả lời tự kiểm: "Cái gì trong đồ án là Next.js mà React SPA thường không làm giống vậy?"

Minh chung can nop:

- Ảnh/log dashboard render được dữ liệu mà không dùng `useEffect`.
- Ảnh/log sau khi thêm task bằng Server Action và dữ liệu được revalidate.
- Đoạn code trích dẫn đúng file trong bảng phủ kỹ thuật.

### 2. Le Van Hoang - San pham va tuong tac Kanban

Vai tro: phụ trách trải nghiệm sản phẩm và kỹ thuật Tầng 3.

Cong viec:

- Hoàn thiện `TaskBoard` Client Component bằng `dnd-kit`.
- Làm luồng đổi trạng thái task: kéo thả hoặc nút chuyển cột, lưu xuống server.
- Chăm chút UI dashboard, form thêm task, trang chi tiết task.
- Viết phần Chương 11-12 về user story, luồng nghiệp vụ, màn hình và kết quả demo.
- Chuẩn bị video demo 2-3 phút: đăng nhập, xem dashboard, thêm task, kéo task, mở chi tiết.

Minh chung can nop:

- Ảnh/video thao tác Kanban.
- Ảnh hoặc log `data/tasks.json` cho thấy task thay đổi sau thao tác.
- Giải thích được vì sao Kanban là Client Component còn dữ liệu ban đầu nằm ở Server Component.

### 3. Le Hoai Loc - Ky nghe phan mem, QA, lab va slide

Vai tro: phụ trách Tầng 2, kiểm thử, tài liệu nộp.

Cong viec:

- Hoàn thiện README, `.env.example`, hướng dẫn chạy lại.
- Kiểm tra `/api/health`, `/api/tasks`, middleware `/login -> /dashboard`.
- Tạo weekly log, bảng phủ kỹ thuật, phụ lục minh chứng Git.
- Viết hands-on lab 30-45 phút: "Server Action và revalidation trong Next.js".
- Làm slide 5-7 trang: bài toán, kiến trúc, bảng phủ, demo, bài học.

Minh chung can nop:

- Screenshot health API.
- Screenshot Git log/commit chia theo tuần.
- Hands-on lab có mục tiêu, bước làm, bài tập nhỏ và lỗi thường gặp.

## Ke hoach theo ngay

### Tuan 5 - Chot pham vi va dung khung

Ngay 1:
- Cả nhóm đọc lại 3 tài liệu yêu cầu.
- Chốt scope: không làm hệ thống quản lý dự án quá lớn; tập trung Kanban task management.
- Tạo repo, branch, README, khung Next.js.

Ngay 2:
- Đại hoàn thiện App Router, Server Component, Server Actions cơ bản.
- Hoàng dựng dashboard/Kanban UI.
- Lộc tạo bảng phủ kỹ thuật bản nháp và weekly log.

Ngay 3:
- Tích hợp thêm task, đổi trạng thái, route chi tiết.
- Chụp ảnh minh chứng Tầng 1A.
- Viết nháp Chương 4 theo từng yêu cầu lõi.

Ket qua cuoi tuan 5:
- App chạy được luồng đăng nhập, xem dashboard, thêm task, mở chi tiết.
- Có bảng phủ kỹ thuật bản nháp.
- Báo cáo bổ sung được khung Chương 4 và Chương 11.

### Tuan 6 - Lam sau minh chung cong nghe

Ngay 1-2:
- Hoàng hoàn thiện kéo thả Kanban và accessibility cơ bản.
- Đại thêm caching/revalidation, Route Handler, Suspense/streaming.
- Lộc kiểm tra route, README, health check, ghi lỗi và cách sửa.

Ngay 3-4:
- Cả nhóm chụp minh chứng: trước/sau thêm task, trước/sau kéo task, API JSON, not-found dynamic route.
- Viết Chương 5 cho nội dung chọn thêm: Server Action, caching/revalidation, middleware, Kanban dnd-kit.
- Viết Chương 12 kết quả triển khai.

Ngay 5:
- Review chéo: mỗi người giải thích phần của người khác.
- Sửa các chỗ "kể tên công nghệ nhưng không có minh chứng".

Ket qua cuoi tuan 6:
- Đồ án MVP hoàn chỉnh.
- Báo cáo có đủ Phần 2 và Phần 3 bản nháp.
- Hands-on lab có đề cương.

### Tuan 7 - Dong goi nop bai

Ngay 1:
- Lộc hoàn thiện hands-on lab 30-45 phút.
- Đại hoàn thiện phần phản biện: khi nào nên/không nên dùng Next.js, so sánh alternatives.
- Hoàng quay video demo.

Ngay 2:
- Cả nhóm làm thử lab nội bộ; một người không viết phần đó thử làm theo.
- Sửa lỗi README và lab.

Ngay 3:
- Hoàn thiện bảng phủ kỹ thuật: chỉ khai cái đã chạy và có minh chứng.
- Bổ sung AI Disclosure: công cụ dùng, phần AI hỗ trợ, ít nhất 2 lỗi AI trả sai và cách phát hiện.

Ngay 4:
- Làm slide 5-7 trang.
- Kiểm tra lại mã nguồn, commit hash, nén file/link GitHub.

Ngay 5:
- Nộp trước hạn, khóa commit/version trước buổi bảo vệ ít nhất 24 giờ.
- Mỗi người tự luyện 10 phút giải thích: App Router, Server/Client boundary, Server Action, cache/revalidation, Kanban Client Component.

## Rủi ro và cách xử lý

- Nếu thiếu thời gian: giữ Tầng 1A + Server Action + Route Handler + middleware; bỏ realtime/offline.
- Nếu kéo thả lỗi: giữ nút chuyển cột bằng Server Action làm luồng chính, dnd-kit là phần nâng cao.
- Nếu thao tác lưu JSON lỗi: kiểm tra quyền ghi thư mục `data`, giữ demo tối giản và ghi rõ hướng mở rộng sang PostgreSQL/Supabase/Neon.
- Nếu báo cáo dài: ưu tiên bảng phủ, ảnh/log, file code; giảm mô tả nghiệp vụ.
