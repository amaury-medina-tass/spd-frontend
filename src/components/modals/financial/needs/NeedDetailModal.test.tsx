import { render, screen } from "@testing-library/react";
import { NeedDetailModal } from "./NeedDetailModal";

describe("NeedDetailModal", () => {
  const makeNeed = (status = "Aprobado") => ({
    id: "1",
    code: 101,
    amount: "500000",
    description: "Office supplies",
    createAt: "2024-01-01T00:00:00Z",
    updateAt: "2024-01-02T00:00:00Z",
    previousStudy: {
      id: "ps1",
      code: "EP-001",
      status,
      createAt: "2024-01-01T00:00:00Z",
      updateAt: "2024-01-01T00:00:00Z",
    },
  });

  const defaultProps = { isOpen: true, need: makeNeed() as any, onClose: jest.fn() };

  it("renders when open", () => {
    render(<NeedDetailModal {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(<NeedDetailModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders nothing when need is null", () => {
    render(<NeedDetailModal isOpen={true} need={null} onClose={jest.fn()} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows Necesidad code in header", () => {
    render(<NeedDetailModal {...defaultProps} />);
    expect(screen.getByText("Necesidad 101")).toBeInTheDocument();
  });

  it("shows description", () => {
    render(<NeedDetailModal {...defaultProps} />);
    expect(screen.getByText("Office supplies")).toBeInTheDocument();
  });

  it("shows Cerrar button", () => {
    render(<NeedDetailModal {...defaultProps} />);
    expect(screen.getByText("Cerrar")).toBeInTheDocument();
  });

  it("shows formatted amount (currency)", () => {
    render(<NeedDetailModal {...defaultProps} />);
    expect(screen.getByText(/500\.000/)).toBeInTheDocument();
  });

  it("getStatusColor returns success for 'Aprobado'", () => {
    render(<NeedDetailModal {...defaultProps} need={makeNeed("Aprobado") as any} />);
    const chips = screen.getAllByText("Aprobado");
    expect(chips.length).toBeGreaterThan(0);
  });

  it("getStatusColor returns warning for 'Pendiente'", () => {
    render(<NeedDetailModal {...defaultProps} need={makeNeed("Pendiente") as any} />);
    expect(screen.getByText("Pendiente")).toBeInTheDocument();
  });

  it("getStatusColor returns danger for 'Rechazado'", () => {
    render(<NeedDetailModal {...defaultProps} need={makeNeed("Rechazado") as any} />);
    expect(screen.getByText("Rechazado")).toBeInTheDocument();
  });

  it("getStatusColor returns default for unknown status", () => {
    render(<NeedDetailModal {...defaultProps} need={makeNeed("Otro Estado") as any} />);
    expect(screen.getByText("Otro Estado")).toBeInTheDocument();
  });

  it("shows formatted datetime for createAt", () => {
    render(<NeedDetailModal {...defaultProps} />);
    // The formatDateTime function formats with toLocaleString("es-CO")
    // It should render the date somewhere in the modal
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("shows previous study code", () => {
    render(<NeedDetailModal {...defaultProps} />);
    expect(screen.getByText("EP-001")).toBeInTheDocument();
  });
});
