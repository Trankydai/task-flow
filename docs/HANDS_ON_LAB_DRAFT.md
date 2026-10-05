# Hands-on lab nháp: Server Action và revalidation trong Next.js

Thời lượng dự kiến: 30-45 phút.

## Mục tiêu học tập

Sau lab, người học có thể:

- Tạo một form gọi Server Action trong Next.js App Router.
- Cập nhật dữ liệu server-side và làm mới cache bằng `updateTag`/`revalidatePath`.
- Giải thích vì sao luồng này khác với React SPA chỉ fetch trên client.

## Điều kiện chuẩn bị

- Đã cài Node.js 20.9 trở lên.
- Đã chạy dự án bằng:

```powershell
npm.cmd install
npm.cmd run dev
```

- Đăng nhập bằng tài khoản mẫu và mở `http://localhost:3000/dashboard`.

## Bài 1: Thêm validation cho Server Action

Mở file `src/app/actions.ts`, tìm hàm `createTaskAction`.

Thêm điều kiện: title phải có ít nhất 5 ký tự.

Gợi ý:

```ts
if (title.length < 5) {
  throw new Error("Tiêu đề phải có ít nhất 5 ký tự.");
}
```

Chạy lại form thêm công việc với title ngắn hơn 5 ký tự và ghi nhận kết quả.

## Bài 2: Thêm tag mặc định

Mở file `src/lib/task-store.ts`, tìm hàm `createTask`.

Đổi tag mặc định từ:

```ts
tags: input.tags.length > 0 ? input.tags : ["Mới"],
```

thành:

```ts
tags: input.tags.length > 0 ? input.tags : ["Mới", "Lab"],
```

Thêm một task mới trên dashboard, sau đó mở `data/tasks.json` để kiểm tra tag đã được ghi xuống server.

## Bài 3: Chứng minh revalidation

Trong `src/app/actions.ts`, tạm thời comment dòng:

```ts
updateTag("tasks");
```

Thêm task mới và quan sát dashboard. Sau đó bỏ comment dòng trên, thêm task khác và so sánh.

Kết luận cần viết:

- Khi có cache invalidation/revalidation, dashboard được làm mới sau mutation.
- Nếu chỉ cache mà không revalidate, UI có nguy cơ hiện dữ liệu cũ.

## Lỗi thường gặp

- Form không chạy vì đang ở Client Component nhưng truyền action sai cách.
- Quên `"use server"` trong file Server Actions.
- Sửa dữ liệu xong nhưng dashboard không đổi vì quên `updateTag` hoặc `revalidatePath`.
- Dùng `useEffect` fetch dữ liệu ban đầu trong dashboard, làm mất minh chứng Server Component.

## Câu hỏi đáp án nhanh

1. Vì sao `TaskBoard` cần `"use client"`?
   - Vì nó dùng state, transition và drag-and-drop trong trình duyệt.

2. Vì sao `dashboard/page.tsx` không cần `"use client"`?
   - Vì đây là Server Component, lấy dữ liệu ban đầu trên server và gửi HTML/RSC payload cho client.

3. Server Action khác Route Handler ở điểm nào?
   - Server Action gắn trực tiếp với form/mutation trong React tree; Route Handler tạo endpoint HTTP rõ ràng như `/api/tasks`.
