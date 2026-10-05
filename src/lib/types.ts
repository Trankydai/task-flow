export const taskStatuses = ["todo", "doing", "review", "done"] as const;

export type TaskStatus = (typeof taskStatuses)[number];

export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  owner: string;
  dueDate: string;
  order: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export const statusLabels: Record<TaskStatus, string> = {
  todo: "Cần làm",
  doing: "Đang làm",
  review: "Chờ duyệt",
  done: "Hoàn thành"
};

export const priorityLabels: Record<TaskPriority, string> = {
  low: "Thấp",
  medium: "Vừa",
  high: "Cao"
};
