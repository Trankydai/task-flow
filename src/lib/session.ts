import { createHmac, timingSafeEqual } from "node:crypto";

export const sessionCookieName = "taskflow_session";
export const sessionMaxAge = 60 * 60 * 24 * 7;
const exampleSessionSecret =
  "thay-bang-chuoi-ngau-nhien-dai-it-nhat-32-ky-tu";

type SessionPayload = {
  userId: string;
  expiresAt: number;
};

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET?.trim();

  if (secret) {
    if (secret.length < 32 || secret === exampleSessionSecret) {
      throw new Error(
        "SESSION_SECRET phải là chuỗi ngẫu nhiên dài ít nhất 32 ký tự."
      );
    }

    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Thiếu biến môi trường SESSION_SECRET.");
  }

  return "taskflow-local-development-secret";
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret())
    .update(value)
    .digest("base64url");
}

export function createSessionToken(userId: string) {
  const payload: SessionPayload = {
    userId,
    expiresAt: Date.now() + sessionMaxAge * 1000
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url"
  );

  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifySessionToken(token: string) {
  const [encodedPayload, receivedSignature, extraPart] = token.split(".");

  if (!encodedPayload || !receivedSignature || extraPart) {
    return null;
  }

  const expectedSignature = Buffer.from(sign(encodedPayload), "base64url");
  const actualSignature = Buffer.from(receivedSignature, "base64url");

  if (
    actualSignature.length !== expectedSignature.length ||
    !timingSafeEqual(actualSignature, expectedSignature)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    ) as Partial<SessionPayload>;

    if (
      typeof payload.userId !== "string" ||
      !payload.userId ||
      typeof payload.expiresAt !== "number" ||
      payload.expiresAt <= Date.now()
    ) {
      return null;
    }

    return {
      userId: payload.userId,
      expiresAt: payload.expiresAt
    } satisfies SessionPayload;
  } catch {
    return null;
  }
}
