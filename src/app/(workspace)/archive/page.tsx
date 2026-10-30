import Link from "next/link";

import { deleteTaskAction, restoreTaskAction } from "@/app/actions";
import { requireCurrentUser } from "@/lib/auth";
import { getArchivedTasks } from "@/lib/task-store";
import { priorityLabels } from "@/lib/types";

export const metadata = {
  title: "Kho lưu trữ công việc"
};

function formatDate(isoString?: string | null) {
  if (!isoString) return "Không xác định";
  try {
    const date = new Date(isoString);
    return date.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  } catch {
    return isoString;
  }
}

export default async function ArchivePage() {
  const user = await requireCurrentUser();
  const tasks = await getArchivedTasks(user.id);

  return (
    <>
      <section className="page-header dashboard-header">
        <div>
          <span className="eyebrow">Kho lưu trữ của {user.name}</span>
          <h1>Kho lưu trữ công việc</h1>
          <p>
            Các công việc đã hoàn thành được lưu lại tại đây giúp bảng Kanban
            chính luôn gọn gàng. Bạn có thể khôi phục lại bảng việc bất kỳ lúc
            nào.
          </p>
        </div>
        <div
          className="header-summary"
          aria-label="Tổng số việc trong kho lưu trữ"
        >
          <span>Đã lưu trữ</span>
          <strong>{tasks.length}</strong>
        </div>
      </section>

      {tasks.length === 0 ? (
        <section className="panel panel-pad archive-empty-card">
          <div className="archive-empty-icon" aria-hidden="true">
            📦
          </div>
          <h2>Kho lưu trữ đang trống</h2>
          <p>
            Khi một công việc ở cột <strong>Hoàn thành</strong> trên bảng việc đã
            xong, bạn có thể nhấn nút <strong>Lưu trữ</strong> trên thẻ để đưa
            vào đây.
          </p>
          <Link className="primary-button" href="/dashboard">
            Về bảng công việc
          </Link>
        </section>
      ) : (
        <section className="archive-list" aria-label="Danh sách việc đã lưu trữ">
          {tasks.map((task) => (
            <article className="panel panel-pad archive-item" key={task.id}>
              <div className="archive-item-main">
                <div className="archive-item-header">
                  <h3>
                    <Link href={`/tasks/${task.id}`}>{task.title}</Link>
                  </h3>
                  <span className={`badge ${task.priority}`}>
                    {priorityLabels[task.priority]}
                  </span>
                </div>

                <p className="archive-item-desc">{task.description}</p>

                <div className="archive-item-meta">
                  <span>Phụ trách: <strong>{task.owner}</strong></span>
                  <span>Hạn chót: <strong>{task.dueDate}</strong></span>
                  <span>
                    Lưu trữ lúc: <strong>{formatDate(task.archivedAt)}</strong>
                  </span>
                  {task.tags.length > 0 && (
                    <div className="card-tags">
                      {task.tags.map((tag) => (
                        <span className="tag" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="archive-item-actions">
                <form action={restoreTaskAction.bind(null, task.id)}>
                  <button className="primary-button" type="submit">
                    ↩ Khôi phục
                  </button>
                </form>
                <Link className="ghost-button" href={`/tasks/${task.id}`}>
                  Chi tiết
                </Link>
                <form action={deleteTaskAction.bind(null, task.id)}>
                  <button className="delete-button" type="submit">
                    Xóa
                  </button>
                </form>
              </div>
            </article>
          ))}
        </section>
      )}
    </>
  );
}
