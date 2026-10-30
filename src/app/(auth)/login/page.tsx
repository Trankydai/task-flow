import Link from "next/link";
import { redirect } from "next/navigation";

import { loginAction } from "@/app/actions";
import { getCurrentUser } from "@/lib/auth";

export const metadata = {
  title: "Đăng nhập"
};

const errorMessages: Record<string, string> = {
  missing: "Vui lòng nhập email và mật khẩu.",
  invalid: "Email hoặc mật khẩu không đúng."
};

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{
    error?: string | string[];
    next?: string | string[];
  }>;
}) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  const { error, next } = await searchParams;
  const errorCode = Array.isArray(error) ? error[0] : error;
  const nextPath = Array.isArray(next) ? next[0] : next;

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-heading">
          <span className="eyebrow">TaskFlow Next</span>
          <h1>Đăng nhập</h1>
          <p>Mỗi tài khoản có một bảng công việc riêng.</p>
        </div>

        {errorCode && errorMessages[errorCode] ? (
          <p className="form-error">{errorMessages[errorCode]}</p>
        ) : null}

        <form action={loginAction} className="form-stack">
          <input name="next" type="hidden" value={nextPath ?? ""} />
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="dai@taskflow.local"
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
              placeholder="123456"
              autoComplete="current-password"
              required
            />
          </div>
          <button className="primary-button" type="submit">
            Vào dashboard
          </button>
        </form>
        <p className="auth-switch">
          Chưa có tài khoản? <Link href="/register">Đăng ký mới</Link>
        </p>
      </section>
    </main>
  );
}
