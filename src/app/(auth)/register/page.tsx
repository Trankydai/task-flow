import Link from "next/link";
import { redirect } from "next/navigation";

import { registerAction } from "@/app/actions";
import { getCurrentUser } from "@/lib/auth";

export const metadata = {
  title: "Đăng ký"
};

const errorMessages: Record<string, string> = {
  missing: "Vui lòng nhập đầy đủ thông tin.",
  password: "Mật khẩu cần có ít nhất 6 ký tự.",
  exists: "Email này đã được đăng ký."
};

export default async function RegisterPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  const { error } = await searchParams;
  const errorCode = Array.isArray(error) ? error[0] : error;

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-heading">
          <span className="eyebrow">TaskFlow Next</span>
          <h1>Tạo tài khoản</h1>
          <p>Bắt đầu với một không gian công việc riêng cho bạn.</p>
        </div>

        {errorCode && errorMessages[errorCode] ? (
          <p className="form-error">{errorMessages[errorCode]}</p>
        ) : null}

        <form action={registerAction} className="form-stack">
          <div className="field">
            <label htmlFor="name">Họ tên</label>
            <input
              id="name"
              name="name"
              placeholder="Nguyễn Văn A"
              autoComplete="name"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="ban@taskflow.local"
              autoComplete="email"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Mật khẩu</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>
          <button className="primary-button" type="submit">
            Tạo tài khoản
          </button>
        </form>
        <p className="auth-switch">
          Đã có tài khoản? <Link href="/login">Đăng nhập</Link>
        </p>
      </section>
    </main>
  );
}
