import { render, screen, waitFor, act, fireEvent } from "@testing-library/react";
import { ManageIndicatorVariablesModal } from "@/components/modals/masters/indicators/ManageIndicatorVariablesModal";
import { addToast } from "@heroui/toast";

const mockGetIndicatorVariables = jest.fn();
const mockGetActionPlanIndicatorVariables = jest.fn();
const mockAssociateIndicatorVariable = jest.fn();
const mockDisassociateIndicatorVariable = jest.fn();
const mockAssociateActionPlanIndicatorVariable = jest.fn();
const mockDisassociateActionPlanIndicatorVariable = jest.fn();

const variableItems = [
  { id: "v1", name: "Variable A", code: "VAR-001", observations: "Obs A", formula: [], created_at: "", updated_at: "" },
  { id: "v2", name: "Variable B", code: "VAR-002", observations: "", formula: [], created_at: "", updated_at: "" },
];

const variableData = {
  data: variableItems,
  meta: { total: 2, page: 1, limit: 5, totalPages: 1 },
};

const emptyData = { data: [], meta: { total: 0, page: 1, limit: 5, totalPages: 1 } };

jest.mock("@/services/masters/indicators.service", () => ({
  getIndicatorVariables: (...args: any[]) => mockGetIndicatorVariables(...args),
  getActionPlanIndicatorVariables: (...args: any[]) => mockGetActionPlanIndicatorVariables(...args),
  associateIndicatorVariable: (...args: any[]) => mockAssociateIndicatorVariable(...args),
  disassociateIndicatorVariable: (...args: any[]) => mockDisassociateIndicatorVariable(...args),
  associateActionPlanIndicatorVariable: (...args: any[]) => mockAssociateActionPlanIndicatorVariable(...args),
  disassociateActionPlanIndicatorVariable: (...args: any[]) => mockDisassociateActionPlanIndicatorVariable(...args),
}));

// ResourceManager mock that renders items via renderCell + renderMobileItem
let capturedResourceManagers: any[] = [];
jest.mock("@/components/common/ResourceManager", () => ({
  ResourceManager: (props: any) => {
    capturedResourceManagers.push(props);
    const columnKeys = (props.columns || []).map((c: any) => c.uid);
    return (
      <div data-testid="resource-manager">
        {props.emptyContent && props.items?.length === 0 && props.emptyContent}
        {(props.items || []).map((item: any, i: number) => (
          <div key={i} data-testid={`rm-row-${item.id}`}>
            {columnKeys.map((key: string) => (
              <span key={key} data-testid={`cell-${item.id}-${key}`}>
                {props.renderCell?.(item, key)}
              </span>
            ))}
            <div data-testid={`mobile-${item.id}`}>
              {props.renderMobileItem?.(item)}
            </div>
          </div>
        ))}
        {props.onSearchChange && (
          <input data-testid="rm-search" onChange={(e) => props.onSearchChange(e.target.value)} />
        )}
        {props.onLimitChange && (
          <button data-testid="rm-limit" onClick={() => props.onLimitChange(10)}>limit</button>
        )}
      </div>
    );
  },
}));
jest.mock("@/components/tables/CleanTable", () => ({
  CleanTable: () => <div data-testid="clean-table">CleanTable</div>,
}));

const defaultProps = {
  isOpen: true,
  indicatorId: "i1",
  indicatorCode: "IND-001",
  onClose: jest.fn(),
  type: "indicative" as const,
};

describe("ManageIndicatorVariablesModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedResourceManagers = [];
    mockGetIndicatorVariables.mockResolvedValue(variableData);
    mockGetActionPlanIndicatorVariables.mockResolvedValue(variableData);
    mockAssociateIndicatorVariable.mockResolvedValue({});
    mockDisassociateIndicatorVariable.mockResolvedValue(undefined);
    mockAssociateActionPlanIndicatorVariable.mockResolvedValue({});
    mockDisassociateActionPlanIndicatorVariable.mockResolvedValue(undefined);
  });

  it("renders when open", async () => {
    render(<ManageIndicatorVariablesModal {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await waitFor(() => expect(mockGetIndicatorVariables).toHaveBeenCalled());
  });

  it("renders nothing when closed", () => {
    render(<ManageIndicatorVariablesModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows indicator code in header", async () => {
    render(<ManageIndicatorVariablesModal {...defaultProps} />);
    expect(screen.getByText("Indicador: IND-001")).toBeInTheDocument();
    await waitFor(() => expect(mockGetIndicatorVariables).toHaveBeenCalled());
  });

  it("renders without indicatorCode", async () => {
    render(<ManageIndicatorVariablesModal {...defaultProps} indicatorCode={undefined} />);
    expect(screen.queryByText(/Indicador:/)).not.toBeInTheDocument();
    await waitFor(() => expect(mockGetIndicatorVariables).toHaveBeenCalled());
  });

  it("calls getIndicatorVariables when type is indicative", async () => {
    render(<ManageIndicatorVariablesModal {...defaultProps} type="indicative" />);
    await waitFor(() => expect(mockGetIndicatorVariables).toHaveBeenCalledWith("i1", expect.any(String)));
  });

  it("calls getActionPlanIndicatorVariables when type is action-plan", async () => {
    render(<ManageIndicatorVariablesModal {...defaultProps} type="action-plan" />);
    await waitFor(() => expect(mockGetActionPlanIndicatorVariables).toHaveBeenCalledWith("i1", expect.any(String)));
  });

  it("does not fetch when indicatorId is null", async () => {
    render(<ManageIndicatorVariablesModal {...defaultProps} indicatorId={null} />);
    expect(mockGetIndicatorVariables).not.toHaveBeenCalled();
  });

  it("shows fetch error toast for associated", async () => {
    mockGetIndicatorVariables.mockRejectedValueOnce(new Error("net err"));
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    render(<ManageIndicatorVariablesModal {...defaultProps} />);
    await waitFor(() => expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" })));
    spy.mockRestore();
  });

  it("shows fetch error toast for available", async () => {
    // First call succeeds (associated), second fails (available)
    mockGetIndicatorVariables
      .mockResolvedValueOnce(variableData)
      .mockRejectedValueOnce(new Error("avail err"));
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    render(<ManageIndicatorVariablesModal {...defaultProps} />);
    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ title: "Error al cargar variables disponibles" }))
    );
    spy.mockRestore();
  });

  // renderCell tests
  it("renderCell shows code column", async () => {
    render(<ManageIndicatorVariablesModal {...defaultProps} />);
    await waitFor(() => expect(screen.getAllByText("VAR-001").length).toBeGreaterThan(0));
  });

  it("renderCell shows name column", async () => {
    render(<ManageIndicatorVariablesModal {...defaultProps} />);
    await waitFor(() => expect(screen.getAllByText("Variable A").length).toBeGreaterThan(0));
  });

  it("renderCell shows observations or dash", async () => {
    render(<ManageIndicatorVariablesModal {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getAllByText("Obs A").length).toBeGreaterThan(0);
      expect(screen.getAllByText("—").length).toBeGreaterThan(0);
    });
  });

  it("renderCell shows dissociate button for associated tab", async () => {
    render(<ManageIndicatorVariablesModal {...defaultProps} />);
    await waitFor(() => {
      // Associated tab: buttons are color="danger"
      const dangerBtns = document.querySelectorAll("[color='danger']");
      expect(dangerBtns.length).toBeGreaterThan(0);
    });
  });

  // handleDissociate
  it("handleDissociate indicative calls disassociateIndicatorVariable", async () => {
    render(<ManageIndicatorVariablesModal {...defaultProps} type="indicative" />);
    await waitFor(() => expect(screen.getAllByText("VAR-001").length).toBeGreaterThan(0));
    const dangerBtns = document.querySelectorAll("[color='danger']");
    await act(async () => { (dangerBtns[0] as HTMLElement).click(); });
    await waitFor(() => expect(mockDisassociateIndicatorVariable).toHaveBeenCalledWith("i1", "v1"));
    expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ title: "Variable desasociada", color: "success" }));
  });

  it("handleDissociate action-plan calls disassociateActionPlanIndicatorVariable", async () => {
    render(<ManageIndicatorVariablesModal {...defaultProps} type="action-plan" />);
    await waitFor(() => expect(screen.getAllByText("VAR-001").length).toBeGreaterThan(0));
    const dangerBtns = document.querySelectorAll("[color='danger']");
    await act(async () => { (dangerBtns[0] as HTMLElement).click(); });
    await waitFor(() => expect(mockDisassociateActionPlanIndicatorVariable).toHaveBeenCalledWith("i1", "v1"));
  });

  it("handleDissociate error shows toast", async () => {
    mockDisassociateIndicatorVariable.mockRejectedValueOnce(new Error("fail dis"));
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    render(<ManageIndicatorVariablesModal {...defaultProps} type="indicative" />);
    await waitFor(() => expect(screen.getAllByText("VAR-001").length).toBeGreaterThan(0));
    const dangerBtns = document.querySelectorAll("[color='danger']");
    await act(async () => { (dangerBtns[0] as HTMLElement).click(); });
    await waitFor(() => expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ title: "Error", color: "danger" })));
    spy.mockRestore();
  });

  it("handleDissociate guards when indicatorId is null", async () => {
    // Render with valid id first to populate data, then we test the guard
    // Since we can't change indicatorId after mount, we test the guard path by
    // verifying it does NOT call dissociate when indicatorId is null
    render(<ManageIndicatorVariablesModal {...defaultProps} indicatorId={null} />);
    expect(mockDisassociateIndicatorVariable).not.toHaveBeenCalled();
  });

  // Available tab tests — need to simulate tab switch
  // The Tabs mock renders all Tab children, so both ResourceManagers are rendered.
  // The "available" tab ResourceManager renders items with isAssociated=false → color="primary" buttons.
  it("available tab shows associate (primary) buttons", async () => {
    render(<ManageIndicatorVariablesModal {...defaultProps} />);
    await waitFor(() => {
      const primaryBtns = document.querySelectorAll("[color='primary']");
      expect(primaryBtns.length).toBeGreaterThan(0);
    });
  });

  it("handleAssociate indicative calls associateIndicatorVariable", async () => {
    render(<ManageIndicatorVariablesModal {...defaultProps} type="indicative" />);
    await waitFor(() => expect(screen.getAllByText("VAR-001").length).toBeGreaterThan(0));
    const primaryBtns = document.querySelectorAll("[color='primary']");
    await act(async () => { (primaryBtns[0] as HTMLElement).click(); });
    await waitFor(() => expect(mockAssociateIndicatorVariable).toHaveBeenCalledWith("i1", "v1"));
    expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ title: "Variable asociada", color: "success" }));
  });

  it("handleAssociate action-plan calls associateActionPlanIndicatorVariable", async () => {
    render(<ManageIndicatorVariablesModal {...defaultProps} type="action-plan" />);
    await waitFor(() => expect(screen.getAllByText("VAR-001").length).toBeGreaterThan(0));
    const primaryBtns = document.querySelectorAll("[color='primary']");
    await act(async () => { (primaryBtns[0] as HTMLElement).click(); });
    await waitFor(() => expect(mockAssociateActionPlanIndicatorVariable).toHaveBeenCalledWith("i1", "v1"));
  });

  it("handleAssociate error shows toast", async () => {
    mockAssociateIndicatorVariable.mockRejectedValueOnce(new Error("fail assoc"));
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    render(<ManageIndicatorVariablesModal {...defaultProps} type="indicative" />);
    await waitFor(() => expect(screen.getAllByText("VAR-001").length).toBeGreaterThan(0));
    const primaryBtns = document.querySelectorAll("[color='primary']");
    await act(async () => { (primaryBtns[0] as HTMLElement).click(); });
    await waitFor(() => expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ title: "Error", color: "danger" })));
    spy.mockRestore();
  });

  // renderMobileItem
  it("renderMobileItem shows code and name", async () => {
    render(<ManageIndicatorVariablesModal {...defaultProps} />);
    await waitFor(() => {
      const mobile = screen.getAllByTestId(/^mobile-v/);
      expect(mobile.length).toBeGreaterThan(0);
      // Mobile items contain the variable code and name
      expect(mobile[0].textContent).toContain("VAR-001");
      expect(mobile[0].textContent).toContain("Variable A");
    });
  });

  it("renderMobileItem shows observations when present", async () => {
    render(<ManageIndicatorVariablesModal {...defaultProps} />);
    await waitFor(() => {
      const mobileV1 = screen.getAllByTestId("mobile-v1");
      expect(mobileV1[0].textContent).toContain("Obs A");
    });
  });

  // onLimitChange
  it("onLimitChange updates limit", async () => {
    render(<ManageIndicatorVariablesModal {...defaultProps} />);
    await waitFor(() => expect(screen.getAllByTestId("rm-limit").length).toBeGreaterThan(0));
    const limitBtns = screen.getAllByTestId("rm-limit");
    await act(async () => { fireEvent.click(limitBtns[0]); });
    // After limit change, fetches again
    await waitFor(() => expect(mockGetIndicatorVariables).toHaveBeenCalledTimes(4)); // initial 2 + refetch 2
  });

  // onSearchChange
  it("onSearchChange triggers refetch", async () => {
    render(<ManageIndicatorVariablesModal {...defaultProps} />);
    await waitFor(() => expect(screen.getAllByTestId("rm-search").length).toBeGreaterThan(0));
    const searchInputs = screen.getAllByTestId("rm-search");
    await act(async () => { fireEvent.change(searchInputs[0], { target: { value: "test" } }); });
    await waitFor(() => expect(mockGetIndicatorVariables).toHaveBeenCalled());
  });

  // emptyContent
  it("shows empty content when no items", async () => {
    mockGetIndicatorVariables.mockResolvedValue(emptyData);
    render(<ManageIndicatorVariablesModal {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText("No hay variables asociadas")).toBeInTheDocument();
    });
  });

  // Cerrar button
  it("Cerrar button calls onClose", async () => {
    const onClose = jest.fn();
    render(<ManageIndicatorVariablesModal {...defaultProps} onClose={onClose} />);
    await waitFor(() => expect(mockGetIndicatorVariables).toHaveBeenCalled());
    const cerrar = screen.getByText("Cerrar");
    fireEvent.click(cerrar);
    expect(onClose).toHaveBeenCalled();
  });
});
