import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test-utils";

jest.mock("@/hooks/useInfiniteAuditLogs", () => ({
  useInfiniteAuditLogs: () => ({
    logs: [],
    meta: null,
    isLoading: false,
    isLoadingMore: false,
    error: null,
    hasMore: false,
    loadMore: jest.fn(),
    refresh: jest.fn(),
    filters: {},
    setFilters: jest.fn(),
    resetFilters: jest.fn(),
  }),
}));
jest.mock("@/components/audit/AuditTimeline", () => ({
  AuditTimeline: (props: any) => <div data-testid="audit-timeline">timeline</div>,
}));
jest.mock("@/components/modals/audit/AuditLogDetailModal", () => ({
  AuditLogDetailModal: () => null,
}));

import AuditPage from "./page";

describe("AuditPage", () => {
  it("renders breadcrumbs", () => {
    renderWithProviders(<AuditPage />);
    expect(screen.getByText("Auditoría")).toBeInTheDocument();
  });

  it("renders audit timeline", () => {
    renderWithProviders(<AuditPage />);
    expect(screen.getByTestId("audit-timeline")).toBeInTheDocument();
  });

  it("renders page without crashing", () => {
    const { container } = renderWithProviders(<AuditPage />);
    expect(container).toBeTruthy();
  });

  it("renders Inicio breadcrumb", () => {
    renderWithProviders(<AuditPage />);
    expect(screen.getByText("Inicio")).toBeInTheDocument();
  });
});
