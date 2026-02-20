import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { get } from "@/lib/http";

const mockGet = get as jest.Mock;

// ── CleanTable mock that exposes renderCell / renderMobileItem ────────────────
let capturedRenderCell: ((item: any, key: React.Key) => React.ReactNode) | null = null;
let capturedRenderMobileItem: ((item: any) => React.ReactNode) | null = null;
let capturedOnPageChange: ((p: number) => void) | null = null;
let capturedOnLimitChange: ((l: number) => void) | null = null;

jest.mock("@/components/tables/CleanTable", () => ({
  CleanTable: (props: any) => {
    capturedRenderCell = props.renderCell;
    capturedRenderMobileItem = props.renderMobileItem;
    capturedOnPageChange = props.onPageChange;
    capturedOnLimitChange = props.onLimitChange;
    return (
      <div data-testid="clean-table">
        <button data-testid="btn-page" onClick={() => props.onPageChange?.(2)}>Page</button>
        <button data-testid="btn-limit" onClick={() => props.onLimitChange?.(10)}>Limit</button>
        {props.emptyContent}
      </div>
    );
  },
}));

jest.mock("@/lib/endpoints", () => ({
  endpoints: {
    financial: {
      masterContractCdpPositions: jest.fn((id: string) => `/financial/master-contracts/${id}/cdp-positions`),
    },
  },
}));

const mockItem = {
  id: "pos1",
  cdpNumber: "CDP-001",
  positionNumber: "1",
  rubricCode: "R-001",
  fundingSourceName: "Recursos Propios",
  fundingSourceCode: "RP",
  projectCode: "P-001",
  cdpTotalValue: 5000000,
  positionValue: 1000000,
  needCode: "N-001",
  observations: "Obs test",
};

const mockResponse = {
  data: [mockItem],
  meta: { total: 1, page: 1, limit: 5, totalPages: 2 },
};

import { MasterContractCdpsModal } from "@/components/modals/financial/contracts/MasterContractCdpsModal";

