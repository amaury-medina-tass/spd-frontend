import { render, screen } from "@testing-library/react";

jest.mock("@/lib/audit-codes", () => ({
  getActionColor: jest.fn(() => "success"),
  getEntityTypeLabel: jest.fn((e: string) => e),
  getActionLabel: jest.fn((a: string) => a),
}));

import { AuditLogCard } from "./AuditLogCard";

const mockLog = {
  id: "1",
  action: "USER_CREATED",
  actionLabel: "Usuario Creado",
  entityType: "USER",
  entityId: "u1",
  entityName: "Test User",
  timestamp: new Date().toISOString(),
  success: true,
  changes: [],
  metadata: {},
};

describe("AuditLogCard", () => {
  it("renders entity name", () => {
    render(<AuditLogCard log={mockLog as any} />);
    expect(screen.getByText("Test User")).toBeInTheDocument();
  });

  it("shows changes count if changes exist", () => {
    render(
      <AuditLogCard
        log={{ ...mockLog, changes: [{ field: "a", fieldLabel: "A", oldValue: "1", newValue: "2" }] } as any}
      />
    );
    expect(screen.getByText(/1 cambio realizado/)).toBeInTheDocument();
  });

  it("shows metadata count if metadata exists", () => {
    render(
      <AuditLogCard log={{ ...mockLog, metadata: { key1: "val1", key2: "val2" } } as any} />
    );
    expect(screen.getByText(/2 propiedades adicionales/)).toBeInTheDocument();
  });

  it("renders without changes or metadata", () => {
    const { container } = render(<AuditLogCard log={mockLog as any} />);
    expect(container).toBeTruthy();
  });

  it("renders actionLabel from log fixture", () => {
    render(<AuditLogCard log={mockLog as any} />);
    expect(screen.getByText("Usuario Creado")).toBeInTheDocument();
  });
});
