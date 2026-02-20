import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { addToast } from "@heroui/toast";
import { requestExport } from "@/services/exports.service";
import { get } from "@/lib/http";

const mockGet = get as jest.Mock;
const mockAddToast = addToast as jest.Mock;
const mockRequestExport = requestExport as jest.Mock;
const mockGetActivities = jest.fn();

jest.mock("@/lib/endpoints", () => ({
  endpoints: { masters: { mgaActivities: "/api/mga" } },
}));

jest.mock("@/components/tables/DataTable", () => ({
  DataTable: (props: any) => {
    const { items = [], columns = [], topActions = [], rowActions = [], ariaLabel } = props;
    return (
      <div data-testid="data-table" aria-label={ariaLabel}>
        {topActions.map((a: any, i: number) => (
          <button key={i} data-testid={`top-${i}`} onClick={a.onClick}>{a.label}</button>
        ))}
        {items.map((item: any, i: number) => (
          <div key={i} data-testid={`row-${i}`}>
            {columns.map((col: any) => (
              <span key={col.key} data-testid={`cell-${i}-${col.key}`}>
                {col.render ? col.render(item) : String(item[col.key] ?? "")}
              </span>
            ))}
            {rowActions?.map((a: any, j: number) => (
              <button key={j} data-testid={`row-${i}-action-${j}`} onClick={() => a.onClick?.(item)}>{a.label}</button>
            ))}
          </div>
        ))}
      </div>
    );
  },
}));
jest.mock("@/components/modals/masters/activities/mga/MGAActivityModal", () => ({ MGAActivityModal: () => null }));
jest.mock("@/components/modals/masters/activities/mga/CreateMGAActivityModal", () => ({ CreateMGAActivityModal: () => null }));
jest.mock("@/components/modals/masters/activities/mga/ManageDetailedActivitiesModal", () => ({ ManageDetailedActivitiesModal: () => null }));
jest.mock("@/services/masters/mga-activities.service", () => ({
  getMGAActivities: (...args: any[]) => mockGetActivities(...args),
}));

import { MGAActivitiesTab } from "./MGAActivitiesTab";

const mockData = {
  data: [
    { id: "mga1", code: "MGA-001", name: "MGA Activity", activityDate: "2024-01-01T00:00:00.000Z", value: 1000000, balance: 500000, project: { code: "P-001", name: "Project A" }, product: { productCode: "PR-001", productName: "Product A" }, observations: "Test obs", detailedActivitiesCount: 5 },
  ],
  meta: { total: 1, page: 1, limit: 5, totalPages: 1 },
};

describe("MGAActivitiesTab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetActivities.mockResolvedValue(mockData);
    mockGet.mockImplementation((url: string) => {
      if (url.includes("mga1")) return Promise.resolve(mockData.data[0]);
      return Promise.resolve(mockData);
    });
  });

  it("renders data table with fetched items", async () => {
    render(<MGAActivitiesTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
  });

  it("renders all columns via renderCell", async () => {
    render(<MGAActivitiesTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    expect(screen.getByTestId("cell-0-code")).toBeInTheDocument();
    expect(screen.getByTestId("cell-0-value")).toBeInTheDocument();
    expect(screen.getByTestId("cell-0-balance")).toBeInTheDocument();
    expect(screen.getByTestId("cell-0-detailedActivitiesCount")).toBeInTheDocument();
  });

  it("clicks view details action", async () => {
    render(<MGAActivitiesTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-0"));
  });

  it("clicks edit action", async () => {
    render(<MGAActivitiesTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-1"));
  });

  it("clicks manage activities action", async () => {
    render(<MGAActivitiesTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-2"));
  });

  it("clicks refresh top action", async () => {
    render(<MGAActivitiesTab />);
    await waitFor(() => expect(mockGetActivities).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByText("Actualizar"));
    await waitFor(() => expect(mockGetActivities).toHaveBeenCalledTimes(2));
  });

  it("clicks create top action", async () => {
    render(<MGAActivitiesTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Crear"));
  });

  it("handles fetch error shows error state with Reintentar", async () => {
    mockGetActivities.mockRejectedValueOnce(new Error("Error al cargar actividades MGA"));
    render(<MGAActivitiesTab />);
    await waitFor(() => expect(screen.getByText("Error al cargar actividades MGA")).toBeInTheDocument());
    expect(screen.getByText("Reintentar")).toBeInTheDocument();
  });

  it("Reintentar button re-fetches", async () => {
    mockGetActivities.mockRejectedValueOnce(new Error("Error al cargar actividades MGA"));
    render(<MGAActivitiesTab />);
    await waitFor(() => expect(screen.getByText("Reintentar")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Reintentar"));
    await waitFor(() => expect(mockGetActivities).toHaveBeenCalledTimes(2));
  });

  it("view action fetches individual activity", async () => {
    render(<MGAActivitiesTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-0"));
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("mga1")));
  });

  it("view action error shows danger toast", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes("mga1")) return Promise.reject(new Error("view failed"));
      return Promise.resolve(mockData);
    });
    render(<MGAActivitiesTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-0"));
    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }))
    );
  });

  it("edit action fetches individual activity with edit mode", async () => {
    render(<MGAActivitiesTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-1"));
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("mga1")));
  });

  it("edit action error shows danger toast", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes("mga1")) return Promise.reject(new Error("edit failed"));
      return Promise.resolve(mockData);
    });
    render(<MGAActivitiesTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-1"));
    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }))
    );
  });

  it("export success calls requestExport and shows primary toast", async () => {
    render(<MGAActivitiesTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Exportar Actividades"));
    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "primary" }))
    );
    expect(mockRequestExport).toHaveBeenCalledWith({ system: "SPD", type: "ACTIVITIES" });
  });

  it("export failure shows danger toast", async () => {
    mockRequestExport.mockRejectedValueOnce(new Error("export error"));
    render(<MGAActivitiesTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Exportar Actividades"));
    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }))
    );
  });

  it("renders activityDate column N/A when null", async () => {
    mockGetActivities.mockResolvedValue({
      data: [{ ...mockData.data[0], activityDate: null }],
      meta: mockData.meta,
    });
    render(<MGAActivitiesTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    expect(screen.getByTestId("cell-0-activityDate")).toHaveTextContent("N/A");
  });

  it("renders value column with currency format", async () => {
    render(<MGAActivitiesTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    expect(screen.getByTestId("cell-0-value")).not.toBeEmptyDOMElement();
  });

  it("renders balance = 0 with default-500 class", async () => {
    mockGetActivities.mockResolvedValue({
      data: [{ ...mockData.data[0], balance: 0 }],
      meta: mockData.meta,
    });
    render(<MGAActivitiesTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    const cell = screen.getByTestId("cell-0-balance");
    expect(cell.querySelector("span")).toHaveClass("text-default-500");
  });

  it("renders project.code N/A when null", async () => {
    mockGetActivities.mockResolvedValue({
      data: [{ ...mockData.data[0], project: null }],
      meta: mockData.meta,
    });
    render(<MGAActivitiesTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    expect(screen.getByTestId("cell-0-project.code")).toHaveTextContent("N/A");
  });

  it("renders observations empty as dash", async () => {
    mockGetActivities.mockResolvedValue({
      data: [{ ...mockData.data[0], observations: "" }],
      meta: mockData.meta,
    });
    render(<MGAActivitiesTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    expect(screen.getByTestId("cell-0-observations")).toHaveTextContent("—");
  });
});
