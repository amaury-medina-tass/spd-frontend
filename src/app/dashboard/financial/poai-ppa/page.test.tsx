import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/test-utils";
import { addToast } from "@heroui/toast";
import { requestExport } from "@/services/exports.service";

jest.mock("./PoaiPpaTableTab", () => ({ PoaiPpaTableTab: () => <div data-testid="table-tab">TableTab</div> }));
jest.mock("./PoaiPpaChartsTab", () => ({ PoaiPpaChartsTab: () => <div data-testid="charts-tab">ChartsTab</div> }));

import PoaiPpaPage from "./page";

const mockAddToast = addToast as jest.Mock;
const mockExport = requestExport as jest.Mock;

describe("FinancialPoaiPpaPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockExport.mockResolvedValue({});
  });

  it("renders breadcrumbs", () => {
    renderWithProviders(<PoaiPpaPage />);
    expect(screen.getByText("POAI PPA")).toBeInTheDocument();
  });

  it("renders export button", () => {
    renderWithProviders(<PoaiPpaPage />);
    expect(screen.getByText("Exportar POAI PPA")).toBeInTheDocument();
  });

  it("renders without crashing", () => {
    const { container } = renderWithProviders(<PoaiPpaPage />);
    expect(container).toBeTruthy();
  });

  it("renders Financiero breadcrumb", () => {
    renderWithProviders(<PoaiPpaPage />);
    expect(screen.getByText("Financiero")).toBeInTheDocument();
  });

  it("shows Registro tab content by default", () => {
    renderWithProviders(<PoaiPpaPage />);
    expect(screen.getByTestId("table-tab")).toBeInTheDocument();
    expect(screen.queryByTestId("charts-tab")).not.toBeInTheDocument();
  });

  it("switches to Gráficas tab on click", () => {
    renderWithProviders(<PoaiPpaPage />);
    fireEvent.click(screen.getByText("Gráficas"));
    expect(screen.getByTestId("charts-tab")).toBeInTheDocument();
    expect(screen.queryByTestId("table-tab")).not.toBeInTheDocument();
  });

  it("switches back to Registro tab", () => {
    renderWithProviders(<PoaiPpaPage />);
    fireEvent.click(screen.getByText("Gráficas"));
    fireEvent.click(screen.getByText("Registro"));
    expect(screen.getByTestId("table-tab")).toBeInTheDocument();
  });

  it("export button calls requestExport and shows success toast", async () => {
    renderWithProviders(<PoaiPpaPage />);
    fireEvent.click(screen.getByText("Exportar POAI PPA"));
    await waitFor(() => expect(mockExport).toHaveBeenCalledWith(expect.objectContaining({ type: "POAI_PPA" })));
    await waitFor(() => expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "primary" })));
  });

  it("export error shows danger toast", async () => {
    mockExport.mockRejectedValueOnce(new Error("fail"));
    renderWithProviders(<PoaiPpaPage />);
    fireEvent.click(screen.getByText("Exportar POAI PPA"));
    await waitFor(() => expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" })));
  });

  it("shows access denied when canRead is false", () => {
    const { usePermissions } = require("@/hooks/usePermissions");
    (usePermissions as jest.Mock).mockReturnValueOnce({ canRead: false });
    renderWithProviders(<PoaiPpaPage />);
    expect(screen.getByText("Acceso Denegado")).toBeInTheDocument();
  });
});
