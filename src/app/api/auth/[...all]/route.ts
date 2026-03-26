import { getAuth } from "@/infrastructure/auth/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(getAuth());
