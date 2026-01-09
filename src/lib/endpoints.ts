export const endpoints = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    me: "/auth/me",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
  },
  accessControl: {
    users: "/users",
    roles: {
      base: "/access-control/roles",
      all: "/access-control/roles/all",
      unassign: "/users/unassign-role",
    },
    modules: "/access-control/modules",
  },
  masters: {
    root: "/masters",
  },
}