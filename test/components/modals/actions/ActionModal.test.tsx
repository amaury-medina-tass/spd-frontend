import { render, screen } from "@testing-library/react";
import { ActionModal } from "@/components/modals/actions/ActionModal";

describe("ActionModal", () => {
  const baseProps = {
    isOpen: true,
    title: "Crear Acción",
    initial: null,
    onClose: jest.fn(),
    onSave: jest.fn(),
  };

  it("renders title when open", () => {
    render(<ActionModal {...baseProps} />);
    expect(screen.getByText("Crear Acción")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(<ActionModal {...baseProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders Código Input label", () => {
    render(<ActionModal {...baseProps} />);
    expect(screen.getByText("Código")).toBeInTheDocument();
  });

  it("renders Cancelar button", () => {
    render(<ActionModal {...baseProps} />);
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
  });

  it("renders Guardar button", () => {
    render(<ActionModal {...baseProps} />);
    expect(screen.getByText("Guardar")).toBeInTheDocument();
  });
});
