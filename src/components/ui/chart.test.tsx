import React from "react";
import { render, screen } from "@testing-library/react";
import {
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "./chart";

const config = {
  valueA: { label: "Value A", color: "#ff0000" },
  valueB: { label: "Value B", color: "#00ff00" },
};

describe("ChartContainer", () => {
  it("renders chart container with data-slot", () => {
    render(
      <ChartContainer config={config} data-testid="chart">
        <svg><rect /></svg>
      </ChartContainer>
    );
    expect(screen.getByTestId("chart")).toHaveAttribute("data-slot", "chart");
  });

  it("renders children inside container", () => {
    render(
      <ChartContainer config={config} data-testid="chart">
        <svg data-testid="svg-child"><rect /></svg>
      </ChartContainer>
    );
    expect(screen.getByTestId("chart")).toBeInTheDocument();
  });

  it("passes custom id to chart", () => {
    render(
      <ChartContainer config={config} id="my-chart" data-testid="chart">
        <svg><rect /></svg>
      </ChartContainer>
    );
    expect(screen.getByTestId("chart")).toHaveAttribute("data-chart", "chart-my-chart");
  });

  it("applies custom className", () => {
    render(
      <ChartContainer config={config} className="my-class" data-testid="chart">
        <svg><rect /></svg>
      </ChartContainer>
    );
    expect(screen.getByTestId("chart")).toHaveClass("my-class");
  });

  it("generates unique chart id when no id provided", () => {
    render(
      <ChartContainer config={config} data-testid="chart">
        <svg><rect /></svg>
      </ChartContainer>
    );
    const el = screen.getByTestId("chart");
    expect(el.getAttribute("data-chart")).toMatch(/^chart-/);
  });
});

describe("ChartStyle", () => {
  it("renders without crashing", () => {
    const { container } = render(<ChartStyle id="test-id" config={config} />);
    expect(container).toBeTruthy();
  });

  it("renders style element when config has colors", () => {
    const { container } = render(<ChartStyle id="chart-1" config={config} />);
    const style = container.querySelector("style");
    expect(style).toBeTruthy();
    expect(style!.innerHTML).toContain("--color-valueA");
    expect(style!.innerHTML).toContain("--color-valueB");
  });

  it("returns null when config has no colors or themes", () => {
    const noColorConfig = { valueA: { label: "A" } };
    const { container } = render(<ChartStyle id="x" config={noColorConfig} />);
    expect(container.querySelector("style")).toBeNull();
  });

  it("handles theme-based config", () => {
    const themeConfig = {
      valueA: { label: "A", theme: { light: "#fff", dark: "#000" } },
    };
    const { container } = render(<ChartStyle id="theme-chart" config={themeConfig} />);
    const style = container.querySelector("style");
    expect(style).toBeTruthy();
    expect(style!.innerHTML).toContain("--color-valueA");
  });
});

describe("ChartTooltipContent", () => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <ChartContainer config={config}>
      <svg><rect /></svg>
      {children}
    </ChartContainer>
  );

  it("returns null when not active", () => {
    const { container } = render(
      <Wrapper>
        <ChartTooltipContent active={false} payload={[]} />
      </Wrapper>
    );
    // Should not render tooltip content div
    expect(container.querySelector("[class*='min-w']")).toBeNull();
  });

  it("returns null when payload is empty", () => {
    const { container } = render(
      <Wrapper>
        <ChartTooltipContent active={true} payload={[]} />
      </Wrapper>
    );
    expect(container.querySelector("[class*='min-w']")).toBeNull();
  });

  it("renders tooltip content when active with payload", () => {
    const payload = [
      { name: "valueA", value: 100, dataKey: "valueA", color: "#ff0000", payload: {}, type: "line" as const },
    ];
    render(
      <Wrapper>
        <ChartTooltipContent active={true} payload={payload} label="Jan" />
      </Wrapper>
    );
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("renders label from config", () => {
    const payload = [
      { name: "valueA", value: 50, dataKey: "valueA", color: "#ff0000", payload: {}, type: "line" as const },
    ];
    render(
      <Wrapper>
        <ChartTooltipContent active={true} payload={payload} label="valueA" />
      </Wrapper>
    );
    expect(screen.getAllByText("Value A").length).toBeGreaterThanOrEqual(1);
  });

  it("renders with hideLabel", () => {
    const payload = [
      { name: "valueA", value: 50, dataKey: "valueA", color: "#ff0000", payload: {}, type: "line" as const },
    ];
    render(
      <Wrapper>
        <ChartTooltipContent active={true} payload={payload} hideLabel label="Test" />
      </Wrapper>
    );
    expect(screen.getByText("50")).toBeInTheDocument();
  });

  it("renders with hideIndicator", () => {
    const payload = [
      { name: "valueA", value: 75, dataKey: "valueA", color: "#ff0000", payload: {}, type: "line" as const },
    ];
    const { container } = render(
      <Wrapper>
        <ChartTooltipContent active={true} payload={payload} hideIndicator />
      </Wrapper>
    );
    expect(screen.getByText("75")).toBeInTheDocument();
  });

  it("renders with indicator=line", () => {
    const payload = [
      { name: "valueA", value: 30, dataKey: "valueA", color: "#ff0000", payload: {}, type: "line" as const },
    ];
    const { container } = render(
      <Wrapper>
        <ChartTooltipContent active={true} payload={payload} indicator="line" label="Jan" />
      </Wrapper>
    );
    expect(screen.getByText("30")).toBeInTheDocument();
  });

  it("renders with indicator=dashed", () => {
    const payload = [
      { name: "valueA", value: 20, dataKey: "valueA", color: "#ff0000", payload: {}, type: "line" as const },
    ];
    render(
      <Wrapper>
        <ChartTooltipContent active={true} payload={payload} indicator="dashed" label="Feb" />
      </Wrapper>
    );
    expect(screen.getByText("20")).toBeInTheDocument();
  });

  it("uses labelFormatter when provided", () => {
    const payload = [
      { name: "valueA", value: 10, dataKey: "valueA", color: "#ff0000", payload: {}, type: "line" as const },
    ];
    render(
      <Wrapper>
        <ChartTooltipContent
          active={true}
          payload={payload}
          label="Jan"
          labelFormatter={(val) => `Formatted: ${val}`}
        />
      </Wrapper>
    );
    expect(screen.getByText("Formatted: Jan")).toBeInTheDocument();
  });

  it("uses custom formatter when provided", () => {
    const payload = [
      { name: "valueA", value: 99, dataKey: "valueA", color: "#ff0000", payload: {}, type: "line" as const },
    ];
    render(
      <Wrapper>
        <ChartTooltipContent
          active={true}
          payload={payload}
          formatter={(value, name) => <span>Custom: {String(value)}</span>}
        />
      </Wrapper>
    );
    expect(screen.getByText("Custom: 99")).toBeInTheDocument();
  });

  it("filters out payload items with type 'none'", () => {
    const payload = [
      { name: "valueA", value: 10, dataKey: "valueA", color: "#ff0000", payload: {}, type: "none" as const },
    ];
    const { container } = render(
      <Wrapper>
        <ChartTooltipContent active={true} payload={payload} />
      </Wrapper>
    );
    expect(screen.queryByText("10")).toBeNull();
  });

  it("renders icon from config when available", () => {
    const iconConfig = {
      valueA: { label: "A", color: "#f00", icon: () => <span data-testid="custom-icon">IC</span> },
    };
    const payload = [
      { name: "valueA", value: 5, dataKey: "valueA", color: "#ff0000", payload: {}, type: "line" as const },
    ];
    render(
      <ChartContainer config={iconConfig}>
        <svg><rect /></svg>
        <ChartTooltipContent active={true} payload={payload} />
      </ChartContainer>
    );
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("uses nameKey to resolve config", () => {
    const payload = [
      { name: "valueA", value: 42, dataKey: "valueA", color: "#ff0000", payload: { myKey: "valueB" }, type: "line" as const },
    ];
    render(
      <Wrapper>
        <ChartTooltipContent active={true} payload={payload} nameKey="myKey" />
      </Wrapper>
    );
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("nestLabel is true when single payload and indicator is not dot", () => {
    const payload = [
      { name: "valueA", value: 88, dataKey: "valueA", color: "#ff0000", payload: {}, type: "line" as const },
    ];
    render(
      <Wrapper>
        <ChartTooltipContent active={true} payload={payload} indicator="line" label="Test" />
      </Wrapper>
    );
    expect(screen.getByText("88")).toBeInTheDocument();
  });

  it("renders multiple payload items", () => {
    const payload = [
      { name: "valueA", value: 10, dataKey: "valueA", color: "#ff0000", payload: {}, type: "line" as const },
      { name: "valueB", value: 20, dataKey: "valueB", color: "#00ff00", payload: {}, type: "line" as const },
    ];
    render(
      <Wrapper>
        <ChartTooltipContent active={true} payload={payload} />
      </Wrapper>
    );
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
  });
});

describe("ChartLegendContent", () => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <ChartContainer config={config}>
      <svg><rect /></svg>
      {children}
    </ChartContainer>
  );

  it("returns null when payload is empty", () => {
    const { container } = render(
      <Wrapper>
        <ChartLegendContent payload={[]} />
      </Wrapper>
    );
    // The legend wrapper div should not be present
    expect(container.querySelector("[class*='items-center justify-center']")).toBeNull();
  });

  it("renders legend items", () => {
    const payload = [
      { value: "valueA", dataKey: "valueA", color: "#ff0000", type: "line" as const },
      { value: "valueB", dataKey: "valueB", color: "#00ff00", type: "line" as const },
    ];
    render(
      <Wrapper>
        <ChartLegendContent payload={payload} />
      </Wrapper>
    );
    expect(screen.getByText("Value A")).toBeInTheDocument();
    expect(screen.getByText("Value B")).toBeInTheDocument();
  });

  it("filters out items with type 'none'", () => {
    const payload = [
      { value: "valueA", dataKey: "valueA", color: "#ff0000", type: "none" as const },
    ];
    render(
      <Wrapper>
        <ChartLegendContent payload={payload} />
      </Wrapper>
    );
    expect(screen.queryByText("Value A")).toBeNull();
  });

  it("renders with verticalAlign='top'", () => {
    const payload = [
      { value: "valueA", dataKey: "valueA", color: "#ff0000", type: "line" as const },
    ];
    const { container } = render(
      <Wrapper>
        <ChartLegendContent payload={payload} verticalAlign="top" />
      </Wrapper>
    );
    expect(screen.getByText("Value A")).toBeInTheDocument();
  });

  it("renders icon from config when available and hideIcon is false", () => {
    const iconConfig = {
      valueA: { label: "A", color: "#f00", icon: () => <span data-testid="legend-icon">LI</span> },
    };
    const payload = [
      { value: "valueA", dataKey: "valueA", color: "#ff0000", type: "line" as const },
    ];
    render(
      <ChartContainer config={iconConfig}>
        <svg><rect /></svg>
        <ChartLegendContent payload={payload} />
      </ChartContainer>
    );
    expect(screen.getByTestId("legend-icon")).toBeInTheDocument();
  });

  it("hides icon when hideIcon is true even if config has icon", () => {
    const iconConfig = {
      valueA: { label: "A", color: "#f00", icon: () => <span data-testid="legend-icon">LI</span> },
    };
    const payload = [
      { value: "valueA", dataKey: "valueA", color: "#ff0000", type: "line" as const },
    ];
    render(
      <ChartContainer config={iconConfig}>
        <svg><rect /></svg>
        <ChartLegendContent payload={payload} hideIcon />
      </ChartContainer>
    );
    expect(screen.queryByTestId("legend-icon")).toBeNull();
  });

  it("uses nameKey to resolve config", () => {
    const payload = [
      { value: "valueA", dataKey: "valueA", color: "#ff0000", type: "line" as const },
    ];
    render(
      <Wrapper>
        <ChartLegendContent payload={payload} nameKey="value" />
      </Wrapper>
    );
    expect(screen.getByText("Value A")).toBeInTheDocument();
  });
});

describe("ChartTooltip and ChartLegend re-exports", () => {
  it("exports ChartTooltip", () => {
    expect(ChartTooltip).toBeDefined();
  });

  it("exports ChartLegend", () => {
    expect(ChartLegend).toBeDefined();
  });
});
