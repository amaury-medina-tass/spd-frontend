import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import { BudgetModificationHistoryModal } from "@/components/modals/masters/activities/detailed/BudgetModificationHistoryModal";

// Capture all CleanTable props for direct testing
let capturedCleanTableProps: any = null;
jest.mock("@/components/tables/CleanTable", () => ({
  CleanTable: (props: any) => {
    capturedCleanTableProps = props;
    return <div>CleanTable</div>;
  },
}));

jest.mock("@/lib/endpoints", () => ({
  endpoints: {
    masters: { budgetModifications: "/budget-modifications" },
  },
}));

const makeModification = (overrides: Partial<any> = {}): any => ({
  id: "mod1",
  modificationType: "ADDITION",
  value: "500000",
  previousBalance: "1000000",
  newBalance: "1500000",
  dateIssue: "2024-03-15T00:00:00Z",
  legalDocument: "Res. 001",
  description: "Adición de presupuesto",
  createdAt: "2024-03-16T10:00:00Z",
  previousRubric: null,
  newRubric: null,
  ...overrides,
});

describe("BudgetModificationHistoryModal", () => {
  const defaultProps = {
    isOpen: true,
    detailedActivityId: "da1",
    detailedActivityName: "Activity A",
    onClose: jest.fn(),
  };

  beforeEach(() => {
    capturedCleanTableProps = null;
    const { get } = require("@/lib/http");
    get.mockResolvedValue({ data: [makeModification()], meta: { total: 1, page: 1, limit: 5, totalPages: 1 } });
  });

  it("renders when open", () => {
    render(<BudgetModificationHistoryModal {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(<BudgetModificationHistoryModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows modal header", () => {
    render(<BudgetModificationHistoryModal {...defaultProps} />);
    expect(screen.getByText("Historial de Modificaciones")).toBeInTheDocument();
  });

  it("shows activity name", () => {
    render(<BudgetModificationHistoryModal {...defaultProps} />);
    expect(screen.getByText("Activity A")).toBeInTheDocument();
  });

  it("renders CleanTable", () => {
    render(<BudgetModificationHistoryModal {...defaultProps} />);
    expect(screen.getByText("CleanTable")).toBeInTheDocument();
  });

  it("calls get with detailedActivityId on open (covers setItems/setMeta lines 68, 82-83)", async () => {
    const { get } = require("@/lib/http");
    render(<BudgetModificationHistoryModal {...defaultProps} />);
    await waitFor(() => expect(get).toHaveBeenCalledWith(expect.stringContaining("da1")));
  });

  it("handles fetch error gracefully (covers error catch path)", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const { get } = require("@/lib/http");
    get.mockRejectedValueOnce(new Error("fetch failed"));
    render(<BudgetModificationHistoryModal {...defaultProps} />);
    await waitFor(() =>
      expect(consoleSpy).toHaveBeenCalledWith("Error fetching history:", expect.any(Error))
    );
    consoleSpy.mockRestore();
  });

  it("renderCell: ADDITION type shows 'Adición' chip (covers lines 87+)", async () => {
    render(<BudgetModificationHistoryModal {...defaultProps} />);
    await waitFor(() => expect(capturedCleanTableProps?.renderCell).not.toBeNull());
    const result = capturedCleanTableProps.renderCell(makeModification({ modificationType: "ADDITION" }), "modificationType");
    const { getByText } = render(<>{result}</>);
    expect(getByText("Adición")).toBeInTheDocument();
  });

  it("renderCell: REDUCTION type shows 'Reducción' chip", async () => {
    render(<BudgetModificationHistoryModal {...defaultProps} />);
    await waitFor(() => expect(capturedCleanTableProps?.renderCell).not.toBeNull());
    const result = capturedCleanTableProps.renderCell(makeModification({ modificationType: "REDUCTION" }), "modificationType");
    const { getByText } = render(<>{result}</>);
    expect(getByText("Reducción")).toBeInTheDocument();
  });

  it("renderCell: TRANSFER type shows 'Traslado' chip", async () => {
    render(<BudgetModificationHistoryModal {...defaultProps} />);
    await waitFor(() => expect(capturedCleanTableProps?.renderCell).not.toBeNull());
    const result = capturedCleanTableProps.renderCell(makeModification({ modificationType: "TRANSFER" }), "modificationType");
    const { getByText } = render(<>{result}</>);
    expect(getByText("Traslado")).toBeInTheDocument();
  });

  it("renderCell: rubricInfo for TRANSFER shows previousRubric and newRubric", async () => {
    render(<BudgetModificationHistoryModal {...defaultProps} />);
    await waitFor(() => expect(capturedCleanTableProps?.renderCell).not.toBeNull());
    const item = makeModification({
      modificationType: "TRANSFER",
      previousRubric: { code: "RUB-OLD", accountName: "Old Rubric" },
      newRubric: { code: "RUB-NEW", accountName: "New Rubric" },
    });
    const result = capturedCleanTableProps.renderCell(item, "rubricInfo");
    const { getByText } = render(<>{result}</>);
    expect(getByText("RUB-OLD")).toBeInTheDocument();
    expect(getByText("RUB-NEW")).toBeInTheDocument();
  });

  it("renderCell: rubricInfo for non-TRANSFER returns dash", async () => {
    render(<BudgetModificationHistoryModal {...defaultProps} />);
    await waitFor(() => expect(capturedCleanTableProps?.renderCell).not.toBeNull());
    const result = capturedCleanTableProps.renderCell(makeModification({ modificationType: "ADDITION" }), "rubricInfo");
    const { getByText } = render(<>{result}</>);
    expect(getByText("-")).toBeInTheDocument();
  });

  it("renderCell: value renders formatted currency", async () => {
    render(<BudgetModificationHistoryModal {...defaultProps} />);
    await waitFor(() => expect(capturedCleanTableProps?.renderCell).not.toBeNull());
    const result = capturedCleanTableProps.renderCell(makeModification({ value: "2000000" }), "value");
    const { getByText } = render(<>{result}</>);
    expect(getByText(/2\.000\.000/)).toBeInTheDocument();
  });

  it("renderCell: dateIssue renders date", async () => {
    render(<BudgetModificationHistoryModal {...defaultProps} />);
    await waitFor(() => expect(capturedCleanTableProps?.renderCell).not.toBeNull());
    const result = capturedCleanTableProps.renderCell(makeModification({ dateIssue: "2024-03-15T00:00:00Z" }), "dateIssue");
    const { container } = render(<>{result}</>);
    expect(container.textContent).toBeTruthy();
  });

  it("renderCell: legalDocument renders the document text", async () => {
    render(<BudgetModificationHistoryModal {...defaultProps} />);
    await waitFor(() => expect(capturedCleanTableProps?.renderCell).not.toBeNull());
    const result = capturedCleanTableProps.renderCell(makeModification({ legalDocument: "Res. 123" }), "legalDocument");
    const { getByText } = render(<>{result}</>);
    expect(getByText("Res. 123")).toBeInTheDocument();
  });

  it("renderCell: description renders description text", async () => {
    render(<BudgetModificationHistoryModal {...defaultProps} />);
    await waitFor(() => expect(capturedCleanTableProps?.renderCell).not.toBeNull());
    const result = capturedCleanTableProps.renderCell(makeModification({ description: "Test desc" }), "description");
    const { getByText } = render(<>{result}</>);
    expect(getByText("Test desc")).toBeInTheDocument();
  });

  it("renderCell: createdAt renders date", async () => {
    render(<BudgetModificationHistoryModal {...defaultProps} />);
    await waitFor(() => expect(capturedCleanTableProps?.renderCell).not.toBeNull());
    const result = capturedCleanTableProps.renderCell(makeModification({ createdAt: "2024-03-16T10:00:00Z" }), "createdAt");
    const { container } = render(<>{result}</>);
    expect(container.textContent).toBeTruthy();
  });

  it("shows total record count (covers JSX lines 215-222)", async () => {
    const { get } = require("@/lib/http");
    get.mockResolvedValue({ data: [makeModification()], meta: { total: 5, page: 1, limit: 5, totalPages: 2 } });
    render(<BudgetModificationHistoryModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText(/5 registro/)).toBeInTheDocument());
  });

  it("renderCell: previousBalance renders formatted currency (covers lines 136-140)", async () => {
    render(<BudgetModificationHistoryModal {...defaultProps} />);
    await waitFor(() => expect(capturedCleanTableProps?.renderCell).toBeDefined());
    const result = capturedCleanTableProps.renderCell(makeModification({ previousBalance: "1000000" }), "previousBalance");
    const { getByText } = render(<>{result}</>);
    expect(getByText(/1\.000\.000/)).toBeInTheDocument();
  });

  it("renderCell: newBalance renders formatted currency (covers lines 142-146)", async () => {
    render(<BudgetModificationHistoryModal {...defaultProps} />);
    await waitFor(() => expect(capturedCleanTableProps?.renderCell).toBeDefined());
    const result = capturedCleanTableProps.renderCell(makeModification({ newBalance: "1500000" }), "newBalance");
    const { getByText } = render(<>{result}</>);
    expect(getByText(/1\.500\.000/)).toBeInTheDocument();
  });

  it("renderCell: default case returns raw value (covers line 169)", async () => {
    render(<BudgetModificationHistoryModal {...defaultProps} />);
    await waitFor(() => expect(capturedCleanTableProps?.renderCell).toBeDefined());
    const result = capturedCleanTableProps.renderCell({ ...makeModification(), unknownField: "test123" }, "unknownField");
    expect(result).toBe("test123");
  });

  it("handleSortChange re-fetches with new descriptor (covers lines 82-83)", async () => {
    const { get } = require("@/lib/http");
    render(<BudgetModificationHistoryModal {...defaultProps} />);
    await waitFor(() => expect(capturedCleanTableProps?.onSortChange).toBeDefined());
    get.mockClear();
    await act(async () => { capturedCleanTableProps.onSortChange({ column: "value", direction: "descending" }); });
    await waitFor(() => expect(get).toHaveBeenCalled());
  });

  it("onPageChange updates page and re-fetches (covers lines 215-216)", async () => {
    const { get } = require("@/lib/http");
    render(<BudgetModificationHistoryModal {...defaultProps} />);
    await waitFor(() => expect(capturedCleanTableProps?.onPageChange).toBeDefined());
    get.mockClear();
    await act(async () => { capturedCleanTableProps.onPageChange(2); });
    await waitFor(() => expect(get).toHaveBeenCalled());
  });

  it("onLimitChange updates limit and re-fetches from page 1 (covers lines 219-222)", async () => {
    const { get } = require("@/lib/http");
    render(<BudgetModificationHistoryModal {...defaultProps} />);
    await waitFor(() => expect(capturedCleanTableProps?.onLimitChange).toBeDefined());
    get.mockClear();
    await act(async () => { capturedCleanTableProps.onLimitChange(10); });
    await waitFor(() => expect(get).toHaveBeenCalled());
  });
});
