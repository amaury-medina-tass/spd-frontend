// src/lib/endpoints.ts
export const endpoints = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    me: "/auth/me",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
  },
  accessControl: {
    users: "/access-control/users",
    roles: "/access-control/roles",
    modules: "/access-control/modules",
  },
  masters: {
    root: "/masters",
  },
}