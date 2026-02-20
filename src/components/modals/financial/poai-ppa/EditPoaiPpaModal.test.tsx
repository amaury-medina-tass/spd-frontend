import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EditPoaiPpaModal } from "./EditPoaiPpaModal";

describe("EditPoaiPpaModal", () => {
  const record = {
    id: "1",
    projectCode: "P001",
    projectName: "Test Project",
    year: 2024,
    projectedPoai: "1000000",
    assignedPoai: "800000",
  };

  const defaultProps = {
    isOpen: true,
    record: record as any,
    isLoading: false,
    onClose: jest.fn(),
    onSave: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    defaultProps.onClose = jest.fn();
    defaultProps.onSave = jest.fn().mockResolvedValue(undefined);
  });

  it("renders when open", () => {
    render(<EditPoaiPpaModal {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(<EditPoaiPpaModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows modal header", () => {
    render(<EditPoaiPpaModal {...defaultProps} />);
    expect(screen.getByText("Editar Registro POAI PPA")).toBeInTheDocument();
  });

  it("shows Cancelar button", () => {
    render(<EditPoaiPpaModal {...defaultProps} />);
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
  });

  it("shows Guardar button", () => {
    render(<EditPoaiPpaModal {...defaultProps} />);
    expect(screen.getByText("Guardar")).toBeInTheDocument();
  });

  it("populates inputs with record values on mount (covers useEffect lines 40-42)", () => {
    render(<EditPoaiPpaModal {...defaultProps} />);
    expect(screen.getByDisplayValue("1000000")).toBeInTheDocument();
    expect(screen.getByDisplayValue("800000")).toBeInTheDocument();
  });

  it("shows project code when record has no project name", () => {
    render(<EditPoaiPpaModal {...defaultProps} />);
    expect(screen.getByText("P001")).toBeInTheDocument();
  });

  it("shows year", () => {
    render(<EditPoaiPpaModal {...defaultProps} />);
    expect(screen.getByText("2024")).toBeInTheDocument();
  });

  it("calls onSave with parsed floats when Guardar is clicked (covers lines 49-51)", async () => {
    render(<EditPoaiPpaModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Guardar"));
    await waitFor(() =>
      expect(defaultProps.onSave).toHaveBeenCalledWith({
        projectedPoai: 1000000,
        assignedPoai: 800000,
      })
    );
  });

  it("does NOT call onSave when projectedPoai is empty (guard check)", async () => {
    render(<EditPoaiPpaModal {...defaultProps} record={null} />);
    // With no record, state remains "", guard returns early
    fireEvent.click(screen.getByText("Guardar"));
    await waitFor(() => expect(defaultProps.onSave).not.toHaveBeenCalled());
  });

  it("calls onClose when Cancelar is clicked", () => {
    render(<EditPoaiPpaModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Cancelar"));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("updates input values when changed", () => {
    render(<EditPoaiPpaModal {...defaultProps} />);
    const inputs = screen.getAllByRole("spinbutton");
    fireEvent.change(inputs[0], { target: { value: "2000000" } });
    expect(screen.getByDisplayValue("2000000")).toBeInTheDocument();
  });

  it("populates from updated record", async () => {
    const { rerender } = render(<EditPoaiPpaModal {...defaultProps} record={null} />);
    rerender(<EditPoaiPpaModal {...defaultProps} record={{ ...record, projectedPoai: "5000000", assignedPoai: "3000000" } as any} />);
    await waitFor(() => {
      expect(screen.getByDisplayValue("5000000")).toBeInTheDocument();
      expect(screen.getByDisplayValue("3000000")).toBeInTheDocument();
    });
  });
});
