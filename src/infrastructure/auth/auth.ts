import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { getDb } from "../database/client";
import * as schema from "../database/schema";

function createAuth() {
  return betterAuth({
    database: drizzleAdapter(getDb(), {
      provider: "pg",
      schema,
    }),
    emailAndPassword: {
      enabled: true,
    },
    plugins: [admin()],
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60,
      },
    },
  });
}

type AuthInstance = ReturnType<typeof createAuth>;

let authInstance: AuthInstance | null = null;

export function getAuth(): AuthInstance {
  if (!authInstance) {
    authInstance = createAuth();
  }
  return authInstance;
}

// Lazy proxy — avoids instantiation at import time (fixes build without DATABASE_URL)
export const auth = new Proxy({} as AuthInstance, {
  get(_target, prop) {
    return (getAuth() as Record<string | symbol, unknown>)[prop];
  },
});
