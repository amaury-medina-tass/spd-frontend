import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders, mockAuthValue } from "@/test-utils";
import { useNotifications, PersistedNotification } from "@/context/NotificationContext";
import { useSidebar } from "@/context/SidebarContext";
import { post } from "@/lib/http";

import { Topbar } from "@/components/layout/Topbar";

const defaultNotifState = () => ({
  notifications: [] as PersistedNotification[],
  unreadCount: 0,
  markAsRead: jest.fn(),
  markAllAsRead: jest.fn(),
  loading: false,
});

// ─── helpers ────────────────────────────────────────────────────────────────

function makeNotif(overrides: Partial<PersistedNotification> = {}): PersistedNotification {
  return {
    id: "n1",
    user_id: "u1",
    event: "Generic.Event",
    title: "Notificación de prueba",
    message: "Este es un mensaje de prueba",
    is_read: false,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600000).toISOString();
}

function minutesAgo(m: number): string {
  return new Date(Date.now() - m * 60000).toISOString();
}

function daysAgo(d: number): string {
  return new Date(Date.now() - d * 86400000).toISOString();
}

// ─── tests ──────────────────────────────────────────────────────────────────

describe("Topbar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useSidebar as jest.Mock).mockReturnValue({
      isOpen: true, isMobile: false, toggleSidebar: jest.fn(),
    });
    (useNotifications as jest.Mock).mockReturnValue(defaultNotifState());
  });

  afterEach(() => jest.restoreAllMocks());

  // ── basic rendering ───────────────────────────────────────────────────────

  it("renders SPD title", () => {
    renderWithProviders(<Topbar />);
    expect(screen.getByText("SPD")).toBeInTheDocument();
  });

  it("renders user name and email", () => {
    renderWithProviders(<Topbar />);
    expect(screen.getByText(/Test/)).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("renders user initials in avatar", () => {
    renderWithProviders(<Topbar />);
    // Avatar renders its `name` prop as text (see jest.setup mock)
    expect(screen.getByText("TU")).toBeInTheDocument();
  });

  it("renders notification bell", () => {
    renderWithProviders(<Topbar />);
    expect(screen.getByLabelText(/notificaciones/i)).toBeInTheDocument();
  });

  it("renders toggle sidebar button", () => {
    renderWithProviders(<Topbar />);
    expect(screen.getByLabelText(/menú/i)).toBeInTheDocument();
  });

  // ── toggle sidebar icon variants ─────────────────────────────────────────

  it("shows PanelLeftClose icon when sidebar is open on desktop", () => {
    (useSidebar as jest.Mock).mockReturnValue({
      isOpen: true, isMobile: false, toggleSidebar: jest.fn(),
    });
    renderWithProviders(<Topbar />);
    expect(screen.getByTestId("icon-PanelLeftClose")).toBeInTheDocument();
    expect(screen.queryByTestId("icon-Menu")).not.toBeInTheDocument();
  });

  it("shows PanelLeft icon when sidebar is closed on desktop", () => {
    (useSidebar as jest.Mock).mockReturnValue({
      isOpen: false, isMobile: false, toggleSidebar: jest.fn(),
    });
    renderWithProviders(<Topbar />);
    expect(screen.getByTestId("icon-PanelLeft")).toBeInTheDocument();
  });

  it("shows Menu icon on mobile", () => {
    (useSidebar as jest.Mock).mockReturnValue({
      isOpen: true, isMobile: true, toggleSidebar: jest.fn(),
    });
    renderWithProviders(<Topbar />);
    expect(screen.getByTestId("icon-Menu")).toBeInTheDocument();
    expect(screen.queryByTestId("icon-PanelLeftClose")).not.toBeInTheDocument();
  });

  it("calls toggleSidebar when toggle button is pressed", () => {
    const toggle = jest.fn();
    (useSidebar as jest.Mock).mockReturnValue({
      isOpen: true, isMobile: false, toggleSidebar: toggle,
    });
    renderWithProviders(<Topbar />);
    fireEvent.click(screen.getByLabelText(/menú/i));
    expect(toggle).toHaveBeenCalled();
  });

  // ── unread badge ──────────────────────────────────────────────────────────

  it("shows unread count in badge", () => {
    (useNotifications as jest.Mock).mockReturnValue({
      notifications: [], unreadCount: 3, markAsRead: jest.fn(), markAllAsRead: jest.fn(), loading: false,
    });
    renderWithProviders(<Topbar />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("shows 99+ for unread count above 99", () => {
    (useNotifications as jest.Mock).mockReturnValue({
      notifications: [], unreadCount: 150, markAsRead: jest.fn(), markAllAsRead: jest.fn(), loading: false,
    });
    renderWithProviders(<Topbar />);
    expect(screen.getByText("99+")).toBeInTheDocument();
  });

  // ── loading state ─────────────────────────────────────────────────────────

  it("shows loading text when loading and no notifications", () => {
    (useNotifications as jest.Mock).mockReturnValue({
      notifications: [], unreadCount: 0, markAsRead: jest.fn(), markAllAsRead: jest.fn(), loading: true,
    });
    renderWithProviders(<Topbar />);
    expect(screen.getByText("Cargando...")).toBeInTheDocument();
  });

  // ── empty state ───────────────────────────────────────────────────────────

  it("shows empty state when no notifications", () => {
    renderWithProviders(<Topbar />);
    expect(screen.getByText("No tienes notificaciones")).toBeInTheDocument();
  });

  // ── mark all as read ──────────────────────────────────────────────────────

  it("shows 'Marcar todas como leídas' button when unreadCount > 0", () => {
    (useNotifications as jest.Mock).mockReturnValue({
      notifications: [makeNotif()],
      unreadCount: 1,
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      loading: false,
    });
    renderWithProviders(<Topbar />);
    expect(screen.getByText("Marcar todas como leídas")).toBeInTheDocument();
  });

  it("does not show 'Marcar todas como leídas' when unreadCount is 0", () => {
    renderWithProviders(<Topbar />);
    expect(screen.queryByText("Marcar todas como leídas")).not.toBeInTheDocument();
  });

  it("calls markAllAsRead when button is clicked", () => {
    const markAllAsRead = jest.fn();
    (useNotifications as jest.Mock).mockReturnValue({
      notifications: [makeNotif()],
      unreadCount: 1,
      markAsRead: jest.fn(),
      markAllAsRead,
      loading: false,
    });
    renderWithProviders(<Topbar />);
    fireEvent.click(screen.getByText("Marcar todas como leídas"));
    expect(markAllAsRead).toHaveBeenCalled();
  });

  // ── NotificationItem ──────────────────────────────────────────────────────

  it("renders notification title and message", () => {
    (useNotifications as jest.Mock).mockReturnValue({
      notifications: [makeNotif({ title: "Alerta importante", message: "Revisa el sistema" })],
      unreadCount: 1,
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      loading: false,
    });
    renderWithProviders(<Topbar />);
    expect(screen.getByText("Alerta importante")).toBeInTheDocument();
    expect(screen.getByText("Revisa el sistema")).toBeInTheDocument();
  });

  it("calls markAsRead when clicking an unread notification", () => {
    const markAsRead = jest.fn();
    (useNotifications as jest.Mock).mockReturnValue({
      notifications: [makeNotif({ id: "notif-42", is_read: false })],
      unreadCount: 1,
      markAsRead,
      markAllAsRead: jest.fn(),
      loading: false,
    });
    renderWithProviders(<Topbar />);
    fireEvent.click(screen.getByText("Notificación de prueba"));
    expect(markAsRead).toHaveBeenCalledWith("notif-42");
  });

  it("does not call markAsRead when clicking an already-read notification", () => {
    const markAsRead = jest.fn();
    (useNotifications as jest.Mock).mockReturnValue({
      notifications: [makeNotif({ is_read: true })],
      unreadCount: 0,
      markAsRead,
      markAllAsRead: jest.fn(),
      loading: false,
    });
    renderWithProviders(<Topbar />);
    fireEvent.click(screen.getByText("Notificación de prueba"));
    expect(markAsRead).not.toHaveBeenCalled();
  });

  it("shows download button for export notifications", () => {
    (useNotifications as jest.Mock).mockReturnValue({
      notifications: [
        makeNotif({
          event: "Files.ExportCompleted",
          data: { downloadUrl: "https://example.com/file.xlsx", fileName: "reporte.xlsx" },
        }),
      ],
      unreadCount: 1,
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      loading: false,
    });
    renderWithProviders(<Topbar />);
    expect(screen.getByText("Descargar archivo")).toBeInTheDocument();
  });

  it("does not show download button for non-export notifications", () => {
    (useNotifications as jest.Mock).mockReturnValue({
      notifications: [makeNotif({ event: "Generic.Event" })],
      unreadCount: 1,
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      loading: false,
    });
    renderWithProviders(<Topbar />);
    expect(screen.queryByText("Descargar archivo")).not.toBeInTheDocument();
  });

  it("triggers file download when download button is clicked", () => {
    (useNotifications as jest.Mock).mockReturnValue({
      notifications: [
        makeNotif({
          event: "Files.ExportCompleted",
          data: { downloadUrl: "https://example.com/file.xlsx", fileName: "reporte.xlsx" },
        }),
      ],
      unreadCount: 1,
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      loading: false,
    });

    renderWithProviders(<Topbar />);

    // Spy AFTER render so React's DOM creation is not intercepted
    const mockLink = { href: "", download: "", click: jest.fn(), remove: jest.fn() };
    const originalCreate = document.createElement.bind(document);
    jest.spyOn(document, "createElement").mockImplementation(
      (tag: string, ...args: any[]) => tag === "a" ? (mockLink as any) : originalCreate(tag, ...args)
    );
    jest.spyOn(document.body, "appendChild").mockReturnValue(mockLink as any);

    fireEvent.click(screen.getByText("Descargar archivo"));

    expect(mockLink.href).toBe("https://example.com/file.xlsx");
    expect(mockLink.download).toBe("reporte.xlsx");
    expect(mockLink.click).toHaveBeenCalled();
  });

  it("uses 'export.xlsx' as default filename when fileName is missing", () => {
    (useNotifications as jest.Mock).mockReturnValue({
      notifications: [
        makeNotif({
          event: "Files.ExportCompleted",
          data: { downloadUrl: "https://example.com/file.xlsx" },
        }),
      ],
      unreadCount: 1,
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      loading: false,
    });

    renderWithProviders(<Topbar />);

    const mockLink = { href: "", download: "", click: jest.fn(), remove: jest.fn() };
    const originalCreate = document.createElement.bind(document);
    jest.spyOn(document, "createElement").mockImplementation(
      (tag: string, ...args: any[]) => tag === "a" ? (mockLink as any) : originalCreate(tag, ...args)
    );
    jest.spyOn(document.body, "appendChild").mockReturnValue(mockLink as any);

    fireEvent.click(screen.getByText("Descargar archivo"));

    expect(mockLink.download).toBe("export.xlsx");
  });

  // ── formatTimeAgo via rendered timestamps ─────────────────────────────────

  it("shows 'Ahora' for notifications created under a minute ago", () => {
    (useNotifications as jest.Mock).mockReturnValue({
      notifications: [makeNotif({ created_at: new Date().toISOString() })],
      unreadCount: 1, markAsRead: jest.fn(), markAllAsRead: jest.fn(), loading: false,
    });
    renderWithProviders(<Topbar />);
    expect(screen.getByText("Ahora")).toBeInTheDocument();
  });

  it("shows 'Hace Xm' for notifications created minutes ago", () => {
    (useNotifications as jest.Mock).mockReturnValue({
      notifications: [makeNotif({ created_at: minutesAgo(30) })],
      unreadCount: 1, markAsRead: jest.fn(), markAllAsRead: jest.fn(), loading: false,
    });
    renderWithProviders(<Topbar />);
    expect(screen.getByText("Hace 30m")).toBeInTheDocument();
  });

  it("shows 'Hace Xh' for notifications created hours ago", () => {
    (useNotifications as jest.Mock).mockReturnValue({
      notifications: [makeNotif({ created_at: hoursAgo(5) })],
      unreadCount: 1, markAsRead: jest.fn(), markAllAsRead: jest.fn(), loading: false,
    });
    renderWithProviders(<Topbar />);
    expect(screen.getByText("Hace 5h")).toBeInTheDocument();
  });

  it("shows 'Hace Xd' for notifications created days ago", () => {
    (useNotifications as jest.Mock).mockReturnValue({
      notifications: [makeNotif({ created_at: daysAgo(3) })],
      unreadCount: 1, markAsRead: jest.fn(), markAllAsRead: jest.fn(), loading: false,
    });
    renderWithProviders(<Topbar />);
    expect(screen.getByText("Hace 3d")).toBeInTheDocument();
  });

  // ── user dropdown / logout ────────────────────────────────────────────────

  it("renders profile and logout dropdown items", () => {
    renderWithProviders(<Topbar />);
    expect(screen.getByText("Mi Perfil")).toBeInTheDocument();
    expect(screen.getByText("Cerrar Sesión")).toBeInTheDocument();
  });

  it("calls post and clear on logout", async () => {
    const clear = jest.fn();

    renderWithProviders(<Topbar />, { authValue: { ...mockAuthValue, clear } });
    fireEvent.click(screen.getByText("Cerrar Sesión"));

    await waitFor(() => {
      expect(post).toHaveBeenCalled();
      expect(clear).toHaveBeenCalled();
    });
  });

  it("calls clear even when post rejects on logout", async () => {
    const clear = jest.fn();
    (post as jest.Mock).mockRejectedValueOnce(new Error("Network Error"));

    renderWithProviders(<Topbar />, { authValue: { ...mockAuthValue, clear } });
    fireEvent.click(screen.getByText("Cerrar Sesión"));

    await waitFor(() => {
      expect(clear).toHaveBeenCalled();
    });
  });
});
