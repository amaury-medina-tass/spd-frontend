import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test-utils";

jest.mock("./MGAActivitiesTab", () => ({ MGAActivitiesTab: () => <div data-testid="mga-tab">MGA</div> }));
jest.mock("./DetailedActivitiesTab", () => ({ DetailedActivitiesTab: () => <div data-testid="detailed-tab">Detailed</div> }));

import MastersActivitiesPage from "./page";

describe("MastersActivitiesPage", () => {
  it("renders breadcrumbs", () => {
    renderWithProviders(<MastersActivitiesPage />);
    expect(screen.getByText("Actividades")).toBeInTheDocument();
  });

  it("renders MGA tab by default", () => {
    renderWithProviders(<MastersActivitiesPage />);
    expect(screen.getByTestId("mga-tab")).toBeInTheDocument();
  });

  it("renders tab pills", () => {
    renderWithProviders(<MastersActivitiesPage />);
    const mgaElements = screen.getAllByText("MGA");
    expect(mgaElements.length).toBeGreaterThan(0);
    expect(screen.getByText("Detalladas")).toBeInTheDocument();
  });
});
