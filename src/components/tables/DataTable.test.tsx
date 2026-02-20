import { render, screen, fireEvent } from "@testing-library/react";
import { DataTable } from "./DataTable";

const columns = [
  { key: "name", label: "Name", sortable: true },
  { key: "email", label: "Email" },
];

const items = [
  { id: "1", name: "John", email: "john@test.com" },
  { id: "2", name: "Jane", email: "jane@test.com" },
];

describe("DataTable", () => {
  it("renders with columns", () => {
    render(<DataTable items={[]} columns={columns} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("renders items", () => {
    render(<DataTable items={items} columns={columns} />);
    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("john@test.com")).toBeInTheDocument();
  });

  it("renders search input when onSearchChange provided", () => {
    render(
      <DataTable
        items={[]}
        columns={columns}
        searchValue=""
        onSearchChange={jest.fn()}
        searchPlaceholder="Search..."
      />
    );
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
  });

  it("renders top actions", () => {
    const topActions = [{ key: "refresh", label: "Refresh", onClick: jest.fn() }];
    render(<DataTable items={[]} columns={columns} topActions={topActions} />);
    expect(screen.getByText("Refresh")).toBeInTheDocument();
  });

  // --- Loading ---

  it("renders loading content when isLoading", () => {
    render(<DataTable items={[]} columns={columns} isLoading />);
    expect(screen.getByText("Cargando datos...")).toBeInTheDocument();
  });

  // --- Empty state ---

  it("renders default empty content when no items", () => {
    render(<DataTable items={[]} columns={columns} />);
    expect(screen.getByText("No hay registros")).toBeInTheDocument();
  });

  it("renders custom empty content", () => {
    render(<DataTable items={[]} columns={columns} emptyContent={<div>Nada aquí</div>} />);
    expect(screen.getByText("Nada aquí")).toBeInTheDocument();
  });

  // --- Boolean rendering ---

  it("renders boolean true as Activo chip", () => {
    const boolColumns = [{ key: "name", label: "Name" }, { key: "active", label: "Active" }];
    const boolItems = [{ id: "1", name: "Test", active: true }];
    render(<DataTable items={boolItems} columns={boolColumns} />);
    expect(screen.getByText("Activo")).toBeInTheDocument();
  });

  it("renders boolean false as Inactivo chip", () => {
    const boolColumns = [{ key: "name", label: "Name" }, { key: "active", label: "Active" }];
    const boolItems = [{ id: "1", name: "Test", active: false }];
    render(<DataTable items={boolItems} columns={boolColumns} />);
    expect(screen.getByText("Inactivo")).toBeInTheDocument();
  });

  // --- Custom render ---

  it("uses custom render function when provided", () => {
    const customColumns = [{ key: "name", label: "Name", render: (item: any) => <strong>{item.name.toUpperCase()}</strong> }];
    render(<DataTable items={[items[0]]} columns={customColumns} />);
    expect(screen.getByText("JOHN")).toBeInTheDocument();
  });

  // --- Row actions ---

  it("renders Acciones column when rowActions provided", () => {
    const rowActions = [{ key: "edit", label: "Editar", onClick: jest.fn() }];
    render(<DataTable items={items} columns={columns} rowActions={rowActions} />);
    expect(screen.getByText("Acciones")).toBeInTheDocument();
  });

  it("renders row action items", () => {
    const rowActions = [
      { key: "edit", label: "Editar", onClick: jest.fn() },
      { key: "delete", label: "Eliminar", onClick: jest.fn() },
    ];
    render(<DataTable items={[items[0]]} columns={columns} rowActions={rowActions} />);
    expect(screen.getByText("Editar")).toBeInTheDocument();
    expect(screen.getByText("Eliminar")).toBeInTheDocument();
  });

  it("calls row action onClick when clicked", () => {
    const mockEdit = jest.fn();
    const rowActions = [{ key: "edit", label: "Editar", onClick: mockEdit }];
    render(<DataTable items={[items[0]]} columns={columns} rowActions={rowActions} />);
    fireEvent.click(screen.getByText("Editar"));
    expect(mockEdit).toHaveBeenCalledWith(items[0]);
  });

  it("does not render Acciones column without rowActions", () => {
    render(<DataTable items={items} columns={columns} />);
    expect(screen.queryByText("Acciones")).not.toBeInTheDocument();
  });

  // --- Sort ---

  it("renders sort button for sortable columns with onSortChange", () => {
    const mockSort = jest.fn();
    render(<DataTable items={items} columns={columns} onSortChange={mockSort} />);
    const sortButton = screen.getByText("Name").closest("button");
    expect(sortButton).toBeInTheDocument();
  });

  it("calls onSortChange with ascending when clicking unsorted column", () => {
    const mockSort = jest.fn();
    render(<DataTable items={items} columns={columns} onSortChange={mockSort} />);
    const sortButton = screen.getByText("Name").closest("button")!;
    fireEvent.click(sortButton);
    expect(mockSort).toHaveBeenCalledWith({ column: "name", direction: "ascending" });
  });

  it("toggles sort direction to descending when already ascending", () => {
    const mockSort = jest.fn();
    render(
      <DataTable
        items={items}
        columns={columns}
        onSortChange={mockSort}
        sortDescriptor={{ column: "name", direction: "ascending" }}
      />
    );
    const sortButton = screen.getByText("Name").closest("button")!;
    fireEvent.click(sortButton);
    expect(mockSort).toHaveBeenCalledWith({ column: "name", direction: "descending" });
  });

  it("does not render sort button without onSortChange", () => {
    render(<DataTable items={items} columns={columns} />);
    const nameText = screen.getByText("Name");
    expect(nameText.closest("button")).toBeNull();
  });

  it("does not render sort button for non-sortable columns", () => {
    const mockSort = jest.fn();
    render(<DataTable items={items} columns={columns} onSortChange={mockSort} />);
    const emailText = screen.getByText("Email");
    expect(emailText.closest("button")).toBeNull();
  });

  // --- Pagination ---

  it("renders pagination when pagination prop provided with totalPages > 0", () => {
    render(
      <DataTable
        items={items}
        columns={columns}
        pagination={{ page: 1, totalPages: 3, onChange: jest.fn() }}
      />
    );
    expect(screen.getByTestId("pagination")).toBeInTheDocument();
    expect(screen.getByText("páginas")).toBeInTheDocument();
  });

  it("does not render pagination when totalPages is 0", () => {
    render(
      <DataTable
        items={[]}
        columns={columns}
        pagination={{ page: 1, totalPages: 0, onChange: jest.fn() }}
      />
    );
    expect(screen.queryByTestId("pagination")).not.toBeInTheDocument();
  });

  it("renders page size dropdown when onPageSizeChange provided", () => {
    render(
      <DataTable
        items={items}
        columns={columns}
        pagination={{
          page: 1,
          totalPages: 3,
          onChange: jest.fn(),
          pageSize: 10,
          onPageSizeChange: jest.fn(),
        }}
      />
    );
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  // --- Top action click ---

  it("calls top action onClick when pressed", () => {
    const mockAction = jest.fn();
    const topActions = [{ key: "add", label: "Agregar", onClick: mockAction }];
    render(<DataTable items={[]} columns={columns} topActions={topActions} />);
    // Desktop button
    fireEvent.click(screen.getByText("Agregar"));
    expect(mockAction).toHaveBeenCalled();
  });

  // --- ariaLabel ---

  it("uses custom ariaLabel", () => {
    const { container } = render(
      <DataTable items={[]} columns={columns} ariaLabel="Mi tabla" />
    );
    expect(container.querySelector('[aria-label="Mi tabla"]')).toBeInTheDocument();
  });

  it("does not show search input without onSearchChange", () => {
    render(<DataTable items={[]} columns={columns} />);
    expect(screen.queryByPlaceholderText("Buscar...")).not.toBeInTheDocument();
  });
});
