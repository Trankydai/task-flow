import "server-only";

import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import { unstable_cache } from "next/cache";

import { Task, TaskStatus, taskStatuses } from "./types";

const tasksFile = path.join(process.cwd(), "data", "tasks.json");
const taskPriorities = ["low", "medium", "high"] as const;

type StoredTask = Task & {
  userId: string;
};

async function ensureTasksFile() {
  await fs.mkdir(path.dirname(tasksFile), { recursive: true });

  try {
    await fs.access(tasksFile);
  } catch {
    await fs.writeFile(tasksFile, "[]\n", "utf8");
  }
}

function normalizeStatus(status: string): TaskStatus {
  return taskStatuses.includes(status as TaskStatus)
    ? (status as TaskStatus)
    : "todo";
}

function normalizePriority(priority: string): Task["priority"] {
  return taskPriorities.includes(priority as Task["priority"])
    ? (priority as Task["priority"])
    : "medium";
}

function normalizeTask(task: StoredTask): StoredTask {
  return {
    ...task,
    status: normalizeStatus(task.status),
    priority: normalizePriority(task.priority),
    tags: Array.isArray(task.tags) ? task.tags : []
  };
}

function toTask(task: StoredTask): Task {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    owner: task.owner,
    dueDate: task.dueDate,
    order: task.order,
    tags: task.tags,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt
  };
}

function sortTasks<T extends Task>(tasks: T[]) {
  return tasks.sort((left, right) => {
    const statusDelta =
      taskStatuses.indexOf(left.status) - taskStatuses.indexOf(right.status);
    return statusDelta || left.order - right.order;
  });
}

async function readTasksRaw() {
  await ensureTasksFile();
  const content = await fs.readFile(tasksFile, "utf8");
  return (JSON.parse(content) as StoredTask[]).map(normalizeTask);
}

async function writeTasksRaw(tasks: StoredTask[]) {
  await ensureTasksFile();
  await fs.writeFile(tasksFile, `${JSON.stringify(tasks, null, 2)}\n`, "utf8");
}

function getNextOrder(tasks: StoredTask[], userId: string, status: TaskStatus) {
  const orders = tasks
    .filter((task) => task.userId === userId && task.status === status)
    .map((task) => task.order);

  return Math.max(0, ...orders) + 10;
}

export const getTasksCached = unstable_cache(
  async (userId: string) => getTasks(userId),
  ["taskflow-tasks"],
  {
    revalidate: 60,
    tags: ["tasks"]
  }
);

export async function getTasks(userId: string) {
  const tasks = await readTasksRaw();
  return sortTasks(tasks.filter((task) => task.userId === userId)).map(toTask);
}

export async function getTaskById(id: string, userId: string) {
  const tasks = await readTasksRaw();
  const task = tasks.find((item) => item.id === id && item.userId === userId);
  return task ? toTask(task) : null;
}

export async function createTask(input: {
  title: string;
  description: string;
  owner: string;
  dueDate: string;
  priority: Task["priority"];
  tags: string[];
  userId: string;
}) {
  const tasks = await readTasksRaw();
  const now = new Date().toISOString();
  const task: StoredTask = {
    id: `task-${randomUUID()}`,
    title: input.title,
    description: input.description,
    owner: input.owner,
    dueDate: input.dueDate,
    status: "todo",
    priority: input.priority,
    order: getNextOrder(tasks, input.userId, "todo"),
    tags: input.tags.length > 0 ? input.tags : ["Mới"],
    createdAt: now,
    updatedAt: now,
    userId: input.userId
  };

  await writeTasksRaw([...tasks, task]);
  return toTask(task);
}

export async function updateTaskStatus(
  id: string,
  status: TaskStatus,
  userId: string
) {
  const tasks = await readTasksRaw();
  const taskIndex = tasks.findIndex(
    (task) => task.id === id && task.userId === userId
  );

  if (taskIndex < 0) {
    return false;
  }

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    status,
    order: getNextOrder(tasks, userId, status),
    updatedAt: new Date().toISOString()
  };

  await writeTasksRaw(tasks);
  return true;
}

export async function reorderTasks(
  status: TaskStatus,
  orderedIds: string[],
  userId: string
) {
  if (orderedIds.length === 0) {
    return;
  }

  const orderById = new Map(
    orderedIds.map((id, index) => [id, (index + 1) * 10])
  );
  const now = new Date().toISOString();
  const tasks = await readTasksRaw();

  await writeTasksRaw(
    tasks.map((task) =>
      task.userId === userId && task.status === status && orderById.has(task.id)
        ? { ...task, order: orderById.get(task.id) ?? task.order, updatedAt: now }
        : task
    )
  );
}

export async function updateTaskDetails(
  id: string,
  input: Pick<
    Task,
    "title" | "description" | "owner" | "dueDate" | "priority" | "tags"
  >,
  userId: string
) {
  const tasks = await readTasksRaw();
  let updated = false;
  const now = new Date().toISOString();

  await writeTasksRaw(
    tasks.map((task) => {
      if (task.id !== id || task.userId !== userId) {
        return task;
      }

      updated = true;
      return {
        ...task,
        ...input,
        updatedAt: now
      };
    })
  );

  return updated;
}

export async function deleteTask(id: string, userId: string) {
  const tasks = await readTasksRaw();
  const nextTasks = tasks.filter(
    (task) => !(task.id === id && task.userId === userId)
  );

  if (nextTasks.length === tasks.length) {
    return false;
  }

  await writeTasksRaw(nextTasks);
  return true;
}
