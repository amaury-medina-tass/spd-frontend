import { render, screen } from "@testing-library/react";
import { FormulaGuideModal } from "./FormulaGuideModal";

describe("FormulaGuideModal", () => {
  const defaultProps = { isOpen: true, onClose: jest.fn() };

  it("renders when open", () => {
    render(<FormulaGuideModal {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(<FormulaGuideModal isOpen={false} onClose={jest.fn()} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows modal title", () => {
    render(<FormulaGuideModal {...defaultProps} />);
    expect(screen.getByText("Guía de Fórmulas e Indicadores")).toBeInTheDocument();
  });

  it("shows subtitle text", () => {
    render(<FormulaGuideModal {...defaultProps} />);
    expect(screen.getByText(/Aprenda a construir fórmulas/)).toBeInTheDocument();
  });

  it("shows workflow section header", () => {
    render(<FormulaGuideModal {...defaultProps} />);
    expect(screen.getByText(/Flujo de Trabajo/)).toBeInTheDocument();
  });

  it("shows Entendido button", () => {
    render(<FormulaGuideModal {...defaultProps} />);
    expect(screen.getByText("Entendido")).toBeInTheDocument();
  });
});