describe("MasterContractCdpsModal", () => {
  const defaultProps = {
    isOpen: true,
    masterContractId: "mc1",
    masterContractNumber: "C-001",
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    capturedRenderCell = null;
    capturedRenderMobileItem = null;
    mockGet.mockResolvedValue(mockResponse);
  });

  // ── basic visibility ───────────────────────────────────────────────────────

  it("renders when open", () => {
    render(<MasterContractCdpsModal {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(<MasterContractCdpsModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows CDPs Asociados header", () => {
    render(<MasterContractCdpsModal {...defaultProps} />);
    expect(screen.getByText("CDPs Asociados")).toBeInTheDocument();
  });

  it("shows contract number in sub-heading", () => {
    render(<MasterContractCdpsModal {...defaultProps} />);
    expect(screen.getByText(/Contrato Marco: C-001/)).toBeInTheDocument();
  });

  it("does not show contract number sub-heading when null", () => {
    render(<MasterContractCdpsModal {...defaultProps} masterContractNumber={null} />);
    expect(screen.queryByText(/Contrato Marco:/)).not.toBeInTheDocument();
  });

  it("renders CleanTable", () => {
    render(<MasterContractCdpsModal {...defaultProps} />);
    expect(screen.getByTestId("clean-table")).toBeInTheDocument();
  });

  it("shows Cerrar button and calls onClose when pressed", () => {
    const onClose = jest.fn();
    render(<MasterContractCdpsModal {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByText("Cerrar"));
    expect(onClose).toHaveBeenCalled();
  });

  it("shows empty content text", async () => {
    mockGet.mockResolvedValueOnce({ data: [], meta: { total: 0, page: 1, limit: 5, totalPages: 0 } });
    render(<MasterContractCdpsModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("No hay CDPs asociados a este contrato")).toBeInTheDocument());
  });

  // ── fetching ───────────────────────────────────────────────────────────────

  it("fetches CDPs on mount when open and masterContractId provided", async () => {
    render(<MasterContractCdpsModal {...defaultProps} />);
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("mc1")));
  });

  it("does not fetch when masterContractId is null", async () => {
    render(<MasterContractCdpsModal {...defaultProps} masterContractId={null} />);
    await new Promise((r) => setTimeout(r, 30));
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("does not fetch when modal is closed", async () => {
    render(<MasterContractCdpsModal {...defaultProps} isOpen={false} />);
    await new Promise((r) => setTimeout(r, 30));
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("includes search param when a search value is set", async () => {
    render(<MasterContractCdpsModal {...defaultProps} />);
    await waitFor(() => expect(mockGet).toHaveBeenCalled());
    const searchInput = screen.getByPlaceholderText("Buscar CDPs...");
    fireEvent.change(searchInput, { target: { value: "query" } });
    await waitFor(() => {
      const calls = mockGet.mock.calls.map((c) => c[0]);
      expect(calls.some((u) => u.includes("search=query"))).toBe(true);
    });
  });

  it("handles fetch error gracefully", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockGet.mockRejectedValueOnce(new Error("fail"));
    render(<MasterContractCdpsModal {...defaultProps} />);
    await waitFor(() => expect(consoleSpy).toHaveBeenCalled());
    consoleSpy.mockRestore();
  });

  // ── pagination / limit ─────────────────────────────────────────────────────

  it("changes page via CleanTable", async () => {
    render(<MasterContractCdpsModal {...defaultProps} />);
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByTestId("btn-page"));
    await waitFor(() => {
      const calls = mockGet.mock.calls.map((c) => c[0]);
      expect(calls.some((u) => u.includes("page=2"))).toBe(true);
    });
  });

  it("changes limit and resets page to 1", async () => {
    render(<MasterContractCdpsModal {...defaultProps} />);
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByTestId("btn-limit"));
    await waitFor(() => {
      const calls = mockGet.mock.calls.map((c) => c[0]);
      expect(calls.some((u) => u.includes("limit=10") && u.includes("page=1"))).toBe(true);
    });
  });

  // ── renderCell ─────────────────────────────────────────────────────────────

  it("renderCell: cdpNumber renders number", async () => {
    render(<MasterContractCdpsModal {...defaultProps} />);
    await waitFor(() => expect(capturedRenderCell).not.toBeNull());
    const { container } = render(<>{capturedRenderCell!(mockItem, "cdpNumber")}</>);
    expect(container).toHaveTextContent("CDP-001");
  });

  it("renderCell: positionNumber renders number", async () => {
    render(<MasterContractCdpsModal {...defaultProps} />);
    await waitFor(() => expect(capturedRenderCell).not.toBeNull());
    const { container } = render(<>{capturedRenderCell!(mockItem, "positionNumber")}</>);
    expect(container).toHaveTextContent("1");
  });

  it("renderCell: rubricCode renders code", async () => {
    render(<MasterContractCdpsModal {...defaultProps} />);
    await waitFor(() => expect(capturedRenderCell).not.toBeNull());
    const { container } = render(<>{capturedRenderCell!(mockItem, "rubricCode")}</>);
    expect(container).toHaveTextContent("R-001");
  });

  it("renderCell: fundingSourceName renders name and code", async () => {
    render(<MasterContractCdpsModal {...defaultProps} />);
    await waitFor(() => expect(capturedRenderCell).not.toBeNull());
    const { container } = render(<>{capturedRenderCell!(mockItem, "fundingSourceName")}</>);
    expect(container).toHaveTextContent("Recursos Propios");
    expect(container).toHaveTextContent("RP");
  });

  it("renderCell: projectCode renders code", async () => {
    render(<MasterContractCdpsModal {...defaultProps} />);
    await waitFor(() => expect(capturedRenderCell).not.toBeNull());
    const { container } = render(<>{capturedRenderCell!(mockItem, "projectCode")}</>);
    expect(container).toHaveTextContent("P-001");
  });

  it("renderCell: cdpTotalValue formats currency", async () => {
    render(<MasterContractCdpsModal {...defaultProps} />);
    await waitFor(() => expect(capturedRenderCell).not.toBeNull());
    const { container } = render(<>{capturedRenderCell!(mockItem, "cdpTotalValue")}</>);
    expect(container).toHaveTextContent("$");
  });

  it("renderCell: positionValue formats currency", async () => {
    render(<MasterContractCdpsModal {...defaultProps} />);
    await waitFor(() => expect(capturedRenderCell).not.toBeNull());
    const { container } = render(<>{capturedRenderCell!(mockItem, "positionValue")}</>);
    expect(container).toHaveTextContent("$");
  });

  it("renderCell: default returns null", async () => {
    render(<MasterContractCdpsModal {...defaultProps} />);
    await waitFor(() => expect(capturedRenderCell).not.toBeNull());
    expect(capturedRenderCell!(mockItem, "unknown")).toBeNull();
  });

  // ── renderMobileItem ───────────────────────────────────────────────────────

  it("renderMobileItem: shows cdpNumber and positionNumber", async () => {
    render(<MasterContractCdpsModal {...defaultProps} />);
    await waitFor(() => expect(capturedRenderMobileItem).not.toBeNull());
    const { container } = render(<>{capturedRenderMobileItem!(mockItem)}</>);
    expect(container).toHaveTextContent("CDP-001");
    expect(container).toHaveTextContent("#1");
  });

  it("renderMobileItem: shows projectCode and rubricCode", async () => {
    render(<MasterContractCdpsModal {...defaultProps} />);
    await waitFor(() => expect(capturedRenderMobileItem).not.toBeNull());
    const { container } = render(<>{capturedRenderMobileItem!(mockItem)}</>);
    expect(container).toHaveTextContent("P-001");
    expect(container).toHaveTextContent("R-001");
  });

  it("renderMobileItem: shows fundingSourceName", async () => {
    render(<MasterContractCdpsModal {...defaultProps} />);
    await waitFor(() => expect(capturedRenderMobileItem).not.toBeNull());
    const { container } = render(<>{capturedRenderMobileItem!(mockItem)}</>);
    expect(container).toHaveTextContent("Recursos Propios");
  });

  it("renderMobileItem: shows formatted currency values", async () => {
    render(<MasterContractCdpsModal {...defaultProps} />);
    await waitFor(() => expect(capturedRenderMobileItem).not.toBeNull());
    const { container } = render(<>{capturedRenderMobileItem!(mockItem)}</>);
    expect(container).toHaveTextContent("$");
  });
});
