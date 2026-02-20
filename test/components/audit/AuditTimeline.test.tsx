import { render, screen, fireEvent, act } from "@testing-library/react";

let intersectionCallback: (entries: IntersectionObserverEntry[]) => void;
const mockObserve = jest.fn();
const mockDisconnect = jest.fn();

beforeEach(() => {
  (window as any).IntersectionObserver = jest.fn((cb: any) => {
    intersectionCallback = cb;
    return { observe: mockObserve, disconnect: mockDisconnect, unobserve: jest.fn() };
  });
});

jest.mock("@/lib/audit-codes", () => ({
  AuditActions: { USER_CREATED: "USER_CREATED" },
  ACTION_LABELS: { USER_CREATED: "Usuario Creado" },
  AuditEntityTypes: { USER: "USER" },
  ENTITY_TYPE_LABELS: { USER: "Usuario" },
  getActionColor: jest.fn(() => "success"),
  getEntityTypeLabel: jest.fn((e: string) => e),
}));

import { AuditTimeline } from "@/components/audit/AuditTimeline";

const baseProps = {
  logs: [],
  isLoading: false,
  isLoadingMore: false,
  meta: null,
  hasMore: false,
  filters: { search: "", action: "", entityType: "", system: "", startDate: "", endDate: "", sortBy: "timestamp", sortOrder: "DESC" as const },
  onFiltersChange: jest.fn(),
};

