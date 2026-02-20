import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { AuditLogDetailModal } from "./AuditLogDetailModal";

jest.mock("@/components/audit/AuditLogBadge", () => ({
  AuditActionBadge: ({ action }: any) => <span>action-{action}</span>,
  AuditEntityBadge: ({ entityType }: any) => <span>entity-{entityType}</span>,
  AuditStatusBadge: ({ success }: any) => <span>status-{String(success)}</span>,
}));
jest.mock("@/components/audit/AuditChangesDisplay", () => ({
  AuditChangesDisplay: ({ changes }: any) => (
    <div data-testid="changes-display">changes-{changes?.length}</div>
  ),
}));
jest.mock("@/components/audit/AuditMetadataDisplay", () => ({
  AuditMetadataDisplay: () => <div data-testid="metadata-display">metadata</div>,
}));

const baseLog = {
  id: "log-123",
  action: "CREATE",
  actionLabel: "Crear Usuario",
  entityName: "Usuario Test",
  entity: "User",
  entityType: "USER",
  entityId: "entity-456",
  userId: "u2",
  userEmail: "test@test.com",
  status: "SUCCESS",
  success: true,
  timestamp: "2024-01-15T10:30:00Z",
  metadata: {},
  changes: null,
};

describe("AuditLogDetailModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: jest.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("basic rendering", () => {
    it("renders dialog when open and log provided", () => {
      render(<AuditLogDetailModal isOpen={true} log={baseLog as any} onClose={jest.fn()} />);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("renders nothing when log is null", () => {
      render(<AuditLogDetailModal isOpen={true} log={null} onClose={jest.fn()} />);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("renders nothing when isOpen is false", () => {
      render(<AuditLogDetailModal isOpen={false} log={baseLog as any} onClose={jest.fn()} />);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("shows actionLabel in header", () => {
      render(<AuditLogDetailModal isOpen={true} log={baseLog as any} onClose={jest.fn()} />);
      expect(screen.getByText("Crear Usuario")).toBeInTheDocument();
    });

    it("shows subtitle text", () => {
      render(<AuditLogDetailModal isOpen={true} log={baseLog as any} onClose={jest.fn()} />);
      expect(screen.getByText(/Detalle del registro de auditor/)).toBeInTheDocument();
    });

    it("shows entityName", () => {
      render(<AuditLogDetailModal isOpen={true} log={baseLog as any} onClose={jest.fn()} />);
      expect(screen.getByText("Usuario Test")).toBeInTheDocument();
    });

    it("renders AuditStatusBadge with success prop", () => {
      render(<AuditLogDetailModal isOpen={true} log={baseLog as any} onClose={jest.fn()} />);
      expect(screen.getByText("status-true")).toBeInTheDocument();
    });

    it("renders AuditEntityBadge with entityType", () => {
      render(<AuditLogDetailModal isOpen={true} log={baseLog as any} onClose={jest.fn()} />);
      expect(screen.getByText("entity-USER")).toBeInTheDocument();
    });

    it("shows Cerrar button", () => {
      render(<AuditLogDetailModal isOpen={true} log={baseLog as any} onClose={jest.fn()} />);
      expect(screen.getByText("Cerrar")).toBeInTheDocument();
    });

    it("calls onClose when Cerrar is clicked", () => {
      const onClose = jest.fn();
      render(<AuditLogDetailModal isOpen={true} log={baseLog as any} onClose={onClose} />);
      fireEvent.click(screen.getByText("Cerrar"));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("shows formatted timestamp containing year", () => {
      render(<AuditLogDetailModal isOpen={true} log={baseLog as any} onClose={jest.fn()} />);
      expect(screen.getByText(/2024/)).toBeInTheDocument();
    });

    it("shows Entidad label", () => {
      render(<AuditLogDetailModal isOpen={true} log={baseLog as any} onClose={jest.fn()} />);
      expect(screen.getByText("Entidad")).toBeInTheDocument();
    });

    it("shows Fecha y hora label", () => {
      render(<AuditLogDetailModal isOpen={true} log={baseLog as any} onClose={jest.fn()} />);
      expect(screen.getByText(/Fecha y hora/i)).toBeInTheDocument();
    });

    it("shows ID del registro in footer", () => {
      render(<AuditLogDetailModal isOpen={true} log={baseLog as any} onClose={jest.fn()} />);
      expect(screen.getByText("ID del registro")).toBeInTheDocument();
    });

    it("shows status-false for failed log", () => {
      const log = { ...baseLog, success: false };
      render(<AuditLogDetailModal isOpen={true} log={log as any} onClose={jest.fn()} />);
      expect(screen.getByText("status-false")).toBeInTheDocument();
    });
  });

  describe("conditional sections", () => {
    it("does NOT show changes section when changes is null", () => {
      render(<AuditLogDetailModal isOpen={true} log={baseLog as any} onClose={jest.fn()} />);
      expect(screen.queryByTestId("changes-display")).not.toBeInTheDocument();
    });

    it("does NOT show changes section when changes is empty array", () => {
      const log = { ...baseLog, changes: [] };
      render(<AuditLogDetailModal isOpen={true} log={log as any} onClose={jest.fn()} />);
      expect(screen.queryByTestId("changes-display")).not.toBeInTheDocument();
    });

    it("shows changes section when changes has items", () => {
      const log = {
        ...baseLog,
        changes: [{ field: "name", oldValue: "A", newValue: "B" }],
      };
      render(<AuditLogDetailModal isOpen={true} log={log as any} onClose={jest.fn()} />);
      expect(screen.getByTestId("changes-display")).toBeInTheDocument();
      expect(screen.getByText("Cambios realizados")).toBeInTheDocument();
    });

    it("does NOT show metadata section when metadata is empty object", () => {
      render(<AuditLogDetailModal isOpen={true} log={baseLog as any} onClose={jest.fn()} />);
      expect(screen.queryByTestId("metadata-display")).not.toBeInTheDocument();
    });

    it("shows metadata section when metadata has keys", () => {
      const log = { ...baseLog, metadata: { ip: "127.0.0.1", userAgent: "Firefox" } };
      render(<AuditLogDetailModal isOpen={true} log={log as any} onClose={jest.fn()} />);
      expect(screen.getByTestId("metadata-display")).toBeInTheDocument();
    });

    it("shows both changes and metadata when both present", () => {
      const log = {
        ...baseLog,
        changes: [{ field: "email", oldValue: "a@a.com", newValue: "b@b.com" }],
        metadata: { ip: "192.168.1.1" },
      };
      render(<AuditLogDetailModal isOpen={true} log={log as any} onClose={jest.fn()} />);
      expect(screen.getByTestId("changes-display")).toBeInTheDocument();
      expect(screen.getByTestId("metadata-display")).toBeInTheDocument();
    });
  });

  describe("CopyButton interactions", () => {
    it("calls clipboard.writeText with entityId when copy button clicked", async () => {
      render(<AuditLogDetailModal isOpen={true} log={baseLog as any} onClose={jest.fn()} />);
      const buttons = screen.getAllByTestId("Button");
      await act(async () => {
        fireEvent.click(buttons[0]);
      });
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("entity-456");
    });

    it("shows success toast after successful copy", async () => {
      const { addToast } = jest.requireMock("@heroui/react");
      render(<AuditLogDetailModal isOpen={true} log={baseLog as any} onClose={jest.fn()} />);
      const buttons = screen.getAllByTestId("Button");
      await act(async () => {
        fireEvent.click(buttons[0]);
      });
      expect(addToast).toHaveBeenCalledWith(
        expect.objectContaining({ color: "success" })
      );
    });

    it("shows Check icon after successful copy", async () => {
      render(<AuditLogDetailModal isOpen={true} log={baseLog as any} onClose={jest.fn()} />);
      const buttons = screen.getAllByTestId("Button");
      await act(async () => {
        fireEvent.click(buttons[0]);
      });
      await waitFor(() => {
        expect(screen.getAllByTestId("icon-Check").length).toBeGreaterThan(0);
      });
    });

    it("copies log id from footer copy button", async () => {
      render(<AuditLogDetailModal isOpen={true} log={baseLog as any} onClose={jest.fn()} />);
      const buttons = screen.getAllByTestId("Button");
      // Footer copy button is second-to-last; last is Cerrar
      const footerCopyBtn = buttons[buttons.length - 2];
      await act(async () => {
        fireEvent.click(footerCopyBtn);
      });
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("log-123");
    });

    it("shows error toast when clipboard throws", async () => {
      (navigator.clipboard.writeText as jest.Mock).mockRejectedValueOnce(
        new Error("Permission denied")
      );
      const { addToast } = jest.requireMock("@heroui/react");
      render(<AuditLogDetailModal isOpen={true} log={baseLog as any} onClose={jest.fn()} />);
      const buttons = screen.getAllByTestId("Button");
      await act(async () => {
        fireEvent.click(buttons[0]);
      });
      expect(addToast).toHaveBeenCalledWith(
        expect.objectContaining({ color: "danger" })
      );
    });

    it("does not show Check icon when copy fails", async () => {
      (navigator.clipboard.writeText as jest.Mock).mockRejectedValueOnce(
        new Error("Not allowed")
      );
      render(<AuditLogDetailModal isOpen={true} log={baseLog as any} onClose={jest.fn()} />);
      const buttons = screen.getAllByTestId("Button");
      await act(async () => {
        fireEvent.click(buttons[0]);
      });
      expect(screen.queryByTestId("icon-Check")).not.toBeInTheDocument();
    });
  });
});
