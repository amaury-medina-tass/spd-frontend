import { render, screen } from "@testing-library/react";

jest.mock("@/components/tables/CleanTable", () => ({
  CleanTable: (props: any) => <div data-testid="clean-table">table</div>,
}));

import { ResourceManager } from "@/components/common/ResourceManager";

describe("ResourceManager", () => {
  it("renders search placeholder", () => {
    render(
      <ResourceManager
        search=""
        onSearchChange={jest.fn()}
        searchPlaceholder="Buscar..."
        items={[]}
        columns={[]}
        page={1}
        totalPages={1}
        onPageChange={jest.fn()}
      />
    );
    expect(screen.getByPlaceholderText("Buscar...")).toBeInTheDocument();
  });

  it("renders create button when onCreate provided", () => {
    render(
      <ResourceManager
        search=""
        onSearchChange={jest.fn()}
        onCreate={jest.fn()}
        createLabel="Nuevo"
        items={[]}
        columns={[]}
        page={1}
        totalPages={1}
        onPageChange={jest.fn()}
      />
    );
    expect(screen.getByText("Nuevo")).toBeInTheDocument();
  });

  it("renders clean table", () => {
    render(
      <ResourceManager
        search=""
        onSearchChange={jest.fn()}
        items={[]}
        columns={[]}
        page={1}
        totalPages={1}
        onPageChange={jest.fn()}
      />
    );
    expect(screen.getByTestId("clean-table")).toBeInTheDocument();
  });

  it("does not render create button when onCreate not provided", () => {
    render(
      <ResourceManager
        search=""
        onSearchChange={jest.fn()}
        createLabel="Nuevo"
        items={[]}
        columns={[]}
        page={1}
        totalPages={1}
        onPageChange={jest.fn()}
      />
    );
    expect(screen.queryByText("Nuevo")).not.toBeInTheDocument();
  });

  it("renders with search value", () => {
    render(
      <ResourceManager
        search="test query"
        onSearchChange={jest.fn()}
        searchPlaceholder="Buscar..."
        items={[]}
        columns={[]}
        page={1}
        totalPages={1}
        onPageChange={jest.fn()}
      />
    );
    const input = screen.getByPlaceholderText("Buscar...") as HTMLInputElement;
    expect(input.value).toBe("test query");
  });
});
