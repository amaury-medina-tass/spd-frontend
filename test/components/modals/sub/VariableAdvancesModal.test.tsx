import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import { VariableAdvancesModal } from "@/components/modals/sub/VariableAdvancesModal";
import { addToast } from "@heroui/toast";

const mockGetByAction = jest.fn();
const mockGetByIndicative = jest.fn();
const mockCreateVariableAdvance = jest.fn();
const mockGetCommunesSelect = jest.fn();

jest.mock("@/services/sub/variable-advances.service", () => ({
  getVariableAdvancesByActionIndicator: (...args: any[]) => mockGetByAction(...args),
  getVariableAdvancesByIndicativeIndicator: (...args: any[]) => mockGetByIndicative(...args),
  createVariableAdvance: (...args: any[]) => mockCreateVariableAdvance(...args),
}));
jest.mock("@/services/masters/communes.service", () => ({
  getCommunesSelect: (...args: any[]) => mockGetCommunesSelect(...args),
}));
jest.mock("@/hooks/useDebounce", () => ({
  useDebounce: (value: string) => value,
}));

// Full @heroui/react mock with Tabs supporting items + render function
jest.mock("@heroui/react", () => {
  const React = require("react");
  return {
    Modal: ({ isOpen, children }: any) =>
      isOpen ? <div role="dialog">{children}</div> : null,
    ModalContent: ({ children }: any) => (
      <div>{typeof children === "function" ? children(() => {}) : children}</div>
    ),
    ModalHeader: ({ children }: any) => <div>{children}</div>,
    ModalBody: ({ children }: any) => <div>{children}</div>,
    ModalFooter: ({ children }: any) => <div>{children}</div>,
    Button: React.forwardRef(
      ({ children, onPress, startContent, endContent, isLoading, isDisabled, ...r }: any, ref: any) => (
        <button ref={ref} onClick={onPress} disabled={isDisabled || isLoading} {...r}>
          {isLoading && <span data-testid="button-loader" />}
          {startContent}{children}{endContent}
        </button>
      )
    ),
    Input: React.forwardRef(
      ({ label, onValueChange, startContent, isInvalid, errorMessage, classNames, endContent, ...r }: any, ref: any) => (
        <div>
          {label && <label>{label}</label>}
          {startContent}
          <input ref={ref} aria-label={label} onChange={(e: any) => onValueChange?.(e.target.value)} {...r} />
          {isInvalid && errorMessage && <span role="alert">{errorMessage}</span>}
          {endContent}
        </div>
      )
    ),
    Select: ({ children, label, onChange, onSelectionChange, isInvalid, errorMessage, selectedKeys, selectionMode, description, isLoading, renderValue, className, ...r }: any) => (
      <div>
        {label && <label>{label}</label>}
        <select
          aria-label={label}
          onChange={(e: any) => {
            if (selectionMode === "multiple" && onSelectionChange) {
              onSelectionChange(new Set([e.target.value]));
            } else if (onChange) {
              onChange(e);
            }
          }}
          value={selectionMode === "multiple" ? undefined : (selectedKeys?.[0] ?? "")}
          {...r}
        >
          {children}
        </select>
        {isInvalid && errorMessage && <span role="alert">{errorMessage}</span>}
        {description && <span>{description}</span>}
      </div>
    ),
    SelectItem: ({ children, ...props }: any) => <option {...props}>{children}</option>,
    Tabs: ({ children, items }: any) => {
      if (typeof children === "function" && items) {
        return (
          <div data-testid="tabs">
            {items.map((item: any, i: number) => {
              const el = children(item);
              return React.cloneElement(el, { key: item.id || item.variableId || i });
            })}
          </div>
        );
      }
      return <div data-testid="tabs">{children}</div>;
    },
    Tab: ({ children, title }: any) => (
      <div>
        <span data-testid="tab-title">{title}</span>
        {children}
      </div>
    ),
    Table: ({ children }: any) => <table>{children}</table>,
    TableHeader: ({ children }: any) => <thead><tr>{children}</tr></thead>,
    TableColumn: ({ children }: any) => <th>{children}</th>,
    TableBody: ({ children }: any) => <tbody>{children}</tbody>,
    TableRow: ({ children }: any) => <tr>{children}</tr>,
    TableCell: ({ children }: any) => <td>{children}</td>,
    Pagination: ({ total, page, onChange }: any) => (
      <nav data-testid="pagination">
        <button onClick={() => onChange?.(page + 1)}>Next</button>
      </nav>
    ),
    Textarea: React.forwardRef(
      ({ label, onValueChange, ...r }: any, ref: any) => (
        <div>
          {label && <label>{label}</label>}
          <textarea ref={ref} aria-label={label} onChange={(e: any) => onValueChange?.(e.target.value)} {...r} />
        </div>
      )
    ),
    Tooltip: ({ children, content }: any) => <div title={content}>{children}</div>,
    Chip: ({ children }: any) => <span>{children}</span>,
  };
});

