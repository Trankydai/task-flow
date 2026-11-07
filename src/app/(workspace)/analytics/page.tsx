import Link from "next/link";

import { requireCurrentUser } from "@/lib/auth";
import { getAllUserTasks } from "@/lib/task-store";
import {
  priorityLabels,
  statusLabels,
  TaskPriority,
  TaskStatus,
  taskStatuses
} from "@/lib/types";

export const metadata = {
  title: "Báo cáo & Phân tích hiệu suất"
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

export default async function AnalyticsPage() {
  const user = await requireCurrentUser();
  const allTasks = await getAllUserTasks(user.id);

  const activeTasks = allTasks.filter((t) => !t.isArchived);
  const archivedTasks = allTasks.filter((t) => t.isArchived);
  const totalTasks = allTasks.length;

  // Completed includes 'done' active tasks + archived tasks
  const completedTasks = allTasks.filter(
    (t) => t.status === "done" || t.isArchived
  );
  const completionRate = totalTasks
    ? Math.round((completedTasks.length / totalTasks) * 100)
    : 0;

  const todayStr = new Date().toISOString().split("T")[0];
  const overdueTasks = activeTasks.filter(
    (t) => t.status !== "done" && t.dueDate && t.dueDate < todayStr
  );
  const urgentHighTasks = activeTasks.filter(
    (t) => t.status !== "done" && t.priority === "high"
  );

  // Status breakdown
  const statusCounts: Record<TaskStatus | "archived", number> = {
    todo: activeTasks.filter((t) => t.status === "todo").length,
    doing: activeTasks.filter((t) => t.status === "doing").length,
    review: activeTasks.filter((t) => t.status === "review").length,
    done: activeTasks.filter((t) => t.status === "done").length,
    archived: archivedTasks.length
  };

  // Priority breakdown
  const priorityList: TaskPriority[] = ["high", "medium", "low"];
  const priorityStats = priorityList.map((pri) => {
    const priTasks = allTasks.filter((t) => t.priority === pri);
    const priDone = priTasks.filter((t) => t.status === "done" || t.isArchived);
    return {
      priority: pri,
      label: priorityLabels[pri],
      total: priTasks.length,
      done: priDone.length,
      rate: priTasks.length ? Math.round((priDone.length / priTasks.length) * 100) : 0
    };
  });

  // Tag analytics
  const tagMap = new Map<string, { total: number; done: number }>();
  allTasks.forEach((t) => {
    t.tags.forEach((tag) => {
      const cleanTag = tag.trim();
      if (!cleanTag) return;
      const current = tagMap.get(cleanTag) || { total: 0, done: 0 };
      current.total += 1;
      if (t.status === "done" || t.isArchived) {
        current.done += 1;
      }
      tagMap.set(cleanTag, current);
    });
  });

  const popularTags = Array.from(tagMap.entries())
    .map(([name, data]) => ({
      name,
      total: data.total,
      done: data.done,
      rate: Math.round((data.done / data.total) * 100)
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  // Activity audit timeline
  const auditTimeline = allTasks
    .flatMap((task) =>
      (task.statusHistory || []).map((h) => ({
        ...h,
        taskId: task.id,
        taskTitle: task.title,
        currentStatus: task.status,
        isArchived: task.isArchived
      }))
    )
    .sort(
      (a, b) =>
        new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
    )
    .slice(0, 15);

  return (
    <>
      <section className="page-header dashboard-header">
        <div>
          <span className="eyebrow">Không gian phân tích của {user.name}</span>
          <h1>Trung tâm phân tích & Báo cáo tiến độ</h1>
          <p>
            Theo dõi toàn diện hiệu suất làm việc cá nhân, tiến độ hoàn thành, cảnh báo
            công việc quá hạn và nhật ký kiểm toán thay đổi trạng thái theo thời gian thực.
          </p>
        </div>
        <div
          className="header-summary"
          aria-label="Tỷ lệ hoàn thành tổng thể"
        >
          <span>Tỷ lệ hoàn thành</span>
          <strong>{completionRate}%</strong>
        </div>
      </section>

      {/* KPI Cards Grid */}
      <section className="analytics-kpi-grid" aria-label="Chỉ số hiệu suất chính">
        <article className="panel panel-pad kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Tổng số công việc</span>
            <span className="kpi-badge">Toàn bộ</span>
          </div>
          <div className="kpi-value">{totalTasks}</div>
          <div className="kpi-meta">
            <span>Đang xử lý: <strong>{activeTasks.length}</strong></span>
            <span>Kho lưu trữ: <strong>{archivedTasks.length}</strong></span>
          </div>
        </article>

        <article className="panel panel-pad kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Tiến độ hoàn thành</span>
            <span className="kpi-badge success">{completionRate}%</span>
          </div>
          <div className="kpi-value success-text">{completedTasks.length} / {totalTasks}</div>
          <div className="analytics-progress-bar" role="progressbar" aria-valuenow={completionRate} aria-valuemin={0} aria-valuemax={100}>
            <div
              className="analytics-progress-fill success-fill"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </article>

        <article className={`panel panel-pad kpi-card ${overdueTasks.length > 0 ? "kpi-card-danger" : ""}`}>
          <div className="kpi-header">
            <span className="kpi-title">Cảnh báo quá hạn</span>
            <span className={`kpi-badge ${overdueTasks.length > 0 ? "danger" : "neutral"}`}>
              {overdueTasks.length > 0 ? "Cần xử lý" : "An toàn"}
            </span>
          </div>
          <div className={`kpi-value ${overdueTasks.length > 0 ? "danger-text" : ""}`}>
            {overdueTasks.length}
          </div>
          <div className="kpi-meta">
            {overdueTasks.length > 0 ? (
              <span className="danger-text">Có công việc đã trễ hạn chót!</span>
            ) : (
              <span>Không có công việc trễ hạn</span>
            )}
          </div>
        </article>

        <article className="panel panel-pad kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Việc ưu tiên cao</span>
            <span className="kpi-badge warning">{urgentHighTasks.length} việc</span>
          </div>
          <div className="kpi-value warning-text">{urgentHighTasks.length}</div>
          <div className="kpi-meta">
            <span>Chiếm <strong>{totalTasks ? Math.round((urgentHighTasks.length / totalTasks) * 100) : 0}%</strong> khối lượng việc mở</span>
          </div>
        </article>
      </section>

      {/* Distribution Section: Status & Priority */}
      <section className="analytics-split-grid">
        {/* Status Distribution */}
        <article className="panel panel-pad">
          <div className="section-title-wrap">
            <h2>Phân bổ theo trạng thái công việc</h2>
            <span className="kpi-subtitle">Khảo sát 4 cột Kanban & Kho lưu trữ</span>
          </div>

          <div className="distribution-list">
            {taskStatuses.map((st) => {
              const count = statusCounts[st];
              const pct = totalTasks ? Math.round((count / totalTasks) * 100) : 0;
              return (
                <div className="distribution-row" key={st}>
                  <div className="dist-label-row">
                    <span className="dist-name">{statusLabels[st]}</span>
                    <span className="dist-nums"><strong>{count}</strong> ({pct}%)</span>
                  </div>
                  <div className="analytics-progress-bar">
                    <div
                      className={`analytics-progress-fill status-${st}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}

            <div className="distribution-row">
              <div className="dist-label-row">
                <span className="dist-name">Đã lưu trữ (Archive)</span>
                <span className="dist-nums">
                  <strong>{statusCounts.archived}</strong> ({totalTasks ? Math.round((statusCounts.archived / totalTasks) * 100) : 0}%)
                </span>
              </div>
              <div className="analytics-progress-bar">
                <div
                  className="analytics-progress-fill status-archived"
                  style={{
                    width: `${totalTasks ? Math.round((statusCounts.archived / totalTasks) * 100) : 0}%`
                  }}
                />
              </div>
            </div>
          </div>
        </article>

        {/* Priority Breakdown */}
        <article className="panel panel-pad">
          <div className="section-title-wrap">
            <h2>Tỷ lệ xử lý theo độ ưu tiên</h2>
            <span className="kpi-subtitle">Hiệu suất giải quyết việc từ Thấp đến Cao</span>
          </div>

          <div className="priority-analytics-list">
            {priorityStats.map((item) => (
              <div className="priority-analytics-item" key={item.priority}>
                <div className="priority-header-row">
                  <span className={`badge ${item.priority}`}>
                    Ưu tiên {item.label}
                  </span>
                  <span className="priority-rate-badge">
                    Hoàn thành <strong>{item.done} / {item.total}</strong> ({item.rate}%)
                  </span>
                </div>
                <div className="analytics-progress-bar">
                  <div
                    className={`analytics-progress-fill priority-${item.priority}`}
                    style={{ width: `${item.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Tag cloud summary */}
          <div className="tag-analytics-block">
            <h3>Nhãn công việc phổ biến</h3>
            {popularTags.length === 0 ? (
              <p className="subtle-text">Chưa có nhãn công việc nào được gán.</p>
            ) : (
              <div className="tag-pills-wrap">
                {popularTags.map((tag) => (
                  <span className="tag-pill" key={tag.name}>
                    <strong>#{tag.name}</strong> ({tag.total} việc - {tag.rate}% xong)
                  </span>
                ))}
              </div>
            )}
          </div>
        </article>
      </section>

      {/* Urgent Tasks requiring immediate attention */}
      {overdueTasks.length > 0 && (
        <section className="panel panel-pad alert-panel-container">
          <div className="alert-panel-header">
            <span className="alert-icon" aria-hidden="true">⚠️</span>
            <div>
              <h2>Công việc quá hạn cần hành động ngay</h2>
              <p>Các công việc dưới đây đã vượt quá thời hạn chót cam kết nhưng chưa hoàn thành.</p>
            </div>
          </div>
          <div className="urgent-task-grid">
            {overdueTasks.map((t) => (
              <div className="urgent-task-card" key={t.id}>
                <div className="urgent-card-top">
                  <span className={`badge ${t.priority}`}>{priorityLabels[t.priority]}</span>
                  <span className="overdue-tag">Quá hạn: {t.dueDate}</span>
                </div>
                <h4 className="urgent-card-title">
                  <Link href={`/tasks/${t.id}`}>{t.title}</Link>
                </h4>
                <div className="urgent-card-footer">
                  <span>Trạng thái: <strong>{statusLabels[t.status]}</strong></span>
                  <Link className="primary-button small-btn" href={`/tasks/${t.id}`}>
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Audit Activity Timeline */}
      <section className="panel panel-pad">
        <div className="section-title-wrap">
          <h2>Nhật ký hoạt động & Kiểm toán trạng thái</h2>
          <p className="kpi-subtitle">
            Ghi nhận tự động mọi vết thay đổi trạng thái của toàn bộ công việc trong không gian làm việc.
          </p>
        </div>

        {auditTimeline.length === 0 ? (
          <p className="subtle-text">Chưa có lịch sử thay đổi trạng thái nào.</p>
        ) : (
          <div className="audit-timeline">
            {auditTimeline.map((item) => (
              <div className="audit-entry" key={item.id}>
                <div className="audit-dot" aria-hidden="true" />
                <div className="audit-content">
                  <div className="audit-line-one">
                    <strong className="audit-actor">{item.changedBy || "Người dùng"}</strong>
                    <span className="audit-action-text">đã cập nhật công việc</span>
                    <Link className="audit-task-link" href={`/tasks/${item.taskId}`}>
                      &ldquo;{item.taskTitle}&rdquo;
                    </Link>
                  </div>
                  <div className="audit-line-two">
                    <span className="audit-status-flow">
                      {item.fromStatus ? statusLabels[item.fromStatus] : "Khởi tạo"}
                      {" ➔ "}
                      <strong>{statusLabels[item.toStatus]}</strong>
                    </span>
                    {item.note && <span className="audit-note">({item.note})</span>}
                    <span className="audit-timestamp">{formatDate(item.changedAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
