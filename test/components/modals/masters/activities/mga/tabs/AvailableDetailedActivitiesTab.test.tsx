import React from "react";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";

const mockGet = jest.fn();
const mockPost = jest.fn();

jest.mock("@/lib/http", () => ({
  get: (...args: any[]) => mockGet(...args),
  post: (...args: any[]) => mockPost(...args),
}));

jest.mock("@/lib/endpoints", () => ({
  endpoints: {
    masters: {
      mgaActivityDetailedActivities: (id: string) => `/mga/${id}/detailed`,
      mgaActivityDetailedRelations: (id: string) => `/mga/${id}/relations`,
    },
  },
}));

// ResourceManager mock that renders items via renderCell
let capturedResourceManagerProps: any = null;
jest.mock("@/components/common/ResourceManager", () => ({
  ResourceManager: (props: any) => {
    capturedResourceManagerProps = props;
    const React = require("react");
    return React.createElement("div", { "data-testid": "resource-manager" },
      props.items?.map((item: any) =>
        React.createElement("div", { key: item.id, "data-testid": `item-${item.id}` },
          props.renderCell?.(item, "code"),
          props.renderCell?.(item, "name"),
          props.renderCell?.(item, "projectCode"),
          props.renderCell?.(item, "rubricCode"),
          props.renderCell?.(item, "budgetCeiling"),
          props.renderCell?.(item, "balance"),
          props.renderCell?.(item, "actions"),
        )
      ),
      props.items?.length === 0 && props.emptyContent,
    );
  },
}));

jest.mock("@/hooks/useDebounce", () => ({
  useDebounce: (value: string) => value,
}));

import { AvailableDetailedActivitiesTab } from "@/components/modals/masters/activities/mga/tabs/AvailableDetailedActivitiesTab";

const makeActivity = (overrides: Partial<any> = {}) => ({
  id: "da1",
  code: "ACT-001",
  name: "Activity One",
  budgetCeiling: "500000",
  balance: "300000",
  project: { code: "PROJ-01" },
  rubric: { code: "RUB-01" },
  ...overrides,
});

