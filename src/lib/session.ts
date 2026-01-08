// src/lib/session.ts
import {http} from "./http"
import {endpoints} from "./endpoints"
import type {SessionMeResponse} from "@/types/auth"

export async function getMe() {
  return http<SessionMeResponse>(endpoints.auth.me)
}