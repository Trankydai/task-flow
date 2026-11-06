import { expect, test } from "../fixtures/taskflow.fixture";

test("chặn truy cập chưa đăng nhập và API trả về 401", async ({
  page,
  request
}) => {
  await test.step("chuyển hướng trang được bảo vệ về đăng nhập", async () => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/\/login\?next=%2Fdashboard$/);
    await expect(page.getByRole("heading", { name: "Đăng nhập" })).toBeVisible();
  });

  await test.step("từ chối API khi không có phiên", async () => {
    const response = await request.get("/api/tasks");

    expect(response.status()).toBe(401);
    await expect(response.json()).resolves.toEqual({
      message: "Bạn cần đăng nhập để xem danh sách công việc."
    });
  });
});

test("hiển thị lỗi khi thông tin đăng nhập không hợp lệ", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("an.e2e@taskflow.local");
  await page.getByLabel("Mật khẩu").fill("sai-mat-khau");
  await page.getByRole("button", { name: "Vào dashboard" }).click();

  await expect(page).toHaveURL(/\/login\?error=invalid$/);
  await expect(page.getByText("Email hoặc mật khẩu không đúng.")).toBeVisible();
});
