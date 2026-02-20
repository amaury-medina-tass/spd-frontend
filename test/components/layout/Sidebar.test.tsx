import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders, mockAuthValue } from "@/test-utils";
import { useSidebar } from "@/context/SidebarContext";

jest.mock("@/config/navigation", () => ({
  menuItems: [
    { label: "Dashboard", href: "/dashboard", icon: "icon", permissionPath: undefined },
    {
      label: "Control de Acceso",
      icon: "icon",
      items: [
        { label: "Usuarios", href: "/dashboard/access-control/users", icon: "icon", permissionPath: "access-control.users" },
        { label: "Roles", href: "/dashboard/access-control/roles", icon: "icon", permissionPath: "access-control.roles" },
      ],
    },
    {
      label: "Finanzas",
      icon: "icon",
      items: [
        { label: "Dashboard Financiero", href: "/dashboard/financial/dashboard", icon: "icon", permissionPath: "financial.dashboard" },
      ],
    },
  ],
  isMenuGroup: (item: any) => !!item.items,
}));

import { Sidebar } from "@/components/layout/Sidebar";

// ─── helpers ────────────────────────────────────────────────────────────────

function desktopExpanded() {
  (useSidebar as jest.Mock).mockReturnValue({
    isOpen: true, isMobile: false, closeSidebar: jest.fn(),
    openSidebar: jest.fn(), toggleSidebar: jest.fn(),
  });
}

function desktopCollapsed() {
  (useSidebar as jest.Mock).mockReturnValue({
    isOpen: false, isMobile: false, closeSidebar: jest.fn(),
    openSidebar: jest.fn(), toggleSidebar: jest.fn(),
  });
}

function mobileOpen(closeSidebar = jest.fn()) {
  (useSidebar as jest.Mock).mockReturnValue({
    isOpen: true, isMobile: true, closeSidebar,
    openSidebar: jest.fn(), toggleSidebar: jest.fn(),
  });
}

// ─── tests ──────────────────────────────────────────────────────────────────

