import { render, screen } from "@testing-library/react";

jest.mock("@/lib/audit-codes", () => ({
  getMetadataLabel: jest.fn((k: string) => k),
}));

import { AuditMetadataDisplay } from "@/components/audit/AuditMetadataDisplay";

describe("AuditMetadataDisplay", () => {
  it("shows empty message when no metadata", () => {
    render(<AuditMetadataDisplay metadata={{}} />);
    expect(screen.getByText(/no hay metadatos/i)).toBeInTheDocument();
  });

  it("renders permission changes with addedIds", () => {
    render(
      <AuditMetadataDisplay
        metadata={{
          added: 2,
          removed: 0,
          total: 5,
          addedIds: ["perm1", "perm2"],
          removedIds: [],
        }}
      />
    );
    expect(screen.getByText(/permisos agregados/i)).toBeInTheDocument();
    expect(screen.getByText("perm1")).toBeInTheDocument();
    expect(screen.getByText("perm2")).toBeInTheDocument();
  });

  it("renders removedIds", () => {
    render(
      <AuditMetadataDisplay
        metadata={{
          added: 0,
          removed: 1,
          total: 3,
          addedIds: [],
          removedIds: ["perm3"],
        }}
      />
    );
    expect(screen.getByText(/permisos removidos/i)).toBeInTheDocument();
    expect(screen.getByText("perm3")).toBeInTheDocument();
  });

  it("renders other metadata in accordion", () => {
    render(
      <AuditMetadataDisplay metadata={{ email: "test@test.com" }} />
    );
    expect(screen.getByText("email")).toBeInTheDocument();
    expect(screen.getByText("test@test.com")).toBeInTheDocument();
  });
});