const emptyPaginated = { data: [], meta: { total: 0, page: 1, limit: 5, totalPages: 0 } };

const sampleData = {
  data: [
    {
      variableId: "var1",
      variableCode: "V-001",
      variableName: "Inversión Social",
      calculatedValue: 1500,
      lastCalculationDate: "2024-06-15T10:30:00Z",
      advances: [
        { id: "adv1", month: 1, value: 500, createAt: "2024-01-10T00:00:00Z", observations: "Proyecto aprobado" },
        { id: "adv2", month: 3, value: 300, createAt: "2024-03-15T00:00:00Z", observations: "" },
      ],
    },
  ],
  meta: { total: 1, page: 1, limit: 5, totalPages: 1 },
};

const multiPageData = {
  data: sampleData.data,
  meta: { total: 12, page: 1, limit: 5, totalPages: 3 },
};

const dataNoAdvances = {
  data: [
    {
      variableId: "var2",
      variableCode: "V-002",
      variableName: "Variable Sin Avances",
      calculatedValue: 0,
      lastCalculationDate: "2024-01-01T00:00:00Z",
      advances: [],
    },
  ],
  meta: { total: 1, page: 1, limit: 5, totalPages: 1 },
};

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  indicatorId: "i1",
  indicatorCode: "IND-001",
  type: "action" as const,
};

