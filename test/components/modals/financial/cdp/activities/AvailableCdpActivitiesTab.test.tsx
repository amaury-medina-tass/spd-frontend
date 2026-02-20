import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { get, post } from "@/lib/http";
import { addToast } from "@heroui/toast";

const mockGet = get as jest.Mock;
const mockPost = post as jest.Mock;
const mockAddToast = addToast as jest.Mock;

// ── ResourceManager mock that exposes callbacks ──────────────────────────────
let capturedRenderCell: ((item: any, key: React.Key) => React.ReactNode) | null = null;
let capturedRenderMobileItem: ((item: any) => React.ReactNode) | null = null;
let capturedOnRefresh: (() => void) | null = null;
let capturedOnLimitChange: ((l: number) => void) | null = null;
let capturedOnPageChange: ((p: number) => void) | null = null;

jest.mock("@/components/common/ResourceManager", () => ({
  ResourceManager: (props: any) => {
    capturedRenderCell = props.renderCell;
    capturedRenderMobileItem = props.renderMobileItem;
    capturedOnRefresh = props.onRefresh;
    capturedOnLimitChange = props.onLimitChange;
    capturedOnPageChange = props.onPageChange;
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

const mockActivity = {
  id: "act1",
  code: "ACT-001",
  name: "Available Activity One",
  project: { code: "P-001" },
  rubric: { code: "R-001" },
  budgetCeiling: "1000000",
  balance: "500000",
};

const mockActivityNoRefs = {
  id: "act2",
  code: "ACT-002",
  name: "Available Activity Two",
  project: null,
  rubric: null,
  budgetCeiling: "2000000",
  balance: "0",
};

const mockResponse = {
  data: [mockActivity, mockActivityNoRefs],
  meta: { total: 2, page: 1, limit: 5, totalPages: 2 },
};

import { AvailableCdpActivitiesTab } from "@/components/modals/financial/cdp/activities/AvailableCdpActivitiesTab";

describe("AvailableCdpActivitiesTab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedRenderCell = null;
    capturedRenderMobileItem = null;
    mockGet.mockResolvedValue(mockResponse);
    mockPost.mockResolvedValue({});
  });

  // ── mount & fetch ──────────────────────────────────────────────────────────

  it("renders without crashing", () => {
    const { container } = render(<AvailableCdpActivitiesTab positionId="p1" />);
    expect(container).toBeTruthy();
  });

  it("renders the ResourceManager", () => {
    render(<AvailableCdpActivitiesTab positionId="p1" />);
    expect(screen.getByTestId("resource-manager")).toBeInTheDocument();
  });

  it("fetches with positionId and type=available in URL", async () => {
    render(<AvailableCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("p1")));
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("type=available"));
  });

  it("does not fetch when positionId is null", async () => {
    render(<AvailableCdpActivitiesTab positionId={null} />);
    await new Promise((r) => setTimeout(r, 30));
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("shows error toast on fetch failure", async () => {
    mockGet.mockRejectedValueOnce(new Error("Network error"));
    render(<AvailableCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(mockAddToast).toHaveBeenCalledWith(
      expect.objectContaining({ color: "danger", title: "Error al cargar disponibles" })
    ));
  });

  it("renders empty content slot", async () => {
    mockGet.mockResolvedValueOnce({ data: [], meta: { total: 0, page: 1, limit: 5, totalPages: 0 } });
    render(<AvailableCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(screen.getByText("No hay actividades disponibles")).toBeInTheDocument());
  });

  // ── pagination & limit ─────────────────────────────────────────────────────

  it("re-fetches on refresh", async () => {
    render(<AvailableCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByTestId("btn-refresh"));
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2));
  });

  it("changes limit and resets page to 1", async () => {
    render(<AvailableCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(mockGet).toHaveBeenCalled());
    const before = mockGet.mock.calls.length;
    fireEvent.click(screen.getByTestId("btn-limit"));
    await waitFor(() => expect(mockGet.mock.calls.length).toBeGreaterThan(before));
    const lastUrl = mockGet.mock.calls[mockGet.mock.calls.length - 1][0];
    expect(lastUrl).toContain("limit=10");
    expect(lastUrl).toContain("page=1");
  });

  it("changes page", async () => {
    render(<AvailableCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(mockGet).toHaveBeenCalled());
    await act(async () => { capturedOnPageChange?.(3); });
    await waitFor(() => {
      const calls = mockGet.mock.calls.map((c) => c[0]);
      expect(calls.some((u) => u.includes("page=3"))).toBe(true);
    });
  });

  it("resets page to 1 when search changes", async () => {
    render(<AvailableCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(mockGet).toHaveBeenCalled());
    fireEvent.change(screen.getByTestId("search-input"), { target: { value: "query" } });
    await waitFor(() => {
      const calls = mockGet.mock.calls.map((c) => c[0]);
      expect(calls.some((u) => u.includes("search=query"))).toBe(true);
    });
  });

  // ── renderCell ─────────────────────────────────────────────────────────────

  it("renderCell: code column", async () => {
    render(<AvailableCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(capturedRenderCell).not.toBeNull());
    const { container } = render(<>{capturedRenderCell!(mockActivity, "code")}</>);
    expect(container).toHaveTextContent("ACT-001");
  });

  it("renderCell: name column", async () => {
    render(<AvailableCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(capturedRenderCell).not.toBeNull());
    const { container } = render(<>{capturedRenderCell!(mockActivity, "name")}</>);
    expect(container).toHaveTextContent("Available Activity One");
  });

  it("renderCell: project column with code", async () => {
    render(<AvailableCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(capturedRenderCell).not.toBeNull());
    const { container } = render(<>{capturedRenderCell!(mockActivity, "project")}</>);
    expect(container).toHaveTextContent("P-001");
  });

  it("renderCell: project column falls back to dash", async () => {
    render(<AvailableCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(capturedRenderCell).not.toBeNull());
    const { container } = render(<>{capturedRenderCell!(mockActivityNoRefs, "project")}</>);
    expect(container).toHaveTextContent("—");
  });

  it("renderCell: pospre column with code", async () => {
    render(<AvailableCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(capturedRenderCell).not.toBeNull());
    const { container } = render(<>{capturedRenderCell!(mockActivity, "pospre")}</>);
    expect(container).toHaveTextContent("R-001");
  });

  it("renderCell: pospre column falls back to dash", async () => {
    render(<AvailableCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(capturedRenderCell).not.toBeNull());
    const { container } = render(<>{capturedRenderCell!(mockActivityNoRefs, "pospre")}</>);
    expect(container).toHaveTextContent("—");
  });

  it("renderCell: ceiling column formats currency", async () => {
    render(<AvailableCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(capturedRenderCell).not.toBeNull());
    const { container } = render(<>{capturedRenderCell!(mockActivity, "ceiling")}</>);
    expect(container).toHaveTextContent("$");
  });

  it("renderCell: available column formats currency", async () => {
    render(<AvailableCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(capturedRenderCell).not.toBeNull());
    const { container } = render(<>{capturedRenderCell!(mockActivity, "available")}</>);
    expect(container).toHaveTextContent("$");
  });

  it("renderCell: actions column renders associate button", async () => {
    render(<AvailableCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(capturedRenderCell).not.toBeNull());
    const { container } = render(<>{capturedRenderCell!(mockActivity, "actions")}</>);
    expect(container.querySelector("[title='Asociar']")).toBeInTheDocument();
  });

  it("renderCell: default returns null", async () => {
    render(<AvailableCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(capturedRenderCell).not.toBeNull());
    expect(capturedRenderCell!(mockActivity, "unknown")).toBeNull();
  });

  // ── handleAssociate ────────────────────────────────────────────────────────

  it("handleAssociate: calls post with detailedActivityId", async () => {
    render(<AvailableCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(capturedRenderCell).not.toBeNull());
    const { getByTitle } = render(<>{capturedRenderCell!(mockActivity, "actions")}</>);
    fireEvent.click(getByTitle("Asociar"));
    await waitFor(() => expect(mockPost).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ detailedActivityId: "act1" })
    ));
    expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "success" }));
  });

  it("handleAssociate: shows error toast on failure", async () => {
    mockPost.mockRejectedValueOnce(new Error("associate error"));
    render(<AvailableCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(capturedRenderCell).not.toBeNull());
    const { getByTitle } = render(<>{capturedRenderCell!(mockActivity, "actions")}</>);
    fireEvent.click(getByTitle("Asociar"));
    await waitFor(() => expect(mockAddToast).toHaveBeenCalledWith(
      expect.objectContaining({ color: "danger" })
    ));
  });

  // ── renderMobileItem ───────────────────────────────────────────────────────

  it("renderMobileItem: shows code and name", async () => {
    render(<AvailableCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(capturedRenderMobileItem).not.toBeNull());
    const { container } = render(<>{capturedRenderMobileItem!(mockActivity)}</>);
    expect(container).toHaveTextContent("ACT-001");
    expect(container).toHaveTextContent("Available Activity One");
  });

  it("renderMobileItem: shows project and rubric codes", async () => {
    render(<AvailableCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(capturedRenderMobileItem).not.toBeNull());
    const { container } = render(<>{capturedRenderMobileItem!(mockActivity)}</>);
    expect(container).toHaveTextContent("P-001");
    expect(container).toHaveTextContent("R-001");
  });

  it("renderMobileItem: falls back to dash when refs absent", async () => {
    render(<AvailableCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(capturedRenderMobileItem).not.toBeNull());
    const { getAllByText } = render(<>{capturedRenderMobileItem!(mockActivityNoRefs)}</>);
    expect(getAllByText("—").length).toBeGreaterThan(0);
  });

  it("renderMobileItem: associate button calls post", async () => {
    render(<AvailableCdpActivitiesTab positionId="p1" />);
    await waitFor(() => expect(capturedRenderMobileItem).not.toBeNull());
    const { container } = render(<>{capturedRenderMobileItem!(mockActivity)}</>);
    const btn = container.querySelector("[color='primary']");
    if (btn) fireEvent.click(btn);
    await waitFor(() => expect(mockPost).toHaveBeenCalled());
  });
});
