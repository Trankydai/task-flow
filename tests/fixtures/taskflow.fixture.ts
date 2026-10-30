import { expect, test as base, type Page } from "@playwright/test";

export const e2eUsers = {
  an: {
    email: "an.e2e@taskflow.local",
    name: "Nguyễn Minh An",
    password: "123456"
  },
  binh: {
    email: "binh.e2e@taskflow.local",
    name: "Trần Gia Bình",
    password: "123456"
  }
} as const;

type UserKey = keyof typeof e2eUsers;

type TaskFlowFixtures = {
  loginAs: (user: UserKey) => Promise<void>;
};

export const test = base.extend<TaskFlowFixtures>({
  loginAs: async ({ page }, provide) => {
    await provide(async (userKey) => {
      const user = e2eUsers[userKey];

      await page.goto("/login");
      await page.getByLabel("Email").fill(user.email);
      await page.getByLabel("Mật khẩu").fill(user.password);
      await page.getByRole("button", { name: "Vào dashboard" }).click();

      await expect(page).toHaveURL(/\/dashboard$/);
      await expect(page.getByText(user.email, { exact: true })).toBeVisible();
    });
  }
});

export { expect, type Page };
