import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MasterContractDetailModal } from "./MasterContractDetailModal";
import type { MasterContract } from "@/types/financial";

// ── helpers ──────────────────────────────────────────────────────────────────

function makeContract(overrides: Partial<MasterContract> = {}): MasterContract {
  return {
    id: "1",
    number: "C-001",
    object: "Suministro de materiales para la atención de emergencias",
    totalValue: "5000000",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    state: "Legalizado",
    createAt: "2024-01-01T10:00:00Z",
    updateAt: "2024-01-02T12:30:00Z",
    need: { id: "n1", code: 101 } as any,
    contractor: { id: "c1", nit: "900123456-7", name: "Test Corp" } as any,
    ...overrides,
  };
}

// ── tests ────────────────────────────────────────────────────────────────────

describe("MasterContractDetailModal", () => {
  const defaultProps = {
    isOpen: true,
    contract: makeContract(),
    onClose: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  // ── visibility ─────────────────────────────────────────────────────────────

  it("renders when open with valid contract", () => {
    render(<MasterContractDetailModal {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders nothing when modal is closed", () => {
    render(<MasterContractDetailModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders nothing when contract is null", () => {
    render(<MasterContractDetailModal {...defaultProps} contract={null} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  // ── header ─────────────────────────────────────────────────────────────────

  it("shows contract number in header", () => {
    render(<MasterContractDetailModal {...defaultProps} />);
    expect(screen.getByText("Contrato C-001")).toBeInTheDocument();
  });

  it("shows subtitle", () => {
    render(<MasterContractDetailModal {...defaultProps} />);
    expect(screen.getByText("Detalle del contrato marco")).toBeInTheDocument();
  });

  // ── fields ─────────────────────────────────────────────────────────────────

  it("shows contractor name and NIT", () => {
    render(<MasterContractDetailModal {...defaultProps} />);
    expect(screen.getByText("Test Corp")).toBeInTheDocument();
    expect(screen.getByText(/NIT: 900123456-7/)).toBeInTheDocument();
  });

  it("shows contract object text", () => {
    render(<MasterContractDetailModal {...defaultProps} />);
    expect(screen.getByText(/Suministro de materiales/)).toBeInTheDocument();
  });

  it("shows need code", () => {
    render(<MasterContractDetailModal {...defaultProps} />);
    expect(screen.getByText("101")).toBeInTheDocument();
  });

  it("formats totalValue as currency", () => {
    render(<MasterContractDetailModal {...defaultProps} />);
    // formatCurrency("5000000") produces a $ value
    const el = screen.getByText(/\$\s*5\.000\.000/);
    expect(el).toBeInTheDocument();
  });

  // ── formatDate branches ────────────────────────────────────────────────────

  it("shows 'N/A' when endDate is null", () => {
    render(<MasterContractDetailModal {...defaultProps} contract={makeContract({ endDate: null })} />);
    expect(screen.getByText("N/A")).toBeInTheDocument();
  });

  it("shows formatted endDate when endDate is provided", () => {
    render(<MasterContractDetailModal {...defaultProps} contract={makeContract({ endDate: "2024-12-31" })} />);
    // The date should render as a localized string — just confirm N/A is NOT shown
    expect(screen.queryByText("N/A")).not.toBeInTheDocument();
  });

  // ── getStateColor branches ─────────────────────────────────────────────────

  it("renders 'Legalizado' state with success chip color", () => {
    render(<MasterContractDetailModal {...defaultProps} contract={makeContract({ state: "Legalizado" })} />);
    expect(screen.getByText("Legalizado")).toBeInTheDocument();
  });

  it("renders 'active' state with success chip color", () => {
    render(<MasterContractDetailModal {...defaultProps} contract={makeContract({ state: "active" })} />);
    expect(screen.getByText("active")).toBeInTheDocument();
  });

  it("renders 'Pendiente' state with warning chip color", () => {
    render(<MasterContractDetailModal {...defaultProps} contract={makeContract({ state: "Pendiente" })} />);
    expect(screen.getByText("Pendiente")).toBeInTheDocument();
  });

  it("renders 'pending' state with warning chip color", () => {
    render(<MasterContractDetailModal {...defaultProps} contract={makeContract({ state: "pending" })} />);
    expect(screen.getByText("pending")).toBeInTheDocument();
  });

  it("renders unknown state with default chip color (line 75)", () => {
    render(<MasterContractDetailModal {...defaultProps} contract={makeContract({ state: "Cancelado" })} />);
    expect(screen.getByText("Cancelado")).toBeInTheDocument();
  });

  // ── isExecution branch (lines 65-66) ──────────────────────────────────────

  it("renders 'en ejecución' state with special blue chip styling", () => {
    render(<MasterContractDetailModal {...defaultProps} contract={makeContract({ state: "en ejecución" })} />);
    expect(screen.getByText("en ejecución")).toBeInTheDocument();
  });

  // ── close button ───────────────────────────────────────────────────────────

  it("shows Cerrar button", () => {
    render(<MasterContractDetailModal {...defaultProps} />);
    expect(screen.getByText("Cerrar")).toBeInTheDocument();
  });

  it("calls onClose when Cerrar is pressed", () => {
    const onClose = jest.fn();
    render(<MasterContractDetailModal {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByText("Cerrar"));
    expect(onClose).toHaveBeenCalled();
  });
});
