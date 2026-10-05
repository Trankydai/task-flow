"use client";

export default function DashboardError({
  error,
  reset
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <section className="panel panel-pad error-box">
      <h1>Không tải được dashboard</h1>
      <p>{error.message}</p>
      <button className="primary-button" onClick={reset} type="button">
        Thử lại
      </button>
    </section>
  );
}
