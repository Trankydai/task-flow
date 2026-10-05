import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { getTasks } from "@/lib/task-store";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { message: "Bạn cần đăng nhập để xem danh sách công việc." },
      { status: 401 }
    );
  }

  const tasks = await getTasks(user.id);

  return NextResponse.json({
    owner: user.name,
    count: tasks.length,
    tasks
  });
}
