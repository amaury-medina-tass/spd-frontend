import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { get, del, post, patch } from "@/lib/http";
import { addToast } from "@heroui/toast";

const mockGet = get as jest.Mock;
const mockDel = del as jest.Mock;
const mockPost = post as jest.Mock;
const mockPatch = patch as jest.Mock;
const mockAddToast = addToast as jest.Mock;

let capturedCreateModalProps: any = {};
let capturedEditModalProps: any = {};

jest.mock("@/components/tables/DataTable", () => ({
  DataTable: (props: any) => {
    const { items = [], columns = [], topActions = [], rowActions = [], ariaLabel, pagination } = props;
    return (
      <div data-testid="data-table" aria-label={ariaLabel}>
        {topActions.map((a: any, i: number) => (
          <button key={i} data-testid={`top-${i}`} onClick={a.onClick}>{a.label}</button>
        ))}
        {items.map((item: any, i: number) => (
          <div key={i} data-testid={`row-${i}`}>
            {columns.map((col: any) => (
              <span key={col.key} data-testid={`cell-${i}-${col.key}`}>
                {col.render ? col.render(item) : null}
              </span>
            ))}
            {rowActions?.map((a: any, j: number) => (
              <button key={j} data-testid={`row-${i}-action-${j}`} onClick={() => a.onClick?.(item)}>{a.label}</button>
            ))}
          </div>
        ))}
        {pagination && (
          <>
            <button data-testid="pagination-change" onClick={() => pagination.onChange(2)}>Next Page</button>
            <button data-testid="pagination-size" onClick={() => pagination.onPageSizeChange?.(20)}>Change Size</button>
          </>
        )}
      </div>
    );
  },
}));
jest.mock("@/components/modals/ConfirmationModal", () => ({
  ConfirmationModal: ({ isOpen, onConfirm }: any) =>
    isOpen ? <div data-testid="confirm-modal"><button onClick={onConfirm}>Confirm</button></div> : null,
}));
jest.mock("@/components/modals/financial/poai-ppa/CreatePoaiPpaModal", () => ({
  CreatePoaiPpaModal: (props: any) => { capturedCreateModalProps = props; return null; },
}));
jest.mock("@/components/modals/financial/poai-ppa/EditPoaiPpaModal", () => ({
  EditPoaiPpaModal: (props: any) => { capturedEditModalProps = props; return null; },
}));
jest.mock("@/components/modals/financial/poai-ppa/ViewPoaiPpaModal", () => ({ ViewPoaiPpaModal: () => null }));

jest.mock("@/lib/endpoints", () => ({
  endpoints: {
    financial: {
      poaiPpa: "/api/poai-ppa",
      projectsSelect: "/api/projects",
    },
  },
}));

import { PoaiPpaTableTab } from "@/app/dashboard/financial/poai-ppa/PoaiPpaTableTab";

const RECORDS_URL = "/api/poai-ppa";
const PROJECTS_URL = "/api/projects";

const mockData = {
  data: [
    { id: "pp1", projectCode: "P-001", year: 2024, projectedPoai: "5000000", assignedPoai: "3000000", project: { name: "Project A" }, createAt: "2024-01-01T00:00:00.000Z" },
  ],
  meta: { total: 1, page: 1, limit: 5, totalPages: 1 },
};

const fullRecord = { ...mockData.data[0], note: "details" };

/** Route GET calls by URL: projectsSelect → empty list, poaiPpa → mockData, individual record → fullRecord */
const defaultImpl = (url: string): Promise<any> => {
  if (url.startsWith(PROJECTS_URL)) return Promise.resolve({ data: [] });
  if (url.includes(`${RECORDS_URL}/pp1`)) return Promise.resolve(fullRecord);
  return Promise.resolve(mockData);
};

