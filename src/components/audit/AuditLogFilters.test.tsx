import { render, screen, fireEvent } from "@testing-library/react";

jest.mock("@/lib/audit-codes", () => ({
  AuditActions: { USER_CREATED: "USER_CREATED" },
  ACTION_LABELS: { USER_CREATED: "Usuario Creado" },
  ENTITY_TYPE_LABELS: { USER: "Usuario" },
}));

jest.mock("@heroui/react", () => ({
  Input: ({ onValueChange, value, placeholder, isClearable, onClear, startContent, ...props }: any) => {
    const React = require("react");
    return React.createElement("div", null,
      React.createElement("input", {
        placeholder,
        value: value || "",
        onChange: (e: any) => onValueChange?.(e.target.value),
        ...props,
      }),
      isClearable && React.createElement("button", { "data-testid": "clear-search", onClick: onClear }, "clear")
    );
  },
  Select: ({ onSelectionChange, placeholder, children, selectedKeys, ...props }: any) => {
    const React = require("react");
    const opts = React.Children.map(children, (child: any) => {
      if (!child) return null;
      return React.cloneElement(child, { value: child.key });
    });
    return React.createElement("select", {
      "aria-label": placeholder,
      onChange: (e: any) => onSelectionChange?.(new Set([e.target.value])),
    }, opts);
  },
  SelectItem: ({ children, ...props }: any) => {
    const React = require("react");
    return React.createElement("option", props, children);
  },
  Button: ({ children, onPress, startContent, ...props }: any) => {
    const React = require("react");
    return React.createElement("button", { onClick: onPress, ...props }, startContent, children);
  },
}));

import { AuditLogFilters } from "./AuditLogFilters";

describe("AuditLogFilters", () => {
  const baseProps = {
    filters: {} as any,
    onFilterChange: jest.fn(),
  };

  it("renders search input", () => {
    render(<AuditLogFilters {...baseProps} />);
    expect(screen.getByPlaceholderText(/buscar/i)).toBeInTheDocument();
  });

  it("shows reset button when there are active filters", () => {
    render(
      <AuditLogFilters
        {...baseProps}
        filters={{ search: "test" } as any}
        onReset={jest.fn()}
      />
    );
    expect(screen.getByText("Limpiar")).toBeInTheDocument();
  });

  it("hides reset button when no active filters", () => {
    render(<AuditLogFilters {...baseProps} filters={{} as any} onReset={jest.fn()} />);
    expect(screen.queryByText("Limpiar")).not.toBeInTheDocument();
  });

  it("calls onFilterChange when search input changes", () => {
    const onFilterChange = jest.fn();
    render(<AuditLogFilters {...baseProps} onFilterChange={onFilterChange} />);
    const input = screen.getByPlaceholderText(/buscar/i);
    fireEvent.change(input, { target: { value: "test query" } });
    expect(onFilterChange).toHaveBeenCalledWith({ search: "test query" });
  });

  it("calls onFilterChange with empty search when cleared", () => {
    const onFilterChange = jest.fn();
    render(<AuditLogFilters {...baseProps} filters={{ search: "test" } as any} onFilterChange={onFilterChange} />);
    fireEvent.click(screen.getByTestId("clear-search"));
    expect(onFilterChange).toHaveBeenCalledWith({ search: "" });
  });

  it("calls onFilterChange when action filter selected", () => {
    const onFilterChange = jest.fn();
    render(<AuditLogFilters {...baseProps} onFilterChange={onFilterChange} />);
    const actionSelect = screen.getByRole("combobox", { name: /acci/i });
    fireEvent.change(actionSelect, { target: { value: "USER_CREATED" } });
    expect(onFilterChange).toHaveBeenCalledWith({ action: "USER_CREATED" });
  });

  it("calls onFilterChange with undefined when action cleared", () => {
    const onFilterChange = jest.fn();
    render(<AuditLogFilters {...baseProps} onFilterChange={onFilterChange} />);
    const actionSelect = screen.getByRole("combobox", { name: /acci/i });
    fireEvent.change(actionSelect, { target: { value: "" } });
    expect(onFilterChange).toHaveBeenCalledWith({ action: undefined });
  });

  it("calls onFilterChange when entity type filter selected", () => {
    const onFilterChange = jest.fn();
    render(<AuditLogFilters {...baseProps} onFilterChange={onFilterChange} />);
    const entitySelect = screen.getByRole("combobox", { name: /tipo/i });
    fireEvent.change(entitySelect, { target: { value: "USER" } });
    expect(onFilterChange).toHaveBeenCalledWith({ entityType: "USER" });
  });

  it("calls onReset when Limpiar button clicked", () => {
    const onReset = jest.fn();
    render(
      <AuditLogFilters
        {...baseProps}
        filters={{ search: "test" } as any}
        onReset={onReset}
      />
    );
    fireEvent.click(screen.getByText("Limpiar"));
    expect(onReset).toHaveBeenCalled();
  });
});