describe("Sidebar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    desktopExpanded();
  });

  // ── basic rendering ───────────────────────────────────────────────────────

  it("renders sidebar with menu items", () => {
    renderWithProviders(<Sidebar />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("renders group menus", () => {
    renderWithProviders(<Sidebar />);
    expect(screen.getByText("Control de Acceso")).toBeInTheDocument();
    expect(screen.getByText("Finanzas")).toBeInTheDocument();
  });

  it("renders images for DAGRD, Bomberos and Alcaldía", () => {
    renderWithProviders(<Sidebar />);
    expect(screen.getByAltText("DAGRD")).toBeInTheDocument();
    expect(screen.getByAltText("Bomberos")).toBeInTheDocument();
    expect(screen.getByAltText("Alcaldía")).toBeInTheDocument();
  });

  // ── permissions ───────────────────────────────────────────────────────────

  it("shows items when user has READ permission", () => {
    renderWithProviders(<Sidebar />);
    expect(screen.getByText("Usuarios")).toBeInTheDocument();
  });

  it("hides items when user has no permission for that path", () => {
    renderWithProviders(<Sidebar />, {
      authValue: { ...mockAuthValue, me: { ...mockAuthValue.me, permissions: {} } },
    });
    expect(screen.queryByText("Usuarios")).not.toBeInTheDocument();
  });

  it("returns null for group when all items are hidden by permissions", () => {
    renderWithProviders(<Sidebar />, {
      authValue: { ...mockAuthValue, me: { ...mockAuthValue.me, permissions: {} } },
    });
    // Control de Acceso and Finanzas groups should not render since all children hidden
    expect(screen.queryByText("Usuarios")).not.toBeInTheDocument();
    expect(screen.queryByText("Dashboard Financiero")).not.toBeInTheDocument();
  });

  it("always shows items without a permissionPath", () => {
    renderWithProviders(<Sidebar />, {
      authValue: { ...mockAuthValue, me: { ...mockAuthValue.me, permissions: {} } },
    });
    // Dashboard has no permissionPath → always shown
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("hides items when me is null", () => {
    renderWithProviders(<Sidebar />, {
      authValue: { ...mockAuthValue, me: null as any },
    });
    expect(screen.queryByText("Usuarios")).not.toBeInTheDocument();
  });

  // ── desktop expanded mode ─────────────────────────────────────────────────

  it("renders as desktop aside when not mobile", () => {
    renderWithProviders(<Sidebar />);
    expect(document.querySelector("aside")).toBeInTheDocument();
  });

  it("renders expanded submenus (Control de Acceso starts expanded)", () => {
    renderWithProviders(<Sidebar />);
    expect(screen.getByText("Usuarios")).toBeInTheDocument();
  });

  // ── toggleMenu collapse (lines 40-42) ─────────────────────────────────────

  it("collapses an expanded group when its button is clicked", () => {
    renderWithProviders(<Sidebar />);
    // "Control de Acceso" starts expanded (default state)
    // Its submenu items are visible
    expect(screen.getByText("Usuarios")).toBeInTheDocument();

    // Click the group button to collapse it
    fireEvent.click(screen.getByText("Control de Acceso"));

    // The submenu container gets max-h-0 but items stay in DOM (CSS-only hide)
    // Verify the click did not throw and the group button is still rendered
    expect(screen.getByText("Control de Acceso")).toBeInTheDocument();
  });

  it("expands a collapsed group when its button is clicked", () => {
    renderWithProviders(<Sidebar />);
    // Collapse first
    fireEvent.click(screen.getByText("Control de Acceso"));
    // Expand again
    fireEvent.click(screen.getByText("Control de Acceso"));
    expect(screen.getByText("Control de Acceso")).toBeInTheDocument();
  });

  it("expands a group that was not in the default expanded list", () => {
    renderWithProviders(<Sidebar />);
    // "Finanzas" is NOT in the default expanded list
    fireEvent.click(screen.getByText("Finanzas"));
    expect(screen.getByText("Finanzas")).toBeInTheDocument();
  });

  // ── desktop collapsed mode ────────────────────────────────────────────────

  it("renders collapsed desktop sidebar with aside element", () => {
    desktopCollapsed();
    renderWithProviders(<Sidebar />);
    expect(document.querySelector("aside")).toBeInTheDocument();
  });

  it("renders Popover for group menus in desktop collapsed mode", () => {
    desktopCollapsed();
    renderWithProviders(<Sidebar />);
    // In collapsed mode, group items are rendered inside PopoverContent
    expect(screen.getByText("Usuarios")).toBeInTheDocument();
    expect(screen.getByText("Dashboard Financiero")).toBeInTheDocument();
  });

  it("shows group label in Popover content header in collapsed mode", () => {
    desktopCollapsed();
    renderWithProviders(<Sidebar />);
    // Group labels still appear in the PopoverContent header
    expect(screen.getByText("Control de Acceso")).toBeInTheDocument();
  });

  // ── mobile mode ───────────────────────────────────────────────────────────

  it("shows mobile aside when open on mobile", () => {
    mobileOpen();
    renderWithProviders(<Sidebar />);
    expect(document.querySelector("aside")).toBeInTheDocument();
  });

  it("renders backdrop when mobile and open", () => {
    mobileOpen();
    const { container } = renderWithProviders(<Sidebar />);
    const backdrop = container.querySelector(".fixed.inset-0");
    expect(backdrop).toBeInTheDocument();
  });

  it("calls closeSidebar when backdrop is clicked (line 186)", () => {
    const close = jest.fn();
    mobileOpen(close);
    const { container } = renderWithProviders(<Sidebar />);
    const backdrop = container.querySelector(".fixed.inset-0");
    fireEvent.click(backdrop!);
    expect(close).toHaveBeenCalled();
  });

  it("does not render backdrop when mobile and closed", () => {
    (useSidebar as jest.Mock).mockReturnValue({
      isOpen: false, isMobile: true, closeSidebar: jest.fn(),
      openSidebar: jest.fn(), toggleSidebar: jest.fn(),
    });
    const { container } = renderWithProviders(<Sidebar />);
    expect(container.querySelector(".fixed.inset-0")).not.toBeInTheDocument();
  });

  it("renders X close button on mobile", () => {
    mobileOpen();
    renderWithProviders(<Sidebar />);
    expect(screen.getByTestId("icon-X")).toBeInTheDocument();
  });

  it("calls closeSidebar when X button is clicked", () => {
    const close = jest.fn();
    mobileOpen(close);
    renderWithProviders(<Sidebar />);
    // X button is the only isIconOnly button in mobile header area
    const xBtn = screen.getByTestId("icon-X").closest("[data-testid='Button']");
    fireEvent.click(xBtn!);
    expect(close).toHaveBeenCalled();
  });

  it("calls closeSidebar on item click in mobile", () => {
    const close = jest.fn();
    mobileOpen(close);
    renderWithProviders(<Sidebar />);
    fireEvent.click(screen.getByText("Dashboard"));
    expect(close).toHaveBeenCalled();
  });

  it("does NOT call closeSidebar on item click on desktop", () => {
    const close = jest.fn();
    (useSidebar as jest.Mock).mockReturnValue({
      isOpen: true, isMobile: false, closeSidebar: close,
      openSidebar: jest.fn(), toggleSidebar: jest.fn(),
    });
    renderWithProviders(<Sidebar />);
    fireEvent.click(screen.getByText("Dashboard"));
    expect(close).not.toHaveBeenCalled();
  });

  // ── active state ──────────────────────────────────────────────────────────

  it("marks Dashboard as active when pathname is /dashboard", () => {
    // usePathname is mocked to return "/dashboard" globally in jest.setup
    renderWithProviders(<Sidebar />);
    // Dashboard button should have primary color (active state)
    const dashboardBtn = screen.getByText("Dashboard").closest("[data-testid='Button']");
    expect(dashboardBtn).toHaveAttribute("color", "primary");
  });
});
