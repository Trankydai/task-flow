import { expect, test } from "../fixtures/taskflow.fixture";

test.describe("Bảng phân tích tiến độ & hiệu suất", () => {
  test("chặn truy cập chưa đăng nhập và chuyển hướng về trang login", async ({
    page
  }) => {
    await page.goto("/analytics");
    await expect(page).toHaveURL(/\/login\?next=%2Fanalytics$/);
    await expect(page.getByRole("heading", { name: "Đăng nhập" })).toBeVisible();
  });

  test("người dùng đăng nhập có thể điều hướng từ sidebar và xem đầy đủ các chỉ số phân tích", async ({
    page,
    loginAs
  }) => {
    await loginAs("an");

    await test.step("điều hướng từ Sidebar vào Báo cáo & Phân tích", async () => {
      const analyticsLink = page.getByRole("link", {
        name: "Báo cáo & Phân tích"
      });
      await expect(analyticsLink).toBeVisible();
      await analyticsLink.click();

      await expect(page).toHaveURL(/\/analytics$/);
      await expect(
        page.getByRole("heading", {
          name: "Trung tâm phân tích & Báo cáo tiến độ"
        })
      ).toBeVisible();
    });

    await test.step("kiểm tra hiển thị các khối chỉ số KPI và phân bổ", async () => {
      await expect(page.getByText("Tổng số công việc", { exact: true })).toBeVisible();
      await expect(page.getByText("Tiến độ hoàn thành", { exact: true })).toBeVisible();
      await expect(page.getByText("Cảnh báo quá hạn", { exact: true })).toBeVisible();
      await expect(page.getByText("Việc ưu tiên cao", { exact: true })).toBeVisible();

      await expect(
        page.getByRole("heading", {
          name: "Phân bổ theo trạng thái công việc"
        })
      ).toBeVisible();
      await expect(
        page.getByRole("heading", {
          name: "Tỷ lệ xử lý theo độ ưu tiên"
        })
      ).toBeVisible();
      await expect(
        page.getByRole("heading", {
          name: "Nhật ký hoạt động & Kiểm toán trạng thái"
        })
      ).toBeVisible();
    });
  });
});
