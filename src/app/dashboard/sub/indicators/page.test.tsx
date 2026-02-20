import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test-utils";

jest.mock("./IndicativePlanSubTab", () => ({ IndicativePlanSubTab: () => <div data-testid="indicative-sub">Indicative</div> }));
jest.mock("./ActionPlanSubTab", () => ({ ActionPlanSubTab: () => <div data-testid="action-sub">Action</div> }));

import SubModulePage from "./page";

describe("SubIndicatorsPage", () => {
  it("renders breadcrumbs", () => {
    renderWithProviders(<SubModulePage />);
    expect(screen.getByText("Indicadores")).toBeInTheDocument();
  });

  it("renders indicative tab by default", () => {
    renderWithProviders(<SubModulePage />);
    expect(screen.getByTestId("indicative-sub")).toBeInTheDocument();
  });

  it("renders tab pills", () => {
    renderWithProviders(<SubModulePage />);
    expect(screen.getByText("Plan Indicativo")).toBeInTheDocument();
  });
});
