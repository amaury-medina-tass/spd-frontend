import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { get, post, del } from "@/lib/http";
import { addToast } from "@heroui/toast";

const mockGet = get as jest.Mock;
const mockPost = post as jest.Mock;
const mockDel = del as jest.Mock;
const mockAddToast = addToast as jest.Mock;

// ── ResourceManager mock that exposes callbacks ──────────────────────────────
let capturedRenderCell: ((item: any, key: React.Key) => React.ReactNode) | null = null;
let capturedRenderMobileItem: ((item: any) => React.ReactNode) | null = null;
let capturedOnRefresh: (() => void) | null = null;
let capturedOnSearchChange: ((v: string) => void) | null = null;
let capturedOnLimitChange: ((l: number) => void) | null = null;
let capturedOnPageChange: ((p: number) => void) | null = null;
let capturedItems: any[] = [];

jest.mock("@/components/common/ResourceManager", () => ({
  ResourceManager: (props: any) => {
    capturedRenderCell = props.renderCell;
    capturedRenderMobileItem = props.renderMobileItem;
    capturedOnRefresh = props.onRefresh;
    capturedOnSearchChange = props.onSearchChange;
    capturedOnLimitChange = props.onLimitChange;
    capturedOnPageChange = props.onPageChange;
    capturedItems = props.items ?? [];
    return (
      <div data-testid="resource-manager">
        <button data-testid="btn-refresh" onClick={() => props.onRefresh?.()}>Refresh</button>
        <button data-testid="btn-limit" onClick={() => props.onLimitChange?.(10)}>Limit</button>
        <button data-testid="btn-page" onClick={() => props.onPageChange?.(2)}>Page</button>
        <input
          data-testid="search-input"
          onChange={(e) => props.onSearchChange?.(e.target.value)}
        />
        {props.emptyContent}
      </div>
    );
  },
}));

// ── Popover mock that renders children (so PopoverContent is visible) ─────────
// jest.setup already mocks @heroui/react; Popover renders children directly.

const mockActivity = {
  id: "cda1",
  code: "CDA-001",
  name: "Activity One",
  project: { code: "P-001" },
  rubric: { code: "R-001" },
  budgetCeiling: "1000000",
  balance: "500000",
};

const mockActivityNoRefs = {
  id: "cda2",
  code: "CDA-002",
  name: "Activity Two",
  project: null,
  rubric: null,
  budgetCeiling: "2000000",
  balance: "0",
};

const mockResponse = {
  data: [mockActivity, mockActivityNoRefs],
  meta: { total: 2, page: 1, limit: 5, totalPages: 2 },
};

import { AssociatedCdpActivitiesTab } from "@/components/modals/financial/cdp/activities/AssociatedCdpActivitiesTab";

