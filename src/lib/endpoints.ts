export const endpoints = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    verifyEmail: "/auth/verify-email",
    resendVerification: "/auth/resend-verification",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    me: "/auth/me",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
  },
  accessControl: {
    users: "/users",
    roles: {
      base: "/access-control/roles",
      all: "/access-control/roles/all",
    },
    modules: "/access-control/modules",
    actions: "/access-control/actions",
  },
  masters: {
    root: "/masters",
  },
  audit: "/audit",
}