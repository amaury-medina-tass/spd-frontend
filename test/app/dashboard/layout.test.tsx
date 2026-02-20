import { render, screen } from "@testing-library/react";
import { renderWithProviders } from "@/test-utils";

jest.mock("@/components/layout/Sidebar", () => ({ Sidebar: () => <div>Sidebar</div> }));
jest.mock("@/components/layout/Topbar", () => ({ Topbar: () => <div>Topbar</div> }));

import DashboardLayout from "@/app/dashboard/layout";

describe("DashboardLayout", () => {
  it("renders sidebar and topbar with children", () => {
    renderWithProviders(
      <DashboardLayout><span>content</span></DashboardLayout>
    );
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("renders Sidebar component", () => {
    renderWithProviders(
      <DashboardLayout><span>x</span></DashboardLayout>
    );
    expect(screen.getByText("Sidebar")).toBeInTheDocument();
  });

  it("renders Topbar component", () => {
    renderWithProviders(
      <DashboardLayout><span>x</span></DashboardLayout>
    );
    expect(screen.getByText("Topbar")).toBeInTheDocument();
  });

  it("renders multiple children", () => {
    renderWithProviders(
      <DashboardLayout>
        <span>first</span>
        <span>second</span>
      </DashboardLayout>
    );
    expect(screen.getByText("first")).toBeInTheDocument();
    expect(screen.getByText("second")).toBeInTheDocument();
  });
});
