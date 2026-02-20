import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NeedCdpPositionsModal } from "@/components/modals/financial/needs/NeedCdpPositionsModal";

const mockGet = jest.fn();
jest.mock("@/lib/http", () => ({ get: (...args: any[]) => mockGet(...args) }));
jest.mock("@/lib/endpoints", () => ({ endpoints: { financial: { needs: "/needs" } } }));

const emptyResponse = { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 }, totalValue: 0 };

describe("NeedCdpPositionsModal", () => {
  beforeEach(() => {
    mockGet.mockResolvedValue(emptyResponse);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders when open", () => {
    render(<NeedCdpPositionsModal isOpen={true} needId="n1" onClose={jest.fn()} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(<NeedCdpPositionsModal isOpen={false} needId="n1" onClose={jest.fn()} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows modal header", () => {
    render(<NeedCdpPositionsModal isOpen={true} needId="n1" onClose={jest.fn()} />);
    expect(screen.getByText("Posiciones CDP Asociadas")).toBeInTheDocument();
  });

  it("shows header subtitle", () => {
    render(<NeedCdpPositionsModal isOpen={true} needId="n1" onClose={jest.fn()} />);
    expect(screen.getByText(/Detalle de los CDPs/)).toBeInTheDocument();
  });

  it("shows Cerrar button", () => {
    render(<NeedCdpPositionsModal isOpen={true} needId="n1" onClose={jest.fn()} />);
    expect(screen.getByText("Cerrar")).toBeInTheDocument();
  });

  it("calls get with needId when opened", async () => {
    render(<NeedCdpPositionsModal isOpen={true} needId="n1" onClose={jest.fn()} />);
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("n1/cdp-positions")));
  });

  it("does not call get when needId is null", async () => {
    render(<NeedCdpPositionsModal isOpen={true} needId={null} onClose={jest.fn()} />);
    await waitFor(() => expect(mockGet).not.toHaveBeenCalled());
  });

  it("renders data items when get resolves with positions", async () => {
    const dataResponse = {
      data: [
        {
          cdpNumber: "CDP-001",
          projectCode: "PROJ-01",
          fundingSourceName: "Fuente A",
          fundingSourceCode: "FA-01",
          positionNumber: 1,
          positionValue: 500000,
          cdpTotalValue: 1000000,
          observations: "Test obs",
        },
      ],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      totalValue: 500000,
    };
    mockGet.mockResolvedValue(dataResponse);
    render(<NeedCdpPositionsModal isOpen={true} needId="n1" onClose={jest.fn()} />);
    await waitFor(() => expect(screen.getByText("CDP-001")).toBeInTheDocument());
    expect(screen.getByText("Fuente A")).toBeInTheDocument();
    expect(screen.getByText(/"Test obs"/)).toBeInTheDocument();
  });

  it("renders totalValue when data is loaded", async () => {
    mockGet.mockResolvedValue({ ...emptyResponse, totalValue: 2500000 });
    render(<NeedCdpPositionsModal isOpen={true} needId="n1" onClose={jest.fn()} />);
    await waitFor(() => expect(screen.getByText(/2\.500\.000/)).toBeInTheDocument());
  });

  it("shows empty state when no positions returned", async () => {
    render(<NeedCdpPositionsModal isOpen={true} needId="n1" onClose={jest.fn()} />);
    await waitFor(() => expect(screen.getByText("No se encontraron posiciones")).toBeInTheDocument());
  });

  it("updates search state when searchInput changes", async () => {
    render(<NeedCdpPositionsModal isOpen={true} needId="n1" onClose={jest.fn()} />);
    const searchInput = screen.getByPlaceholderText("Buscar por código, CDP...");
    fireEvent.change(searchInput, { target: { value: "CDP-123" } });
    // useDebounce is pass-through, so debouncedSearch === searchInput → setSearch called
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2));
  });

  it("calls onClose when Cerrar is clicked", () => {
    const onClose = jest.fn();
    render(<NeedCdpPositionsModal isOpen={true} needId="n1" onClose={onClose} />);
    fireEvent.click(screen.getByText("Cerrar"));
    expect(onClose).toHaveBeenCalled();
  });

  it("shows item observations placeholder when empty", async () => {
    const dataResponse = {
      data: [
        {
          cdpNumber: "CDP-002",
          projectCode: "P02",
          fundingSourceName: "Fuente B",
          fundingSourceCode: "FB",
          positionNumber: 2,
          positionValue: 100000,
          cdpTotalValue: 200000,
          observations: "",
        },
      ],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      totalValue: 100000,
    };
    mockGet.mockResolvedValue(dataResponse);
    render(<NeedCdpPositionsModal isOpen={true} needId="n1" onClose={jest.fn()} />);
    await waitFor(() => expect(screen.getByText(/"Sin observaciones"/)).toBeInTheDocument());
  });
});
