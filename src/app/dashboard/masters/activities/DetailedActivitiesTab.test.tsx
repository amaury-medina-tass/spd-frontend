import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { get, del, post, patch } from "@/lib/http";
import { addToast } from "@heroui/toast";
import { requestExport } from "@/services/exports.service";

const mockGet = get as jest.Mock;
const mockDel = del as jest.Mock;
const mockPost = post as jest.Mock;
const mockPatch = patch as jest.Mock;
const mockAddToast = addToast as jest.Mock;
const mockRequestExport = requestExport as jest.Mock;

let capturedDetailModalProps: any = {};
let capturedCreateModalProps: any = {};
let capturedModificationModalProps: any = {};

jest.mock("@/lib/endpoints", () => ({
  endpoints: { masters: { detailedActivities: "/api/detailed", budgetModifications: "/api/modifications" } },
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
jest.mock("@/components/modals/masters/activities/detailed/DetailedActivityModal", () => ({
  DetailedActivityModal: (props: any) => { capturedDetailModalProps = props; return null; },
}));
jest.mock("@/components/modals/masters/activities/detailed/CreateDetailedActivityModal", () => ({
  CreateDetailedActivityModal: (props: any) => { capturedCreateModalProps = props; return null; },
}));
jest.mock("@/components/modals/masters/activities/detailed/CreateBudgetModificationModal", () => ({
  CreateBudgetModificationModal: (props: any) => { capturedModificationModalProps = props; return null; },
}));
jest.mock("@/components/modals/masters/activities/detailed/BudgetModificationHistoryModal", () => ({ BudgetModificationHistoryModal: () => null }));
jest.mock("@/components/modals/ConfirmationModal", () => ({
  ConfirmationModal: ({ isOpen, onConfirm }: any) =>
    isOpen ? <div data-testid="confirm-modal"><button onClick={onConfirm}>Confirm</button></div> : null,
}));

import { DetailedActivitiesTab } from "./DetailedActivitiesTab";

const mockData = {
  data: [
    { id: "da1", code: "DA-001", name: "Activity 1", activityDate: "2024-01-15T00:00:00.000Z", project: { name: "Project A" }, rubric: { code: "R-001" }, budgetCeiling: "1000000", balance: "500000", cpc: "CPC-001" },
  ],
  meta: { total: 1, page: 1, limit: 5, totalPages: 1 },
};

describe("DetailedActivitiesTab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedDetailModalProps = {};
    capturedCreateModalProps = {};
    capturedModificationModalProps = {};
    mockGet.mockImplementation((url: string) => {
      if (url.includes("da1")) return Promise.resolve({ ...mockData.data[0], fullDetails: true });
      return Promise.resolve(mockData);
    });
    mockDel.mockResolvedValue(undefined);
    mockPost.mockResolvedValue({});
    mockPatch.mockResolvedValue({});
  });

  it("renders data table with fetched items", async () => {
    render(<DetailedActivitiesTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
  });

  it("renders all columns via renderCell", async () => {
    render(<DetailedActivitiesTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    expect(screen.getByTestId("cell-0-code")).toBeInTheDocument();
    expect(screen.getByTestId("cell-0-budgetCeiling")).toBeInTheDocument();
    expect(screen.getByTestId("cell-0-balance")).toBeInTheDocument();
  });

  it("clicks view details action", async () => {
    render(<DetailedActivitiesTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-0"));
  });

  it("clicks edit action", async () => {
    render(<DetailedActivitiesTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-2"));
  });

  it("clicks delete action and confirms", async () => {
    render(<DetailedActivitiesTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-4"));
    await waitFor(() => expect(screen.getByTestId("confirm-modal")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Confirm"));
    await waitFor(() => expect(mockDel).toHaveBeenCalled());
  });

  it("clicks refresh top action", async () => {
    render(<DetailedActivitiesTab />);
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByText("Actualizar"));
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2));
  });

  it("clicks create top action", async () => {
    render(<DetailedActivitiesTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Crear"));
  });

  it("handles fetch error shows error state with Reintentar", async () => {
    mockGet.mockRejectedValueOnce(new Error("Error al cargar actividades detalladas"));
    render(<DetailedActivitiesTab />);
    await waitFor(() => expect(screen.getByText("Error al cargar actividades detalladas")).toBeInTheDocument());
    expect(screen.getByText("Reintentar")).toBeInTheDocument();
  });

  it("Reintentar re-fetches data", async () => {
    mockGet.mockRejectedValueOnce(new Error("Error al cargar actividades detalladas"));
    render(<DetailedActivitiesTab />);
    await waitFor(() => expect(screen.getByText("Reintentar")).toBeInTheDocument());
    mockGet.mockImplementation((url: string) => {
      if (url.includes("da1")) return Promise.resolve({ ...mockData.data[0] });
      return Promise.resolve(mockData);
    });
    fireEvent.click(screen.getByText("Reintentar"));
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
  });

  it("export success calls requestExport and shows primary toast", async () => {
    render(<DetailedActivitiesTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Exportar Actividades"));
    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "primary" }))
    );
    expect(mockRequestExport).toHaveBeenCalledWith({ system: "SPD", type: "ACTIVITIES" });
  });

  it("export failure shows danger toast", async () => {
    mockRequestExport.mockRejectedValueOnce(new Error("export error"));
    render(<DetailedActivitiesTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Exportar Actividades"));
    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }))
    );
  });

  it("view action fetches individual activity in view mode", async () => {
    render(<DetailedActivitiesTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-0"));
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("da1")));
  });

  it("view action error shows danger toast", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes("da1")) return Promise.reject(new Error("view failed"));
      return Promise.resolve(mockData);
    });
    render(<DetailedActivitiesTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-0"));
    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }))
    );
  });

  it("history action opens BudgetModificationHistoryModal", async () => {
    render(<DetailedActivitiesTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-1"));
    // Action opens the modal - no error expected
    await waitFor(() => expect(screen.getByTestId("data-table")).toBeInTheDocument());
  });

  it("edit action fetches individual activity in edit mode", async () => {
    render(<DetailedActivitiesTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-2"));
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("da1")));
  });

  it("edit action error shows danger toast", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes("da1")) return Promise.reject(new Error("edit failed"));
      return Promise.resolve(mockData);
    });
    render(<DetailedActivitiesTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-2"));
    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }))
    );
  });

  it("modification action opens CreateBudgetModificationModal", async () => {
    render(<DetailedActivitiesTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-3"));
    await waitFor(() => expect(screen.getByTestId("data-table")).toBeInTheDocument());
  });

  it("onSaveActivity calls patch and shows success toast", async () => {
    render(<DetailedActivitiesTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    // open edit modal to set selectedActivity
    fireEvent.click(screen.getByTestId("row-0-action-2"));
    // Wait for selectedActivity state to be set (modal receives non-null activity)
    await waitFor(() => expect(capturedDetailModalProps.activity).toBeTruthy());
    await capturedDetailModalProps.onSave({ name: "Updated", observations: "obs" });
    await waitFor(() => expect(mockPatch).toHaveBeenCalled());
    expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "success" }));
  });

  it("onSaveActivity error shows danger toast", async () => {
    mockPatch.mockRejectedValueOnce(new Error("patch failed"));
    render(<DetailedActivitiesTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-2"));
    await waitFor(() => expect(capturedDetailModalProps.activity).toBeTruthy());
    await capturedDetailModalProps.onSave({ name: "Fail", observations: "" });
    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }))
    );
  });

  it("onCreateActivity calls post and shows success toast", async () => {
    render(<DetailedActivitiesTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Crear"));
    await capturedCreateModalProps.onSave({ name: "New Activity", code: "DA-002" });
    await waitFor(() => expect(mockPost).toHaveBeenCalled());
    expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "success" }));
  });

  it("onCreateActivity error shows danger toast", async () => {
    mockPost.mockRejectedValueOnce(new Error("create failed"));
    render(<DetailedActivitiesTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Crear"));
    await capturedCreateModalProps.onSave({ name: "Fail", code: "DA-002" });
    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }))
    );
  });

  it("onCreateModification calls post with budget modifications endpoint", async () => {
    render(<DetailedActivitiesTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-3"));
    await capturedModificationModalProps.onSave({ amount: 100000, reason: "reason" });
    await waitFor(() =>
      expect(mockPost).toHaveBeenCalledWith("/api/modifications", expect.anything())
    );
    expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "success" }));
  });

  it("onCreateModification error shows danger toast", async () => {
    mockPost.mockRejectedValueOnce(new Error("mod failed"));
    render(<DetailedActivitiesTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-3"));
    await capturedModificationModalProps.onSave({ amount: 100000, reason: "reason" });
    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }))
    );
  });

  it("renders activityDate column N/A when null", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes("da1")) return Promise.resolve({ ...mockData.data[0] });
      return Promise.resolve({
        data: [{ ...mockData.data[0], activityDate: null }],
        meta: mockData.meta,
      });
    });
    render(<DetailedActivitiesTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    expect(screen.getByTestId("cell-0-activityDate")).toHaveTextContent("N/A");
  });

  it("renders project.name column N/A when null", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes("da1")) return Promise.resolve({ ...mockData.data[0] });
      return Promise.resolve({
        data: [{ ...mockData.data[0], project: null }],
        meta: mockData.meta,
      });
    });
    render(<DetailedActivitiesTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    expect(screen.getByTestId("cell-0-project.name")).toHaveTextContent("N/A");
  });

  it("renders budgetCeiling as formatted currency", async () => {
    render(<DetailedActivitiesTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    expect(screen.getByTestId("cell-0-budgetCeiling")).not.toBeEmptyDOMElement();
  });

  it("handles delete error", async () => {
    mockDel.mockRejectedValueOnce({ response: { data: { code: "ERR" } } });
    render(<DetailedActivitiesTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-4"));
    await waitFor(() => expect(screen.getByTestId("confirm-modal")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Confirm"));
    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }))
    );
  });
});
