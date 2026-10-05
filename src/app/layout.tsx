import type { Metadata } from "next";
import Link from "next/link";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "TaskFlow Next",
    template: "%s | TaskFlow Next"
  },
  description:
    "Hệ thống quản lý công việc cá nhân được xây dựng bằng Next.js."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <header className="topbar">
          <Link className="brand" href="/dashboard">
            TaskFlow Next
          </Link>
          <nav aria-label="Điều hướng chính">
            <Link href="/dashboard">Bảng công việc</Link>
            <Link href="/login">Đăng nhập</Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
