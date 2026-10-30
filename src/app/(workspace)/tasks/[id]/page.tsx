import Link from "next/link";
import { notFound } from "next/navigation";

import {
  archiveTaskAndRedirectAction,
  deleteTaskAndRedirectAction,
  restoreTaskAction,
  updateTaskAction
} from "@/app/actions";
import { TaskStatusHistoryView } from "@/components/task-status-history";
import { getCurrentUser, requireCurrentUser } from "@/lib/auth";
import { getTaskById } from "@/lib/task-store";
import { priorityLabels, statusLabels, taskStatuses } from "@/lib/types";

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const task = user ? await getTaskById(id, user.id) : null;

  return {
    title: task ? task.title : "Không tìm thấy công việc"
  };
}

export default async function TaskDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireCurrentUser();
  const task = await getTaskById(id, user.id);

  if (!task) {
    notFound();
  }

  const isDone = task.status === "done";
  const isArchived = Boolean(task.isArchived);

  return (
    <>
      <section className="page-header">
        <div>
          <div className="detail-header-eyebrow">
            {isArchived ? (
              <span className="archive-pill">Đã lưu trữ</span>
            ) : (
              <span className="eyebrow">Chi tiết công việc</span>
            )}
          </div>
          <h1>{task.title}</h1>
          <p>
            Xem thông tin chi tiết, điều chỉnh mức ưu tiên và cập nhật nội dung
            công việc khi phạm vi thay đổi.
          </p>
        </div>
        <div className="header-actions">
          {isArchived ? (
            <Link className="ghost-button" href="/archive">
              Về kho lưu trữ
            </Link>
          ) : (
            <Link className="ghost-button" href="/dashboard">
              Về bảng công việc
            </Link>
          )}
        </div>
      </section>

      <section className="detail-layout">
        <div className="detail-main">
          <article className="panel panel-pad">
            <h2>Thông tin</h2>
            <div className="detail-list">
              <div>
                <span>Trạng thái</span>
                <strong>
                  {statusLabels[task.status]}
                  {isArchived && " (Đã lưu trữ)"}
                </strong>
              </div>
              <div>
                <span>Ưu tiên</span>
                <strong>{priorityLabels[task.priority]}</strong>
              </div>
              <div>
                <span>Người phụ trách</span>
                <strong>{task.owner}</strong>
              </div>
              <div>
                <span>Hạn</span>
                <strong>{task.dueDate}</strong>
              </div>
              <div>
                <span>Cập nhật</span>
                <strong>{new Date(task.updatedAt).toLocaleString("vi-VN")}</strong>
              </div>
              <div>
                <span>Tag</span>
                <strong>
                  {task.tags.length ? task.tags.join(", ") : "Không có"}
                </strong>
              </div>
            </div>
            <p>{task.description}</p>
          </article>

          <TaskStatusHistoryView history={task.statusHistory ?? []} />
        </div>

        <aside className="panel panel-pad">
          <h2>Cập nhật nhanh</h2>
          <form
            action={updateTaskAction.bind(null, task.id)}
            className="form-stack"
          >
            <div className="field">
              <label htmlFor="title">Tiêu đề</label>
              <input id="title" name="title" defaultValue={task.title} required />
            </div>
            <div className="field">
              <label htmlFor="status">Trạng thái</label>
              <select id="status" name="status" defaultValue={task.status}>
                {taskStatuses.map((st) => (
                  <option key={st} value={st}>
                    {statusLabels[st]}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="description">Mô tả</label>
              <textarea
                id="description"
                name="description"
                defaultValue={task.description}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="owner">Phụ trách</label>
              <input id="owner" name="owner" defaultValue={task.owner} required />
            </div>
            <div className="field">
              <label htmlFor="dueDate">Hạn</label>
              <input
                id="dueDate"
                name="dueDate"
                type="date"
                defaultValue={task.dueDate}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="priority">Ưu tiên</label>
              <select id="priority" name="priority" defaultValue={task.priority}>
                <option value="low">Thấp</option>
                <option value="medium">Vừa</option>
                <option value="high">Cao</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="tags">Tag</label>
              <input
                id="tags"
                name="tags"
                defaultValue={task.tags.join(", ")}
                placeholder="Demo, Nộp bài, Báo cáo"
              />
            </div>
            <button className="primary-button" type="submit">
              Lưu thay đổi
            </button>
          </form>

          {isArchived ? (
            <form
              action={restoreTaskAction.bind(null, task.id)}
              className="action-button-form"
            >
              <button className="primary-button full-width" type="submit">
                ↩ Khôi phục về bảng việc
              </button>
            </form>
          ) : isDone ? (
            <form
              action={archiveTaskAndRedirectAction.bind(null, task.id)}
              className="action-button-form"
            >
              <button className="archive-button full-width" type="submit">
                📦 Lưu trữ công việc này
              </button>
            </form>
          ) : null}

          <form action={deleteTaskAndRedirectAction.bind(null, task.id)}>
            <button className="danger-button full-width" type="submit">
              Xóa công việc
            </button>
          </form>
        </aside>
      </section>
    </>
  );
}
