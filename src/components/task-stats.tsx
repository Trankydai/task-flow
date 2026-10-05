import { Task, taskStatuses, statusLabels } from "@/lib/types";

export function TaskStats({ tasks }: { tasks: Task[] }) {
  return (
    <section className="stats" aria-label="Thống kê công việc">
      {taskStatuses.map((status) => {
        const count = tasks.filter((task) => task.status === status).length;
        return (
          <article className="stat" key={status}>
            <span>{statusLabels[status]}</span>
            <strong>{count}</strong>
          </article>
        );
      })}
    </section>
  );
}
