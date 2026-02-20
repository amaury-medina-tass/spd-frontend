import { render, screen, fireEvent } from "@testing-library/react";
import { StepChip } from "./StepChip";

jest.mock("../utils/helpers", () => ({
  cleanLabel: (label: string | undefined, fallback: string) => label || fallback,
}));

describe("StepChip", () => {
  // Variable
  it("renders variable step with code", () => {
    render(
      <StepChip step={{ type: "variable", value: { code: "VAR001", name: "Variable Uno" } } as any} />
    );
    expect(screen.getByText("VAR001")).toBeInTheDocument();
  });

  it("renders variable step with name when no code", () => {
    render(
      <StepChip step={{ type: "variable", value: { name: "Variable Uno" } } as any} />
    );
    expect(screen.getByText("Variable Uno")).toBeInTheDocument();
  });

  // Constant
  it("renders constant step with value", () => {
    render(
      <StepChip step={{ type: "constant", value: "42" } as any} />
    );
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  // Operator
  it("renders operator step with symbol", () => {
    render(
      <StepChip step={{ type: "operator", value: { symbol: "+" } } as any} />
    );
    expect(screen.getByText("+")).toBeInTheDocument();
  });

  // Comparison
  it("renders comparison step with symbol", () => {
    render(
      <StepChip step={{ type: "comparison", value: { symbol: "≥" } } as any} />
    );
    expect(screen.getByText("≥")).toBeInTheDocument();
  });

  // Parenthesis
  it("renders open parenthesis step", () => {
    render(
      <StepChip step={{ type: "parenthesis", value: "(" } as any} />
    );
    expect(screen.getByText("(")).toBeInTheDocument();
  });

  it("renders close parenthesis step", () => {
    render(
      <StepChip step={{ type: "parenthesis", value: ")" } as any} />
    );
    expect(screen.getByText(")")).toBeInTheDocument();
  });

  // Separator
  it("renders separator step", () => {
    render(
      <StepChip step={{ type: "separator", value: "," } as any} />
    );
    expect(screen.getByText(",")).toBeInTheDocument();
  });

  // Function
  it("renders function step with name and open paren", () => {
    render(
      <StepChip step={{ type: "function", value: { id: "SUM", name: "SUMA" } } as any} />
    );
    expect(screen.getByText("SUMA(")).toBeInTheDocument();
  });

  // Goal variable
  it("renders goal_variable step with year", () => {
    render(
      <StepChip step={{ type: "goal_variable", value: { year: 2024, valorMeta: "100" } } as any} />
    );
    expect(screen.getByText("Meta Var [2024]")).toBeInTheDocument();
  });

  it("renders goal_variable step with N/A when no year", () => {
    render(
      <StepChip step={{ type: "goal_variable", value: { valorMeta: "100" } } as any} />
    );
    expect(screen.getByText("Meta Var [N/A]")).toBeInTheDocument();
  });

  // Goal indicator
  it("renders goal_indicator step with year", () => {
    render(
      <StepChip step={{ type: "goal_indicator", value: { year: 2025, valorMeta: "200" } } as any} />
    );
    expect(screen.getByText("Meta Ind [2025]")).toBeInTheDocument();
  });

  it("renders goal_indicator step with N/A when no year", () => {
    render(
      <StepChip step={{ type: "goal_indicator", value: { valorMeta: "200" } } as any} />
    );
    expect(screen.getByText("Meta Ind [N/A]")).toBeInTheDocument();
  });

  // Quadrennium variable
  it("renders quadrennium_variable step", () => {
    render(
      <StepChip step={{ type: "quadrennium_variable", value: { label: "Cuatrenio", startYear: 2020, endYear: 2023 } } as any} />
    );
    expect(screen.getByText("Cuatrenio")).toBeInTheDocument();
  });

  // Quadrennium indicator
  it("renders quadrennium_indicator step", () => {
    render(
      <StepChip step={{ type: "quadrennium_indicator", value: { label: "Q-Ind", startYear: 2024, endYear: 2027 } } as any} />
    );
    expect(screen.getByText("Q-Ind")).toBeInTheDocument();
  });

  // Advance
  it("renders advance step with label", () => {
    render(
      <StepChip step={{ type: "advance", value: { label: "Avance 2024 Ene", year: 2024 } } as any} />
    );
    expect(screen.getByText("Avance 2024 Ene")).toBeInTheDocument();
  });

  it("renders advance step fallback when no label", () => {
    render(
      <StepChip step={{ type: "advance", value: { year: 2025 } } as any} />
    );
    expect(screen.getByText("Avance 2025")).toBeInTheDocument();
  });

  // Baseline
  it("renders baseline step", () => {
    render(
      <StepChip step={{ type: "baseline", value: { id: "LINEA_BASE", label: "Línea Base" } } as any} />
    );
    expect(screen.getByText("Línea Base")).toBeInTheDocument();
  });

  // Delete button
  it("renders delete button when onDelete is provided", () => {
    const { container } = render(
      <StepChip step={{ type: "variable", value: { code: "X", name: "X" } } as any} onDelete={jest.fn()} />
    );
    const btn = container.querySelector("button");
    expect(btn).toBeTruthy();
  });

  it("does not render delete button when onDelete is not provided", () => {
    const { container } = render(
      <StepChip step={{ type: "variable", value: { code: "X", name: "X" } } as any} />
    );
    const btn = container.querySelector("button");
    expect(btn).toBeNull();
  });

  it("calls onDelete and stops propagation when delete clicked", () => {
    const onDelete = jest.fn();
    const { container } = render(
      <StepChip step={{ type: "variable", value: { code: "X", name: "X" } } as any} onDelete={onDelete} />
    );
    const btn = container.querySelector("button")!;
    fireEvent.click(btn);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  // Default/unknown type
  it("renders unknown step type with default style", () => {
    const { container } = render(
      <StepChip step={{ type: "unknown_type" as any, value: "something" } as any} />
    );
    expect(container).toBeTruthy();
  });

  // Symbol types don't render delete button even if onDelete provided
  it("parenthesis renders as plain text without delete button", () => {
    const onDelete = jest.fn();
    const { container } = render(
      <StepChip step={{ type: "parenthesis", value: "(" } as any} onDelete={onDelete} />
    );
    // Should use the isSymbol branch that renders a plain div without delete
    const btns = container.querySelectorAll("button");
    expect(btns.length).toBe(0);
  });

  it("operator renders as plain text without delete button", () => {
    const onDelete = jest.fn();
    const { container } = render(
      <StepChip step={{ type: "operator", value: { symbol: "*" } } as any} onDelete={onDelete} />
    );
    const btns = container.querySelectorAll("button");
    expect(btns.length).toBe(0);
  });
});
