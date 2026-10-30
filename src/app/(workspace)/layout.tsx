import Link from "next/link";

import { logoutAction } from "@/app/actions";
import { requireCurrentUser } from "@/lib/auth";
import { getArchivedTasksCount } from "@/lib/task-store";

export default async function WorkspaceLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireCurrentUser();
  const archivedCount = await getArchivedTasksCount(user.id);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="sidebar-kicker">TaskFlow Next</p>
          <h2>Quản lý công việc</h2>
        </div>
        <nav aria-label="Điều hướng khu làm việc">
          <Link className="sidebar-link" href="/dashboard">
            <span>Bảng công việc</span>
          </Link>
          <Link className="sidebar-link" href="/archive">
            <span>Kho lưu trữ</span>
            {archivedCount > 0 ? (
              <span className="sidebar-badge">{archivedCount}</span>
            ) : null}
          </Link>
        </nav>
        <div className="sidebar-user">
          <span>{user.name}</span>
          <small>{user.email}</small>
        </div>
        <form action={logoutAction} className="logout-form">
          <button className="ghost-button" type="submit">
            Đăng xuất
          </button>
        </form>
      </aside>
      <main className="workspace">{children}</main>
    </div>
  );
}
