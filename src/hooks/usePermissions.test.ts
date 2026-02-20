jest.unmock("@/hooks/usePermissions");

import { renderHook } from "@testing-library/react";
import { usePermissions, ActionCode } from "./usePermissions";

// Mock useAuth
const mockMe: any = {
  permissions: {
    "/test/module": {
      actions: {
        CREATE: { allowed: true },
        READ: { allowed: true },
        UPDATE: { allowed: false },
        DELETE: { allowed: true },
        ASSIGN_ROLE: { allowed: false },
        ASSIGN_PERMISSION: { allowed: true },
        ASSIGN_ACTION: { allowed: false },
        BUDGET_MODIFICATION: { allowed: true },
      },
    },
  },
};

jest.mock("@/components/auth/useAuth", () => ({
  useAuth: () => ({ me: mockMe }),
}));

describe("usePermissions", () => {
  it("should return permissions for a known module", () => {
    const { result } = renderHook(() => usePermissions("/test/module"));
    expect(result.current.modulePermissions).toBeDefined();
    expect(result.current.modulePermissions?.actions.CREATE.allowed).toBe(true);
  });

  it("should return null for unknown module", () => {
    const { result } = renderHook(() => usePermissions("/unknown/module"));
    expect(result.current.modulePermissions).toBeNull();
  });

  it("should compute canCreate correctly", () => {
    const { result } = renderHook(() => usePermissions("/test/module"));
    expect(result.current.canCreate).toBe(true);
  });

  it("should compute canRead correctly", () => {
    const { result } = renderHook(() => usePermissions("/test/module"));
    expect(result.current.canRead).toBe(true);
  });

  it("should compute canUpdate correctly", () => {
    const { result } = renderHook(() => usePermissions("/test/module"));
    expect(result.current.canUpdate).toBe(false);
  });

  it("should compute canDelete correctly", () => {
    const { result } = renderHook(() => usePermissions("/test/module"));
    expect(result.current.canDelete).toBe(true);
  });

  it("should compute canAssignRole correctly", () => {
    const { result } = renderHook(() => usePermissions("/test/module"));
    expect(result.current.canAssignRole).toBe(false);
  });

  it("should compute canAssignPermission correctly", () => {
    const { result } = renderHook(() => usePermissions("/test/module"));
    expect(result.current.canAssignPermission).toBe(true);
  });

  it("should compute canAssignAction correctly", () => {
    const { result } = renderHook(() => usePermissions("/test/module"));
    expect(result.current.canAssignAction).toBe(false);
  });

  it("should compute canModifyBudget correctly", () => {
    const { result } = renderHook(() => usePermissions("/test/module"));
    expect(result.current.canModifyBudget).toBe(true);
  });

  it("hasPermission returns false for unknown module", () => {
    const { result } = renderHook(() => usePermissions("/unknown"));
    expect(result.current.hasPermission("CREATE")).toBe(false);
  });

  it("hasPermission returns false for unknown action", () => {
    const { result } = renderHook(() => usePermissions("/test/module"));
    expect(result.current.hasPermission("NONEXISTENT" as ActionCode)).toBe(false);
  });
});
