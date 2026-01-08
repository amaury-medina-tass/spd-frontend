// src/lib/session.ts
import { get } from "./http"
import { endpoints } from "./endpoints"
import type { SessionMeResponse } from "@/types/auth"

export async function getMe() {
  return get<SessionMeResponse>(endpoints.auth.me)
}