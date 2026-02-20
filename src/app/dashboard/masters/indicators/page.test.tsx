import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "@/test-utils";

jest.mock("./IndicativePlanIndicatorsTab", () => ({ IndicativePlanIndicatorsTab: () => <div data-testid="indicative-tab">Indicative</div> }));
jest.mock("./ActionPlanIndicatorsTab", () => ({ ActionPlanIndicatorsTab: () => <div data-testid="action-tab">Action</div> }));

import MastersIndicatorsPage from "./page";

describe("MastersIndicatorsPage", () => {
  it("renders breadcrumbs", () => {
    renderWithProviders(<MastersIndicatorsPage />);
    expect(screen.getByText("Indicadores")).toBeInTheDocument();
  });

  it("renders indicative tab by default", () => {
    renderWithProviders(<MastersIndicatorsPage />);
    expect(screen.getByTestId("indicative-tab")).toBeInTheDocument();
  });

  it("renders tab pills", () => {
    renderWithProviders(<MastersIndicatorsPage />);
    expect(screen.getByText("Plan Indicativo")).toBeInTheDocument();
    expect(screen.getByText("Plan de Acción")).toBeInTheDocument();
  });

  it("switching to Plan de Acción shows action tab", () => {
    renderWithProviders(<MastersIndicatorsPage />);
    expect(screen.getByTestId("indicative-tab")).toBeInTheDocument();
    expect(screen.queryByTestId("action-tab")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("Plan de Acción"));
    expect(screen.getByTestId("action-tab")).toBeInTheDocument();
    expect(screen.queryByTestId("indicative-tab")).not.toBeInTheDocument();
  });

  it("clicking Plan Indicativo pill keeps indicative tab active", () => {
    renderWithProviders(<MastersIndicatorsPage />);
    fireEvent.click(screen.getByText("Plan de Acción"));
    fireEvent.click(screen.getByText("Plan Indicativo"));
    expect(screen.getByTestId("indicative-tab")).toBeInTheDocument();
    expect(screen.queryByTestId("action-tab")).not.toBeInTheDocument();
  });
});