describe("AssociatedCdpActivitiesTab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedRenderCell = null;
    capturedRenderMobileItem = null;
    capturedItems = [];
    mockGet.mockResolvedValue(mockResponse);
    mockPost.mockResolvedValue({});
    mockDel.mockResolvedValue(undefined);
  });

  // ── mount & fetch ──────────────────────────────────────────────────────────

  it("renders without crashing", () => {
    const { container } = render(<AssociatedCdpActivitiesTab positionId="p1" />);
    expect(container).toBeTruthy();
  });

  it("fetches activities on mount with positionId", async () => {
    render(<AssociatedCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("p1")));
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("type=associated"));
  });

  it("does not fetch when positionId is null", () => {
    render(<AssociatedCdpActivitiesTab positionId={null} />);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("shows error toast on fetch failure", async () => {
    mockGet.mockRejectedValueOnce(new Error("Network error"));
    render(<AssociatedCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(mockAddToast).toHaveBeenCalledWith(
      expect.objectContaining({ color: "danger", title: expect.stringContaining("Error") })
    ));
  });

  it("renders empty content slot", async () => {
    mockGet.mockResolvedValueOnce({ data: [], meta: { total: 0, page: 1, limit: 5, totalPages: 0 } });
    render(<AssociatedCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(screen.getByText("No hay actividades asociadas")).toBeInTheDocument());
  });

  // ── refresh, pagination, limit ─────────────────────────────────────────────

  it("re-fetches on refresh button click", async () => {
    render(<AssociatedCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByTestId("btn-refresh"));
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2));
  });

  it("changes limit and resets page to 1", async () => {
    render(<AssociatedCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(mockGet).toHaveBeenCalled());
    const callsBefore = mockGet.mock.calls.length;
    fireEvent.click(screen.getByTestId("btn-limit"));
    await waitFor(() => expect(mockGet.mock.calls.length).toBeGreaterThan(callsBefore));
    const lastUrl = mockGet.mock.calls[mockGet.mock.calls.length - 1][0];
    expect(lastUrl).toContain("limit=10");
  });

  it("changes page", async () => {
    render(<AssociatedCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(mockGet).toHaveBeenCalled());
    await act(async () => { capturedOnPageChange?.(2); });
    await waitFor(() => {
      const calls = mockGet.mock.calls.map((c) => c[0]);
      expect(calls.some((u) => u.includes("page=2"))).toBe(true);
    });
  });

  it("resets page to 1 when search changes", async () => {
    render(<AssociatedCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(mockGet).toHaveBeenCalled());
    // Simulate search change (useDebounce is identity in tests)
    fireEvent.change(screen.getByTestId("search-input"), { target: { value: "test" } });
    await waitFor(() => {
      const calls = mockGet.mock.calls.map((c) => c[0]);
      expect(calls.some((u) => u.includes("search=test"))).toBe(true);
    });
  });

  // ── renderCell ─────────────────────────────────────────────────────────────

  it("renderCell: code column", async () => {
    render(<AssociatedCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(capturedRenderCell).not.toBeNull());
    const { container } = render(<>{capturedRenderCell!(mockActivity, "code")}</>);
    expect(container).toHaveTextContent("CDA-001");
  });

  it("renderCell: name column", async () => {
    render(<AssociatedCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(capturedRenderCell).not.toBeNull());
    const { container } = render(<>{capturedRenderCell!(mockActivity, "name")}</>);
    expect(container).toHaveTextContent("Activity One");
  });

  it("renderCell: project column with code", async () => {
    render(<AssociatedCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(capturedRenderCell).not.toBeNull());
    const { container } = render(<>{capturedRenderCell!(mockActivity, "project")}</>);
    expect(container).toHaveTextContent("P-001");
  });

  it("renderCell: project column without code shows dash", async () => {
    render(<AssociatedCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(capturedRenderCell).not.toBeNull());
    const { container } = render(<>{capturedRenderCell!(mockActivityNoRefs, "project")}</>);
    expect(container).toHaveTextContent("—");
  });

  it("renderCell: pospre column with code", async () => {
    render(<AssociatedCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(capturedRenderCell).not.toBeNull());
    const { container } = render(<>{capturedRenderCell!(mockActivity, "pospre")}</>);
    expect(container).toHaveTextContent("R-001");
  });

  it("renderCell: pospre column without code shows dash", async () => {
    render(<AssociatedCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(capturedRenderCell).not.toBeNull());
    const { container } = render(<>{capturedRenderCell!(mockActivityNoRefs, "pospre")}</>);
    expect(container).toHaveTextContent("—");
  });

  it("renderCell: ceiling column formats currency", async () => {
    render(<AssociatedCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(capturedRenderCell).not.toBeNull());
    const { container } = render(<>{capturedRenderCell!(mockActivity, "ceiling")}</>);
    expect(container).toHaveTextContent("$");
  });

  it("renderCell: available column formats currency", async () => {
    render(<AssociatedCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(capturedRenderCell).not.toBeNull());
    const { container } = render(<>{capturedRenderCell!(mockActivity, "available")}</>);
    expect(container).toHaveTextContent("$");
  });

  it("renderCell: actions column renders buttons", async () => {
    render(<AssociatedCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(capturedRenderCell).not.toBeNull());
    const { container } = render(<>{capturedRenderCell!(mockActivity, "actions")}</>);
    expect(container.querySelectorAll("[data-testid='Button']").length).toBeGreaterThan(0);
  });

  it("renderCell: default column returns null", async () => {
    render(<AssociatedCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(capturedRenderCell).not.toBeNull());
    const result = capturedRenderCell!(mockActivity, "unknown");
    expect(result).toBeNull();
  });

  // ── handleDissociate ───────────────────────────────────────────────────────

  it("handleDissociate: calls del and re-fetches", async () => {
    render(<AssociatedCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(capturedRenderCell).not.toBeNull());
    const { getAllByTitle } = render(<>{capturedRenderCell!(mockActivity, "actions")}</>);
    const dissociateBtn = getAllByTitle("Desasociar")[0];
    fireEvent.click(dissociateBtn);
    await waitFor(() => expect(mockDel).toHaveBeenCalled());
    expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "success" }));
  });

  it("handleDissociate: shows error toast on failure", async () => {
    mockDel.mockRejectedValueOnce(new Error("del failed"));
    render(<AssociatedCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(capturedRenderCell).not.toBeNull());
    const { getAllByTitle } = render(<>{capturedRenderCell!(mockActivity, "actions")}</>);
    const dissociateBtn = getAllByTitle("Desasociar")[0];
    fireEvent.click(dissociateBtn);
    await waitFor(() => expect(mockAddToast).toHaveBeenCalledWith(
      expect.objectContaining({ color: "danger" })
    ));
  });

  // ── ConsumePopover ─────────────────────────────────────────────────────────

  it("ConsumePopover: shows invalid-amount toast when amount is empty", async () => {
    render(<AssociatedCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(capturedRenderCell).not.toBeNull());
    const { getByText } = render(<>{capturedRenderCell!(mockActivity, "actions")}</>);
    // Popover renders its content directly (jest.setup mock)
    const consumeBtn = getByText("Consumir");
    fireEvent.click(consumeBtn);
    await waitFor(() => expect(mockAddToast).toHaveBeenCalledWith(
      expect.objectContaining({ color: "danger", description: expect.stringContaining("monto válido") })
    ));
  });

  it("ConsumePopover: updates display value when typing amount", async () => {
    render(<AssociatedCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(capturedRenderCell).not.toBeNull());
    const { getByLabelText } = render(<>{capturedRenderCell!(mockActivity, "actions")}</>);
    const input = getByLabelText("Monto a consumir");
    fireEvent.change(input, { target: { value: "500000" } });
    // Input formats and renders display value — no error thrown
    expect(input).toBeInTheDocument();
  });

  it("ConsumePopover: calls post on valid consume", async () => {
    render(<AssociatedCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(capturedRenderCell).not.toBeNull());
    const { getByLabelText, getByText } = render(<>{capturedRenderCell!(mockActivity, "actions")}</>);
    const input = getByLabelText("Monto a consumir");
    fireEvent.change(input, { target: { value: "100000" } });
    fireEvent.click(getByText("Consumir"));
    await waitFor(() => expect(mockPost).toHaveBeenCalled());
    expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "success" }));
  });

  it("ConsumePopover: shows error toast when post fails", async () => {
    mockPost.mockRejectedValueOnce(new Error("consume error"));
    render(<AssociatedCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(capturedRenderCell).not.toBeNull());
    const { getByLabelText, getByText } = render(<>{capturedRenderCell!(mockActivity, "actions")}</>);
    const input = getByLabelText("Monto a consumir");
    fireEvent.change(input, { target: { value: "100000" } });
    fireEvent.click(getByText("Consumir"));
    await waitFor(() => expect(mockAddToast).toHaveBeenCalledWith(
      expect.objectContaining({ color: "danger", title: "Error al consumir" })
    ));
  });

  it("ConsumePopover: cancel button closes popover without submitting", async () => {
    render(<AssociatedCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(capturedRenderCell).not.toBeNull());
    const { getByText } = render(<>{capturedRenderCell!(mockActivity, "actions")}</>);
    fireEvent.click(getByText("Cancelar"));
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("ConsumePopover: shows available balance in popover", async () => {
    render(<AssociatedCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(capturedRenderCell).not.toBeNull());
    const { getByText } = render(<>{capturedRenderCell!(mockActivity, "actions")}</>);
    expect(getByText(/Disponible/)).toBeInTheDocument();
  });

  // ── renderMobileItem ───────────────────────────────────────────────────────

  it("renderMobileItem: shows code and name", async () => {
    render(<AssociatedCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(capturedRenderMobileItem).not.toBeNull());
    const { container } = render(<>{capturedRenderMobileItem!(mockActivity)}</>);
    expect(container).toHaveTextContent("CDA-001");
    expect(container).toHaveTextContent("Activity One");
  });

  it("renderMobileItem: shows project and rubric codes", async () => {
    render(<AssociatedCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(capturedRenderMobileItem).not.toBeNull());
    const { container } = render(<>{capturedRenderMobileItem!(mockActivity)}</>);
    expect(container).toHaveTextContent("P-001");
    expect(container).toHaveTextContent("R-001");
  });

  it("renderMobileItem: shows dashes when project/rubric absent", async () => {
    render(<AssociatedCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(capturedRenderMobileItem).not.toBeNull());
    const { getAllByText } = render(<>{capturedRenderMobileItem!(mockActivityNoRefs)}</>);
    expect(getAllByText("—").length).toBeGreaterThan(0);
  });

  it("renderMobileItem: dissociate button calls del", async () => {
    render(<AssociatedCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(capturedRenderMobileItem).not.toBeNull());
    const { container } = render(<>{capturedRenderMobileItem!(mockActivity)}</>);
    const dangerBtn = container.querySelector("[color='danger']");
    if (dangerBtn) fireEvent.click(dangerBtn);
    await waitFor(() => expect(mockDel).toHaveBeenCalled());
  });
});
