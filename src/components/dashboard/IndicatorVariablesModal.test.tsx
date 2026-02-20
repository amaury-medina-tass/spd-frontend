import { render, screen, waitFor } from "@testing-library/react";
jest.mock("@/services/masters/indicators.service", () => ({
  getIndicatorLocationVariables: jest.fn().mockResolvedValue({ data: [] }),
}));

import { IndicatorVariablesModal } from "./IndicatorVariablesModal";

describe("IndicatorVariablesModal", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <IndicatorVariablesModal isOpen={false} onClose={jest.fn()} indicatorId="1" type="indicative" />
    );
    expect(container.textContent).toBe("");
  });

  it("renders title when open", async () => {
    render(
      <IndicatorVariablesModal isOpen={true} onClose={jest.fn()} indicatorId="1" type="indicative" />
    );
    await waitFor(() => expect(screen.getByText("Variables Asociadas")).toBeInTheDocument());
  });

  it("shows empty state text when no variables", async () => {
    render(
      <IndicatorVariablesModal isOpen={true} onClose={jest.fn()} indicatorId="1" type="indicative" />
    );
    await waitFor(() =>
      expect(screen.getByText(/No hay variables asociadas a este indicador/)).toBeInTheDocument()
    );
  });

  it("shows indicatorCode in header", async () => {
    render(
      <IndicatorVariablesModal isOpen={true} onClose={jest.fn()} indicatorId="1" indicatorCode="IND-001" type="indicative" />
    );
    await waitFor(() => expect(screen.getByText(/IND-001/)).toBeInTheDocument());
  });

  it("renders with type action", async () => {
    render(
      <IndicatorVariablesModal isOpen={true} onClose={jest.fn()} indicatorId="1" type="action" />
    );
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
  });

  it("shows table columns when variables present", async () => {
    const { getIndicatorLocationVariables } = require("@/services/masters/indicators.service");
    getIndicatorLocationVariables.mockResolvedValueOnce({
      data: [{ variable: { id: "v1", code: "VAR001", name: "Variable Test" }, matchType: "direct" }],
    });
    render(
      <IndicatorVariablesModal isOpen={true} onClose={jest.fn()} indicatorId="1" type="indicative" />
    );
    await waitFor(() => expect(screen.getByText("VAR001")).toBeInTheDocument());
  });
});