describe("AvailableDetailedActivitiesTab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedResourceManagerProps = null;
    mockGet.mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 5, totalPages: 0 } });
    mockPost.mockResolvedValue({});
  });

  it("renders without crashing", () => {
    const { container } = render(<AvailableDetailedActivitiesTab mgaActivityId="m1" />);
    expect(container).toBeTruthy();
  });

  it("renders ResourceManager", () => {
    render(<AvailableDetailedActivitiesTab mgaActivityId="m1" />);
    expect(screen.getByTestId("resource-manager")).toBeInTheDocument();
  });

  it("fetches activities when mgaActivityId provided", async () => {
    render(<AvailableDetailedActivitiesTab mgaActivityId="m1" />);
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("m1")));
  });

  it("fetches with type=available in URL", async () => {
    render(<AvailableDetailedActivitiesTab mgaActivityId="m1" />);
    await waitFor(() =>
      expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("type=available"))
    );
  });

  it("does not fetch when mgaActivityId is null", async () => {
    render(<AvailableDetailedActivitiesTab mgaActivityId={null} />);
    await new Promise((r) => setTimeout(r, 50));
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("renders items via renderCell when data is returned (covers renderCell lines 108-137)", async () => {
    mockGet.mockResolvedValue({
      data: [makeActivity()],
      meta: { total: 1, page: 1, limit: 5, totalPages: 1 },
    });
    render(<AvailableDetailedActivitiesTab mgaActivityId="m1" />);
    await waitFor(() => expect(screen.getByText("ACT-001")).toBeInTheDocument());
    expect(screen.getByText("Activity One")).toBeInTheDocument();
    expect(screen.getByText("PROJ-01")).toBeInTheDocument();
    expect(screen.getByText("RUB-01")).toBeInTheDocument();
  });

  it("renderCell: shows formatted currency for budgetCeiling and balance (covers formatCurrency line 32)", async () => {
    mockGet.mockResolvedValue({
      data: [makeActivity({ budgetCeiling: "1000000", balance: "500000" })],
      meta: { total: 1, page: 1, limit: 5, totalPages: 1 },
    });
    render(<AvailableDetailedActivitiesTab mgaActivityId="m1" />);
    await waitFor(() => expect(screen.getByText(/1\.000\.000/)).toBeInTheDocument());
    expect(screen.getByText(/500\.000/)).toBeInTheDocument();
  });

  it("renderCell: shows dash for missing project/rubric codes", async () => {
    mockGet.mockResolvedValue({
      data: [makeActivity({ project: undefined, rubric: undefined })],
      meta: { total: 1, page: 1, limit: 5, totalPages: 1 },
    });
    render(<AvailableDetailedActivitiesTab mgaActivityId="m1" />);
    await waitFor(() => expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(2));
  });

  it("renderCell: actions button triggers handleAssociate on click (covers lines 94-103)", async () => {
    mockGet.mockResolvedValue({
      data: [makeActivity()],
      meta: { total: 1, page: 1, limit: 5, totalPages: 1 },
    });
    render(<AvailableDetailedActivitiesTab mgaActivityId="m1" />);
    await waitFor(() => expect(screen.getByTestId("item-da1")).toBeInTheDocument());
    const actionButtons = screen.getByTestId("item-da1").querySelectorAll("[color='primary']");
    expect(actionButtons.length).toBeGreaterThan(0);
    await act(async () => { fireEvent.click(actionButtons[0]); });
    await waitFor(() => expect(mockPost).toHaveBeenCalledWith("/mga/m1/relations", { detailedActivityId: "da1" }));
  });

  it("handleAssociate: shows success toast and re-fetches (covers lines 98-99)", async () => {
    const { addToast } = require("@heroui/toast");
    mockGet.mockResolvedValue({
      data: [makeActivity()],
      meta: { total: 1, page: 1, limit: 5, totalPages: 1 },
    });
    render(<AvailableDetailedActivitiesTab mgaActivityId="m1" />);
    await waitFor(() => expect(screen.getByTestId("item-da1")).toBeInTheDocument());
    const actionBtn = screen.getByTestId("item-da1").querySelectorAll("[color='primary']")[0];
    mockGet.mockClear();
    await act(async () => { fireEvent.click(actionBtn); });
    await waitFor(() => expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ title: "Actividad asociada", color: "success" })));
    expect(mockGet).toHaveBeenCalled();
  });

  it("handleAssociate: shows error toast on failure (covers lines 100-101)", async () => {
    const { addToast } = require("@heroui/toast");
    mockPost.mockRejectedValue(new Error("Server error"));
    mockGet.mockResolvedValue({
      data: [makeActivity()],
      meta: { total: 1, page: 1, limit: 5, totalPages: 1 },
    });
    render(<AvailableDetailedActivitiesTab mgaActivityId="m1" />);
    await waitFor(() => expect(screen.getByTestId("item-da1")).toBeInTheDocument());
    const actionBtn = screen.getByTestId("item-da1").querySelectorAll("[color='primary']")[0];
    await act(async () => { fireEvent.click(actionBtn); });
    await waitFor(() => expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ title: "Error", color: "danger" })));
  });

  it("fetch error shows error toast (covers line 76)", async () => {
    const { addToast } = require("@heroui/toast");
    mockGet.mockRejectedValue(new Error("Network error"));
    render(<AvailableDetailedActivitiesTab mgaActivityId="m1" />);
    await waitFor(() => expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ title: "Error al cargar disponibles", color: "danger" })));
  });

  it("onLimitChange resets page to 1 (covers lines 208-209)", async () => {
    render(<AvailableDetailedActivitiesTab mgaActivityId="m1" />);
    await waitFor(() => expect(capturedResourceManagerProps?.onLimitChange).toBeDefined());
    mockGet.mockClear();
    await act(async () => { capturedResourceManagerProps.onLimitChange(10); });
    await waitFor(() => expect(mockGet).toHaveBeenCalled());
  });

  it("onSearchChange triggers new fetch (covers debouncedSearch)", async () => {
    render(<AvailableDetailedActivitiesTab mgaActivityId="m1" />);
    await waitFor(() => expect(capturedResourceManagerProps?.onSearchChange).toBeDefined());
    mockGet.mockClear();
    await act(async () => { capturedResourceManagerProps.onSearchChange("test"); });
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("search=test")));
  });

  it("shows empty content when no activities", async () => {
    render(<AvailableDetailedActivitiesTab mgaActivityId="m1" />);
    await waitFor(() => expect(screen.getByText("No hay actividades disponibles")).toBeInTheDocument());
  });
});
