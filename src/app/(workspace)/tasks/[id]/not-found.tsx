import Link from "next/link";

export default function TaskNotFound() {
  return (
    <section className="panel panel-pad">
      <h1>Không tìm thấy công việc</h1>
      <p>Công việc này không tồn tại hoặc không thuộc tài khoản hiện tại.</p>
      <Link className="primary-button" href="/dashboard">
        Về dashboard
      </Link>
    </section>
  );
}