describe("VariableAdvancesModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetByAction.mockResolvedValue(emptyPaginated);
    mockGetByIndicative.mockResolvedValue(emptyPaginated);
    mockCreateVariableAdvance.mockResolvedValue({});
    mockGetCommunesSelect.mockResolvedValue({ data: [] });
  });

  // ---- Basic rendering ----

  it("renders when open", () => {
    render(<VariableAdvancesModal {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(<VariableAdvancesModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows indicatorCode in header", () => {
    render(<VariableAdvancesModal {...defaultProps} />);
    expect(screen.getByText(/IND-001/)).toBeInTheDocument();
  });

  it("renders dialog without indicatorCode", () => {
    render(<VariableAdvancesModal {...defaultProps} indicatorCode={undefined} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  // ---- Data fetching ----

  it("calls getVariableAdvancesByActionIndicator when type is action", async () => {
    render(<VariableAdvancesModal {...defaultProps} type="action" />);
    await waitFor(() => expect(mockGetByAction).toHaveBeenCalledWith("i1", expect.any(String)));
  });

  it("calls getVariableAdvancesByIndicativeIndicator when type is indicative", async () => {
    render(<VariableAdvancesModal {...defaultProps} type="indicative" />);
    await waitFor(() => expect(mockGetByIndicative).toHaveBeenCalledWith("i1", expect.any(String)));
  });

  it("does not fetch when indicatorId is null", async () => {
    render(<VariableAdvancesModal {...defaultProps} indicatorId={null} />);
    await waitFor(() => expect(mockGetByAction).not.toHaveBeenCalled());
  });

  it("fetches communes on open", async () => {
    render(<VariableAdvancesModal {...defaultProps} />);
    await waitFor(() => expect(mockGetCommunesSelect).toHaveBeenCalled());
  });

  it("handles fetch error and shows toast", async () => {
    mockGetByAction.mockRejectedValue(new Error("Server error"));
    render(<VariableAdvancesModal {...defaultProps} />);
    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Error", color: "danger" })
      )
    );
  });

  it("shows loading state during fetch", () => {
    mockGetByAction.mockReturnValue(new Promise(() => {}));
    render(<VariableAdvancesModal {...defaultProps} />);
    expect(screen.getByTestId("icon-Loader2")).toBeInTheDocument();
  });

  // ---- UI elements ----

  it("renders search input placeholder", () => {
    render(<VariableAdvancesModal {...defaultProps} />);
    expect(screen.getByPlaceholderText(/buscar variable/i)).toBeInTheDocument();
  });

  it("renders year select", () => {
    render(<VariableAdvancesModal {...defaultProps} />);
    expect(screen.getByLabelText("Año del Avance")).toBeInTheDocument();
  });

  it("renders Cerrar button", () => {
    render(<VariableAdvancesModal {...defaultProps} />);
    expect(screen.getByText("Cerrar")).toBeInTheDocument();
  });

  // ---- Empty state ----

  it("shows empty state when no variables found", async () => {
    render(<VariableAdvancesModal {...defaultProps} />);
    await waitFor(() => expect(mockGetByAction).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByText("No se encontraron variables")).toBeInTheDocument());
  });

  // ---- Tabs with data ----

  it("renders variable details when data is loaded", async () => {
    mockGetByAction.mockResolvedValue(sampleData);
    render(<VariableAdvancesModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("Inversión Social")).toBeInTheDocument());
  });

  it("renders variable code as tab title", async () => {
    mockGetByAction.mockResolvedValue(sampleData);
    render(<VariableAdvancesModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("V-001")).toBeInTheDocument());
  });

  it("renders calculated value", async () => {
    mockGetByAction.mockResolvedValue(sampleData);
    render(<VariableAdvancesModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("1500")).toBeInTheDocument());
  });

  it("renders Registrar Avance button", async () => {
    mockGetByAction.mockResolvedValue(sampleData);
    render(<VariableAdvancesModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("Registrar Avance")).toBeInTheDocument());
  });

  it("renders advances table with month and value", async () => {
    mockGetByAction.mockResolvedValue(sampleData);
    render(<VariableAdvancesModal {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText("Enero")).toBeInTheDocument();
      expect(screen.getByText("500")).toBeInTheDocument();
      expect(screen.getByText("Marzo")).toBeInTheDocument();
      expect(screen.getByText("300")).toBeInTheDocument();
    });
  });

  it("renders table headers", async () => {
    mockGetByAction.mockResolvedValue(sampleData);
    render(<VariableAdvancesModal {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText("MES")).toBeInTheDocument();
      expect(screen.getByText("VALOR")).toBeInTheDocument();
      expect(screen.getByText("FECHA REPORTE")).toBeInTheDocument();
      expect(screen.getByText("OBSERVACIONES")).toBeInTheDocument();
      expect(screen.getByText("ACCIONES")).toBeInTheDocument();
    });
  });

  it("shows dash for empty observations", async () => {
    mockGetByAction.mockResolvedValue(sampleData);
    render(<VariableAdvancesModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("—")).toBeInTheDocument());
  });

  it("shows observation text in advances table", async () => {
    mockGetByAction.mockResolvedValue(sampleData);
    render(<VariableAdvancesModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("Proyecto aprobado")).toBeInTheDocument());
  });

  it("shows no-advances message when variable has empty advances", async () => {
    mockGetByAction.mockResolvedValue(dataNoAdvances);
    render(<VariableAdvancesModal {...defaultProps} />);
    const year = new Date().getFullYear();
    await waitFor(() =>
      expect(screen.getByText(`No hay avances registrados para ${year}.`)).toBeInTheDocument()
    );
  });

  // ---- Eye button / Observations modal ----

  it("renders eye button only for advances with observations", async () => {
    mockGetByAction.mockResolvedValue(sampleData);
    render(<VariableAdvancesModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByTestId("icon-Eye")).toBeInTheDocument());
    expect(screen.getAllByTestId("icon-Eye")).toHaveLength(1);
  });

  it("opens observations modal on eye button click", async () => {
    mockGetByAction.mockResolvedValue(sampleData);
    render(<VariableAdvancesModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByTestId("icon-Eye")).toBeInTheDocument());

    fireEvent.click(screen.getByTestId("icon-Eye").closest("button")!);
    await waitFor(() => {
      expect(screen.getByText("Observaciones del Avance")).toBeInTheDocument();
      expect(screen.getByText("Entendido")).toBeInTheDocument();
    });
  });

  it("closes observations modal on Entendido click", async () => {
    mockGetByAction.mockResolvedValue(sampleData);
    render(<VariableAdvancesModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByTestId("icon-Eye")).toBeInTheDocument());

    fireEvent.click(screen.getByTestId("icon-Eye").closest("button")!);
    await waitFor(() => expect(screen.getByText("Entendido")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Entendido"));
    await waitFor(() =>
      expect(screen.queryByText("Observaciones del Avance")).not.toBeInTheDocument()
    );
  });

  // ---- Create Advance modal ----

  it("opens create modal on Registrar Avance click", async () => {
    mockGetByAction.mockResolvedValue(sampleData);
    render(<VariableAdvancesModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("Registrar Avance")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Registrar Avance"));
    await waitFor(() => {
      expect(screen.getByText("Registrar Nuevo Avance")).toBeInTheDocument();
      expect(screen.getByText("Guardar Avance")).toBeInTheDocument();
      expect(screen.getByText("Cancelar")).toBeInTheDocument();
    });
  });

  it("renders form fields in create modal", async () => {
    mockGetByAction.mockResolvedValue(sampleData);
    render(<VariableAdvancesModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("Registrar Avance")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Registrar Avance"));

    await waitFor(() => {
      expect(screen.getByLabelText("Mes")).toBeInTheDocument();
      expect(screen.getByLabelText("Valor")).toBeInTheDocument();
      expect(screen.getByLabelText("Observaciones")).toBeInTheDocument();
      expect(screen.getByLabelText("Comunas / Corregimientos (Opcional)")).toBeInTheDocument();
    });
  });

  it("shows validation error for missing value", async () => {
    mockGetByAction.mockResolvedValue(sampleData);
    render(<VariableAdvancesModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("Registrar Avance")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Registrar Avance"));
    await waitFor(() => expect(screen.getByText("Guardar Avance")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Guardar Avance"));
    await waitFor(() =>
      expect(screen.getByText("El valor es obligatorio")).toBeInTheDocument()
    );
  });

  it("shows validation error for missing month", async () => {
    mockGetByAction.mockResolvedValue(sampleData);
    render(<VariableAdvancesModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("Registrar Avance")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Registrar Avance"));
    await waitFor(() => expect(screen.getByText("Guardar Avance")).toBeInTheDocument());

    // Clear month & set value
    fireEvent.change(screen.getByLabelText("Mes"), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText("Valor"), { target: { value: "100" } });

    fireEvent.click(screen.getByText("Guardar Avance"));
    await waitFor(() =>
      expect(screen.getByText("El mes es obligatorio")).toBeInTheDocument()
    );
  });

  it("submits advance successfully", async () => {
    mockGetByAction.mockResolvedValue(sampleData);
    mockCreateVariableAdvance.mockResolvedValue({});
    render(<VariableAdvancesModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("Registrar Avance")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Registrar Avance"));
    await waitFor(() => expect(screen.getByText("Guardar Avance")).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText("Valor"), { target: { value: "250" } });

    await act(async () => {
      fireEvent.click(screen.getByText("Guardar Avance"));
    });

    await waitFor(() => {
      expect(mockCreateVariableAdvance).toHaveBeenCalledWith(
        expect.objectContaining({
          variableId: "var1",
          value: 250,
          year: new Date().getFullYear(),
        })
      );
      expect(addToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Éxito", color: "success" })
      );
    });
  });

  it("handles create advance error", async () => {
    mockGetByAction.mockResolvedValue(sampleData);
    mockCreateVariableAdvance.mockRejectedValue(new Error("Create failed"));
    render(<VariableAdvancesModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("Registrar Avance")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Registrar Avance"));
    await waitFor(() => expect(screen.getByText("Guardar Avance")).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText("Valor"), { target: { value: "100" } });

    await act(async () => {
      fireEvent.click(screen.getByText("Guardar Avance"));
    });

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Error", description: "Create failed", color: "danger" })
      )
    );
  });

  it("closes create modal on Cancelar click", async () => {
    mockGetByAction.mockResolvedValue(sampleData);
    render(<VariableAdvancesModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("Registrar Avance")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Registrar Avance"));
    await waitFor(() => expect(screen.getByText("Registrar Nuevo Avance")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Cancelar"));
    await waitFor(() =>
      expect(screen.queryByText("Registrar Nuevo Avance")).not.toBeInTheDocument()
    );
  });

  it("clears value error when typing", async () => {
    mockGetByAction.mockResolvedValue(sampleData);
    render(<VariableAdvancesModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("Registrar Avance")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Registrar Avance"));
    await waitFor(() => expect(screen.getByText("Guardar Avance")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Guardar Avance"));
    await waitFor(() => expect(screen.getByText("El valor es obligatorio")).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText("Valor"), { target: { value: "50" } });
    await waitFor(() =>
      expect(screen.queryByText("El valor es obligatorio")).not.toBeInTheDocument()
    );
  });

  it("clears month error when selecting month", async () => {
    mockGetByAction.mockResolvedValue(sampleData);
    render(<VariableAdvancesModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("Registrar Avance")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Registrar Avance"));
    await waitFor(() => expect(screen.getByText("Guardar Avance")).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText("Mes"), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText("Valor"), { target: { value: "100" } });
    fireEvent.click(screen.getByText("Guardar Avance"));
    await waitFor(() => expect(screen.getByText("El mes es obligatorio")).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText("Mes"), { target: { value: "6" } });
    await waitFor(() =>
      expect(screen.queryByText("El mes es obligatorio")).not.toBeInTheDocument()
    );
  });

  it("fills observations textarea in create modal", async () => {
    mockGetByAction.mockResolvedValue(sampleData);
    render(<VariableAdvancesModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("Registrar Avance")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Registrar Avance"));
    await waitFor(() => expect(screen.getByLabelText("Observaciones")).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText("Observaciones"), { target: { value: "Test obs" } });
    // No error — observations is optional
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  // ---- Pagination ----

  it("shows pagination when multiple pages", async () => {
    mockGetByAction.mockResolvedValue(multiPageData);
    render(<VariableAdvancesModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByTestId("pagination")).toBeInTheDocument());
  });

  it("does not show pagination for single page", async () => {
    mockGetByAction.mockResolvedValue(sampleData);
    render(<VariableAdvancesModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("V-001")).toBeInTheDocument());
    expect(screen.queryByTestId("pagination")).not.toBeInTheDocument();
  });

  // ---- Search ----

  it("passes search in params when searching", async () => {
    render(<VariableAdvancesModal {...defaultProps} />);
    await waitFor(() => expect(mockGetByAction).toHaveBeenCalled());

    const searchInput = screen.getByPlaceholderText(/buscar variable/i);
    fireEvent.change(searchInput, { target: { value: "social" } });

    await waitFor(() => {
      const lastCall = mockGetByAction.mock.calls[mockGetByAction.mock.calls.length - 1];
      expect(lastCall[1]).toContain("search=social");
    });
  });

  // ---- Year change ----

  it("refetches with new year on select change", async () => {
    render(<VariableAdvancesModal {...defaultProps} />);
    await waitFor(() => expect(mockGetByAction).toHaveBeenCalled());

    const yearSelect = screen.getByLabelText("Año del Avance");
    fireEvent.change(yearSelect, { target: { value: "2023" } });

    await waitFor(() => {
      const lastCall = mockGetByAction.mock.calls[mockGetByAction.mock.calls.length - 1];
      expect(lastCall[1]).toContain("year=2023");
    });
  });

  // ---- Reset on close ----

  it("resets state when modal closes", () => {
    const { rerender } = render(<VariableAdvancesModal {...defaultProps} />);
    rerender(<VariableAdvancesModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  // ---- Communes error handling ----

  it("handles communes fetch error gracefully", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockGetCommunesSelect.mockRejectedValue(new Error("Communes error"));
    render(<VariableAdvancesModal {...defaultProps} />);
    await waitFor(() => expect(mockGetCommunesSelect).toHaveBeenCalled());
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    consoleSpy.mockRestore();
  });
});
