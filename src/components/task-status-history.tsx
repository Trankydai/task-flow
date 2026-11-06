import { statusLabels, TaskStatusHistory } from "@/lib/types";

function formatDate(isoString: string) {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
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

export function TaskStatusHistoryView({
  history,
  asPanel = true
}: {
  history: TaskStatusHistory[];
  asPanel?: boolean;
}) {
  // Sắp xếp mới nhất lên đầu
  const sorted = [...history].sort(
    (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
  );

  return (
    <div
      className={asPanel ? "panel panel-pad history-module" : "history-module"}
    >
      <div className="history-header">
        <div className="history-title-wrap">
          <span className="history-icon" aria-hidden="true">
            🕒
          </span>
          <h2>Lịch sử thay đổi trạng thái</h2>
        </div>
        <span className="count-pill">{sorted.length}</span>
      </div>

      {sorted.length === 0 ? (
        <p className="history-empty">Chưa có thay đổi trạng thái nào.</p>
      ) : (
        <ol className="history-timeline">
          {sorted.map((item, index) => {
            const isLatest = index === 0;
            return (
              <li
                className={`history-item status-${item.toStatus}${isLatest ? " is-latest" : ""}`}
                key={item.id}
              >
                <div className="history-marker" aria-hidden="true" />
                <div className="history-content">
                  <div className="history-flow">
                    {item.fromStatus ? (
                      <>
                        <span className={`status-tag status-${item.fromStatus}`}>
                          {statusLabels[item.fromStatus]}
                        </span>
                        <span className="history-arrow">→</span>
                        <span className={`status-tag status-${item.toStatus}`}>
                          {statusLabels[item.toStatus]}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="status-tag status-init">Khởi tạo</span>
                        <span className="history-arrow">→</span>
                        <span className={`status-tag status-${item.toStatus}`}>
                          {statusLabels[item.toStatus]}
                        </span>
                      </>
                    )}
                    {isLatest && <span className="latest-pill">Hiện tại</span>}
                  </div>

                  <div className="history-meta">
                    <span className="history-time">
                      {formatDate(item.changedAt)}
                    </span>
                    {item.changedBy && (
                      <span className="history-user">
                        bởi <strong>{item.changedBy}</strong>
                      </span>
                    )}
                    {item.note && (
                      <span className="history-note">({item.note})</span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
