"use client";

import Link from "next/link";

export default function TaskDetailError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="panel panel-pad error-box">
      <h1>Không tải được chi tiết công việc</h1>
      <p>{error.message || "Đã có lỗi xảy ra khi đọc dữ liệu."}</p>
      <div className="form-actions">
        <button className="primary-button" onClick={reset} type="button">
          Thử lại
        </button>
        <Link className="ghost-button" href="/dashboard">
          Về dashboard
        </Link>
      </div>
    </section>
  );
}
