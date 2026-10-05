import { Suspense } from "react";

import { CreateTaskForm } from "@/components/create-task-form";
import { TaskBoard } from "@/components/task-board";
import { TaskInsights } from "@/components/task-insights";
import { TaskStats } from "@/components/task-stats";
import { requireCurrentUser } from "@/lib/auth";
import { getTasksCached } from "@/lib/task-store";

export const metadata = {
  title: "Bảng công việc"
};

export default async function DashboardPage() {
  const user = await requireCurrentUser();
  const tasks = await getTasksCached(user.id);
  const inProgress = tasks.filter((task) => task.status !== "done").length;

  return (
    <>
      <section className="page-header dashboard-header">
        <div>
          <span className="eyebrow">Không gian của {user.name}</span>
          <h1>Bảng công việc cá nhân</h1>
          <p>
            Theo dõi tiến độ, tạo việc mới và kéo thả các thẻ để cập nhật
            trạng thái trong cùng một màn hình.
          </p>
        </div>
        <div className="header-summary" aria-label="Tổng số việc đang mở">
          <span>Đang xử lý</span>
          <strong>{inProgress}</strong>
        </div>
      </section>

      <TaskStats tasks={tasks} />

      <section className="grid-two">
        <div className="board-area">
          <Suspense
            fallback={
              <div className="inline-loading">Đang cập nhật tổng quan...</div>
            }
          >
            <TaskInsights tasks={tasks} />
          </Suspense>
          <TaskBoard
            key={tasks
              .map(
                (task) =>
                  `${task.id}:${task.status}:${task.order}:${task.updatedAt}`
              )
              .join("|")}
            tasks={tasks}
          />
        </div>

        <aside className="create-panel">
          <h2>Thêm công việc</h2>
          <CreateTaskForm defaultOwner={user.name} />
        </aside>
      </section>
    </>
  );
}
