import { Task } from "@/lib/types";

export async function TaskInsights({ tasks }: { tasks: Task[] }) {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const urgentTasks = tasks.filter((task) => task.priority === "high").length;
  const owners = new Set(tasks.map((task) => task.owner)).size;
  const doneTasks = tasks.filter((task) => task.status === "done").length;
  const completionRate = tasks.length
    ? Math.round((doneTasks / tasks.length) * 100)
    : 0;

  return (
    <section className="insight-strip" aria-label="Tổng quan nhanh">
      <div>
        <span>Ưu tiên cao</span>
        <strong>{urgentTasks}</strong>
      </div>
      <div>
        <span>Phạm vi phụ trách</span>
        <strong>{owners}</strong>
      </div>
      <div>
        <span>Tỷ lệ hoàn thành</span>
        <strong>{completionRate}%</strong>
      </div>
    </section>
  );
}
