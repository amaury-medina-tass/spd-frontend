import { render, screen } from "@testing-library/react";

jest.mock("@/lib/audit-codes", () => ({
  getActionLabel: jest.fn((a: string) => a),
  getActionColor: jest.fn(() => "success"),
  getEntityTypeLabel: jest.fn((e: string) => e),
}));

import { AuditActionBadge, AuditStatusBadge, AuditEntityBadge } from "@/components/audit/AuditLogBadge";

describe("AuditLogBadge", () => {
  describe("AuditActionBadge", () => {
    it("renders action label", () => {
      render(<AuditActionBadge action="USER_CREATED" actionLabel="Usuario Creado" />);
      expect(screen.getByText("Usuario Creado")).toBeInTheDocument();
    });

    it("falls back to getActionLabel when no label provided", () => {
      render(<AuditActionBadge action="USER_CREATED" />);
      expect(screen.getByText("USER_CREATED")).toBeInTheDocument();
    });
  });

  describe("AuditStatusBadge", () => {
    it("renders Exitoso for success", () => {
      render(<AuditStatusBadge success={true} />);
      expect(screen.getByText("Exitoso")).toBeInTheDocument();
    });

    it("renders Fallido for failure", () => {
      render(<AuditStatusBadge success={false} />);
      expect(screen.getByText("Fallido")).toBeInTheDocument();
    });
  });

  describe("AuditEntityBadge", () => {
    it("renders entity type label", () => {
      render(<AuditEntityBadge entityType="USER" />);
      expect(screen.getByText("USER")).toBeInTheDocument();
    });
  });
});