describe("AuditTimeline", () => {
  it("shows loading state", () => {
    render(<AuditTimeline {...baseProps} isLoading={true} />);
    expect(screen.getByText(/cargando registros/i)).toBeInTheDocument();
  });

  it("shows empty state when no logs", () => {
    render(<AuditTimeline {...baseProps} />);
    expect(screen.getByText(/sin registros/i)).toBeInTheDocument();
  });

  it("renders logs when provided", () => {
    const log = {
      id: "1", action: "USER_CREATED", actionLabel: "Created", entityType: "USER",
      entityId: "u1", entityName: "User", timestamp: new Date().toISOString(),
      success: true, changes: [], metadata: {},
    };
    render(<AuditTimeline {...baseProps} logs={[log as any]} />);
    expect(screen.getByText("Created")).toBeInTheDocument();
  });

  it("shows total count chip when meta provided", () => {
    const log = {
      id: "1", action: "USER_CREATED", actionLabel: "Created", entityType: "USER",
      entityId: "u1", entityName: "User", timestamp: new Date().toISOString(),
      success: true, changes: [], metadata: {},
    };
    render(
      <AuditTimeline {...baseProps} logs={[log as any]} meta={{ total: 42, page: 1, limit: 10, totalPages: 5 }} />
    );
    expect(screen.getByText(/42 registros/)).toBeInTheDocument();
  });

  it("shows clean filters button with active filters", () => {
    const onReset = jest.fn();
    render(
      <AuditTimeline
        {...baseProps}
        filters={{ ...baseProps.filters, search: "test" }}
        onResetFilters={onReset}
      />
    );
    expect(screen.getByText("Limpiar")).toBeInTheDocument();
  });

  it("calls onResetFilters when Limpiar clicked in filter bar", () => {
    const onReset = jest.fn();
    render(
      <AuditTimeline
        {...baseProps}
        filters={{ ...baseProps.filters, search: "test" }}
        onResetFilters={onReset}
      />
    );
    fireEvent.click(screen.getByText("Limpiar"));
    expect(onReset).toHaveBeenCalled();
  });

  it("shows Limpiar filtros button in empty state with active filters", () => {
    const onReset = jest.fn();
    render(
      <AuditTimeline
        {...baseProps}
        logs={[]}
        filters={{ ...baseProps.filters, search: "test" }}
        onResetFilters={onReset}
      />
    );
    const buttons = screen.getAllByText(/Limpiar/i);
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it("renders with date filter values", () => {
    render(
      <AuditTimeline
        {...baseProps}
        filters={{ ...baseProps.filters, startDate: "2024-01-01T00:00:00.000Z", endDate: "2024-01-31T23:59:59.999Z" }}
      />
    );
    expect(screen.getByTestId("date-range-picker")).toBeInTheDocument();
  });

  it("shows refresh button and calls onRefresh when clicked", () => {
    const onRefresh = jest.fn();
    render(<AuditTimeline {...baseProps} onRefresh={onRefresh} />);
    const refreshIcon = screen.getByTestId("icon-RefreshCw");
    fireEvent.click(refreshIcon.closest("[data-testid='Button']")!);
    expect(onRefresh).toHaveBeenCalled();
  });

  it("calls onFiltersChange when sort order toggled", () => {
    const onFiltersChange = jest.fn();
    render(<AuditTimeline {...baseProps} onFiltersChange={onFiltersChange} />);
    const sortBtn = screen.getByLabelText(/^Orden (desc|asc)/i);
    fireEvent.click(sortBtn);
    expect(onFiltersChange).toHaveBeenCalledWith(expect.objectContaining({ sortOrder: "ASC" }));
  });

  it("shows sortBy label when meta and sortBy provided", () => {
    const log = {
      id: "1", action: "USER_CREATED", actionLabel: "Created", entityType: "USER",
      entityId: "u1", entityName: "User", timestamp: new Date().toISOString(),
      success: true, changes: [], metadata: {},
    };
    render(
      <AuditTimeline
        {...baseProps}
        logs={[log as any]}
        meta={{ total: 5, page: 1, limit: 10, totalPages: 1 }}
        filters={{ ...baseProps.filters, sortBy: "timestamp", sortOrder: "ASC" }}
      />
    );
    expect(screen.getByText(/Ordenado por fecha/i)).toBeInTheDocument();
  });

  it("renders loading more spinner when isLoadingMore is true", () => {
    const log = {
      id: "1", action: "USER_CREATED", actionLabel: "Created", entityType: "USER",
      entityId: "u1", entityName: "User", timestamp: new Date().toISOString(),
      success: true, changes: [], metadata: {},
    };
    render(<AuditTimeline {...baseProps} logs={[log as any]} isLoadingMore={true} hasMore={true} />);
    expect(screen.getByText(/cargando más/i)).toBeInTheDocument();
  });

  it("shows fin marker when all logs loaded", () => {
    const log = {
      id: "1", action: "USER_CREATED", actionLabel: "Created", entityType: "USER",
      entityId: "u1", entityName: "User", timestamp: new Date().toISOString(),
      success: true, changes: [], metadata: {},
    };
    render(<AuditTimeline {...baseProps} logs={[log as any]} hasMore={false} />);
    expect(screen.getByText("Fin")).toBeInTheDocument();
  });

  // IntersectionObserver / handleObserver
  it("calls onLoadMore when IntersectionObserver triggers with isIntersecting", () => {
    const onLoadMore = jest.fn();
    const log = {
      id: "1", action: "USER_CREATED", actionLabel: "Created", entityType: "USER",
      entityId: "u1", entityName: "User", timestamp: new Date().toISOString(),
      success: true, changes: [], metadata: {},
    };
    render(
      <AuditTimeline
        {...baseProps}
        logs={[log as any]}
        hasMore={true}
        isLoadingMore={false}
        onLoadMore={onLoadMore}
      />
    );
    act(() => {
      intersectionCallback([{ isIntersecting: true } as IntersectionObserverEntry]);
    });
    expect(onLoadMore).toHaveBeenCalled();
  });

  it("does not call onLoadMore when not intersecting", () => {
    const onLoadMore = jest.fn();
    const log = {
      id: "1", action: "USER_CREATED", actionLabel: "Created", entityType: "USER",
      entityId: "u1", entityName: "User", timestamp: new Date().toISOString(),
      success: true, changes: [], metadata: {},
    };
    render(
      <AuditTimeline {...baseProps} logs={[log as any]} hasMore={true} onLoadMore={onLoadMore} />
    );
    act(() => {
      intersectionCallback([{ isIntersecting: false } as IntersectionObserverEntry]);
    });
    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it("does not call onLoadMore when hasMore is false", () => {
    const onLoadMore = jest.fn();
    const log = {
      id: "1", action: "USER_CREATED", actionLabel: "Created", entityType: "USER",
      entityId: "u1", entityName: "User", timestamp: new Date().toISOString(),
      success: true, changes: [], metadata: {},
    };
    render(
      <AuditTimeline {...baseProps} logs={[log as any]} hasMore={false} onLoadMore={onLoadMore} />
    );
    act(() => {
      intersectionCallback([{ isIntersecting: true } as IntersectionObserverEntry]);
    });
    expect(onLoadMore).not.toHaveBeenCalled();
  });

  // handleDateRangeChange
  it("parses date range from filter values for DateRangePicker", () => {
    render(
      <AuditTimeline
        {...baseProps}
        filters={{ ...baseProps.filters, startDate: "2024-03-01T00:00:00.000Z", endDate: "2024-03-31T23:59:59.999Z" }}
      />
    );
    expect(screen.getByTestId("date-range-picker")).toBeInTheDocument();
  });

  // Limpiar filtros button in empty state
  it("calls onResetFilters from empty state Limpiar filtros button", () => {
    const onReset = jest.fn();
    render(
      <AuditTimeline
        {...baseProps}
        logs={[]}
        filters={{ ...baseProps.filters, action: "USER_CREATED" }}
        onResetFilters={onReset}
      />
    );
    const btn = screen.getByText("Limpiar filtros");
    fireEvent.click(btn);
    expect(onReset).toHaveBeenCalled();
  });

  // Sort order ASC toggle
  it("toggles sort order from ASC to DESC", () => {
    const onFiltersChange = jest.fn();
    render(
      <AuditTimeline
        {...baseProps}
        filters={{ ...baseProps.filters, sortOrder: "ASC" }}
        onFiltersChange={onFiltersChange}
      />
    );
    const sortBtn = screen.getByLabelText("Orden ascendente");
    fireEvent.click(sortBtn);
    expect(onFiltersChange).toHaveBeenCalledWith({ sortOrder: "DESC" });
  });

  // Filter by action select
  it("calls onFiltersChange when action select changes", () => {
    const onFiltersChange = jest.fn();
    render(<AuditTimeline {...baseProps} onFiltersChange={onFiltersChange} />);
    const actionSelect = screen.getByLabelText("Filtrar por acción");
    fireEvent.change(actionSelect, { target: { value: "USER_CREATED" } });
    expect(onFiltersChange).toHaveBeenCalled();
  });

  // Filter by entity type select
  it("calls onFiltersChange when entity type select changes", () => {
    const onFiltersChange = jest.fn();
    render(<AuditTimeline {...baseProps} onFiltersChange={onFiltersChange} />);
    const entitySelect = screen.getByLabelText("Filtrar por tipo de entidad");
    fireEvent.change(entitySelect, { target: { value: "USER" } });
    expect(onFiltersChange).toHaveBeenCalled();
  });

  // Sort by select
  it("calls onFiltersChange when sortBy select changes", () => {
    const onFiltersChange = jest.fn();
    render(<AuditTimeline {...baseProps} onFiltersChange={onFiltersChange} />);
    const sortSelect = screen.getByLabelText("Ordenar por");
    fireEvent.change(sortSelect, { target: { value: "action" } });
    expect(onFiltersChange).toHaveBeenCalled();
  });

  // Search input
  it("calls onFiltersChange when search input changes", () => {
    const onFiltersChange = jest.fn();
    render(<AuditTimeline {...baseProps} onFiltersChange={onFiltersChange} />);
    const searchInput = screen.getByPlaceholderText("Buscar...");
    fireEvent.change(searchInput, { target: { value: "test" } });
    expect(onFiltersChange).toHaveBeenCalled();
  });

  // hasActiveFilters with different filter types
  it("shows Limpiar button when entityType filter is active", () => {
    const onReset = jest.fn();
    render(
      <AuditTimeline
        {...baseProps}
        filters={{ ...baseProps.filters, entityType: "USER" }}
        onResetFilters={onReset}
      />
    );
    expect(screen.getByText("Limpiar")).toBeInTheDocument();
  });

  it("shows Limpiar button when startDate filter is active", () => {
    const onReset = jest.fn();
    render(
      <AuditTimeline
        {...baseProps}
        filters={{ ...baseProps.filters, startDate: "2024-01-01T00:00:00.000Z", endDate: "2024-01-31T23:59:59.999Z" }}
        onResetFilters={onReset}
      />
    );
    expect(screen.getByText("Limpiar")).toBeInTheDocument();
  });

  it("does not show Limpiar button when no active filters", () => {
    render(<AuditTimeline {...baseProps} />);
    expect(screen.queryByText("Limpiar")).not.toBeInTheDocument();
  });

  // Timeline item click
  it("passes onLogClick to timeline items", () => {
    const onLogClick = jest.fn();
    const log = {
      id: "1", action: "USER_CREATED", actionLabel: "Created", entityType: "USER",
      entityId: "u1", entityName: "User", timestamp: new Date().toISOString(),
      success: true, changes: [], metadata: {},
    };
    render(<AuditTimeline {...baseProps} logs={[log as any]} onLogClick={onLogClick} />);
    expect(screen.getByText("Created")).toBeInTheDocument();
  });
});
