// Set DEV_BYPASS_AUTH=true in .env.local to skip auth during development.
// WARNING: Remove this before going to production.

const DEV_USER_ID = "dev-user-001";

export const DEV_MODE = process.env.DEV_BYPASS_AUTH === "true";

export const DEV_SESSION = DEV_MODE
  ? {
      session: {
        id: "dev-session-001",
        userId: DEV_USER_ID,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      user: {
        id: DEV_USER_ID,
        name: "Dev User",
        email: "dev@slideforge.local",
        role: "admin",
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }
  : null;
