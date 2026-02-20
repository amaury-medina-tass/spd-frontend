import { render, screen, fireEvent } from "@testing-library/react";
import { CleanTable } from "@/components/tables/CleanTable";
import type { ColumnDef } from "@/components/tables/CleanTable";

const columns: ColumnDef[] = [
  { uid: "name", name: "Name" },
  { uid: "value", name: "Value" },
];

const items = [
  { id: "1", name: "Item A", value: "100" },
  { id: "2", name: "Item B", value: "200" },
];

describe("CleanTable", () => {
  it("renders column headers", () => {
    render(
      <CleanTable
        items={[]}
        columns={columns}
        renderCell={(item: any, key) => item[key as string]}
      />
    );
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Value")).toBeInTheDocument();
  });

  it("renders items as table rows", () => {
    const { container } = render(
      <CleanTable
        items={items}
        columns={columns}
        renderCell={(item: any, key) => item[key as string]}
      />
    );
    const rows = container.querySelectorAll("tbody tr");
    expect(rows).toHaveLength(2);
  });

  it("renders item cell values without crashing", () => {
    const { container } = render(
      <CleanTable
        items={[items[0]]}
        columns={columns}
        renderCell={(item: any, key) => <span data-testid={`cell-${key}`}>{item[key as string]}</span>}
      />
    );
    expect(container).toBeTruthy();
  });

  it("renders table with hardcoded aria-label", () => {
    const { container } = render(
      <CleanTable
        items={[]}
        columns={columns}
        renderCell={(item: any, key) => item[key as string]}
      />
    );
    expect(container.querySelector('[aria-label="Tabla de datos"]')).toBeInTheDocument();
  });

  // --- Pagination ---

  it("renders pagination when totalPages > 1", () => {
    render(
      <CleanTable
        items={items}
        columns={columns}
        renderCell={(item: any, key) => item[key as string]}
        page={1}
        totalPages={3}
        onPageChange={jest.fn()}
      />
    );
    expect(screen.getByTestId("pagination")).toBeInTheDocument();
  });

  it("does not render pagination when totalPages is 1 and no onLimitChange", () => {
    render(
      <CleanTable
        items={items}
        columns={columns}
        renderCell={(item: any, key) => item[key as string]}
        page={1}
        totalPages={1}
      />
    );
    expect(screen.queryByTestId("pagination")).not.toBeInTheDocument();
  });

  // --- Limit select ---

  it("renders limit select when onLimitChange provided", () => {
    render(
      <CleanTable
        items={items}
        columns={columns}
        renderCell={(item: any, key) => item[key as string]}
        limit={10}
        onLimitChange={jest.fn()}
      />
    );
    expect(screen.getByLabelText("Filas")).toBeInTheDocument();
  });

  it("calls onLimitChange when limit value changed", () => {
    const mockLimitChange = jest.fn();
    render(
      <CleanTable
        items={items}
        columns={columns}
        renderCell={(item: any, key) => item[key as string]}
        limit={10}
        onLimitChange={mockLimitChange}
      />
    );
    const limitSelect = screen.getByLabelText("Filas");
    fireEvent.change(limitSelect, { target: { value: "20" } });
    expect(mockLimitChange).toHaveBeenCalledWith(20);
  });

  it("does not call onLimitChange when empty value", () => {
    const mockLimitChange = jest.fn();
    render(
      <CleanTable
        items={items}
        columns={columns}
        renderCell={(item: any, key) => item[key as string]}
        limit={10}
        onLimitChange={mockLimitChange}
      />
    );
    const limitSelect = screen.getByLabelText("Filas");
    Object.defineProperty(limitSelect, "value", { configurable: true, get: () => "", set: () => {} });
    fireEvent.change(limitSelect);
    expect(mockLimitChange).not.toHaveBeenCalled();
  });

  // --- Mobile view ---

  it("renders mobile view when renderMobileItem provided", () => {
    render(
      <CleanTable
        items={items}
        columns={columns}
        renderCell={(item: any, key) => item[key as string]}
        renderMobileItem={(item: any) => <div data-testid="mobile-item">{item.name}</div>}
      />
    );
    const mobileItems = screen.getAllByTestId("mobile-item");
    expect(mobileItems).toHaveLength(2);
    expect(screen.getByText("Item A")).toBeInTheDocument();
  });

  it("renders mobile loading state", () => {
    render(
      <CleanTable
        items={[]}
        columns={columns}
        renderCell={(item: any, key) => item[key as string]}
        renderMobileItem={(item: any) => <div>{item.name}</div>}
        isLoading={true}
      />
    );
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("renders mobile empty state with default content", () => {
    render(
      <CleanTable
        items={[]}
        columns={columns}
        renderCell={(item: any, key) => item[key as string]}
        renderMobileItem={(item: any) => <div>{item.name}</div>}
        isLoading={false}
      />
    );
    expect(screen.getByText("Sin datos para mostrar")).toBeInTheDocument();
  });

  it("renders mobile empty state with custom emptyContent", () => {
    render(
      <CleanTable
        items={[]}
        columns={columns}
        renderCell={(item: any, key) => item[key as string]}
        renderMobileItem={(item: any) => <div>{item.name}</div>}
        emptyContent={<div>Custom empty</div>}
      />
    );
    expect(screen.getByText("Custom empty")).toBeInTheDocument();
  });

  // --- Sort ---

  it("passes sortDescriptor and onSortChange to Table", () => {
    const mockSort = jest.fn();
    const { container } = render(
      <CleanTable
        items={items}
        columns={columns}
        renderCell={(item: any, key) => item[key as string]}
        sortDescriptor={{ column: "name", direction: "ascending" }}
        onSortChange={mockSort}
      />
    );
    expect(container).toBeTruthy();
  });

  // --- hideHeader ---

  it("respects className prop", () => {
    const { container } = render(
      <CleanTable
        items={[]}
        columns={columns}
        renderCell={(item: any, key) => item[key as string]}
        className="custom-class"
      />
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("renders with custom limitOptions", () => {
    render(
      <CleanTable
        items={items}
        columns={columns}
        renderCell={(item: any, key) => item[key as string]}
        limit={25}
        onLimitChange={jest.fn()}
        limitOptions={[25, 50, 100]}
      />
    );
    expect(screen.getByLabelText("Filas")).toBeInTheDocument();
  });
});
