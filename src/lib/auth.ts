import "server-only";

import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  createSessionToken,
  sessionCookieName,
  sessionMaxAge,
  verifySessionToken
} from "./session";

const configuredDataDirectory = process.env.TASKFLOW_DATA_DIR?.trim();
const dataDirectory = configuredDataDirectory
  ? path.resolve(process.cwd(), configuredDataDirectory)
  : path.join(process.cwd(), "data");
const usersFile = path.join(dataDirectory, "users.json");

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export type AuthUser = Pick<StoredUser, "id" | "name" | "email" | "role">;

function toAuthUser(user: StoredUser): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

async function ensureUsersFile() {
  await fs.mkdir(path.dirname(usersFile), { recursive: true });

  try {
    await fs.access(usersFile);
  } catch {
    await fs.writeFile(usersFile, "[]\n", "utf8");
  }
}

async function readUsersRaw() {
  await ensureUsersFile();
  const content = await fs.readFile(usersFile, "utf8");
  return JSON.parse(content) as StoredUser[];
}

async function writeUsersRaw(users: StoredUser[]) {
  await ensureUsersFile();
  await fs.writeFile(usersFile, `${JSON.stringify(users, null, 2)}\n`, "utf8");
}

export function hashPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

export async function findUserByEmail(email: string) {
  const users = await readUsersRaw();
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export async function createUser(input: {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}) {
  const users = await readUsersRaw();
  const now = new Date().toISOString();
  const user: StoredUser = {
    id: input.id,
    name: input.name,
    email: input.email,
    passwordHash: input.passwordHash,
    role: "member",
    createdAt: now,
    updatedAt: now
  };

  await writeUsersRaw([...users, user]);
  return user;
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;

  if (!token) {
    return null;
  }

  const session = verifySessionToken(token);

  if (!session) {
    return null;
  }

  const users = await readUsersRaw();
  const user = users.find((item) => item.id === session.userId);
  return user ? toAuthUser(user) : null;
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function setUserSession(userId: string) {
  const cookieStore = await cookies();

  cookieStore.set(sessionCookieName, createSessionToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionMaxAge
  });
}

export async function clearUserSession() {
  const cookieStore = await cookies();

  cookieStore.delete(sessionCookieName);
  cookieStore.delete("taskflow_user_id");
}
