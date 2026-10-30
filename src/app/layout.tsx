import type { Metadata } from "next";

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
      <body>{children}</body>
    </html>
  );
}
