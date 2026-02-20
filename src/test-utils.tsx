import React from "react";
import { render, RenderOptions } from "@testing-library/react";
import { AuthContext } from "@/components/auth/AuthProvider";

// ---------------------------------------------------------------------------
// Mock values
// ---------------------------------------------------------------------------

const allPerms: Record<string, any> = {
  "access-control.users": { actions: { READ: { allowed: true }, CREATE: { allowed: true }, UPDATE: { allowed: true }, DELETE: { allowed: true }, ASSIGN_ROLE: { allowed: true } } },
  "access-control.roles": { actions: { READ: { allowed: true }, CREATE: { allowed: true }, UPDATE: { allowed: true }, DELETE: { allowed: true }, ASSIGN_PERMISSION: { allowed: true } } },
  "access-control.modules": { actions: { READ: { allowed: true }, CREATE: { allowed: true }, UPDATE: { allowed: true }, DELETE: { allowed: true } } },
  "access-control.actions": { actions: { READ: { allowed: true }, CREATE: { allowed: true }, UPDATE: { allowed: true }, DELETE: { allowed: true } } },
  "financial.needs": { actions: { READ: { allowed: true }, CREATE: { allowed: true }, UPDATE: { allowed: true } } },
  "financial.projects": { actions: { READ: { allowed: true } } },
  "financial.cdps": { actions: { READ: { allowed: true } } },
  "financial.contracts": { actions: { READ: { allowed: true } } },
  "financial.previous-studies": { actions: { READ: { allowed: true } } },
  "financial.poai-ppa": { actions: { READ: { allowed: true }, CREATE: { allowed: true }, UPDATE: { allowed: true } } },
  "financial.dashboard": { actions: { READ: { allowed: true } } },
  "masters.indicators": { actions: { READ: { allowed: true }, CREATE: { allowed: true }, UPDATE: { allowed: true } } },
  "masters.variables": { actions: { READ: { allowed: true }, CREATE: { allowed: true }, UPDATE: { allowed: true } } },
  "masters.activities": { actions: { READ: { allowed: true }, CREATE: { allowed: true }, UPDATE: { allowed: true } } },
  "sub.indicators": { actions: { READ: { allowed: true } } },
  "sub.variables": { actions: { READ: { allowed: true } } },
  audit: { actions: { READ: { allowed: true } } },
};

export const mockAuthValue = {
  me: {
    id: "u1",
    first_name: "Test",
    last_name: "User",
    email: "test@example.com",
    document_number: "123",
    email_verified: true,
    is_active: true,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
    permissions: allPerms,
    roles: [{ id: "r1", name: "Admin" }],
  } as any,
  loading: false,
  refreshMe: jest.fn(),
  clear: jest.fn(),
};

export const mockSidebarValue = {
  isOpen: true,
  isMobile: false,
  toggleSidebar: jest.fn(),
  closeSidebar: jest.fn(),
  openSidebar: jest.fn(),
};

export const mockNotificationValue = {
  notifications: [] as any[],
  unreadCount: 0,
  markAsRead: jest.fn(),
  markAllAsRead: jest.fn(),
  loading: false,
};

// ---------------------------------------------------------------------------
// renderWithProviders — wraps the component in AuthContext and mocks
// useSidebar / useNotifications via jest.mock (they are not exported contexts)
// ---------------------------------------------------------------------------

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper"> & {
    authValue?: typeof mockAuthValue;
    sidebarValue?: typeof mockSidebarValue;
    notificationValue?: typeof mockNotificationValue;
  }
) {
  const { authValue = mockAuthValue, sidebarValue, notificationValue, ...renderOptions } = options ?? {};

  // Apply sidebar mock values if provided
  if (sidebarValue) {
    const sidebar = require("@/context/SidebarContext");
    if (sidebar.useSidebar?.mockReturnValue) {
      sidebar.useSidebar.mockReturnValue(sidebarValue);
    }
  }

  // Apply notification mock values if provided
  if (notificationValue) {
    const notif = require("@/context/NotificationContext");
    if (notif.useNotifications?.mockReturnValue) {
      notif.useNotifications.mockReturnValue(notificationValue);
    }
  }

  return render(ui, {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
    ),
    ...renderOptions,
  });
}

/** Flush async microtasks inside act() */
export const flushAsync = () =>
  require("@testing-library/react").act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
