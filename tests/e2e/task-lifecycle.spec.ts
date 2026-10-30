import { expect, test, type Page } from "../fixtures/taskflow.fixture";

type ApiTask = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  owner: string;
  dueDate: string;
  tags: string[];
};

async function getTasks(page: Page) {
  const response = await page.request.get("/api/tasks");
  expect(response.ok()).toBeTruthy();
  return (await response.json()) as { tasks: ApiTask[] };
}

test("đăng nhập, tạo, chuyển trạng thái, tải lại, cập nhật và xóa công việc", async ({
  page,
  loginAs
}, testInfo) => {
  const title = `Kiểm thử vòng đời E2E lần ${testInfo.retry}`;
  const updatedTitle = `${title} - đã cập nhật`;

  await loginAs("an");

  await test.step("tạo công việc mới", async () => {
    await page.getByLabel("Tiêu đề").fill(title);
    await page
      .getByLabel("Mô tả")
      .fill("Kiểm tra luồng công việc từ giao diện đến kho dữ liệu.");
    await page.getByLabel("Hạn hoàn thành").fill("2026-12-31");
    await page.getByLabel("Mức ưu tiên").selectOption("high");
    await page.getByLabel("Tag").fill("Playwright, CI");
    await page.getByRole("button", { name: "Thêm công việc" }).click();

    await expect(page.getByRole("link", { name: title })).toBeVisible();
    await expect
      .poll(async () => {
        const { tasks } = await getTasks(page);
        return tasks.find((task) => task.title === title)?.status;
      })
      .toBe("todo");
  });

  await test.step("chuyển sang cột Đang làm và giữ trạng thái sau tải lại", async () => {
    const card = page.locator("article.task-card").filter({ hasText: title });
    await card
      .getByRole("button", { name: `Chuyển ${title} sang cột sau` })
      .click();

    await expect
      .poll(async () => {
        const { tasks } = await getTasks(page);
        return tasks.find((task) => task.title === title)?.status;
      })
      .toBe("doing");

    await page.reload();
    const doingColumn = page.locator("section.column").filter({
      has: page.getByRole("heading", { name: "Đang làm", exact: true })
    });
    await expect(doingColumn.getByRole("link", { name: title })).toBeVisible();
    await testInfo.attach("01-dashboard-task-doing", {
      body: await page.screenshot({ fullPage: true }),
      contentType: "image/png"
    });
  });

  await test.step("mở chi tiết và cập nhật nội dung", async () => {
    await page.getByRole("link", { name: title }).click();
    await expect(page).toHaveURL(/\/tasks\/task-/);
    await expect(page.getByRole("heading", { name: title })).toBeVisible();

    await page.getByLabel("Tiêu đề").fill(updatedTitle);
    await page
      .getByLabel("Mô tả")
      .fill("Nội dung đã được Playwright cập nhật và xác nhận.");
    await page.getByLabel("Phụ trách").fill("Nhóm 12");
    await page.getByLabel("Hạn", { exact: true }).fill("2027-01-05");
    await page.getByLabel("Ưu tiên", { exact: true }).selectOption("medium");
    await page.getByLabel("Tag", { exact: true }).fill("E2E, Đã cập nhật");
    await page.getByRole("button", { name: "Lưu thay đổi" }).click();

    await expect(page.getByRole("heading", { name: updatedTitle })).toBeVisible();
    await expect(
      page
        .locator("article.panel")
        .getByText("Nội dung đã được Playwright cập nhật và xác nhận.", {
          exact: true
        })
    ).toBeVisible();

    await expect
      .poll(async () => {
        const { tasks } = await getTasks(page);
        const task = tasks.find((item) => item.title === updatedTitle);
        return task
          ? {
              description: task.description,
              owner: task.owner,
              dueDate: task.dueDate,
              priority: task.priority,
              tags: task.tags
            }
          : null;
      })
      .toEqual({
        description: "Nội dung đã được Playwright cập nhật và xác nhận.",
        owner: "Nhóm 12",
        dueDate: "2027-01-05",
        priority: "medium",
        tags: ["E2E", "Đã cập nhật"]
      });

    await testInfo.attach("02-task-detail-updated", {
      body: await page.screenshot({ fullPage: true }),
      contentType: "image/png"
    });
  });

  await test.step("xóa công việc và xác nhận dữ liệu không còn", async () => {
    await page.getByRole("button", { name: "Xóa công việc" }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("link", { name: updatedTitle })).toHaveCount(0);
    await expect
      .poll(async () => {
        const { tasks } = await getTasks(page);
        return tasks.some((task) => task.title === updatedTitle);
      })
      .toBe(false);
  });
});
