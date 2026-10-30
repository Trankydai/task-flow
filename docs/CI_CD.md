# Quy trình CI/CD và Playwright

## 1. Mục tiêu

Workflow `.github/workflows/ci-cd.yml` tạo một cổng chất lượng lặp lại cho mọi
thay đổi mã nguồn. CI chỉ thành công khi dependency production không có cảnh
báo từ mức cao, TypeScript hợp lệ, ESLint không báo lỗi, Next.js build được và
bốn kịch bản Playwright hoàn tất trên Chromium.

## 2. Luồng CI

CI được kích hoạt khi push lên bất kỳ nhánh nào, khi mở hoặc cập nhật pull
request vào `main`, và khi chạy thủ công bằng `workflow_dispatch`.

Các bước theo thứ tự:

1. Checkout đúng commit và không lưu credential vào working tree.
2. Cài Node.js 22 và bật npm cache.
3. Chạy `npm ci` theo `package-lock.json`.
4. Chạy `npm audit --omit=dev --audit-level=high`.
5. Chạy typecheck, lint và production build bằng Webpack. Chế độ phát triển vẫn
   dùng Turbopack; Webpack được chọn cho build để kết quả ổn định trên cả đường
   dẫn Windows có ký tự Unicode và runner Linux.
6. Cài duy nhất Chromium cùng dependency hệ điều hành.
7. Chạy Playwright với một worker để tránh xung đột khi ghi JSON.
8. Lưu `playwright-report/` và `test-results/` thành artifact trong 7 ngày.

Playwright khởi động một Next.js dev server riêng ở cổng 3100 và đặt
`TASKFLOW_DATA_DIR=.playwright-data`. Script `scripts/reset-e2e-data.mjs` sao
chép fixture sạch trước mỗi lần chạy, nên test không làm bẩn `data/tasks.json`
hoặc `data/users.json`.

## 3. Luồng CD lên Vercel

Job `deploy-production` chỉ được xét khi CI thành công và sự kiện là push vào
`main`. Cần tạo ba repository secrets trong GitHub:

- `VERCEL_TOKEN`: token dùng cho môi trường CI/CD.
- `VERCEL_ORG_ID`: mã tổ chức hoặc tài khoản sở hữu project.
- `VERCEL_PROJECT_ID`: mã project Vercel đã liên kết.

Khi đủ cấu hình, workflow chạy `vercel pull` cho môi trường production,
`vercel build --prod`, rồi `vercel deploy --prebuilt --prod`. Nếu thiếu secret,
job kết thúc an toàn bằng notice nêu tên cấu hình còn thiếu và không hiển thị
giá trị secret.

## 4. Giới hạn lưu trữ khi triển khai

TaskFlow hiện dùng file JSON để minh họa đồ án. Vercel phù hợp để chứng minh
quy trình build và triển khai, nhưng filesystem của deployment không phải kho
lưu trữ bền vững cho thao tác tạo hoặc sửa công việc. Khi dùng production thật,
cần thay `data/*.json` bằng PostgreSQL, Supabase, Neon hoặc một dịch vụ lưu trữ
bền vững trước khi xem CD là hoàn chỉnh về mặt vận hành.

## 5. Minh chứng cần lưu

- URL và commit SHA của GitHub Actions run.
- Job summary cho audit, typecheck, lint, build và Playwright.
- Artifact `playwright-report-*` cùng `playwright-test-results-*`.
- URL deployment Vercel và phản hồi `/api/health` sau triển khai.
