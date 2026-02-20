import { render, screen, fireEvent } from "@testing-library/react";
import { addToast } from "@heroui/react";

jest.mock("@/lib/audit-codes", () => ({
  getActionColor: jest.fn(() => "success"),
  getEntityTypeLabel: jest.fn((e: string) => e),
}));

import { AuditTimelineItem } from "./AuditTimelineItem";

const mockLog = {
  id: "1",
  action: "USER_CREATED",
  actionLabel: "Usuario Creado",
  entityType: "USER",
  entityId: "u1",
  entityName: "Test User",
  timestamp: new Date().toISOString(),
  success: true,
  changes: [],
  metadata: {},
};

describe("AuditTimelineItem", () => {
  const mockAddToast = addToast as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(navigator, { clipboard: { writeText: jest.fn().mockResolvedValue(undefined) } });
  });
  it("renders action label and entity name", () => {
    render(<AuditTimelineItem log={mockLog as any} />);
    expect(screen.getByText("Usuario Creado")).toBeInTheDocument();
    expect(screen.getByText(/Test User/)).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const fn = jest.fn();
    render(<AuditTimelineItem log={mockLog as any} onClick={fn} />);
    fireEvent.click(screen.getByRole("button", { name: /Ver detalle/ }));
    expect(fn).toHaveBeenCalledWith(mockLog);
  });

  it("shows changes detail text", () => {
    const log = {
      ...mockLog,
      changes: [{ field: "name", fieldLabel: "Nombre", oldValue: "A", newValue: "B" }],
    };
    render(<AuditTimelineItem log={log as any} />);
    expect(screen.getByText(/Nombre: A → B/)).toBeInTheDocument();
  });

  it("shows multiple changes count", () => {
    const log = {
      ...mockLog,
      changes: [
        { field: "a", fieldLabel: "A", oldValue: "1", newValue: "2" },
        { field: "b", fieldLabel: "B", oldValue: "3", newValue: "4" },
      ],
    };
    render(<AuditTimelineItem log={log as any} />);
    expect(screen.getByText(/2 campos modificados/)).toBeInTheDocument();
  });

  it("shows fallido indicator when success is false", () => {
    const log = { ...mockLog, success: false };
    render(<AuditTimelineItem log={log as any} />);
    expect(screen.getByText(/Fallido/)).toBeInTheDocument();
  });

  it("formatRelativeTime: shows 'Hace X min' for recent timestamp", () => {
    const ts = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    render(<AuditTimelineItem log={{ ...mockLog, timestamp: ts } as any} />);
    expect(screen.getByText(/Hace \d+ min/)).toBeInTheDocument();
  });

  it("formatRelativeTime: shows 'Hace Xh' for hours-old timestamp", () => {
    const ts = new Date(Date.now() - 3 * 3600 * 1000).toISOString();
    render(<AuditTimelineItem log={{ ...mockLog, timestamp: ts } as any} />);
    expect(screen.getByText(/Hace \d+h/)).toBeInTheDocument();
  });

  it("formatRelativeTime: shows 'Hace Xd' for days-old timestamp", () => {
    const ts = new Date(Date.now() - 3 * 86400 * 1000).toISOString();
    render(<AuditTimelineItem log={{ ...mockLog, timestamp: ts } as any} />);
    expect(screen.getByText(/Hace \d+d/)).toBeInTheDocument();
  });

  it("formatRelativeTime: shows locale date for timestamps > 7 days", () => {
    const ts = new Date(Date.now() - 10 * 86400 * 1000).toISOString();
    render(<AuditTimelineItem log={{ ...mockLog, timestamp: ts } as any} />);
    // Should render some date string (locale format)
    const timeEl = screen.getByText(/\d+/);
    expect(timeEl).toBeInTheDocument();
  });

  it("shows detail text for metadata.added with more than 2 ids", () => {
    const log = {
      ...mockLog,
      changes: [],
      metadata: { added: true, addedIds: ["id1", "id2", "id3"] },
    };
    render(<AuditTimelineItem log={log as any} />);
    expect(screen.getByText(/id1, id2 y 1 m/)).toBeInTheDocument();
  });

  it("shows detail text for metadata.added with 2 ids", () => {
    const log = {
      ...mockLog,
      changes: [],
      metadata: { added: true, addedIds: ["id1", "id2"] },
    };
    render(<AuditTimelineItem log={log as any} />);
    expect(screen.getByText("id1, id2")).toBeInTheDocument();
  });

  it("shows detail text for metadata.removed with ids", () => {
    const log = {
      ...mockLog,
      changes: [],
      metadata: { removed: true, removedIds: ["rid1", "rid2", "rid3"] },
    };
    render(<AuditTimelineItem log={log as any} />);
    expect(screen.getByText(/rid1, rid2 y 1 m/)).toBeInTheDocument();
  });

  it("shows detail text for metadata.removed with 1 id", () => {
    const log = {
      ...mockLog,
      changes: [],
      metadata: { removed: true, removedIds: ["rid1"] },
    };
    render(<AuditTimelineItem log={log as any} />);
    expect(screen.getByText("rid1")).toBeInTheDocument();
  });

  it("shows email from metadata", () => {
    const log = {
      ...mockLog,
      changes: [],
      metadata: { email: "test@example.com" },
    };
    render(<AuditTimelineItem log={log as any} />);
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("clicking copy button calls clipboard.writeText and addToast", async () => {
    render(<AuditTimelineItem log={mockLog as any} />);
    const copyBtn = screen.getByRole("button", { name: /copiar id/i });
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockLog.id);
    expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "success" }));
  });

  it("copy button click does not propagate to parent", () => {
    const onClick = jest.fn();
    render(<AuditTimelineItem log={mockLog as any} onClick={onClick} />);
    const copyBtn = screen.getByRole("button", { name: /copiar id/i });
    fireEvent.click(copyBtn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders timeline connector line when not last", () => {
    const { container } = render(<AuditTimelineItem log={mockLog as any} isLast={false} />);
    const line = container.querySelector(".w-px.flex-1");
    expect(line).toBeInTheDocument();
  });

  it("does not render connector line when isLast is true", () => {
    const { container } = render(<AuditTimelineItem log={mockLog as any} isLast={true} />);
    const line = container.querySelector(".w-px.flex-1");
    expect(line).not.toBeInTheDocument();
  });
});
