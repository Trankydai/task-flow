"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";

import {
  clearUserSession,
  createUser,
  findUserByEmail,
  hashPassword,
  requireCurrentUser,
  setUserSession
} from "@/lib/auth";
import {
  createTask,
  deleteTask as deleteTaskInStore,
  reorderTasks as reorderTasksInStore,
  updateTaskDetails,
  updateTaskStatus as updateTaskStatusInStore
} from "@/lib/task-store";
import { TaskPriority, TaskStatus, taskStatuses } from "@/lib/types";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getTags(formData: FormData) {
  const rawTags = getString(formData, "tags");

  return Array.from(
    new Set(
      rawTags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    )
  ).slice(0, 6);
}

function getSafeRedirectPath(formData: FormData) {
  const nextPath = getString(formData, "next");
  const isWorkspacePath =
    nextPath === "/dashboard" ||
    nextPath.startsWith("/dashboard/") ||
    nextPath.startsWith("/tasks/");

  return isWorkspacePath ? nextPath : "/dashboard";
}

function getLoginErrorPath(error: "missing" | "invalid", nextPath: string) {
  const params = new URLSearchParams({ error });

  if (nextPath !== "/dashboard") {
    params.set("next", nextPath);
  }

  return `/login?${params.toString()}`;
}

function refreshTaskRoutes() {
  updateTag("tasks");
  revalidatePath("/dashboard");
  revalidatePath("/tasks/[id]", "page");
}

export async function loginAction(formData: FormData) {
  const email = getString(formData, "email").toLowerCase();
  const password = getString(formData, "password");
  const nextPath = getSafeRedirectPath(formData);

  if (!email || !password) {
    redirect(getLoginErrorPath("missing", nextPath));
  }

  const user = await findUserByEmail(email);

  if (!user || user.passwordHash !== hashPassword(password)) {
    redirect(getLoginErrorPath("invalid", nextPath));
  }

  await setUserSession(user.id);
  redirect(nextPath);
}

export async function registerAction(formData: FormData) {
  const name = getString(formData, "name");
  const email = getString(formData, "email").toLowerCase();
  const password = getString(formData, "password");

  if (!name || !email || !password) {
    redirect("/register?error=missing");
  }

  if (password.length < 6) {
    redirect("/register?error=password");
  }

  const existedUser = await findUserByEmail(email);

  if (existedUser) {
    redirect("/register?error=exists");
  }

  const user = await createUser({
    id: `user-${randomUUID()}`,
    name,
    email,
    passwordHash: hashPassword(password)
  });

  await setUserSession(user.id);
  redirect("/dashboard");
}

export async function logoutAction() {
  await clearUserSession();
  redirect("/login");
}

export async function createTaskAction(formData: FormData) {
  const user = await requireCurrentUser();
  const title = getString(formData, "title");
  const description = getString(formData, "description");
  const owner = getString(formData, "owner") || user.name;
  const dueDate = getString(formData, "dueDate");
  const priority = getString(formData, "priority") as TaskPriority;
  const tags = getTags(formData);

  if (!title || !description || !dueDate) {
    throw new Error("Thiếu thông tin bắt buộc để tạo công việc.");
  }

  if (!["low", "medium", "high"].includes(priority)) {
    throw new Error("Mức ưu tiên không hợp lệ.");
  }

  await createTask({
    title,
    description,
    owner,
    dueDate,
    priority,
    tags,
    userId: user.id
  });
  refreshTaskRoutes();
}

export async function updateTaskStatus(id: string, status: TaskStatus) {
  const user = await requireCurrentUser();

  if (!taskStatuses.includes(status)) {
    throw new Error("Trạng thái công việc không hợp lệ.");
  }

  const updated = await updateTaskStatusInStore(id, status, user.id);

  if (!updated) {
    throw new Error("Không tìm thấy công việc của bạn.");
  }

  refreshTaskRoutes();
}

export async function reorderTasks(status: TaskStatus, orderedIds: string[]) {
  const user = await requireCurrentUser();

  if (!taskStatuses.includes(status)) {
    throw new Error("Trạng thái công việc không hợp lệ.");
  }

  await reorderTasksInStore(status, orderedIds, user.id);
  refreshTaskRoutes();
}

export async function updateTaskAction(id: string, formData: FormData) {
  const user = await requireCurrentUser();
  const title = getString(formData, "title");
  const description = getString(formData, "description");
  const owner = getString(formData, "owner");
  const dueDate = getString(formData, "dueDate");
  const priority = getString(formData, "priority") as TaskPriority;
  const tags = getTags(formData);

  if (!title || !description || !owner || !dueDate) {
    throw new Error("Thiếu thông tin cập nhật công việc.");
  }

  if (!["low", "medium", "high"].includes(priority)) {
    throw new Error("Mức ưu tiên không hợp lệ.");
  }

  const updated = await updateTaskDetails(
    id,
    {
      title,
      description,
      owner,
      dueDate,
      priority,
      tags
    },
    user.id
  );

  if (!updated) {
    throw new Error("Không tìm thấy công việc của bạn.");
  }

  refreshTaskRoutes();
  redirect(`/tasks/${id}`);
}

export async function deleteTaskAction(id: string) {
  const user = await requireCurrentUser();
  const deleted = await deleteTaskInStore(id, user.id);

  if (!deleted) {
    throw new Error("Không tìm thấy công việc của bạn.");
  }

  refreshTaskRoutes();
}

export async function deleteTaskAndRedirectAction(id: string) {
  await deleteTaskAction(id);
  redirect("/dashboard");
}
