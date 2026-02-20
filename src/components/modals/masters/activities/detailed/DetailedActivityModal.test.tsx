import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DetailedActivityModal } from "./DetailedActivityModal";

describe("DetailedActivityModal", () => {
  const activity = {
    id: "a1",
    name: "Test Activity",
    code: "ACT-001",
    cpc: "CPC-01",
    observations: "Some obs",
    budgetCeiling: "1000000",
    balance: "500000",
    activityDate: "2024-06-15",
    createAt: "2024-01-01T00:00:00Z",
    updateAt: "2024-01-02T00:00:00Z",
    project: { code: "PROJ-01", name: "Project A" },
    rubric: { code: "RUB-01", accountName: "Rubric A" },
  };
  const defaultProps = {
    isOpen: true,
    activity: activity as any,
    mode: "view" as const,
    onClose: jest.fn(),
    onSave: jest.fn(),
  };

  beforeEach(() => {
    defaultProps.onClose = jest.fn();
    defaultProps.onSave = jest.fn();
  });

  it("renders when open in view mode", () => {
    render(<DetailedActivityModal {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(<DetailedActivityModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders nothing when activity is null", () => {
    render(<DetailedActivityModal {...defaultProps} activity={null} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows 'Detalle de la actividad' subtitle in view mode", () => {
    render(<DetailedActivityModal {...defaultProps} />);
    expect(screen.getByText("Detalle de la actividad")).toBeInTheDocument();
  });

  it("shows activity name", () => {
    render(<DetailedActivityModal {...defaultProps} />);
    expect(screen.getByText("Test Activity")).toBeInTheDocument();
  });

  it("shows Cerrar button in view mode", () => {
    render(<DetailedActivityModal {...defaultProps} />);
    expect(screen.getByText("Cerrar")).toBeInTheDocument();
  });

  it("shows 'Modificar información' subtitle in edit mode (covers isViewMode=false branch)", () => {
    render(<DetailedActivityModal {...defaultProps} mode="edit" />);
    expect(screen.getByText(/Modificar información de la actividad/)).toBeInTheDocument();
  });

  it("shows Guardar button in edit mode", () => {
    render(<DetailedActivityModal {...defaultProps} mode="edit" />);
    expect(screen.getByText("Guardar")).toBeInTheDocument();
  });

  it("shows Cancelar button in edit mode", () => {
    render(<DetailedActivityModal {...defaultProps} mode="edit" />);
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
  });

  it("calls onSave with name and observations when Guardar clicked (covers lines 76-77)", async () => {
    render(<DetailedActivityModal {...defaultProps} mode="edit" />);
    fireEvent.click(screen.getByText("Guardar"));
    await waitFor(() =>
      expect(defaultProps.onSave).toHaveBeenCalledWith({
        name: "Test Activity",
        observations: "Some obs",
      })
    );
  });

  it("does not call onSave if onSave is undefined in view mode", () => {
    const props = { ...defaultProps, mode: "view" as const, onSave: undefined };
    render(<DetailedActivityModal {...props} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    // no error thrown
  });

  it("shows activity cpc in view mode", () => {
    render(<DetailedActivityModal {...defaultProps} />);
    expect(screen.getByText("CPC-01")).toBeInTheDocument();
  });

  it("shows budget ceiling formatted as currency", () => {
    render(<DetailedActivityModal {...defaultProps} />);
    expect(screen.getByText(/1\.000\.000/)).toBeInTheDocument();
  });

  it("shows project code and name", () => {
    render(<DetailedActivityModal {...defaultProps} />);
    expect(screen.getByText(/PROJ-01/)).toBeInTheDocument();
    expect(screen.getByText(/Project A/)).toBeInTheDocument();
  });

  it("shows rubric code and name", () => {
    render(<DetailedActivityModal {...defaultProps} />);
    expect(screen.getByText(/RUB-01/)).toBeInTheDocument();
  });

  it("allows updating name input in edit mode", () => {
    render(<DetailedActivityModal {...defaultProps} mode="edit" />);
    const nameInput = screen.getByRole("textbox", { name: /Nombre/i });
    fireEvent.change(nameInput, { target: { value: "Updated Activity" } });
    expect(screen.getByDisplayValue("Updated Activity")).toBeInTheDocument();
  });

  it("calls onSave with updated name after editing", async () => {
    render(<DetailedActivityModal {...defaultProps} mode="edit" />);
    const nameInput = screen.getByRole("textbox", { name: /Nombre/i });
    fireEvent.change(nameInput, { target: { value: "New Name" } });
    fireEvent.click(screen.getByText("Guardar"));
    await waitFor(() =>
      expect(defaultProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({ name: "New Name" })
      )
    );
  });
});
