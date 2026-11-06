import { expect, test } from "../fixtures/taskflow.fixture";

test("không cho người dùng xem công việc của tài khoản khác", async ({
  page,
  loginAs
}) => {
  await loginAs("an");

  const apiResponse = await page.request.get("/api/tasks");
  expect(apiResponse.ok()).toBeTruthy();
  const payload = (await apiResponse.json()) as {
    tasks: Array<{ id: string; title: string }>;
  };

  expect(payload.tasks).toContainEqual(
    expect.objectContaining({ id: "task-e2e-an-private" })
  );
  expect(payload.tasks).not.toContainEqual(
    expect.objectContaining({ id: "task-e2e-binh-private" })
  );

  await page.goto("/tasks/task-e2e-binh-private");

  await expect(page).toHaveURL(/\/tasks\/task-e2e-binh-private$/);
  await expect(
    page.getByRole("heading", { name: "Không tìm thấy công việc" })
  ).toBeVisible();
  await expect(
    page.getByText("Công việc này không tồn tại hoặc không thuộc tài khoản hiện tại.")
  ).toBeVisible();
});
