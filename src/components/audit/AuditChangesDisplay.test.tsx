import { render, screen } from "@testing-library/react";
import { AuditChangesDisplay } from "./AuditChangesDisplay";

describe("AuditChangesDisplay", () => {
  it("shows empty message when no changes", () => {
    render(<AuditChangesDisplay changes={[]} />);
    expect(screen.getByText(/no hay cambios/i)).toBeInTheDocument();
  });

  it("renders a change row with field label, old and new values", () => {
    render(
      <AuditChangesDisplay
        changes={[
          { field: "name", fieldLabel: "Nombre", oldValue: "Old", newValue: "New" },
        ]}
      />
    );
    expect(screen.getByText("Nombre")).toBeInTheDocument();
    expect(screen.getByText("Old")).toBeInTheDocument();
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("renders multiple changes", () => {
    render(
      <AuditChangesDisplay
        changes={[
          { field: "a", fieldLabel: "A", oldValue: "1", newValue: "2" },
          { field: "b", fieldLabel: "B", oldValue: "3", newValue: "4" },
        ]}
      />
    );
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("formats boolean values", () => {
    render(
      <AuditChangesDisplay
        changes={[{ field: "active", fieldLabel: "Activo", oldValue: true, newValue: false }]}
      />
    );
    expect(screen.getByText("Sí")).toBeInTheDocument();
    expect(screen.getByText("No")).toBeInTheDocument();
  });

  it("formats null as dash", () => {
    render(
      <AuditChangesDisplay
        changes={[{ field: "x", fieldLabel: "X", oldValue: null, newValue: "val" }]}
      />
    );
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