describe("PoaiPpaTableTab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockReset();
    mockDel.mockReset();
    mockPost.mockReset();
    mockPatch.mockReset();
    capturedCreateModalProps = {};
    capturedEditModalProps = {};
    mockGet.mockImplementation(defaultImpl);
    mockDel.mockResolvedValue(undefined);
    mockPost.mockResolvedValue({});
    mockPatch.mockResolvedValue({});
  });

  it("renders data table with fetched items", async () => {
    render(<PoaiPpaTableTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
  });

  it("renders column cells via col.render", async () => {
    render(<PoaiPpaTableTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    expect(screen.getByTestId("cell-0-projectedPoai").textContent).not.toBe("");
    expect(screen.getByTestId("cell-0-assignedPoai").textContent).not.toBe("");
    expect(screen.getByTestId("cell-0-project.name").textContent).toContain("Project A");
    expect(screen.getByTestId("cell-0-createAt").textContent).not.toBe("");
  });

  it("renders N/A for missing project name", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.startsWith(PROJECTS_URL)) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [{ ...mockData.data[0], project: null }], meta: mockData.meta });
    });
    render(<PoaiPpaTableTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    expect(screen.getByTestId("cell-0-project.name").textContent).toBe("N/A");
  });

  it("onViewRecord - calls get for full record", async () => {
    render(<PoaiPpaTableTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-0"));
    // 3rd call should be the individual record fetch (1=projects, 2=records, 3=individual)
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("/pp1")));
  });

  it("onViewRecord error shows danger toast", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.startsWith(PROJECTS_URL)) return Promise.resolve({ data: [] });
      if (url.includes(`${RECORDS_URL}/pp1`)) return Promise.reject({ data: { errors: { code: "NOT_FOUND" } } });
      return Promise.resolve(mockData);
    });
    render(<PoaiPpaTableTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-0"));
    await waitFor(() => expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" })));
  });

  it("onEditRecord success sets record in EditModal", async () => {
    render(<PoaiPpaTableTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-1"));
    await waitFor(() => expect(capturedEditModalProps.record?.id).toBe("pp1"));
  });

  it("onEditRecord error shows danger toast", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.startsWith(PROJECTS_URL)) return Promise.resolve({ data: [] });
      if (url.includes(`${RECORDS_URL}/pp1`)) return Promise.reject({ data: { errors: { code: "ERR" } } });
      return Promise.resolve(mockData);
    });
    render(<PoaiPpaTableTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-1"));
    await waitFor(() => expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" })));
  });

  it("onSaveRecord calls patch and shows success toast", async () => {
    render(<PoaiPpaTableTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-1"));
    await waitFor(() => expect(capturedEditModalProps.record?.id).toBe("pp1"));
    await act(async () => {
      await capturedEditModalProps.onSave({ projectedPoai: 6000000, assignedPoai: 4000000 });
    });
    expect(mockPatch).toHaveBeenCalledWith(expect.stringContaining("pp1"), expect.objectContaining({ projectedPoai: 6000000 }));
    expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "success" }));
  });

  it("onSaveRecord error shows danger toast", async () => {
    mockPatch.mockRejectedValueOnce({ data: { errors: { code: "ERR" } } });
    render(<PoaiPpaTableTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-1"));
    await waitFor(() => expect(capturedEditModalProps.record?.id).toBe("pp1"));
    await act(async () => {
      await capturedEditModalProps.onSave({ projectedPoai: 1, assignedPoai: 1 });
    });
    expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }));
  });

  it("clicks create top action - opens CreatePoaiPpaModal", async () => {
    render(<PoaiPpaTableTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Crear"));
    await waitFor(() => expect(capturedCreateModalProps.isOpen).toBe(true));
  });

  it("onCreateRecord calls post and shows success toast", async () => {
    render(<PoaiPpaTableTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Crear"));
    await waitFor(() => expect(capturedCreateModalProps.isOpen).toBe(true));
    await act(async () => {
      await capturedCreateModalProps.onSave({ projectId: "p1", projectCode: "P-001", year: 2025, projectedPoai: 1000000, assignedPoai: 800000 });
    });
    expect(mockPost).toHaveBeenCalled();
    expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "success" }));
  });

  it("onCreateRecord error shows danger toast", async () => {
    mockPost.mockRejectedValueOnce({ data: { errors: { code: "CONFLICT" } } });
    render(<PoaiPpaTableTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Crear"));
    await waitFor(() => expect(capturedCreateModalProps.isOpen).toBe(true));
    await act(async () => {
      await capturedCreateModalProps.onSave({ projectId: "p1", projectCode: "P-001", year: 2025, projectedPoai: 100, assignedPoai: 80 });
    });
    expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }));
  });

  it("clicks delete and confirms", async () => {
    render(<PoaiPpaTableTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-2"));
    await waitFor(() => expect(screen.getByTestId("confirm-modal")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Confirm"));
    await waitFor(() => expect(mockDel).toHaveBeenCalled());
    expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "success" }));
  });

  it("handles delete error shows danger toast", async () => {
    mockDel.mockRejectedValueOnce({ data: { errors: { code: "ERR" } } });
    render(<PoaiPpaTableTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-2"));
    await waitFor(() => expect(screen.getByTestId("confirm-modal")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Confirm"));
    await waitFor(() => expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" })));
  });

  it("clicks refresh top action", async () => {
    render(<PoaiPpaTableTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    const callsBefore = mockGet.mock.calls.length;
    fireEvent.click(screen.getByText("Actualizar"));
    await waitFor(() => expect(mockGet.mock.calls.length).toBeGreaterThan(callsBefore));
  });

  it("shows error state with Reintentar button on fetch error", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.startsWith(PROJECTS_URL)) return Promise.resolve({ data: [] });
      return Promise.reject(new Error("network fail"));
    });
    render(<PoaiPpaTableTab />);
    await waitFor(() => expect(screen.getByText("Reintentar")).toBeInTheDocument());
  });

  it("Reintentar refetches data", async () => {
    let recordCallCount = 0;
    mockGet.mockImplementation((url: string) => {
      if (url.startsWith(PROJECTS_URL)) return Promise.resolve({ data: [] });
      recordCallCount++;
      if (recordCallCount === 1) return Promise.reject(new Error("first fail"));
      return Promise.resolve(mockData);
    });
    render(<PoaiPpaTableTab />);
    await waitFor(() => expect(screen.getByText("Reintentar")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Reintentar"));
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
  });

  it("pagination page change triggers refetch", async () => {
    render(<PoaiPpaTableTab />);
    await waitFor(() => expect(screen.getByTestId("pagination-change")).toBeInTheDocument());
    const callsBefore = mockGet.mock.calls.length;
    fireEvent.click(screen.getByTestId("pagination-change"));
    await waitFor(() => expect(mockGet.mock.calls.length).toBeGreaterThan(callsBefore));
  });

  it("pagination size change triggers refetch", async () => {
    render(<PoaiPpaTableTab />);
    await waitFor(() => expect(screen.getByTestId("pagination-size")).toBeInTheDocument());
    const callsBefore = mockGet.mock.calls.length;
    fireEvent.click(screen.getByTestId("pagination-size"));
    await waitFor(() => expect(mockGet.mock.calls.length).toBeGreaterThan(callsBefore));
  });
});
