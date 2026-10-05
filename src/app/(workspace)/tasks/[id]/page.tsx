import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteTaskAndRedirectAction, updateTaskAction } from "@/app/actions";
import { getCurrentUser, requireCurrentUser } from "@/lib/auth";
import { getTaskById } from "@/lib/task-store";
import { priorityLabels, statusLabels } from "@/lib/types";

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

  return (
    <>
      <section className="page-header">
        <div>
          <h1>{task.title}</h1>
          <p>
            Xem thông tin chi tiết, điều chỉnh mức ưu tiên và cập nhật nội dung
            công việc khi phạm vi thay đổi.
          </p>
        </div>
        <Link className="ghost-button" href="/dashboard">
          Về bảng công việc
        </Link>
      </section>

      <section className="detail-layout">
        <article className="panel panel-pad">
          <h2>Thông tin</h2>
          <div className="detail-list">
            <div>
              <span>Trạng thái</span>
              <strong>{statusLabels[task.status]}</strong>
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
              <strong>{task.tags.length ? task.tags.join(", ") : "Không có"}</strong>
            </div>
          </div>
          <p>{task.description}</p>
        </article>

        <aside className="panel panel-pad">
          <h2>Cập nhật nhanh</h2>
          <form action={updateTaskAction.bind(null, task.id)} className="form-stack">
            <div className="field">
              <label htmlFor="title">Tiêu đề</label>
              <input id="title" name="title" defaultValue={task.title} required />
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
